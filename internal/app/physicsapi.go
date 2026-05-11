package app

import (
	"encoding/json"

	"penopt/internal/physics"
)

// PhysicsAPI exposes material/filter/beam physics to the frontend.
type PhysicsAPI struct{}

func NewPhysicsAPI() *PhysicsAPI { return &PhysicsAPI{} }

func (pa *PhysicsAPI) GetMaterials() string {
	data, _ := json.Marshal(physics.Materials())
	return string(data)
}

func (pa *PhysicsAPI) GetFilters() string {
	data, _ := json.Marshal(physics.Filters())
	return string(data)
}

type FilterStats struct {
	EEff      float64 `json:"eEff"`
	EShift    float64 `json:"eShift"`
	FluxRatio float64 `json:"fluxRatio"`
	HvlCu     float64 `json:"hvlCu"`
}

type BeamParamsResult struct {
	MuRho  float64      `json:"muRho"`
	Mu     float64      `json:"mu"`
	TMm    float64      `json:"tMm"`
	TMin   float64      `json:"tMin"`
	Eeff   float64      `json:"eEff"`
	Filter *FilterStats `json:"filter,omitempty"`
}

func (pa *PhysicsAPI) CalcBeamParams(energy float64, tPct float64, filterID string, materialID string) string {
	mat, ok := physics.MaterialByID(materialID)
	if !ok {
		return `{"error":"unknown material"}`
	}

	var filterLayers []physics.FilterLayer
	var filterObj *physics.Filter
	for _, f := range physics.Filters() {
		if f.ID == filterID {
			filterObj = &f
			filterLayers = f.Layers
			break
		}
	}

	feResult := physics.ComputeEffectiveEnergy(energy, filterLayers)
	eEff := feResult.EEff

	muRho := physics.LogLogInterp(eEff, mat.Data)
	mu := muRho * mat.Rho
	tMin := tPct / 100.0
	tMm := physics.CalcTMm(mu, tMin)

	res := BeamParamsResult{
		MuRho: muRho, Mu: mu, TMm: tMm, TMin: tMin, Eeff: eEff,
	}

	if filterObj != nil && filterObj.ID != "none" {
		hvl := physics.HVLCu(eEff)
		res.Filter = &FilterStats{
			EEff: feResult.EEff, EShift: feResult.EShift,
			FluxRatio: feResult.FluxRatio, HvlCu: hvl,
		}
	}

	data, _ := json.Marshal(res)
	return string(data)
}

type EnergyRecommendation struct {
	KV           int     `json:"kv"`
	Eeff         float64 `json:"eEff"`
	Transmission float64 `json:"transmission"`
	Label        string  `json:"label"`
}

func (pa *PhysicsAPI) CalcEnergyRecommendation(materialID string, maxPenetrationMM float64, tPct float64) string {
	mat, ok := physics.MaterialByID(materialID)
	if !ok {
		return `{"error":"unknown material"}`
	}
	tMin := tPct / 100.0
	kV, eEff, T := physics.RecommendKV(mat, maxPenetrationMM, tMin)

	label := "Low"
	if kV > 150 {
		label = "Medium"
	}
	if kV > 300 {
		label = "High"
	}

	data, _ := json.Marshal(EnergyRecommendation{
		KV: kV, Eeff: eEff, Transmission: T, Label: label,
	})
	return string(data)
}
