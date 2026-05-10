// Package objectives implements the optimization objective functions
// from Ito et al. 2020: f_mtl (generalized mean), f_energy (max transmission),
// and f_hdn (projection area range).
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
	var sum float64
	for _, l := range lengths {
		sum += math.Pow(l, m)
	}
	return math.Pow(sum/float64(n), 1/m)
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

// FHdn computes the projection area range Amax−Amin (Ito 2020 eq 2).
// A projection area = number of rays that hit the object.
// We use maxPerProjection to compute the heuristic: the range of max
// transmission lengths across projections gives a measure of isotropy.
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
func CombinedScore(fMtlVals, fEnergyVals, fHdnVals []float64,
	wMtl, wEnergy, wHdn float64, method string) []float64 {

	n := len(fMtlVals)
	if n == 0 {
		return nil
	}

	nFMtl := Normalize(fMtlVals)
	nFEnergy := Normalize(fEnergyVals)
	nFHdn := Normalize(fHdnVals)

	scores := make([]float64, n)
	if method == "minimax" {
		for i := range n {
			scores[i] = math.Max(wMtl*nFMtl[i], math.Max(wEnergy*nFEnergy[i], wHdn*nFHdn[i]))
		}
	} else {
		for i := range n {
			scores[i] = wMtl*nFMtl[i] + wEnergy*nFEnergy[i] + wHdn*nFHdn[i]
		}
	}
	return scores
}
