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
	FTuy             float64   `json:"fTuy"`
	Score            float64   `json:"score"`
	MaxPerProjection []float64 `json:"maxPerProjection"`
}

// OrientationRaw holds raw (pre-normalization) objective values for one orientation.
type OrientationRaw struct {
	Theta            float64
	Phi              float64
	FMtlRaw          float64
	FEnergyRaw       float64
	FHdnRaw          float64
	FTuyRaw          float64
	MaxPerProjection []float64
}

// Result holds the full optimization result.
type Result struct {
	BestOrientation  OrientationScore   `json:"bestOrientation"`
	WorstOrientation OrientationScore   `json:"worstOrientation"`
	AllScores        []OrientationScore `json:"allScores"`
	SearchTimeMs     float64            `json:"searchTimeMs"`
	CoarseTimeMs     float64            `json:"coarseTimeMs"`
	FineTimeMs       float64            `json:"fineTimeMs"`
	NumCoarseEval    int                `json:"numCoarseEval"`
	NumFineEval      int                `json:"numFineEval"`
	IntelliScan      *IntelliScanResult `json:"intelliScan,omitempty"`
}

// EvaluateSingle evaluates a single orientation (for UI preview / heatmap).
func EvaluateSingle(bvhTree *bvh.BVH, m *mesh.Mesh, theta, phi float64, cfg raycaster.ScannerConfig) OrientationScore {
	grid := raycaster.ComputeRayGrid(cfg)
	result := raycaster.ComputeTransmissionLengths(theta, phi, bvhTree, cfg, grid)
	fMtl := objectives.FMtl(result.Lengths, 3)
	fEnergy := objectives.FEnergy(result.Lengths)
	fHdn := objectives.FHdn(result.MaxPerProjection)

	var fTuy float64
	if m != nil {
		fTuy = ComputeTuyCompleteness(m, theta, phi)
	}

	return OrientationScore{
		Theta:            theta,
		Phi:              phi,
		FMtl:             fMtl,
		FEnergy:          fEnergy,
		FHdn:             fHdn,
		FTuy:             fTuy,
		MaxPerProjection: result.MaxPerProjection,
	}
}

// ProgressFn is called after each orientation evaluation during search.
type ProgressFn func(idx, total int, theta, phi float64)

// Run executes the coarse→fine grid search.
// weights: [w_mtl, w_energy, w_hdn]
// method: "weighted" or "minimax"
// onProgress is called after each orientation (may be nil).
// m is the mesh used for Tuy completeness computation.
func Run(bvhTree *bvh.BVH, m *mesh.Mesh, cfg raycaster.ScannerConfig,
	weights [3]float64, method string, onProgress ProgressFn) (*Result, error) {

	startTime := time.Now()

	// ── Phase 1: Coarse search ──
	coarseOrientations := make([]Orient, 0, len(coarseThetas)*len(coarsePhis))
	for _, theta := range coarseThetas {
		for _, phi := range coarsePhis {
			coarseOrientations = append(coarseOrientations, Orient{theta, phi})
		}
	}

	coarseStart := time.Now()
	grid := raycaster.ComputeRayGrid(cfg)
	coarseRaws := evaluateOrientationsRaw(bvhTree, m, coarseOrientations, cfg, grid, onProgress, 0, len(coarseOrientations))
	coarseTime := time.Since(coarseStart).Seconds() * 1000

	if len(coarseRaws) < 2 {
		return nil, nil
	}

	// Find top 3 candidates using provisional ranking (coarse-only normalization)
	// This is a guide for which regions to refine, not a final ranking.
	provisionalScores := globalScoreAndNormalize(coarseRaws, weights, method)
	type provisional struct {
		raw OrientationRaw
		idx int
	}
	provisionals := make([]provisional, len(coarseRaws))
	for i, r := range coarseRaws {
		provisionals[i] = provisional{raw: r, idx: i}
	}
	sort.Slice(provisionals, func(i, j int) bool {
		return provisionalScores[provisionals[i].idx] < provisionalScores[provisionals[j].idx]
	})

	topN := 3
	if len(provisionals) < topN {
		topN = len(provisionals)
	}
	topCandidates := provisionals[:topN]

	// ── Phase 2: Fine search ──
	fineCfg := cfg
	fineCfg.RayGridX = 16
	fineCfg.RayGridY = 16
	fineCfg.NumProjections = 90

	fineSet := make(map[[2]float64]bool)
	for _, cand := range topCandidates {
		for dt := -5.0; dt <= 5; dt++ {
			for dp := -5.0; dp <= 5; dp++ {
				t := cand.raw.Theta + dt
				p := cand.raw.Phi + dp
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

	fineStart := time.Now()
	fineGrid := raycaster.ComputeRayGrid(fineCfg)
	fineRaws := evaluateOrientationsRaw(bvhTree, m, fineOrientations, fineCfg, fineGrid, onProgress, len(coarseOrientations), len(coarseOrientations)+len(fineOrientations))
	fineTime := time.Since(fineStart).Seconds() * 1000

	// ── Combine results and globally normalize ──
	allRaws := append(coarseRaws, fineRaws...)
	allScores := make([]OrientationScore, len(allRaws))
	for i, r := range allRaws {
		allScores[i] = OrientationScore{
			Theta:            r.Theta,
			Phi:              r.Phi,
			FMtl:             r.FMtlRaw,
			FEnergy:          r.FEnergyRaw,
			FHdn:             r.FHdnRaw,
			FTuy:             r.FTuyRaw,
			MaxPerProjection: r.MaxPerProjection,
		}
	}

	// Global normalization across ALL orientations together
	fMtlVals := make([]float64, len(allRaws))
	fEnergyVals := make([]float64, len(allRaws))
	fHdnVals := make([]float64, len(allRaws))
	for i, r := range allRaws {
		fMtlVals[i] = r.FMtlRaw
		fEnergyVals[i] = r.FEnergyRaw
		fHdnVals[i] = r.FHdnRaw
	}

	combined := objectives.CombinedScore(fMtlVals, fEnergyVals, fHdnVals,
		weights[0], weights[1], weights[2], method)

	for i := range allScores {
		allScores[i].Score = combined[i]
	}

	// Sort by score to find best and worst
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
		CoarseTimeMs:     coarseTime,
		FineTimeMs:       fineTime,
		NumCoarseEval:    len(coarseOrientations),
		NumFineEval:      len(fineOrientations),
	}

	return res, nil
}

// evaluateOrientationsRaw runs ray casting for a list of orientations,
// returning raw (pre-normalization) objective values without scoring.
// Global normalization is applied later in Run() to avoid batch-local bias.
// m is the mesh used for Tuy-Smith completeness computation.
func evaluateOrientationsRaw(bvhTree *bvh.BVH, m *mesh.Mesh,
	orientations []Orient,
	cfg raycaster.ScannerConfig,
	grid raycaster.RayGrid,
	onProgress ProgressFn, baseIdx, total int) []OrientationRaw {

	raws := make([]OrientationRaw, 0, len(orientations))

	for i, o := range orientations {
		result := raycaster.ComputeTransmissionLengths(o.Theta, o.Phi, bvhTree, cfg, grid)
		fMtl := objectives.FMtl(result.Lengths, 3)
		fEnergy := objectives.FEnergy(result.Lengths)
		fHdn := objectives.FHdn(result.MaxPerProjection)

		var fTuy float64
		if m != nil {
			fTuy = ComputeTuyCompleteness(m, o.Theta, o.Phi)
		}

		raws = append(raws, OrientationRaw{
			Theta:            o.Theta,
			Phi:              o.Phi,
			FMtlRaw:          fMtl,
			FEnergyRaw:       fEnergy,
			FHdnRaw:          fHdn,
			FTuyRaw:          fTuy,
			MaxPerProjection: result.MaxPerProjection,
		})

		// Report progress
		if onProgress != nil {
			onProgress(baseIdx+i+1, total, o.Theta, o.Phi)
		}
	}

	return raws
}

// globalScoreAndNormalize applies global normalization and combined scoring
// to a batch of raw objective values. Used for provisional ranking within
// one batch (e.g., coarse-only ranking for top-3 selection).
func globalScoreAndNormalize(raws []OrientationRaw,
	weights [3]float64, method string) []float64 {

	n := len(raws)
	scores := make([]float64, n)
	if n == 0 {
		return scores
	}

	fMtlVals := make([]float64, n)
	fEnergyVals := make([]float64, n)
	fHdnVals := make([]float64, n)
	for i, r := range raws {
		fMtlVals[i] = r.FMtlRaw
		fEnergyVals[i] = r.FEnergyRaw
		fHdnVals[i] = r.FHdnRaw
	}

	return objectives.CombinedScore(fMtlVals, fEnergyVals, fHdnVals,
		weights[0], weights[1], weights[2], method)
}
