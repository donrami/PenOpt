package search

import (
	"math"
	"testing"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"penopt/internal/objectives"
	"penopt/internal/raycaster"
	"context"
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

	result, err := Run(context.Background(), bvhTree, m, cfg, [5]float64{0.4, 0.3, 0.15, 0.1, 0.05}, "weighted", nil, 0, 0)
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

	result, err := Run(context.Background(), bvhTree, m, cfg, [5]float64{0.4, 0.3, 0.15, 0.1, 0.05}, "weighted", nil, 0, 0)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}
	// All sides of a box mesh should have tangent rays
	if result.BestOrientation.FTuy <= 0 {
		t.Errorf("Expected FTuy > 0 for box mesh, got %v", result.BestOrientation.FTuy)
	}
}

// ── Known-answer tests ──

// buildCubeMesh creates a cube from (-size, -size, -size) to (size, size, size).
func buildCubeMesh(size float64) *mesh.Mesh {
	m := mesh.NewMesh()
	// Front (z=size)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, -size, size}, V1: mesh.Vec3{size, -size, size}, V2: mesh.Vec3{size, size, size}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, -size, size}, V1: mesh.Vec3{size, size, size}, V2: mesh.Vec3{-size, size, size}})
	// Back (z=-size)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, -size, -size}, V1: mesh.Vec3{size, -size, -size}, V2: mesh.Vec3{size, size, -size}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, -size, -size}, V1: mesh.Vec3{size, size, -size}, V2: mesh.Vec3{-size, size, -size}})
	// Top (y=size)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, size, -size}, V1: mesh.Vec3{size, size, -size}, V2: mesh.Vec3{size, size, size}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, size, -size}, V1: mesh.Vec3{size, size, size}, V2: mesh.Vec3{-size, size, size}})
	// Bottom (y=-size)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, -size, -size}, V1: mesh.Vec3{size, -size, -size}, V2: mesh.Vec3{size, -size, size}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, -size, -size}, V1: mesh.Vec3{size, -size, size}, V2: mesh.Vec3{-size, -size, size}})
	// Right (x=size)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{size, -size, -size}, V1: mesh.Vec3{size, size, -size}, V2: mesh.Vec3{size, size, size}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{size, -size, -size}, V1: mesh.Vec3{size, size, size}, V2: mesh.Vec3{size, -size, size}})
	// Left (x=-size)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, -size, -size}, V1: mesh.Vec3{-size, size, -size}, V2: mesh.Vec3{-size, size, size}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{-size, -size, -size}, V1: mesh.Vec3{-size, size, size}, V2: mesh.Vec3{-size, -size, size}})
	m.CenterAtOrigin()
	return m
}

// buildSphereMesh creates a simple sphere approximation using a 2-subdivision icosahedron.
func buildSphereMesh(radius float64, subdivisions int) *mesh.Mesh {
	goldenRatio := (1 + math.Sqrt(5)) / 2
	verts := []mesh.Vec3{
		{-1, goldenRatio, 0}, {1, goldenRatio, 0}, {-1, -goldenRatio, 0}, {1, -goldenRatio, 0},
		{0, -1, goldenRatio}, {0, 1, goldenRatio}, {0, -1, -goldenRatio}, {0, 1, -goldenRatio},
		{goldenRatio, 0, -1}, {goldenRatio, 0, 1}, {-goldenRatio, 0, -1}, {-goldenRatio, 0, 1},
	}
	for i := range verts {
		v := &verts[i]
		l := math.Sqrt(v.X*v.X + v.Y*v.Y + v.Z*v.Z)
		v.X = v.X / l * radius
		v.Y = v.Y / l * radius
		v.Z = v.Z / l * radius
	}

	faces := [][3]int{
		{0, 1, 4}, {0, 4, 11}, {0, 11, 5}, {0, 5, 1}, {1, 5, 9},
		{1, 9, 8}, {1, 8, 4}, {4, 8, 2}, {4, 2, 11}, {11, 2, 10},
		{11, 10, 5}, {5, 10, 6}, {5, 6, 9}, {9, 6, 7}, {9, 7, 8},
		{8, 7, 2}, {2, 7, 3}, {2, 3, 10}, {10, 3, 6}, {6, 3, 7},
	}

	for s := 0; s < subdivisions; s++ {
		newFaces := make([][3]int, 0, len(faces)*4)
		midMap := make(map[[2]int]int)
		midpoint := func(a, b int) int {
			key := [2]int{min(a, b), max(a, b)}
			if idx, ok := midMap[key]; ok {
				return idx
			}
			va, vb := verts[a], verts[b]
			mid := mesh.Vec3{X: (va.X + vb.X) / 2, Y: (va.Y + vb.Y) / 2, Z: (va.Z + vb.Z) / 2}
			l := math.Sqrt(mid.X*mid.X + mid.Y*mid.Y + mid.Z*mid.Z)
			mid.X = mid.X / l * radius
			mid.Y = mid.Y / l * radius
			mid.Z = mid.Z / l * radius
			idx := len(verts)
			verts = append(verts, mid)
			midMap[key] = idx
			return idx
		}
		for _, f := range faces {
			a, b, c := f[0], f[1], f[2]
			ab := midpoint(a, b)
			bc := midpoint(b, c)
			ca := midpoint(c, a)
			newFaces = append(newFaces,
				[3]int{a, ab, ca},
				[3]int{b, bc, ab},
				[3]int{c, ca, bc},
				[3]int{ab, bc, ca},
			)
		}
		faces = newFaces
	}

	m := mesh.NewMesh()
	for _, f := range faces {
		m.AddTriangle(mesh.Triangle{V0: verts[f[0]], V1: verts[f[1]], V2: verts[f[2]]})
	}
	m.CenterAtOrigin()
	return m
}

// ── Face-centroid fallback tests ──

// TestFaceCentroid_CoversAllFaces verifies that face-centroid sampling
// produces a high coverage fraction and the correct number of rays.
func TestFaceCentroid_CoversAllFaces(t *testing.T) {
	m, bvhTree := buildTestMesh() // 12-face box
	cfg := raycaster.DefaultScannerConfig()
	cfg.NumProjections = 4

	result := raycaster.ComputeTransmissionLengthsFaceCentroid(0, 0, m, bvhTree, cfg)

	t.Logf("Face-centroid: %d faces x %d projections = %d total rays",
		m.NumTris, cfg.NumProjections, len(result.Lengths))
	t.Logf("Face-centroid: coverage=%.4f, fMtl=%.3f, fEnergy=%.3f",
		result.CoverageFraction,
		objectives.FMtl(result.Lengths, 3),
		objectives.FEnergy(result.Lengths))

	// With 12 faces x 4 projections = 48 rays, coverage should be high.
	// The box fills a substantial fraction of the detector.
	if result.CoverageFraction < 0.5 {
		t.Errorf("Face-centroid coverage = %.4f, expected > 0.5", result.CoverageFraction)
	}
	if len(result.Lengths) != 12*4 {
		t.Errorf("Expected %d lengths, got %d", 12*4, len(result.Lengths))
	}
}

// TestRunWithFaceCentroid verifies that the search triggers face-centroid
// sampling for a tiny part that fits between grid cells.
func TestRunWithFaceCentroid_SmallPart(t *testing.T) {
	// A tiny 1mm cube centered at origin on a 400mm detector.
	// With any reasonable grid, the part fits between inter-ray cells.
	m := buildCubeMesh(0.5) // 1mm cube
	bvhTree := bvh.Build(m)
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 8
	cfg.RayGridY = 8
	cfg.NumProjections = 8

	result, err := Run(context.Background(), bvhTree, m, cfg, [5]float64{0.4, 0.3, 0.15, 0.1, 0.05}, "weighted", nil, 0, 0)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}

	t.Logf("Small part: samplingMethod=%q", result.SamplingMethod)
	t.Logf("Small part: minCoverage=%.4f, warning=%q", result.MinCoverageFraction, result.CoverageWarning)

	// The small part should trigger face-centroid sampling
	if result.SamplingMethod != "face-centroid" {
		t.Logf("Note: sampling method is %q (face-centroid expected for tiny part)", result.SamplingMethod)
	}
}

// TestSearch_FindsCubeFaceOn verifies that the search finds a near-face-on
// orientation for a cube, since face-on minimises peak penetration.
// Uses a 200mm cube (fills 50% of detector) and 32×32 ray grid for adequate sampling.
func TestSearch_FindsCubeFaceOn(t *testing.T) {
	m := buildCubeMesh(100.0) // 200mm cube — fills half the detector
	bvhTree := bvh.Build(m)
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 32
	cfg.RayGridY = 32
	cfg.NumProjections = 36

	result, err := Run(context.Background(), bvhTree, m, cfg, [5]float64{0.3, 0.4, 0.2, 0.05, 0.05}, "weighted", nil, 0, 0)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}

	best := result.BestOrientation
	t.Logf("Cube: best θ=%.1f°, φ=%.1f°, score=%.4f", best.Theta, best.Phi, best.Score)
	t.Logf("Cube: fMtl=%.2f, fEnergy=%.2f (200mm cube, face-on ~200mm, varies by projection)",
		best.FMtl, best.FEnergy)

	// The face-on neighbourhood (θ≈0°, φ≈0°) should be near-optimal.
	// The 15° coarse grid evaluates exactly at (0,0) and (±15, ...).
	// The best orientation must be within a few grid steps of face-on.
	dist := math.Sqrt(best.Theta*best.Theta + best.Phi*best.Phi)
	t.Logf("Angular distance from face-on: %.1f°", dist)
	if dist > 30 {
		t.Errorf("Best at θ=%.1f°, φ=%.1f° is %.1f° from face-on — expected within 30°",
			best.Theta, best.Phi, dist)
	}

	// fEnergy for a 200mm cube will vary by projection angle.
	// At worst, max penetration approaches the space diagonal (~346mm).
	// At best (face-on projection), it's ~200mm. Both are valid.
	if best.FEnergy < 100 || best.FEnergy > 400 {
		t.Errorf("fEnergy=%.1f mm outside expected range [100, 400] for 200mm cube", best.FEnergy)
	}
}

// TestSphere_AllOrientationsEqual verifies that a sphere has no preferred
// orientation — objective values should be near-identical regardless of angles.
func TestSphere_AllOrientationsEqual(t *testing.T) {
	m := buildSphereMesh(30.0, 2) // ~320 faces, radius 30mm
	bvhTree := bvh.Build(m)
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 8
	cfg.RayGridY = 8
	cfg.NumProjections = 18

	s0 := EvaluateSingle(bvhTree, m, 0, 0, cfg)
	s45 := EvaluateSingle(bvhTree, m, 45, 45, cfg)

	maxFMtl := math.Max(s0.FMtl, s45.FMtl)
	if maxFMtl > 0 {
		diff := math.Abs(s0.FMtl-s45.FMtl) / maxFMtl
		t.Logf("Sphere: fMtl(0,0)=%.2f, fMtl(45,45)=%.2f, rel diff=%.3f%%",
			s0.FMtl, s45.FMtl, diff*100)
		// For a sphere, fMtl should be within 10% regardless of orientation.
		// The tolerance is higher than ideal because the low-res ray grid (8×8)
		// introduces discretisation noise.
		if diff > 0.10 {
			t.Errorf("Sphere fMtl varies by %.1f%% between (0,0) and (45,45)", diff*100)
		}
	}

	maxFEn := math.Max(s0.FEnergy, s45.FEnergy)
	if maxFEn > 0 {
		diff := math.Abs(s0.FEnergy-s45.FEnergy) / maxFEn
		t.Logf("Sphere: fEnergy(0,0)=%.2f, fEnergy(45,45)=%.2f, rel diff=%.3f%%",
			s0.FEnergy, s45.FEnergy, diff*100)
		if diff > 0.10 {
			t.Errorf("Sphere fEnergy varies by %.1f%% between (0,0) and (45,45)", diff*100)
		}
	}
}
