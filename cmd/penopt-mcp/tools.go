// Tool implementations for the PenOpt MCP server.
//
// Each tool delegates to the existing penopt/internal/* packages.
package main

import (
	"context"
	"fmt"
	"math"
	"os"
	"sync"

	"github.com/modelcontextprotocol/go-sdk/mcp"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"penopt/internal/raycaster"
	"penopt/internal/search"
)

// ── Shared state ──────────────────────────────────────────────────────────

var (
	stateMu      sync.Mutex
	loadedMesh   *mesh.Mesh
	loadedBVH    *bvh.BVH
	loadedMeshName string // stored from last load_mesh call
)

// mcpServer is the server instance, set once in main(). Used by tools that
// need to send notifications (progress, logging) back to the connected client.
var mcpServer *mcp.Server

// currentSession returns the first connected session. With stdio transport
// there is at most one session at a time.
func currentSession() *mcp.ServerSession {
	if mcpServer == nil {
		return nil
	}
	for s := range mcpServer.Sessions() {
		return s
	}
	return nil
}

// ── Tool: load_mesh ───────────────────────────────────────────────────────

type LoadMeshInput struct {
	Path string `json:"path" jsonschema:"Absolute path to an .stl or .obj file containing a triangle mesh of the part to be CT-scanned"`
}

// meshInfo is returned by load_mesh and get_mesh_info.
// It mirrors internal/app.MeshInfo without importing the Wails-using package.
type meshInfo struct {
	Name          string  `json:"name"`
	NumTriangles  int     `json:"numTriangles"`
	NumVertices   int     `json:"numVertices"`
	IsWatertight  bool    `json:"isWatertight"`
	BoundaryEdges int     `json:"boundaryEdges"`
	BoundsMinX    float64 `json:"boundsMinX"`
	BoundsMinY    float64 `json:"boundsMinY"`
	BoundsMinZ    float64 `json:"boundsMinZ"`
	BoundsMaxX    float64 `json:"boundsMaxX"`
	BoundsMaxY    float64 `json:"boundsMaxY"`
	BoundsMaxZ    float64 `json:"boundsMaxZ"`
	CenterX       float64 `json:"centerX"`
	CenterY       float64 `json:"centerY"`
	CenterZ       float64 `json:"centerZ"`
	ExtentX       float64 `json:"extentX"`
	ExtentY       float64 `json:"extentY"`
	ExtentZ       float64 `json:"extentZ"`
}

func meshToInfo(m *mesh.Mesh, name string) meshInfo {
	wt, be := m.CheckWatertight()
	mc := m.Center()
	me := m.Extent()
	return meshInfo{
		Name:          name,
		NumTriangles:  m.NumTris,
		NumVertices:   m.NumVerts,
		IsWatertight:  wt,
		BoundaryEdges: be,
		BoundsMinX:    float64(m.Min.X), BoundsMinY: float64(m.Min.Y), BoundsMinZ: float64(m.Min.Z),
		BoundsMaxX:    float64(m.Max.X), BoundsMaxY: float64(m.Max.Y), BoundsMaxZ: float64(m.Max.Z),
		CenterX:       float64(mc.X), CenterY: float64(mc.Y), CenterZ: float64(mc.Z),
		ExtentX:       float64(me.X), ExtentY: float64(me.Y), ExtentZ: float64(me.Z),
	}
}

func handleLoadMesh(ctx context.Context, req *mcp.CallToolRequest, in LoadMeshInput) (
	*mcp.CallToolResult, meshInfo, error,
) {
	// Validate path
	if in.Path == "" {
		return nil, meshInfo{}, fmt.Errorf("path must not be empty")
	}

	// Validate extension
	ext := ""
	if len(in.Path) > 4 {
		ext = in.Path[len(in.Path)-4:]
	}
	if ext != ".stl" && ext != ".obj" && len(in.Path) > 5 && in.Path[len(in.Path)-5:] != ".obj" {
		return nil, meshInfo{}, fmt.Errorf("unsupported format %q — expected .stl or .obj file", ext)
	}

	// Read file
	data, err := os.ReadFile(in.Path)
	if err != nil {
		return nil, meshInfo{}, fmt.Errorf("file not found or unreadable: %w", err)
	}

	if len(data) == 0 {
		return nil, meshInfo{}, fmt.Errorf("file is empty: %s", in.Path)
	}

	// Extract name from path
	name := in.Path
	for i := len(in.Path) - 1; i >= 0; i-- {
		if in.Path[i] == '/' || in.Path[i] == '\\' {
			name = in.Path[i+1:]
			break
		}
	}

	// Parse mesh
	var m *mesh.Mesh
	if ext == ".obj" || (len(in.Path) > 5 && in.Path[len(in.Path)-5:] == ".obj") {
		m, err = mesh.ParseOBJ(data)
	} else {
		m, err = mesh.ParseSTL(data)
	}
	if err != nil {
		return nil, meshInfo{}, fmt.Errorf("mesh parse error: %w", err)
	}

	if m.NumTris == 0 {
		return nil, meshInfo{}, fmt.Errorf("mesh has %d triangles — nothing to optimize", m.NumTris)
	}

	// Center at origin and build BVH
	m.CenterAtOrigin()
	bvhTree := bvh.Build(m)

	// Store in global state
	stateMu.Lock()
	loadedMesh = m
	loadedBVH = bvhTree
	loadedMeshName = name
	stateMu.Unlock()

	info := meshToInfo(m, name)
	return nil, info, nil
}

// ── Tool: get_mesh_info ───────────────────────────────────────────────────

type GetMeshInfoInput struct{}

func handleGetMeshInfo(ctx context.Context, req *mcp.CallToolRequest, in GetMeshInfoInput) (
	*mcp.CallToolResult, meshInfo, error,
) {
	stateMu.Lock()
	m := loadedMesh
	n := loadedMeshName
	stateMu.Unlock()

	if m == nil {
		return nil, meshInfo{}, fmt.Errorf("no mesh loaded — call load_mesh first")
	}

	info := meshToInfo(m, n)
	return nil, info, nil
}

// ── Tool: evaluate_orientation ────────────────────────────────────────────

type EvaluateOrientationInput struct {
	Theta float64 `json:"theta" jsonschema:"Rotation angle around the X-axis in degrees. Typical range is -45 to 45. Positive = counter-clockwise when viewed from +X."`
	Phi   float64 `json:"phi" jsonschema:"Rotation angle around the Y-axis in degrees. Typical range is -45 to 45. Positive = counter-clockwise when viewed from +Y."`
}

// orientationScore is the output for evaluate_orientation and part of optimization results.
type orientationScore struct {
	Theta   float64 `json:"theta"`
	Phi     float64 `json:"phi"`
	FMtl    float64 `json:"fMtl"`
	FEnergy float64 `json:"fEnergy"`
	FHdn    float64 `json:"fHdn"`
	FTuy    float64 `json:"fTuy"`
	FBh     float64 `json:"fBh"`
	Score   float64 `json:"score"`
}

func handleEvaluateOrientation(ctx context.Context, req *mcp.CallToolRequest, in EvaluateOrientationInput) (
	*mcp.CallToolResult, orientationScore, error,
) {
	if math.IsNaN(in.Theta) || math.IsInf(in.Theta, 0) {
		return nil, orientationScore{}, fmt.Errorf("theta must be a finite number, got %v", in.Theta)
	}
	if math.IsNaN(in.Phi) || math.IsInf(in.Phi, 0) {
		return nil, orientationScore{}, fmt.Errorf("phi must be a finite number, got %v", in.Phi)
	}

	stateMu.Lock()
	m := loadedMesh
	bvhTree := loadedBVH
	stateMu.Unlock()

	if bvhTree == nil || m == nil {
		return nil, orientationScore{}, fmt.Errorf("no mesh loaded — call load_mesh first")
	}

	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 16
	cfg.RayGridY = 16
	cfg.NumProjections = 90

	score := search.EvaluateSingle(bvhTree, m, in.Theta, in.Phi, cfg)

	return nil, orientationScore{
		Theta:   score.Theta,
		Phi:     score.Phi,
		FMtl:    score.FMtl,
		FEnergy: score.FEnergy,
		FHdn:    score.FHdn,
		FTuy:    score.FTuy,
		FBh:     score.FBh,
		Score:   score.Score,
	}, nil
}

// ── Tool: run_optimization ────────────────────────────────────────────────

type RunOptimizationInput struct {
	Weights     [5]float64 `json:"weights,omitempty" jsonschema:"Weights for the 5 objectives: [generalized_mean_penetration, max_penetration, projection_uniformity, Tuy_completeness, beam_hardening]. Default [0.2,0.2,0.2,0.2,0.2] (equal weight). Increase to prioritize that objective."`
	Method      string     `json:"method,omitempty" jsonschema:"Scoring method. 'weighted' (default, sum of weighted normalized scores) or 'minimax' (max of weighted normalized scores, more conservative)."`
	RayGridXY   int        `json:"rayGridXY,omitempty" jsonschema:"Ray sampling grid resolution (rays per dimension). 0 = auto-select based on part size. 8 = fast. 16 = standard. 32 = highest fidelity (slowest)."`
	SearchRange int        `json:"searchRange,omitempty" jsonschema:"Angular search range in degrees symmetric about zero. 0 = default 45°. Minimum 30°, maximum 75°."`
}

// optimizationResult is the condensed output for run_optimization.
// It omits the full AllScores array (too large for LLM context) and includes
// only the key findings.
type optimizationResult struct {
	BestTheta           float64 `json:"bestTheta"`
	BestPhi             float64 `json:"bestPhi"`
	BestFMtl            float64 `json:"bestFMtl"`
	BestFEnergy         float64 `json:"bestFEnergy"`
	BestFHdn            float64 `json:"bestFHdn"`
	BestFTuy            float64 `json:"bestFTuy"`
	BestFBh             float64 `json:"bestFBh"`
	BestScore           float64 `json:"bestScore"`
	WorstScore          float64 `json:"worstScore"`
	SearchTimeMs        float64 `json:"searchTimeMs"`
	NumCoarseEval       int     `json:"numCoarseEval"`
	NumFineEval         int     `json:"numFineEval"`
	TotalEvaluated      int     `json:"totalEvaluated"`
	ConstrainedOptimum  bool    `json:"constrainedOptimum"`
	BoundaryWarning     string  `json:"boundaryWarning,omitempty"`
	CoarseFineMismatch  bool    `json:"coarseFineMismatch"`
	MismatchNote        string  `json:"mismatchNote,omitempty"`
	Top3Spread          float64 `json:"top3Spread"`
	ScoreGap            float64 `json:"scoreGap"`
	ConvergenceNote     string  `json:"convergenceNote,omitempty"`
	CoverageWarning     string  `json:"coverageWarning,omitempty"`
	MinCoverageFraction float64 `json:"minCoverageFraction"`
	AutoRayGrid         int     `json:"autoRayGrid,omitempty"`
	SearchRangeUsed     int     `json:"searchRangeUsed"`
	MethodUsed          string  `json:"methodUsed"`
	ReferenceScore      float64 `json:"referenceScore,omitempty"`
}

func resultToOutput(r *search.Result) optimizationResult {
	out := optimizationResult{
		BestTheta:           r.BestOrientation.Theta,
		BestPhi:             r.BestOrientation.Phi,
		BestFMtl:            r.BestOrientation.FMtl,
		BestFEnergy:         r.BestOrientation.FEnergy,
		BestFHdn:            r.BestOrientation.FHdn,
		BestFTuy:            r.BestOrientation.FTuy,
		BestFBh:             r.BestOrientation.FBh,
		BestScore:           r.BestOrientation.Score,
		WorstScore:          r.WorstOrientation.Score,
		SearchTimeMs:        r.SearchTimeMs,
		NumCoarseEval:       r.NumCoarseEval,
		NumFineEval:         r.NumFineEval,
		TotalEvaluated:      r.NumCoarseEval + r.NumFineEval,
		ConstrainedOptimum:  r.ConstrainedOptimum,
		BoundaryWarning:     r.BoundaryWarning,
		CoarseFineMismatch:  r.CoarseFineMismatch,
		MismatchNote:        r.MismatchNote,
		Top3Spread:          r.Top3Spread,
		ScoreGap:            r.ScoreGap,
		ConvergenceNote:     r.ConvergenceNote,
		CoverageWarning:     r.CoverageWarning,
		MinCoverageFraction: r.MinCoverageFraction,
		AutoRayGrid:         r.AutoRayGrid,
		SearchRangeUsed:     r.SearchRange,
	}
	if r.ReferenceOrientation != nil {
		out.ReferenceScore = r.ReferenceOrientation.Score
	}
	return out
}

func handleRunOptimization(ctx context.Context, req *mcp.CallToolRequest, in RunOptimizationInput) (
	*mcp.CallToolResult, optimizationResult, error,
) {
	// Set defaults
	weights := in.Weights
	if weights == [5]float64{} {
		weights = [5]float64{0.2, 0.2, 0.2, 0.2, 0.2}
	}
	method := in.Method
	if method == "" {
		method = "weighted"
	}
	rayGridXY := in.RayGridXY
	if rayGridXY < 0 {
		rayGridXY = 0
	}
	searchRange := in.SearchRange
	if searchRange < 0 {
		searchRange = 0
	}
	if searchRange != 0 && (searchRange < 30 || searchRange > 75) {
		return nil, optimizationResult{}, fmt.Errorf("searchRange must be 0 (default), 30–75, got %d", searchRange)
	}
	if method != "weighted" && method != "minimax" {
		return nil, optimizationResult{}, fmt.Errorf("method must be %q or %q, got %q", "weighted", "minimax", method)
	}

	stateMu.Lock()
	m := loadedMesh
	bvhTree := loadedBVH
	stateMu.Unlock()

	if bvhTree == nil || m == nil {
		return nil, optimizationResult{}, fmt.Errorf("no mesh loaded — call load_mesh first")
	}

	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 8  // coarse grid, search.Run re-configures as needed
	cfg.RayGridY = 8
	cfg.NumProjections = 36

	// Build progress callback that sends MCP notifications and logs to stderr
	onProgress := func(idx, total int, theta, phi float64) {
		pct := float64(idx) / float64(total) * 100
		msg := fmt.Sprintf("PenOpt: θ=%.0f° φ=%.0f° (%d/%d, %.0f%%)", theta, phi, idx, total, pct)
		// Stderr fallback — visible in any terminal / Claude log
		fmt.Fprintln(os.Stderr, msg)
		// MCP progress notification for clients that support it
		sess := currentSession()
		if sess != nil {
			_ = sess.NotifyProgress(ctx, &mcp.ProgressNotificationParams{
				ProgressToken: nil,
				Progress:      float64(idx) / float64(total),
				Message:       msg,
			})
		}
	}

	result, err := search.Run(ctx, bvhTree, m, cfg, weights, method, onProgress, rayGridXY, searchRange)
	if err != nil {
		return nil, optimizationResult{}, fmt.Errorf("optimization failed: %w", err)
	}
	if result == nil {
		return nil, optimizationResult{}, fmt.Errorf("optimization returned no result (mesh may have 0 triangles)")
	}

	out := resultToOutput(result)
	out.MethodUsed = method
	return nil, out, nil
}
