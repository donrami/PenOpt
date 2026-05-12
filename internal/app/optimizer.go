package app

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"penopt/internal/raycaster"
	"penopt/internal/search"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Optimizer runs the coarse -> fine orientation search.
type Optimizer struct {
	loader *MeshLoader
}

func NewOptimizer(loader *MeshLoader) *Optimizer {
	return &Optimizer{loader: loader}
}

// RunRequest holds the optimization parameters from the frontend.
type RunRequest struct {
	Weights     [5]float64 `json:"weights"` // [w_mtl, w_energy, w_hdn, w_tuy, w_bh]
	Method      string     `json:"method"`
	RayGridXY   int        `json:"rayGridXY"`   // 0 = use defaults (8 coarse / 16 fine)
	SearchRange int        `json:"searchRange"` // 0 = default 45°
}

// Run starts the search asynchronously, emitting events to ctx.
func (opt *Optimizer) Run(ctx context.Context, req RunRequest) (string, error) {
	opt.loader.Lock()
	bvhTree := opt.loader.CurrentBVH
	m := opt.loader.CurrentMesh
	opt.loader.Unlock()

	if bvhTree == nil {
		return "", fmt.Errorf("no mesh loaded")
	}

	coarseCfg := raycaster.DefaultScannerConfig()
	// T2.1: use ray grid override from frontend if provided
	coarseRayGrid := 8
	if req.RayGridXY > 0 {
		coarseRayGrid = req.RayGridXY
	}
	coarseCfg.RayGridX = coarseRayGrid
	coarseCfg.RayGridY = coarseRayGrid
	coarseCfg.NumProjections = 36

	go func() {
		searchStart := time.Now()

		result, err := search.Run(bvhTree, m, coarseCfg, req.Weights, req.Method,
			func(idx, total int, theta, phi float64) {
				pct := float64(idx) / float64(total) * 100
				var estRemainingMs int64 = 0
				if idx > 0 {
					elapsed := time.Since(searchStart).Milliseconds()
					estRemainingMs = elapsed * int64(total-idx) / int64(idx)
				}
				runtime.EventsEmit(ctx, "search:progress", map[string]interface{}{
					"pct": pct,
					"label": fmt.Sprintf("\u03B8=%.0f\u00B0 \u03C6=%.0f\u00B0", theta, phi),
					"idx": idx,
					"total": total,
					"estimatedRemainingMs": estRemainingMs,
				})
			}, req.RayGridXY, req.SearchRange)

		if result != nil && m != nil {
			// T3.1: pass SOD/SDD for cone-beam IntelliScan correction
			is := search.ComputeIntelliScanAngles(m, result.BestOrientation.Theta, result.BestOrientation.Phi,
				coarseCfg.SOD, coarseCfg.SDD)
			result.IntelliScan = &is
		}

		if err != nil || result == nil {
			runtime.EventsEmit(ctx, "search:done", map[string]interface{}{
				"error": fmt.Sprintf("Search failed: %v", err),
			})
			return
		}

		data, err := json.Marshal(result)
		if err != nil {
			runtime.EventsEmit(ctx, "search:done", map[string]interface{}{
				"error": fmt.Sprintf("JSON error: %v", err),
			})
			return
		}

		runtime.EventsEmit(ctx, "search:done", map[string]interface{}{
			"result": string(data),
		})
	}()

	return "started", nil
}

// EvaluateSingle evaluates one orientation (for UI preview).
func (opt *Optimizer) EvaluateSingle(theta, phi float64) (string, error) {
	opt.loader.Lock()
	bvhTree := opt.loader.CurrentBVH
	m := opt.loader.CurrentMesh
	opt.loader.Unlock()

	if bvhTree == nil {
		return "", fmt.Errorf("no mesh loaded")
	}

	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 16
	cfg.RayGridY = 16
	cfg.NumProjections = 90

	score := search.EvaluateSingle(bvhTree, m, theta, phi, cfg)
	data, err := json.Marshal(score)
	if err != nil {
		return "", fmt.Errorf("JSON marshal error: %w", err)
	}
	return string(data), nil
}