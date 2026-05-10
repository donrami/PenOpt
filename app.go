package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"penopt/internal/physics"
	"penopt/internal/raycaster"
	"penopt/internal/search"
)

// App is the main application struct, bound to the frontend via Wails v2.
type App struct {
	ctx         context.Context
	mu          sync.Mutex
	currentMesh *mesh.Mesh
	currentBVH  *bvh.BVH
}

// NewApp creates a new App instance.
func NewApp() *App {
	return &App{}
}

// startup is called by Wails when the app starts.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ── Mesh Info (returned to frontend) ──

type meshInfo struct {
	Name           string  `json:"name"`
	NumTriangles   int     `json:"numTriangles"`
	NumVertices    int     `json:"numVertices"`
	IsWatertight   bool    `json:"isWatertight"`
	BoundaryEdges  int     `json:"boundaryEdges"`
	BoundsMinX     float64 `json:"boundsMinX"`
	BoundsMinY     float64 `json:"boundsMinY"`
	BoundsMinZ     float64 `json:"boundsMinZ"`
	BoundsMaxX     float64 `json:"boundsMaxX"`
	BoundsMaxY     float64 `json:"boundsMaxY"`
	BoundsMaxZ     float64 `json:"boundsMaxZ"`
	CenterX        float64 `json:"centerX"`
	CenterY        float64 `json:"centerY"`
	CenterZ        float64 `json:"centerZ"`
	ExtentX        float64 `json:"extentX"`
	ExtentY        float64 `json:"extentY"`
	ExtentZ        float64 `json:"extentZ"`
}

// GetMeshInfo returns info about the currently loaded mesh.
func (a *App) GetMeshInfo() *meshInfo {
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.currentMesh == nil {
		return nil
	}
	wt, be := a.currentMesh.CheckWatertight()
	return &meshInfo{
		NumTriangles:  a.currentMesh.NumTris,
		NumVertices:   a.currentMesh.NumVerts,
		IsWatertight:  wt,
		BoundaryEdges: be,
		BoundsMinX: a.currentMesh.Min.X, BoundsMinY: a.currentMesh.Min.Y, BoundsMinZ: a.currentMesh.Min.Z,
		BoundsMaxX: a.currentMesh.Max.X, BoundsMaxY: a.currentMesh.Max.Y, BoundsMaxZ: a.currentMesh.Max.Z,
		CenterX: a.currentMesh.Center().X, CenterY: a.currentMesh.Center().Y, CenterZ: a.currentMesh.Center().Z,
		ExtentX: a.currentMesh.Extent().X, ExtentY: a.currentMesh.Extent().Y, ExtentZ: a.currentMesh.Extent().Z,
	}
}

// ── File Loading ──

// PickAndLoadMesh opens a native file dialog (STL/OBJ only) and loads the selected mesh.
func (a *App) PickAndLoadMesh() (*meshInfo, error) {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select STL or OBJ file",
		Filters: []runtime.FileFilter{
			{DisplayName: "STL/OBJ Files (*.stl, *.obj)", Pattern: "*.stl;*.obj"},
		},
	})
	if err != nil {
		return nil, err
	}
	if path == "" {
		return nil, nil // user cancelled
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("file read error: %w", err)
	}

	_, name := filepath.Split(path)

	a.mu.Lock()
	defer a.mu.Unlock()

	var m *mesh.Mesh
	if len(name) > 4 && name[len(name)-4:] == ".obj" {
		m, err = mesh.ParseOBJ(data)
	} else {
		m, err = mesh.ParseSTL(data)
	}
	if err != nil {
		return nil, fmt.Errorf("mesh parse error: %w", err)
	}

	m.CenterAtOrigin()

	bvhTree := bvh.Build(m)
	a.currentMesh = m
	a.currentBVH = bvhTree

	wt, be := m.CheckWatertight()
	mc := m.Center()
	me := m.Extent()
	return &meshInfo{
		Name:          name,
		NumTriangles:  m.NumTris,
		NumVertices:   m.NumVerts,
		IsWatertight:  wt,
		BoundaryEdges: be,
		BoundsMinX: m.Min.X, BoundsMinY: m.Min.Y, BoundsMinZ: m.Min.Z,
		BoundsMaxX: m.Max.X, BoundsMaxY: m.Max.Y, BoundsMaxZ: m.Max.Z,
		CenterX: mc.X, CenterY: mc.Y, CenterZ: mc.Z,
		ExtentX: me.X, ExtentY: me.Y, ExtentZ: me.Z,
	}, nil
}

// LoadMeshFromBytes loads a mesh from raw file bytes. Detects STL vs OBJ by extension.
func (a *App) LoadMeshFromBytes(name string, data []byte) (*meshInfo, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	var m *mesh.Mesh
	var err error

	if len(name) > 4 && name[len(name)-4:] == ".obj" {
		m, err = mesh.ParseOBJ(data)
	} else {
		m, err = mesh.ParseSTL(data)
	}
	if err != nil {
		return nil, fmt.Errorf("mesh parse error: %w", err)
	}

	// Center the mesh at origin so ray casting and rendering are in sync
	m.CenterAtOrigin()

	bvhTree := bvh.Build(m)
	a.currentMesh = m
	a.currentBVH = bvhTree

	wt, be := m.CheckWatertight()
	mc := m.Center()
	me := m.Extent()
	return &meshInfo{
		NumTriangles:  m.NumTris,
		NumVertices:   m.NumVerts,
		IsWatertight:  wt,
		BoundaryEdges: be,
		BoundsMinX: m.Min.X, BoundsMinY: m.Min.Y, BoundsMinZ: m.Min.Z,
		BoundsMaxX: m.Max.X, BoundsMaxY: m.Max.Y, BoundsMaxZ: m.Max.Z,
		CenterX: mc.X, CenterY: mc.Y, CenterZ: mc.Z,
		ExtentX: me.X, ExtentY: me.Y, ExtentZ: me.Z,
	}, nil
}

// ── Vertex Data for 3D Rendering ──

// GetVertexBuffer returns flat [x0,y0,z0, x1,y1,z1, ...].
func (a *App) GetVertexBuffer() []float64 {
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.currentMesh == nil {
		return nil
	}
	return a.currentMesh.VertexBuffer()
}

// ── Optimization ──

type runRequest struct {
	Weights [3]float64 `json:"weights"`
	Method  string     `json:"method"`
}

// RunOptimization starts the grid search asynchronously. Progress and results
// are delivered via Wails runtime events: "search:progress" and "search:done".
func (a *App) RunOptimization(req runRequest) (string, error) {
	a.mu.Lock()
	bvhTree := a.currentBVH
	a.mu.Unlock()

	if bvhTree == nil {
		return "", fmt.Errorf("no mesh loaded")
	}

	// Coarse search config — 8²×36 = fast, 2,304 rays/orientation × 49 = ~113k rays
	coarseCfg := raycaster.DefaultScannerConfig()
	coarseCfg.RayGridX = 8
	coarseCfg.RayGridY = 8
	coarseCfg.NumProjections = 36

	// Run search in a goroutine so progress events are deliverable
	a.mu.Lock()
	m := a.currentMesh
	a.mu.Unlock()

	go func() {
		result, err := search.Run(bvhTree, coarseCfg, req.Weights, req.Method,
			func(idx, total int, theta, phi float64) {
				pct := float64(idx) / float64(total) * 100
				runtime.EventsEmit(a.ctx, "search:progress", map[string]interface{}{
					"pct":   pct,
					"label": fmt.Sprintf("\u03B8=%.0f\u00B0 \u03C6=%.0f\u00B0", theta, phi),
					"idx":   idx,
					"total": total,
				})
			}, m)

		if err != nil || result == nil {
			runtime.EventsEmit(a.ctx, "search:done", map[string]interface{}{
				"error": fmt.Sprintf("Search failed: %v", err),
			})
			return
		}

		data, err := json.Marshal(result)
		if err != nil {
			runtime.EventsEmit(a.ctx, "search:done", map[string]interface{}{
				"error": fmt.Sprintf("JSON error: %v", err),
			})
			return
		}

		runtime.EventsEmit(a.ctx, "search:done", map[string]interface{}{
			"result": string(data),
		})
	}()

	return "started", nil
}

// EvaluateOrientation evaluates a single orientation (for UI preview).
func (a *App) EvaluateOrientation(theta, phi float64) (string, error) {
	a.mu.Lock()
	bvhTree := a.currentBVH
	a.mu.Unlock()

	if bvhTree == nil {
		return "", fmt.Errorf("no mesh loaded")
	}

	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 16
	cfg.RayGridY = 16
	cfg.NumProjections = 90

	score := search.EvaluateSingle(bvhTree, theta, phi, cfg)
	data, err := json.Marshal(score)
	if err != nil {
		return "", fmt.Errorf("JSON marshal error: %w", err)
	}
	return string(data), nil
}

// GetDefaultScannerConfig returns the default scanner configuration.
func (a *App) GetDefaultScannerConfig() raycaster.ScannerConfig {
	return raycaster.DefaultScannerConfig()
}

// ── Scanner Presets ──

type scannerPreset struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	SDD       float64 `json:"sdd"`
	SOD       float64 `json:"sod"`
	DetWidth  float64 `json:"detWidth"`
	DetHeight float64 `json:"detHeight"`
	PixelsX   int     `json:"pixelsX"`
	PixelsY   int     `json:"pixelsY"`
}

// GetScannerPresets returns common CT scanner configurations.
func (a *App) GetScannerPresets() string {
	presets := []scannerPreset{
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

// ── Heatmap (Per-Face Penetration) ──

// ComputeFaceHeatmap computes per-face max penetration at (theta, phi).
func (a *App) ComputeFaceHeatmap(theta, phi float64) string {
	a.mu.Lock()
	m := a.currentMesh
	bvhTree := a.currentBVH
	a.mu.Unlock()

	if m == nil || bvhTree == nil {
		return `{"error":"no mesh loaded"}`
	}

	cfg := raycaster.DefaultScannerConfig()
	cfg.NumProjections = 90

	faceData := raycaster.ComputeFacePenetrations(m, bvhTree, theta, phi, cfg)
	data, _ := json.Marshal(faceData)
	return string(data)
}

// ── Material Database ──

// GetMaterials returns all NIST XCOM materials as JSON.
func (a *App) GetMaterials() string {
	data, _ := json.Marshal(physics.Materials())
	return string(data)
}

// GetFilters returns all beam filter presets as JSON.
func (a *App) GetFilters() string {
	data, _ := json.Marshal(physics.Filters())
	return string(data)
}

// FilterStats returns computed filter statistics.
type filterStats struct {
	EEff      float64 `json:"eEff"`
	EShift    float64 `json:"eShift"`
	FluxRatio float64 `json:"fluxRatio"`
	HvlCu     float64 `json:"hvlCu"`
}

// CalcBeamParams computes beam parameters for given settings.
// Returns JSON with Eeff, transmission, mu, tMax.
func (a *App) CalcBeamParams(energy float64, tPct float64, filterID string, materialID string) string {
	type result struct {
		MuRho     float64       `json:"muRho"`
		Mu        float64       `json:"mu"`
		TMm       float64       `json:"tMm"`
		TMin      float64       `json:"tMin"`
		Filter    *filterStats  `json:"filter,omitempty"`
		Eeff      float64       `json:"eEff"`
	}

	mat, ok := physics.MaterialByID(materialID)
	if !ok {
		return `{"error":"unknown material"}`
	}

	// Find filter preset
	var filterLayers []physics.FilterLayer
	var filterObj *physics.Filter
	for _, f := range physics.Filters() {
		if f.ID == filterID {
			filterObj = &f
			filterLayers = f.Layers
			break
		}
	}

	// Compute effective energy through filter
	feResult := physics.ComputeEffectiveEnergy(energy, filterLayers)
	eEff := feResult.EEff

	muRho := physics.LogLogInterp(eEff, mat.Data)
	mu := muRho * mat.Rho
	tMin := tPct / 100.0
	tMm := physics.CalcTMm(mu, tMin)

	res := result{
		MuRho: muRho,
		Mu:    mu,
		TMm:   tMm,
		TMin:  tMin,
		Eeff:  eEff,
	}

	if filterObj != nil && filterObj.ID != "none" {
		hvl := physics.HVLCu(eEff)
		res.Filter = &filterStats{
			EEff:      feResult.EEff,
			EShift:    feResult.EShift,
			FluxRatio: feResult.FluxRatio,
			HvlCu:     hvl,
		}
	}

	data, _ := json.Marshal(res)
	return string(data)
}

// EnergyRecommendation is returned from CalcEnergyRecommendation.
type EnergyRecommendation struct {
	KV        int     `json:"kv"`
	Eeff      float64 `json:"eEff"`
	Transmission float64 `json:"transmission"`
	Label     string  `json:"label"`
}

// CalcEnergyRecommendation estimates kV needed for the given penetration.
func (a *App) CalcEnergyRecommendation(materialID string, maxPenetrationMM float64, tPct float64) string {
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
		KV:           kV,
		Eeff:         eEff,
		Transmission: T,
		Label:        label,
	})
	return string(data)
}

// ── Events for frontend progress ──

// EmitProgress sends a progress event to the frontend during optimization.
func (a *App) EmitProgress(pct float64, label string) {
	// Wails runtime events: EventsEmit(ctx, name, data)
	// We call this from frontend via polling or from search goroutine
	// Implementation detail: the Wails runtime.EventsEmit is available
	// via a.ctx once startup() is called.
	_ = a.ctx
	_ = pct
	_ = label
}
