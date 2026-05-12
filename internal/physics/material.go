// Package physics provides the NIST XCOM material database and Beer-Lambert
// X-ray physics calculations. Ported from the JS CT.MATS / CT.FILTER_MATS / CT.FILTERS.
package physics

import (
	"fmt"
	"math"
)

// MuRhoPoint is a single (energy keV, μ/ρ cm²/g) data point from NIST XCOM.
type MuRhoPoint struct {
	Energy float64 `json:"energy"`
	MuRho  float64 `json:"muRho"`
}

// Material describes a material with its NIST XCOM mass attenuation data.
type Material struct {
	ID    string       `json:"id"`
	Name  string       `json:"name"`
	Cat   string       `json:"cat"`   // "M" = metallic, "N" = non-metallic
	Rho   float64      `json:"rho"`   // density (g/cm³)
	Color string       `json:"color"` // hex color for UI
	KEdge float64      `json:"kEdge,omitempty"` // K-edge energy (keV), if any
	Data  []MuRhoPoint `json:"data"`  // tabulated μ/ρ data
}

// FilterLayer is a single filter layer (material + thickness).
type FilterLayer struct {
	Mat string  `json:"mat"`
	MM  float64 `json:"mm"`
}

// Filter describes a beam pre-filter preset.
type Filter struct {
	ID     string        `json:"id"`
	Name   string        `json:"name"`
	Icon   string        `json:"icon"`
	Desc   string        `json:"desc"`
	Layers []FilterLayer `json:"layers"`
}

// ── Public API ──

// Materials returns the full NIST XCOM material database (40+ materials + AM variants).
func Materials() []Material { return mats }

// FilterMaterials returns the filter material database (Cu, Zn).
func FilterMaterials() map[string]Material { return filterMats }

// Filters returns the beam pre-filter presets.
func Filters() []Filter { return filters }

// MaterialByID finds a material by its ID string.
func MaterialByID(id string) (Material, bool) {
	for _, m := range mats {
		if m.ID == id {
			return m, true
		}
	}
	return Material{}, false
}

// ── Interpolation ──

// LogLogInterp performs log-log interpolation for a given energy against a set
// of (energy, value) points. Follows NIST XCOM approach: linear in log space.
func LogLogInterp(E float64, pts []MuRhoPoint) float64 {
	if len(pts) == 0 {
		return 0
	}
	if E <= pts[0].Energy {
		return pts[0].MuRho
	}
	last := pts[len(pts)-1]
	if E >= last.Energy {
		return last.MuRho
	}
	for i := 0; i < len(pts)-1; i++ {
		if E >= pts[i].Energy && E <= pts[i+1].Energy {
			logE := math.Log(E)
			logE0 := math.Log(pts[i].Energy)
			logE1 := math.Log(pts[i+1].Energy)
			t := (logE - logE0) / (logE1 - logE0)
			logMu0 := math.Log(pts[i].MuRho)
			logMu1 := math.Log(pts[i+1].MuRho)
			return math.Exp(logMu0 + t*(logMu1-logMu0))
		}
	}
	return last.MuRho
}

// ── Beer-Lambert Physics ──

// CalcMu computes the linear attenuation coefficient μ (cm⁻¹) at energy Eeff (keV).
func CalcMu(mat Material, Eeff float64) float64 {
	return LogLogInterp(Eeff, mat.Data) * mat.Rho
}

// CalcTransmission computes T = exp(-μ·x). x is in mm, μ is in cm⁻¹.
func CalcTransmission(mu float64, xMM float64) float64 {
	return math.Exp(-mu * (xMM / 10))
}

// CalcTMm returns penetration length (mm) for a given transmission Tmin.
func CalcTMm(mu float64, Tmin float64) float64 {
	return (-math.Log(Tmin) / mu) * 10
}

// FilterTrans computes transmission through a multi-layer filter.
func FilterTrans(E float64, layers []FilterLayer) float64 {
	T := 1.0
	for _, layer := range layers {
		mat, ok := filterMats[layer.Mat]
		if !ok {
			continue
		}
		muRho := LogLogInterp(E, mat.Data)
		T *= math.Exp(-muRho*mat.Rho*(layer.MM/10))
	}
	return T
}

// EffectiveEnergyResult holds computed beam parameters after filtering.
type EffectiveEnergyResult struct {
	EEff      float64 `json:"eEff"`
	FluxRatio float64 `json:"fluxRatio"`
	EShift    float64 `json:"eShift"`
}

// ComputeEffectiveEnergy calculates the effective beam energy after pre-filtering.
func ComputeEffectiveEnergy(EInput float64, layers []FilterLayer) EffectiveEnergyResult {
	if len(layers) == 0 {
		return EffectiveEnergyResult{EEff: EInput, FluxRatio: 1, EShift: 0}
	}

	kVp := EInput / 0.40
	N := 120
	Emin := 20.0
	Emax := kVp
	dE := (Emax - Emin) / float64(N)

	var sumPhi, sumPhiF, sumEPhi, sumEPhiF float64

	for i := 0; i < N; i++ {
		E := Emin + (float64(i)+0.5)*dE
		if E <= 0 || E >= Emax {
			continue
		}
		phi := math.Max(0, (kVp-E)/E)
		T := FilterTrans(E, layers)
		phiF := phi * T

		sumPhi += phi * dE
		sumPhiF += phiF * dE
		sumEPhi += E * phi * dE
		sumEPhiF += E * phiF * dE
	}

	eUnfilt := EInput
	if sumPhi > 0 {
		eUnfilt = sumEPhi / sumPhi
	}
	eEff := EInput
	if sumPhiF > 0 {
		eEff = sumEPhiF / sumPhiF
	}
	if eEff < EInput*0.8 {
		eEff = EInput * 0.8
	}
	fluxRatio := 1.0
	if sumPhi > 0 {
		fluxRatio = sumPhiF / sumPhi
	}

	return EffectiveEnergyResult{
		EEff:      eEff,
		FluxRatio: fluxRatio,
		EShift:    eEff - eUnfilt,
	}
}

// HVLCu computes copper half-value layer (mm) at energy E.
func HVLCu(E float64) float64 {
	cuMat := filterMats["cu"]
	muRho := LogLogInterp(E, cuMat.Data)
	mu := muRho * cuMat.Rho
	return (math.Log(2) / mu) * 10
}

// RecommendKV estimates the tube voltage (kV) to penetrate maxPenetrationMM
// using polyenergetic spectrum integration and optional beam filter attenuation.
// For backward compatibility, when filterLayers is nil, falls back to kV*0.40.
func RecommendKVWithFilter(mat Material, maxPenetrationMM float64, Tmin float64, filterLayers []FilterLayer) (kV int, eEff float64, T float64) {
	for kVguess := 50; kVguess <= 500; kVguess += 10 {
		var keff float64
		if len(filterLayers) > 0 {
			// Use polyenergetic effective energy via spectrum integration
			fe := ComputeEffectiveEnergy(float64(kVguess), filterLayers)
			keff = fe.EEff
		} else {
			keff = float64(kVguess) * 0.40
		}
		mu := CalcMu(mat, keff)
		T := CalcTransmission(mu, maxPenetrationMM)
		if T >= Tmin {
			return kVguess, keff, T
		}
	}
	return 500, 200.0, 0.0
}

// RecommendKV estimates the tube voltage (kV) to penetrate maxPenetrationMM.
// Wrapper for backward compatibility — uses kV*0.40 effective energy with no filter.
func RecommendKV(mat Material, maxPenetrationMM float64, Tmin float64) (kV int, eEff float64, T float64) {
	return RecommendKVWithFilter(mat, maxPenetrationMM, Tmin, nil)
}

// FmtPenetration formats a penetration length (mm) for display.
func FmtPenetration(mm float64) string {
	if mm > 9999 {
		return ">10 m"
	}
	if mm >= 1000 {
		return fmt.Sprintf("%.2f m", mm/1000)
	}
	if mm >= 100 {
		return fmt.Sprintf("%.0f mm", mm)
	}
	return fmt.Sprintf("%.1f mm", mm)
}
