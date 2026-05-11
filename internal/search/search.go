// Package search implements the coarse→fine grid search for optimal orientation.
// Based on Ito et al. 2020 §2.4: discretize (θ, φ) at 10° intervals, find top 3,
// then refine at 1° intervals around each candidate.
package search

import (
	"math"
	"sort"
	"time"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"penopt/internal/objectives"
	"penopt/internal/raycaster"
)

// coarseThetas are the coarse tilt angles around X (degrees).
// Matches the original: 7 values at 15° spacing.
var coarseThetas = []float64{-45, -30, -15, 0, 15, 30, 45}

// coarsePhis are the coarse tilt angles around Y (degrees).
// Matches the original: 7 values at 15° spacing.
var coarsePhis = []float64{-45, -30, -15, 0, 15, 30, 45}

// DefaultSearchGrid returns a copy of the default coarse search grid.
func DefaultSearchGrid() (thetas, phis []float64) {
	thetas = make([]float64, len(coarseThetas))
	phis = make([]float64, len(coarsePhis))
	copy(thetas, coarseThetas)
	copy(phis, coarsePhis)
	return
}

// Orient is an orientation (θ, φ) in degrees.
type Orient struct {
	Theta, Phi float64
}

// OrientationScore holds evaluation results for one orientation.
type OrientationScore struct {
	Theta            float64   `json:"theta"`
	Phi              float64   `json:"phi"`
	FMtl             float64   `json:"fMtl"`
	FEnergy          float64   `json:"fEnergy"`
	FHdn             float64   `json:"fHdn"`
	Score            float64   `json:"score"`
	MaxPerProjection []float64 `json:"maxPerProjection"`
}

// Result holds the full optimization result.
type Result struct {
	BestOrientation  OrientationScore   `json:"bestOrientation"`
	WorstOrientation OrientationScore   `json:"worstOrientation"`
	AllScores        []OrientationScore `json:"allScores"`
	SearchTimeMs     float64            `json:"searchTimeMs"`
	IntelliScan      *IntelliScanResult `json:"intelliScan,omitempty"`
}

// EvaluateSingle evaluates a single orientation (for UI preview / heatmap).
func EvaluateSingle(bvhTree *bvh.BVH, theta, phi float64, cfg raycaster.ScannerConfig) OrientationScore {
	grid := raycaster.ComputeRayGrid(cfg)
	result := raycaster.ComputeTransmissionLengths(theta, phi, bvhTree, cfg, grid)
	fMtl := objectives.FMtl(result.Lengths, 3)
	fEnergy := objectives.FEnergy(result.Lengths)
	fHdn := objectives.FHdn(result.MaxPerProjection)

	return OrientationScore{
		Theta:            theta,
		Phi:              phi,
		FMtl:             fMtl,
		FEnergy:          fEnergy,
		FHdn:             fHdn,
		MaxPerProjection: result.MaxPerProjection,
	}
}

// ProgressFn is called after each orientation evaluation during search.
type ProgressFn func(idx, total int, theta, phi float64)

// Run executes the coarse→fine grid search.
// weights: [w_mtl, w_energy, w_hdn]
// method: "weighted" or "minimax"
// onProgress is called after each orientation (may be nil).
// mesh is used for IntelliScan computation (may be nil).
func Run(bvhTree *bvh.BVH, cfg raycaster.ScannerConfig,
	weights [3]float64, method string, onProgress ProgressFn, mesh *mesh.Mesh) (*Result, error) {

	startTime := time.Now()

	// ── Phase 1: Coarse search ──
	coarseOrientations := make([]Orient, 0, len(coarseThetas)*len(coarsePhis))
	for _, theta := range coarseThetas {
		for _, phi := range coarsePhis {
			coarseOrientations = append(coarseOrientations, Orient{theta, phi})
		}
	}

	grid := raycaster.ComputeRayGrid(cfg)
	coarseScores := evaluateOrientations(bvhTree, coarseOrientations, cfg, grid, weights, method, onProgress, 0, len(coarseOrientations))

	if len(coarseScores) < 2 {
		return nil, nil
	}

	// Find top 3 candidates
	sort.Slice(coarseScores, func(i, j int) bool {
		return coarseScores[i].Score < coarseScores[j].Score
	})
	topN := 3
	if len(coarseScores) < topN {
		topN = len(coarseScores)
	}
	topCandidates := coarseScores[:topN]

	// ── Phase 2: Fine search ──
	fineCfg := cfg
	fineCfg.RayGridX = 16
	fineCfg.RayGridY = 16
	fineCfg.NumProjections = 90

	fineSet := make(map[[2]float64]bool)
	for _, cand := range topCandidates {
		for dt := -5.0; dt <= 5; dt++ {
			for dp := -5.0; dp <= 5; dp++ {
				t := cand.Theta + dt
				p := cand.Phi + dp
				if t < 0 {
					t += 180
				}
				if t >= 180 {
					t -= 180
				}
				if p < 0 {
					p += 360
				}
				if p >= 360 {
					p -= 360
				}
				key := [2]float64{math.Round(t), math.Round(p)}
				if !fineSet[key] {
					fineSet[key] = true
				}
			}
		}
	}

	fineOrientations := make([]Orient, 0, len(fineSet))
	for key := range fineSet {
		isCoarse := false
		for _, ct := range coarseThetas {
			for _, cp := range coarsePhis {
				if math.Abs(key[0]-ct) < 0.5 && math.Abs(key[1]-cp) < 0.5 {
					isCoarse = true
					break
				}
			}
			if isCoarse {
				break
			}
		}
		if !isCoarse {
			fineOrientations = append(fineOrientations, Orient{key[0], key[1]})
		}
	}

	fineGrid := raycaster.ComputeRayGrid(fineCfg)
	fineScores := evaluateOrientations(bvhTree, fineOrientations, fineCfg, fineGrid, weights, method, onProgress, len(coarseOrientations), len(coarseOrientations)+len(fineOrientations))

	// ── Combine results ──
	allScores := append(coarseScores, fineScores...)

	bestIdx := 0
	worstIdx := 0
	for i := 1; i < len(allScores); i++ {
		if allScores[i].Score < allScores[bestIdx].Score {
			bestIdx = i
		}
		if allScores[i].Score > allScores[worstIdx].Score {
			worstIdx = i
		}
	}

	elapsed := time.Since(startTime).Seconds() * 1000 // ms

	res := &Result{
		BestOrientation:  allScores[bestIdx],
		WorstOrientation: allScores[worstIdx],
		AllScores:        allScores,
		SearchTimeMs:     elapsed,
	}

	// Compute IntelliScan angles if mesh is available
	if mesh != nil {
		best := allScores[bestIdx]
		is := ComputeIntelliScanAngles(mesh, best.Theta, best.Phi)
		res.IntelliScan = &is
	}

	return res, nil
}

// evaluateOrientations runs ray casting + objective scoring for a list of orientations.
func evaluateOrientations(bvhTree *bvh.BVH,
	orientations []Orient,
	cfg raycaster.ScannerConfig,
	grid raycaster.RayGrid,
	weights [3]float64, method string,
	onProgress ProgressFn, baseIdx, total int) []OrientationScore {

	scores := make([]OrientationScore, 0, len(orientations))

	for i, o := range orientations {
		result := raycaster.ComputeTransmissionLengths(o.Theta, o.Phi, bvhTree, cfg, grid)
		fMtl := objectives.FMtl(result.Lengths, 3)
		fEnergy := objectives.FEnergy(result.Lengths)
		fHdn := objectives.FHdn(result.MaxPerProjection)

		scores = append(scores, OrientationScore{
			Theta:            o.Theta,
			Phi:              o.Phi,
			FMtl:             fMtl,
			FEnergy:          fEnergy,
			FHdn:             fHdn,
			MaxPerProjection: result.MaxPerProjection,
		})

		// Report progress
		if onProgress != nil {
			onProgress(baseIdx+i+1, total, o.Theta, o.Phi)
		}
	}

	// Compute combined scores (needs all values for min/max normalization)
	if len(scores) > 0 {
		fMtlVals := make([]float64, len(scores))
		fEnergyVals := make([]float64, len(scores))
		fHdnVals := make([]float64, len(scores))
		for i, s := range scores {
			fMtlVals[i] = s.FMtl
			fEnergyVals[i] = s.FEnergy
			fHdnVals[i] = s.FHdn
		}

		combined := objectives.CombinedScore(fMtlVals, fEnergyVals, fHdnVals,
			weights[0], weights[1], weights[2], method)

		for i := range scores {
			scores[i].Score = combined[i]
		}
	}

	return scores
}
