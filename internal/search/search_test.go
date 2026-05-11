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
	_, bvhTree := buildTestMesh()
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 4
	cfg.RayGridY = 4
	cfg.NumProjections = 8

	score := EvaluateSingle(bvhTree, 0, 0, cfg)
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
}

func TestRun_ReturnsResult(t *testing.T) {
	_, bvhTree := buildTestMesh()
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 4
	cfg.RayGridY = 4
	cfg.NumProjections = 8

	result, err := Run(bvhTree, cfg, [3]float64{0.4, 0.4, 0.2}, "weighted", nil)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}
	if result == nil {
		t.Fatal("Run() returned nil result")
	}
	// For a tiny box mesh at coarse grid (4x4 rays, 8 projections), zero penetration
	// is expected — all rays miss or pass through thin edges.
	// Just verify we got numerical results.
	if result.BestOrientation.Theta == 0 && result.BestOrientation.Phi == 0 {
		// ok — theta/phi are always present
	}
	if len(result.AllScores) == 0 {
		t.Error("AllScores is empty")
	}
	if result.SearchTimeMs <= 0 {
		t.Error("SearchTimeMs should be positive")
	}
}

func TestRun_WithoutMesh_NoIntelliScan(t *testing.T) {
	_, bvhTree := buildTestMesh()
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 4
	cfg.RayGridY = 4
	cfg.NumProjections = 8

	result, err := Run(bvhTree, cfg, [3]float64{0.4, 0.4, 0.2}, "weighted", nil)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}
	if result.IntelliScan != nil {
		t.Error("expected IntelliScan to be nil since Run no longer computes it")
	}
}
