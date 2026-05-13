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

// TubeSpec describes the X-ray tube capabilities for a scanner preset.
type TubeSpec struct {
	MaxKV            int     `json:"maxKV"`                       // maximum tube voltage (kV)
	MaxPowerAtMaxKVW int     `json:"maxPowerAtMaxKVW,omitempty"`  // max continuous power at max kV (W)
	TubeType         string  `json:"tubeType"`                    // "microfocus" | "rotating-target" | "medical" | "dental"
	AnodeMHU         float64 `json:"anodeMHU,omitempty"`          // anode heat storage (MHU) — medical CT only
	Notes            string  `json:"notes,omitempty"`             // free-text; configuration variants, known limitations
}

type ScannerPreset struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	SDD       float64   `json:"sdd"`
	SOD       float64   `json:"sod"`
	DetWidth  float64   `json:"detWidth"`
	DetHeight float64   `json:"detHeight"`
	PixelsX   int       `json:"pixelsX"`
	PixelsY   int       `json:"pixelsY"`
	Tube      *TubeSpec `json:"tube,omitempty"` // nil for custom preset
}

func (sa *ScannerAPI) GetScannerPresets() string {
	presets := []ScannerPreset{
		{
			ID: "custom", Name: "Custom / Default",
			SDD: 1000, SOD: 700, DetWidth: 400, DetHeight: 400, PixelsX: 1024, PixelsY: 1024,
			Tube: nil,
		},
		{
			ID: "nikon_xt_h_225", Name: "Nikon XT H 225",
			SDD: 800, SOD: 500, DetWidth: 400, DetHeight: 400, PixelsX: 1024, PixelsY: 1024,
			Tube: &TubeSpec{
				MaxKV: 225, MaxPowerAtMaxKVW: 450, TubeType: "microfocus",
				Notes: "Rotating.Target 2.0: 450 W; also available as 225 W reflection target",
			},
		},
		{
			ID: "nikon_xt_h_320", Name: "Nikon XT H 320",
			SDD: 1200, SOD: 800, DetWidth: 400, DetHeight: 400, PixelsX: 1024, PixelsY: 1024,
			Tube: &TubeSpec{
				MaxKV: 320, MaxPowerAtMaxKVW: 320, TubeType: "microfocus",
				Notes: "Reflection target",
			},
		},
		{
			ID: "ge_phoenix_s240", Name: "GE Phoenix v|tome|x S240",
			SDD: 600, SOD: 400, DetWidth: 300, DetHeight: 300, PixelsX: 1024, PixelsY: 1024,
			Tube: &TubeSpec{
				MaxKV: 240, MaxPowerAtMaxKVW: 320, TubeType: "microfocus",
				Notes: "Optional nanoCT tube: 180 kV / 20 W",
			},
		},
		{
			ID: "ge_phoenix_m300", Name: "GE Phoenix v|tome|x M300",
			SDD: 1000, SOD: 700, DetWidth: 400, DetHeight: 400, PixelsX: 2048, PixelsY: 2048,
			Tube: &TubeSpec{
				MaxKV: 300, MaxPowerAtMaxKVW: 500, TubeType: "microfocus",
			},
		},
		{
			ID: "zeiss_metrotom_800", Name: "Zeiss METROTOM 800",
			SDD: 700, SOD: 450, DetWidth: 300, DetHeight: 300, PixelsX: 1024, PixelsY: 1024,
			Tube: &TubeSpec{
				MaxKV: 225, MaxPowerAtMaxKVW: 500, TubeType: "microfocus",
				Notes: "Also available as 130 kV / 39 W and 320 kV variants",
			},
		},
		{
			ID: "zeiss_metrotom_1500", Name: "Zeiss METROTOM 1500",
			SDD: 1200, SOD: 800, DetWidth: 400, DetHeight: 400, PixelsX: 2048, PixelsY: 2048,
			Tube: &TubeSpec{
				MaxKV: 225, MaxPowerAtMaxKVW: 500, TubeType: "microfocus",
			},
		},
		{
			ID: "nikon_voxls_20", Name: "Nikon VOXLS 20",
			SDD: 500, SOD: 300, DetWidth: 200, DetHeight: 200, PixelsX: 1024, PixelsY: 1024,
			Tube: &TubeSpec{
				MaxKV: 225, MaxPowerAtMaxKVW: 450, TubeType: "microfocus",
				Notes: "Rotating.Target 2.0: 450 W; also 225 W reflection target",
			},
		},
		{
			ID: "nikon_voxls_30", Name: "Nikon VOXLS 30",
			SDD: 700, SOD: 450, DetWidth: 300, DetHeight: 300, PixelsX: 1024, PixelsY: 1024,
			Tube: &TubeSpec{
				MaxKV: 450, MaxPowerAtMaxKVW: 450, TubeType: "microfocus",
				Notes: "Configurable: 225 / 320 / 450 kV target modules",
			},
		},
		{
			ID: "siemens_somatom_go_up", Name: "Siemens Somatom Go.Up",
			SDD: 1040, SOD: 595, DetWidth: 500, DetHeight: 500, PixelsX: 736, PixelsY: 736,
			Tube: &TubeSpec{
				MaxKV: 130, MaxPowerAtMaxKVW: 32000, TubeType: "medical", AnodeMHU: 3.5,
				Notes: "Chronon tube; 80 kW eq. with SAFIRE",
			},
		},
		{
			ID: "ge_lightspeed_vct", Name: "GE LightSpeed VCT",
			SDD: 949, SOD: 541, DetWidth: 400, DetHeight: 400, PixelsX: 888, PixelsY: 888,
			Tube: &TubeSpec{
				MaxKV: 140, MaxPowerAtMaxKVW: 100000, TubeType: "medical", AnodeMHU: 8.0,
				Notes: "Performix Pro VCT 100",
			},
		},
		{
			ID: "philips_brilliance_64", Name: "Philips Brilliance 64",
			SDD: 1040, SOD: 570, DetWidth: 500, DetHeight: 500, PixelsX: 672, PixelsY: 672,
			Tube: &TubeSpec{
				MaxKV: 140, TubeType: "medical",
				Notes: "MRC 800 tube; 20–500 mA",
			},
		},
		{
			ID: "dental_cbct_small", Name: "Dental CBCT (small)",
			SDD: 300, SOD: 200, DetWidth: 100, DetHeight: 80, PixelsX: 640, PixelsY: 640,
			Tube: &TubeSpec{
				MaxKV: 90, TubeType: "dental",
				Notes: "1–15 mA; < 2 kVA total. W K-lines (59.3 keV) fall in operating range — omitted from heuristic spectrum",
			},
		},
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
