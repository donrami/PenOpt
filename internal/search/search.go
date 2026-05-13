// Package search implements the coarse→fine grid search for optimal orientation.
// Based on Ito et al. 2020 §2.4: discretize (θ, φ) at 15° intervals (deviation from paper's
// 10° for speed — evaluates ~50% of the coarse orientations). Find top 3, then refine at 1°.
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
	CoverageFraction float64   // fraction of rays that intersected the mesh
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
	// Coverage detection
	MinCoverageFraction float64 `json:"minCoverageFraction"`          // lowest across all evaluated orientations
	CoverageWarning     string  `json:"coverageWarning,omitempty"`    // warning if undersampled
	// Auto-sizing for small-part handling (set by app/optimizer.go)
	AutoRayGrid int     `json:"autoRayGrid,omitempty"`   // auto-selected grid size based on part extent
	ExtentRatio float64 `json:"extentRatio,omitempty"`   // part full extent / detector width
	// Face-centroid fallback sampling
	SamplingMethod string `json:"samplingMethod,omitempty"` // "grid" or "face-centroid"
	// Convergence metrics
	ScoreGap        float64 `json:"scoreGap"`               // difference between best and 2nd-best score
	Top3Spread      float64 `json:"top3Spread"`             // max angular distance among top 3 (degrees)
	ConvergenceNote string  `json:"convergenceNote,omitempty"` // human-readable note
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

	// Decide sampling method: face-centroid for very small parts where grid undersamples.
	// Face-centroid is expensive (1 ray per face per projection), so it's only used:
	// - For the FINE phase only (coarse phase always uses grid-based sampling)
	// - When part fits in <3 inter-ray cells AND mesh has <3000 triangles
	// - With greatly reduced projections (8 instead of 18)
	// Larger small parts rely on the auto-sized grid for adequate sampling until
	// mesh simplification is implemented.
	useFaceCentroidFine := false
	useFaceCentroidCoarse := false
	if m != nil {
		partExtent := math.Max(m.Extent().X, math.Max(m.Extent().Y, m.Extent().Z))
		interRaySpacing := cfg.DetWidth / float64(cfg.RayGridX)
		isSmallPart := (partExtent * 2) < interRaySpacing*3
		isLowPoly := m.NumTris < 3000
		if isSmallPart && isLowPoly {
			// Low-poly tiny part: use face-centroid for accuracy
			useFaceCentroidFine = true
			cfg.NumProjections = min(cfg.NumProjections, 8)
		} else if isSmallPart && !isLowPoly {
			// Small but dense part: grid-based with auto-size takes care of it.
			// A 32×32 grid (1024 rays) at 36 proj = 37k rays vs 20k-face face-centroid
			// at 18 proj = 360k rays — grid is 10× cheaper per orientation.
			// The frontend will interpolate missing face values for the heatmap.
		}
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
	coarseRaws := evaluateOrientationsRaw(bvhTree, m, coarseOrientations, cfg, grid, onProgress, 0, len(coarseOrientations), useFaceCentroidCoarse)
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
	fineRaws := evaluateOrientationsRaw(bvhTree, m, fineOrientations, fineCfg, fineGrid, onProgress, len(coarseOrientations), len(coarseOrientations)+len(fineOrientations), useFaceCentroidFine)
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

	// ── Convergence metrics ──
	var scoreGap float64
	var top3Spread float64
	var convergenceNote string
	if len(allScores) >= 2 {
		// ScoreGap = difference between best and second-best normalized score
		scoreGap = allScores[1].Score - allScores[bestIdx].Score
		if scoreGap < 0 {
			scoreGap = 0
		}
	}
	if len(allScores) >= 3 {
		// Find top 3 distinct orientations by score
		top3 := []OrientationScore{allScores[bestIdx]}
		for _, s := range allScores {
			if len(top3) >= 3 {
				break
			}
			if s.Theta != allScores[bestIdx].Theta || s.Phi != allScores[bestIdx].Phi {
				top3 = append(top3, s)
			}
		}
		if len(top3) >= 3 {
			// Max angular distance among top 3
			maxDist := 0.0
			for i := 0; i < 3; i++ {
				for j := i + 1; j < 3; j++ {
					d := angularDistance(top3[i].Theta, top3[i].Phi, top3[j].Theta, top3[j].Phi)
					if d > maxDist {
						maxDist = d
					}
				}
			}
			top3Spread = maxDist
		}
	}
	if scoreGap < 0.01 {
		convergenceNote = "Best and runner-up are nearly tied. Consider the top 2 orientations."
	}
	if top3Spread > 10 {
		note := fmt.Sprintf("Top 3 orientations span %.0f° — multiple local optima found.", top3Spread)
		if convergenceNote != "" {
			convergenceNote += " " + note
		} else {
			convergenceNote = note
		}
	}

	// ── T3.2: Reference orientation (θ=0°, φ=0°) ──
	var refOrientation *OrientationScore
	if bvhTree != nil {
		refScore := EvaluateSingle(bvhTree, m, 0, 0, fineCfg)
		refOrientation = &refScore
	}

	// ── Coverage detection across all evaluations ──
	minCov := 1.0
	for _, r := range allRaws {
		if r.CoverageFraction < minCov {
			minCov = r.CoverageFraction
		}
	}
	var coverageWarning string
	if minCov < 0.05 {
		coverageWarning = fmt.Sprintf(
			"Only %.1f%% of rays intersected the part. Consider increasing ray grid resolution or using a scanner with smaller detector.",
			minCov*100)
	} else if minCov < 0.20 {
		coverageWarning = fmt.Sprintf(
			"Ray coverage is low (%.1f%% of rays hit the part). Results may be less reliable for fine features.",
			minCov*100)
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
		MinCoverageFraction: minCov,
		CoverageWarning:     coverageWarning,
		ScoreGap:            scoreGap,
		Top3Spread:          top3Spread,
		ConvergenceNote:     convergenceNote,
	}

	res.SamplingMethod = "grid"
	if useFaceCentroidFine {
		res.SamplingMethod = "face-centroid-fine"
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
	onProgress ProgressFn, baseIdx, total int,
	useFaceCentroid bool) []OrientationRaw {

	raws := make([]OrientationRaw, 0, len(orientations))

	for i, o := range orientations {
		var result raycaster.OrientationResult
		if useFaceCentroid && m != nil {
			result = raycaster.ComputeTransmissionLengthsFaceCentroid(o.Theta, o.Phi, m, bvhTree, cfg)
		} else {
			result = raycaster.ComputeTransmissionLengths(o.Theta, o.Phi, bvhTree, cfg, grid)
		}
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
			CoverageFraction: result.CoverageFraction,
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

// angularDistance returns the Euclidean distance between two orientations in (θ, φ) space.
// Not true great-circle distance but adequate for small-angle comparisons within the search range.
func angularDistance(t1, p1, t2, p2 float64) float64 {
	dt := t1 - t2
	dp := p1 - p2
	return math.Sqrt(dt*dt + dp*dp)
}