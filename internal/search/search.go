// Package search implements the coarse→fine grid search for optimal orientation.
// Based on Ito et al. 2020 §2.4: discretize (θ, φ) at 10° intervals, find top 3,
// then refine at 1° intervals around each candidate.
package search

import (
	"fmt"
	"math"
	"sort"
	"time"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"penopt/internal/objectives"
	"penopt/internal/raycaster"
)

// generateSearchGrid returns coarse θ and φ grids for the given range (degrees).
// The grid uses 15° steps; ±0° is always included.
func generateSearchGrid(rangeDeg int) (thetas, phis []float64) {
	if rangeDeg <= 0 {
		rangeDeg = 45
	}
	if rangeDeg < 30 {
		rangeDeg = 30
	}
	if rangeDeg > 75 {
		rangeDeg = 75
	}
	step := 15.0
	// Build the list
	for t := -float64(rangeDeg); t <= float64(rangeDeg)+1e-9; t += step {
		thetas = append(thetas, t)
	}
	// Ensure ±0° is always present (may be skipped if rangeDeg % 15 != 0)
	hasZero := false
	for _, v := range thetas {
		if math.Abs(v) < 1e-9 {
			hasZero = true
			break
		}
	}
	if !hasZero {
		thetas = append(thetas, 0)
		sort.Float64s(thetas)
	}
	phis = make([]float64, len(thetas))
	copy(phis, thetas)
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
	FBh              float64   `json:"fBh"`
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
	FBhRaw           float64
	MaxPerProjection []float64
}

// Result holds the full optimization result.
type Result struct {
	BestOrientation     OrientationScore    `json:"bestOrientation"`
	WorstOrientation    OrientationScore    `json:"worstOrientation"`
	AllScores           []OrientationScore  `json:"allScores"`
	SearchTimeMs        float64             `json:"searchTimeMs"`
	CoarseTimeMs        float64             `json:"coarseTimeMs"`
	FineTimeMs          float64             `json:"fineTimeMs"`
	NumCoarseEval       int                 `json:"numCoarseEval"`
	NumFineEval         int                 `json:"numFineEval"`
	IntelliScan         *IntelliScanResult  `json:"intelliScan,omitempty"`
	// T1.1: constrained optimum detection
	ConstrainedOptimum  bool                `json:"constrainedOptimum"`
	BoundaryWarning     string              `json:"boundaryWarning,omitempty"`
	SearchRange         int                 `json:"searchRange"` // degrees, canonical record of range used
	// T2.3: coarse/fine convergence
	CoarseFineMismatch  bool                `json:"coarseFineMismatch"`
	MismatchNote        string              `json:"mismatchNote,omitempty"`
	// T3.2: reference orientation comparison
	ReferenceOrientation *OrientationScore  `json:"referenceOrientation,omitempty"`
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

	// Placeholder for beam-hardening metric
	var fBh float64
	// For now, we set it to 0. In the future, we can compute a proper metric.
	// For example, we could compute the variance of the path lengths per projection
	// as a proxy for beam-hardening variation.
	// But note: the current FHdn already uses the range of max per projection.
	// We'll leave it as 0 for now and implement later.

	return OrientationScore{
		Theta:            theta,
		Phi:              phi,
		FMtl:             fMtl,
		FEnergy:          fEnergy,
		FHdn:             fHdn,
		FTuy:             fTuy,
		FBh:              fBh,
		MaxPerProjection: result.MaxPerProjection,
	}
}

// ProgressFn is called after each orientation evaluation during search.
type ProgressFn func(idx, total int, theta, phi float64)

// Run executes the coarse→fine grid search.
// weights: [w_mtl, w_energy, w_hdn, w_tuy, w_bh]
// method: "weighted" or "minimax"
// onProgress is called after each orientation (may be nil).
// m is the mesh used for Tuy completeness computation.
// rayGridOverride: if > 0, overrides coarse ray grid (fine = min(override*2, 32)).
// searchRange: degrees, 0 = default 45°.
func Run(bvhTree *bvh.BVH, m *mesh.Mesh, cfg raycaster.ScannerConfig,
	weights [5]float64, method string, onProgress ProgressFn, rayGridOverride int, searchRange int) (*Result, error) {

	startTime := time.Now()

	// Resolve and validate search range
	if searchRange <= 0 {
		searchRange = 45
	}
	if searchRange < 30 {
		searchRange = 30
	}
	if searchRange > 75 {
		searchRange = 75
	}

	// ── Phase 1: Coarse search ──
	coarseThetas, coarsePhis := generateSearchGrid(searchRange)
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

	// Build coarse score map for convergence comparison (T2.3)
	coarseScoreMap := make(map[string]float64)
	coarseRawMap := make(map[string]OrientationRaw)
	coarseNormalized := globalScoreAndNormalize(coarseRaws, weights, method)
	for i, r := range coarseRaws {
		key := fmt.Sprintf("%.1f,%.1f", math.Round(r.Theta*10)/10, math.Round(r.Phi*10)/10)
		coarseScoreMap[key] = coarseNormalized[i]
		coarseRawMap[key] = r
	}

	// Find top 3 candidates using provisional ranking (coarse-only normalization)
	provisionalScores := coarseNormalized
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
	fineCfg.NumProjections = 90
	// T2.1: fine ray grid = 2x coarse grid, capped at 32
	fineRayGridXY := 16
	if rayGridOverride > 0 {
		fineRayGridXY = rayGridOverride * 2
		if fineRayGridXY > 32 {
			fineRayGridXY = 32
		}
	}
	fineCfg.RayGridX = fineRayGridXY
	fineCfg.RayGridY = fineRayGridXY

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
			FBh:              r.FBhRaw,
			MaxPerProjection: r.MaxPerProjection,
		}
	}

	// Global normalization across ALL orientations together
	fMtlVals := make([]float64, len(allRaws))
	fEnergyVals := make([]float64, len(allRaws))
	fHdnVals := make([]float64, len(allRaws))
	fTuyVals := make([]float64, len(allRaws))
	fBhVals := make([]float64, len(allRaws))
	for i, r := range allRaws {
		fMtlVals[i] = r.FMtlRaw
		fEnergyVals[i] = r.FEnergyRaw
		fHdnVals[i] = r.FHdnRaw
		fTuyVals[i] = r.FTuyRaw
		fBhVals[i] = r.FBhRaw
	}

	combined := objectives.CombinedScore(fMtlVals, fEnergyVals, fHdnVals, fTuyVals, fBhVals,
		weights[0], weights[1], weights[2], weights[3], weights[4], method)

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

	// ── T1.1: Constrained optimum detection ──
	// Use the actual configured range so the 5° margin is correct
	boundaryThreshold := float64(searchRange) - 5.0
	bestTheta := allScores[bestIdx].Theta
	bestPhi := allScores[bestIdx].Phi
	constrainedOptimum := false
	var boundaryWarning string
	if math.Abs(bestTheta) >= boundaryThreshold || math.Abs(bestPhi) >= boundaryThreshold {
		constrainedOptimum = true
		boundaryWarning = fmt.Sprintf(
			"Best orientation is within 5° of search boundary (±%d°). Consider extending the range to find the true optimum.",
			searchRange)
	}

	// ── T2.3: Coarse/fine convergence check ──
	coarseFineMismatch := false
	var mismatchNote string
	bestKey := fmt.Sprintf("%.1f,%.1f", math.Round(bestTheta*10)/10, math.Round(bestPhi*10)/10)
	if coarseScore, ok := coarseScoreMap[bestKey]; ok {
		bestScore := allScores[bestIdx].Score
		diff := math.Abs(bestScore - coarseScore)
		if diff > 0.01 {
			coarseFineMismatch = true
			diffPct := diff * 100
			mismatchNote = fmt.Sprintf("Fine-resolution evaluation produced %.1f%% different score for top candidate due to ray grid resolution change (coarse: %.3f, fine: %.3f).", diffPct, coarseScore, bestScore)
		}
	}

	// ── T3.2: Reference orientation (θ=0°, φ=0°) ──
	var refOrientation *OrientationScore
	if bvhTree != nil {
		refScore := EvaluateSingle(bvhTree, m, 0, 0, fineCfg)
		refOrientation = &refScore
	}

	res := &Result{
		BestOrientation:     allScores[bestIdx],
		WorstOrientation:    allScores[worstIdx],
		AllScores:           allScores,
		SearchTimeMs:        elapsed,
		CoarseTimeMs:        coarseTime,
		FineTimeMs:          fineTime,
		NumCoarseEval:       len(coarseOrientations),
		NumFineEval:         len(fineOrientations),
		ConstrainedOptimum:  constrainedOptimum,
		BoundaryWarning:     boundaryWarning,
		SearchRange:         searchRange,
		CoarseFineMismatch:  coarseFineMismatch,
		MismatchNote:        mismatchNote,
		ReferenceOrientation: refOrientation,
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

		// Placeholder for beam-hardening metric
		var fBh float64
		// For now, we set it to 0. In the future, we can compute a proper metric.

		raws = append(raws, OrientationRaw{
			Theta:            o.Theta,
			Phi:              o.Phi,
			FMtlRaw:          fMtl,
			FEnergyRaw:       fEnergy,
			FHdnRaw:          fHdn,
			FTuyRaw:          fTuy,
			FBhRaw:           fBh,
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
	weights [5]float64, method string) []float64 {

	n := len(raws)
	scores := make([]float64, n)
	if n == 0 {
		return scores
	}

	fMtlVals := make([]float64, n)
	fEnergyVals := make([]float64, n)
	fHdnVals := make([]float64, n)
	fTuyVals := make([]float64, n)
	fBhVals := make([]float64, n)
	for i, r := range raws {
		fMtlVals[i] = r.FMtlRaw
		fEnergyVals[i] = r.FEnergyRaw
		fHdnVals[i] = r.FHdnRaw
		fTuyVals[i] = r.FTuyRaw
		fBhVals[i] = r.FBhRaw
	}

	return objectives.CombinedScore(fMtlVals, fEnergyVals, fHdnVals, fTuyVals, fBhVals,
		weights[0], weights[1], weights[2], weights[3], weights[4], method)
}