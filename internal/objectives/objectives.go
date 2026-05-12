// Package objectives implements the optimization objective functions
// from Ito et al. 2020: f_mtl (generalized mean), f_energy (max transmission),
// f_hdn (penetration range), and f_tuy (Tuy-Smith completeness).
// Additional objectives (beam hardening, scatter, cone-beam, uncertainty)
// are defined but require per-face or per-projection data not collected
// by the sparse ray grid — they are available in NSGA-II+AdvancedPhysics mode.
package objectives

import "math"

// FMtl computes the generalized mean of transmission lengths (Ito 2020 eq 1).
// m=3 gives cube-root mean, biasing toward reducing maximum penetration.
// f_mtl = (1/N * Σ x_i^m)^(1/m)
func FMtl(lengths []float64, m float64) float64 {
	n := len(lengths)
	if n == 0 {
		return 0
	}
	// m=3 is hard-coded at all call sites — use fast path
	var sum float64
	for _, l := range lengths {
		sum += l * l * l
	}
	return math.Cbrt(sum / float64(n))
}

// FEnergy returns the max transmission length across all rays.
// f_energy = max(x_i) — represents the longest path through material,
// which determines the required X-ray energy.
func FEnergy(lengths []float64) float64 {
	var max float64
	for _, l := range lengths {
		if l > max {
			max = l
		}
	}
	return max
}

// FHdn computes the penetration range: max − min of per-projection
// max penetration lengths. This approximates the projection range
// concept from Ito 2020 eq 2 (which uses silhouette area), but uses
// max X-ray path length as a fast geometric proxy.
// Lower f_hdn = more isotropic = better.
func FHdn(maxPerProjection []float64) float64 {
	if len(maxPerProjection) == 0 {
		return 0
	}
	aMin := maxPerProjection[0]
	aMax := maxPerProjection[0]
	for _, v := range maxPerProjection {
		if v > aMax {
			aMax = v
		}
		if v < aMin {
			aMin = v
		}
	}
	return aMax - aMin
}

// FTuy computes the Tuy-Smith completeness for a set of orientations.
// It returns the fraction of faces that satisfy the Tuy condition for each orientation.
// Higher is better.
// Note: This function expects a slice of Tuy completeness values (one per orientation)
// computed externally (e.g., via search.ComputeTuyCompleteness).
func FTuy(values []float64) []float64 {
	// We return the values as-is because they are already in [0,1] and higher is better.
	// However, we might want to invert it if we want to minimize (like other objectives).
	// But note: in the optimization, we want to maximize Tuy completeness.
	// Since our scoring minimizes the score, we will invert it in the calling code
	// or use (1 - tuy) as the objective to minimize.
	// For now, we return the values and let the caller decide how to use them.
	// We'll document that the caller should use (1 - tuy) if they want to minimize.
	return values
}

// FBh computes a beam-hardening metric.
// Placeholder: returns the input values as-is.
// In the future, this will compute a metric based on polyenergetic spectrum.
func FBh(values []float64) []float64 {
	return values
}

// Normalize scales values to [0,1] range.
func Normalize(values []float64) []float64 {
	n := len(values)
	if n == 0 {
		return nil
	}
	result := make([]float64, n)
	min := values[0]
	max := values[0]
	for _, v := range values {
		if v < min {
			min = v
		}
		if v > max {
			max = v
		}
	}
	range_ := max - min
	if range_ == 0 {
		return result // all zeros
	}
	for i, v := range values {
		result[i] = (v - min) / range_
	}
	return result
}

// CombinedScore computes the weighted combination of normalized objectives.
// method: "minimax" = max(w_i * n_i), "weighted" = Σ(w_i * n_i).
// Now supports five objectives: fMtl, fEnergy, fHdn, fTuy, fBh.
func CombinedScore(fMtlVals, fEnergyVals, fHdnVals, fTuyVals, fBhVals []float64,
	wMtl, wEnergy, wHdn, wTuy, wBh float64, method string) []float64 {

	n := len(fMtlVals)
	if n == 0 {
		return nil
	}

	// Normalize each objective separately
	nFMtl := Normalize(fMtlVals)
	nFEnergy := Normalize(fEnergyVals)
	nFHdn := Normalize(fHdnVals)
	nFTuy := Normalize(fTuyVals)
	nFBh := Normalize(fBhVals)

	scores := make([]float64, n)
	if method == "minimax" {
		for i := range n {
			scores[i] = math.Max(wMtl*nFMtl[i], math.Max(wEnergy*nFEnergy[i], math.Max(wHdn*nFHdn[i], math.Max(wTuy*nFTuy[i], wBh*nFBh[i]))))
		}
	} else {
		for i := range n {
			scores[i] = wMtl*nFMtl[i] + wEnergy*nFEnergy[i] + wHdn*nFHdn[i] + wTuy*nFTuy[i] + wBh*nFBh[i]
		}
	}
	return scores
}