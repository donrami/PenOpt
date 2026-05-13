package main

import (
	"context"
	"os"
	"path/filepath"

	"penopt/internal/app"
	"penopt/internal/raycaster"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App is the main Wails application struct, composing focused adapters.
type App struct {
	ctx        context.Context
	MeshLoader *app.MeshLoader
	Optimizer  *app.Optimizer
	PhysicsAPI *app.PhysicsAPI
	ScannerAPI *app.ScannerAPI
}

// NewApp creates a new App instance with composed adapters.
func NewApp() *App {
	ml := app.NewMeshLoader()
	return &App{
		MeshLoader: ml,
		Optimizer:  app.NewOptimizer(ml),
		PhysicsAPI: app.NewPhysicsAPI(),
		ScannerAPI: app.NewScannerAPI(ml),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ── Mesh Info (delegated) ──

// GetMeshInfo returns info about the currently loaded mesh.
func (a *App) GetMeshInfo() *app.MeshInfo {
	return a.MeshLoader.GetInfo()
}

// PickAndLoadMesh opens a native file dialog and loads the selected mesh.
func (a *App) PickAndLoadMesh() (*app.MeshInfo, error) {
	return a.MeshLoader.PickAndLoad(a.ctx)
}

// LoadMeshFromBytes loads a mesh from raw file bytes.
func (a *App) LoadMeshFromBytes(name string, data []byte) (*app.MeshInfo, error) {
	return a.MeshLoader.LoadMesh(name, data)
}

// GetVertexBuffer returns flat vertex coordinates.
func (a *App) GetVertexBuffer() []float64 {
	return a.MeshLoader.GetVertexBuffer()
}

// ── Optimization ──

// runRequest matches the frontend's RunRequest struct (now with 5 weights and searchRange).
type runRequest struct {
	Weights     [5]float64 `json:"weights"` // [w_mtl, w_energy, w_hdn, w_tuy, w_bh]
	Method      string     `json:"method"`
	RayGridXY   int        `json:"rayGridXY"` // 0 = use defaults (8 coarse / 16 fine)
	SearchRange int        `json:"searchRange"` // 0 = default 45°
}

// RunOptimization starts the grid search asynchronously.
func (a *App) RunOptimization(req runRequest) (string, error) {
	return a.Optimizer.Run(a.ctx, app.RunRequest{Weights: req.Weights, Method: req.Method, RayGridXY: req.RayGridXY, SearchRange: req.SearchRange})
}

// EvaluateOrientation evaluates a single orientation (for UI preview).
func (a *App) EvaluateOrientation(theta, phi float64) (string, error) {
	return a.Optimizer.EvaluateSingle(theta, phi)
}

// ── Materials / Filters / Physics ──

// GetMaterials returns all NIST XCOM materials as JSON.
func (a *App) GetMaterials() string { return a.PhysicsAPI.GetMaterials() }

// GetFilters returns all beam filter presets as JSON.
func (a *App) GetFilters() string { return a.PhysicsAPI.GetFilters() }

// CalcBeamParams computes beam parameters for given settings.
func (a *App) CalcBeamParams(energy float64, tPct float64, filterID string, materialID string) string {
	return a.PhysicsAPI.CalcBeamParams(energy, tPct, filterID, materialID)
}

// CalcEnergyRecommendation estimates kV needed for the given penetration.
func (a *App) CalcEnergyRecommendation(materialID string, maxPenetrationMM float64, tPct float64, filterID string) string {
	return a.PhysicsAPI.CalcEnergyRecommendation(materialID, maxPenetrationMM, tPct, filterID)
}

// ── Scanner Presets / Heatmap ──

// GetScannerPresets returns common CT scanner configurations.
func (a *App) GetScannerPresets() string { return a.ScannerAPI.GetScannerPresets() }

// GetDefaultScannerConfig returns the default scanner configuration.
func (a *App) GetDefaultScannerConfig() raycaster.ScannerConfig { return a.ScannerAPI.GetDefaultScannerConfig() }

// ComputeFaceHeatmap computes per-face max penetration at (theta, phi).
func (a *App) ComputeFaceHeatmap(theta, phi float64) string { return a.ScannerAPI.ComputeFaceHeatmap(theta, phi) }

// SaveFile opens a native Save File dialog and writes data to the chosen path.
// Returns the full file path if saved, empty string if cancelled, or an error.
func (a *App) SaveFile(defaultName string, data []byte) (string, error) {
	ext := filepath.Ext(defaultName)
	filterName := ext + " files"
	if ext == ".json" {
		filterName = "JSON files (*.json)"
	} else if ext == ".png" {
		filterName = "PNG images (*.png)"
	}

	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultDirectory: "",
		DefaultFilename:  defaultName,
		Title:            "Save file",
		Filters: []runtime.FileFilter{
			{DisplayName: filterName, Pattern: "*" + ext},
		},
		ShowHiddenFiles:      false,
		CanCreateDirectories: true,
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil // user cancelled
	}
	return path, os.WriteFile(path, data, 0644)
}

