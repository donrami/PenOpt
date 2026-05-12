package search

import (
	"testing"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"penopt/internal/raycaster"
)

// buildTestMesh creates a simple box-like mesh for testing.
func buildTestMesh() (*mesh.Mesh, *bvh.BVH) {
	m := mesh.NewMesh()
	// A simple cube with 12 triangles (2 per face)
	// Front face (z=50)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, -20, 50}, V1: mesh.Vec3{20, -20, 50}, V2: mesh.Vec3{20, 20, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, -20, 50}, V1: mesh.Vec3{20, 20, 50}, V2: mesh.Vec3{-20, 20, 50}})
	// Back face (z=-50)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, -20, -50}, V1: mesh.Vec3{20, -20, -50}, V2: mesh.Vec3{20, 20, -50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, -20, -50}, V1: mesh.Vec3{20, 20, -50}, V2: mesh.Vec3{-20, 20, -50}})
	// Top face (y=20)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, 20, -50}, V1: mesh.Vec3{20, 20, -50}, V2: mesh.Vec3{20, 20, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, 20, -50}, V1: mesh.Vec3{20, 20, 50}, V2: mesh.Vec3{-20, 20, 50}})
	// Bottom face (y=-20)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, -20, -50}, V1: mesh.Vec3{20, -20, -50}, V2: mesh.Vec3{20, -20, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, -20, -50}, V1: mesh.Vec3{20, -20, 50}, V2: mesh.Vec3{-20, -20, 50}})
	// Right face (x=20)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{20, -20, -50}, V1: mesh.Vec3{20, 20, -50}, V2: mesh.Vec3{20, 20, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{20, -20, -50}, V1: mesh.Vec3{20, 20, 50}, V2: mesh.Vec3{20, -20, 50}})
	// Left face (x=-20)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, -20, -50}, V1: mesh.Vec3{-20, 20, -50}, V2: mesh.Vec3{-20, 20, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-20, -20, -50}, V1: mesh.Vec3{-20, 20, 50}, V2: mesh.Vec3{-20, -20, 50}})
	m.CenterAtOrigin()
	bvhTree := bvh.Build(m)
	return m, bvhTree
}

func TestEvaluateSingle(t *testing.T) {
	m, bvhTree := buildTestMesh()
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 4
	cfg.RayGridY = 4
	cfg.NumProjections = 8

	score := EvaluateSingle(bvhTree, m, 0, 0, cfg)
	if score.Theta != 0 || score.Phi != 0 {
		t.Errorf("expected theta=0, phi=0, got theta=%v, phi=%v", score.Theta, score.Phi)
	}
	if score.FMtl < 0 {
		t.Errorf("FMtl should be >= 0, got %v", score.FMtl)
	}
	if score.FEnergy < 0 {
		t.Errorf("FEnergy should be >= 0, got %v", score.FEnergy)
	}
	if score.Score != 0 {
		t.Errorf("Score should be 0 for single eval, got %v", score.Score)
	}
	if score.FTuy <= 0 {
		t.Errorf("FTuy should be > 0 for a box mesh, got %v", score.FTuy)
	}
}

func TestRun_ReturnsResult(t *testing.T) {
	m, bvhTree := buildTestMesh()
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 4
	cfg.RayGridY = 4
	cfg.NumProjections = 8

	result, err := Run(bvhTree, m, cfg, [3]float64{0.4, 0.4, 0.2}, "weighted", nil, 0, 0)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}
	if result == nil {
		t.Fatal("Run() returned nil result")
	}
	if len(result.AllScores) == 0 {
		t.Error("AllScores is empty")
	}
	if result.SearchTimeMs <= 0 {
		t.Error("SearchTimeMs should be positive")
	}
	// Verify Tuy completeness was computed
	if result.BestOrientation.FTuy <= 0 {
		t.Errorf("Best orientation should have positive Tuy completeness, got %v", result.BestOrientation.FTuy)
	}
}

func TestComputeTuyCompleteness_Box(t *testing.T) {
	m, _ := buildTestMesh()
	// A box at (0,0) has 8/12 = 2/3 Tuy-complete faces
	// Top/bottom faces (normals ∥ Y) have no tangent rays for circular trajectory.
	ftuy := ComputeTuyCompleteness(m, 0, 0)
	expected := 8.0 / 12.0 // 4 side faces × 2 triangles each / 12 total
	if ftuy != expected {
		t.Errorf("Expected FTuy = %.3f for box at (0,0), got %.3f", expected, ftuy)
	}
}

func TestComputeTuyCompleteness_FlatPlate(t *testing.T) {
	// A flat plate in the XZ plane should have low Tuy completeness
	// because face normals are nearly parallel to Y
	m := mesh.NewMesh()
	// A thin plate: 100x1x100 mm
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 0, -50}, V1: mesh.Vec3{50, 0, -50}, V2: mesh.Vec3{50, 0, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 0, -50}, V1: mesh.Vec3{50, 0, 50}, V2: mesh.Vec3{-50, 0, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 1, -50}, V1: mesh.Vec3{50, 1, -50}, V2: mesh.Vec3{50, 1, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 1, -50}, V1: mesh.Vec3{50, 1, 50}, V2: mesh.Vec3{-50, 1, 50}})
	// Side faces
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 0, -50}, V1: mesh.Vec3{50, 0, -50}, V2: mesh.Vec3{50, 1, -50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 0, -50}, V1: mesh.Vec3{50, 1, -50}, V2: mesh.Vec3{-50, 1, -50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{50, 0, -50}, V1: mesh.Vec3{50, 0, 50}, V2: mesh.Vec3{50, 1, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{50, 0, -50}, V1: mesh.Vec3{50, 1, 50}, V2: mesh.Vec3{50, 1, -50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 0, 50}, V1: mesh.Vec3{50, 0, 50}, V2: mesh.Vec3{50, 1, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 0, 50}, V1: mesh.Vec3{50, 1, 50}, V2: mesh.Vec3{-50, 1, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 0, -50}, V1: mesh.Vec3{-50, 0, 50}, V2: mesh.Vec3{-50, 1, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-50, 0, -50}, V1: mesh.Vec3{-50, 1, 50}, V2: mesh.Vec3{-50, 1, -50}})
	m.CenterAtOrigin()

	// At (0, 0), top and bottom faces (normals ±Y) have no tangent rays
	// The 4 side faces do have tangent rays
	ftuy := ComputeTuyCompleteness(m, 0, 0)
	// 8 side triangles / 12 total triangles = 0.666...
	expected := 8.0 / 12.0
	if ftuy != expected {
		t.Errorf("Expected FTuy = %.3f for flat plate at (0,0), got %.3f", expected, ftuy)
	}
}

func TestRun_WithMesh_ComputesTuy(t *testing.T) {
	m, bvhTree := buildTestMesh()
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 4
	cfg.RayGridY = 4
	cfg.NumProjections = 8

	result, err := Run(bvhTree, m, cfg, [3]float64{0.4, 0.4, 0.2}, "weighted", nil, 0, 0)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}
	// All sides of a box mesh should have tangent rays
	if result.BestOrientation.FTuy <= 0 {
		t.Errorf("Expected FTuy > 0 for box mesh, got %v", result.BestOrientation.FTuy)
	}
}
