package app

import (
	"encoding/json"

	"penopt/internal/raycaster"
)

// ScannerAPI exposes scanner presets, config, and heatmap.
type ScannerAPI struct {
	loader *MeshLoader
}

func NewScannerAPI(loader *MeshLoader) *ScannerAPI {
	return &ScannerAPI{loader: loader}
}

type ScannerPreset struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	SDD       float64 `json:"sdd"`
	SOD       float64 `json:"sod"`
	DetWidth  float64 `json:"detWidth"`
	DetHeight float64 `json:"detHeight"`
	PixelsX   int     `json:"pixelsX"`
	PixelsY   int     `json:"pixelsY"`
}

func (sa *ScannerAPI) GetScannerPresets() string {
	presets := []ScannerPreset{
		{ID: "custom", Name: "Custom / Default", SDD: 1000, SOD: 700, DetWidth: 400, DetHeight: 400, PixelsX: 1024, PixelsY: 1024},
		{ID: "nikon_xt_h_225", Name: "Nikon XT H 225", SDD: 800, SOD: 500, DetWidth: 400, DetHeight: 400, PixelsX: 1024, PixelsY: 1024},
		{ID: "nikon_xt_h_320", Name: "Nikon XT H 320", SDD: 1200, SOD: 800, DetWidth: 400, DetHeight: 400, PixelsX: 1024, PixelsY: 1024},
		{ID: "ge_phoenix_s240", Name: "GE Phoenix v|tome|x S240", SDD: 600, SOD: 400, DetWidth: 300, DetHeight: 300, PixelsX: 1024, PixelsY: 1024},
		{ID: "ge_phoenix_m300", Name: "GE Phoenix v|tome|x M300", SDD: 1000, SOD: 700, DetWidth: 400, DetHeight: 400, PixelsX: 2048, PixelsY: 2048},
		{ID: "zeiss_metrotom_800", Name: "Zeiss METROTOM 800", SDD: 700, SOD: 450, DetWidth: 300, DetHeight: 300, PixelsX: 1024, PixelsY: 1024},
		{ID: "zeiss_metrotom_1500", Name: "Zeiss METROTOM 1500", SDD: 1200, SOD: 800, DetWidth: 400, DetHeight: 400, PixelsX: 2048, PixelsY: 2048},
		{ID: "nikon_voxls_20", Name: "Nikon VOXLS 20", SDD: 500, SOD: 300, DetWidth: 200, DetHeight: 200, PixelsX: 1024, PixelsY: 1024},
		{ID: "nikon_voxls_30", Name: "Nikon VOXLS 30", SDD: 700, SOD: 450, DetWidth: 300, DetHeight: 300, PixelsX: 1024, PixelsY: 1024},
		{ID: "siemens_somatom_go_up", Name: "Siemens Somatom Go.Up", SDD: 1040, SOD: 595, DetWidth: 500, DetHeight: 500, PixelsX: 736, PixelsY: 736},
		{ID: "ge_lightspeed_vct", Name: "GE LightSpeed VCT", SDD: 949, SOD: 541, DetWidth: 400, DetHeight: 400, PixelsX: 888, PixelsY: 888},
		{ID: "philips_brilliance_64", Name: "Philips Brilliance 64", SDD: 1040, SOD: 570, DetWidth: 500, DetHeight: 500, PixelsX: 672, PixelsY: 672},
		{ID: "dental_cbct_small", Name: "Dental CBCT (small)", SDD: 300, SOD: 200, DetWidth: 100, DetHeight: 80, PixelsX: 640, PixelsY: 640},
	}
	data, _ := json.Marshal(presets)
	return string(data)
}

func (sa *ScannerAPI) ComputeFaceHeatmap(theta, phi float64) string {
	sa.loader.Lock()
	m := sa.loader.CurrentMesh
	bvhTree := sa.loader.CurrentBVH
	sa.loader.Unlock()

	if m == nil || bvhTree == nil {
		return `{"error":"no mesh loaded"}`
	}

	cfg := raycaster.DefaultScannerConfig()
	// Force face-centroid sampling for the heatmap (grid misses too many faces).
	// Use 8 projections — comprehensive per-face coverage in ~5s for a 20k face mesh.
	cfg.RayGridX = 0
	cfg.RayGridY = 0
	cfg.NumProjections = 8

	faceData := raycaster.ComputeFacePenetrations(m, bvhTree, theta, phi, cfg)
	data, _ := json.Marshal(faceData)
	return string(data)
}

func (sa *ScannerAPI) GetDefaultScannerConfig() raycaster.ScannerConfig {
	return raycaster.DefaultScannerConfig()
}
