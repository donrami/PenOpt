package app

import (
	"context"
	"encoding/json"
	"fmt"

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
	Weights [3]float64 `json:"weights"`
	Method  string     `json:"method"`
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
	coarseCfg.RayGridX = 8
	coarseCfg.RayGridY = 8
	coarseCfg.NumProjections = 36

	go func() {
		result, err := search.Run(bvhTree, m, coarseCfg, req.Weights, req.Method,
			func(idx, total int, theta, phi float64) {
				pct := float64(idx) / float64(total) * 100
				runtime.EventsEmit(ctx, "search:progress", map[string]interface{}{
					"pct": pct, "label": fmt.Sprintf("\u03B8=%.0f\u00B0 \u03C6=%.0f\u00B0", theta, phi),
					"idx": idx, "total": total,
				})
			})

		if result != nil && m != nil {
			is := search.ComputeIntelliScanAngles(m, result.BestOrientation.Theta, result.BestOrientation.Phi)
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
