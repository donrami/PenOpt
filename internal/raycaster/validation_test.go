package raycaster

import (
	"math"
	"testing"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
)

// buildSphereMesh creates an icosphere approximation with radius R.
// Uses a recursive icosahedron subdivision for good sphere approximation.
func buildSphereMesh(radius float64, subdivisions int) *mesh.Mesh {
	// Start with icosahedron vertices
	goldenRatio := (1 + math.Sqrt(5)) / 2
	verts := []mesh.Vec3{
		{-1, goldenRatio, 0}, {1, goldenRatio, 0}, {-1, -goldenRatio, 0}, {1, -goldenRatio, 0},
		{0, -1, goldenRatio}, {0, 1, goldenRatio}, {0, -1, -goldenRatio}, {0, 1, -goldenRatio},
		{goldenRatio, 0, -1}, {goldenRatio, 0, 1}, {-goldenRatio, 0, -1}, {-goldenRatio, 0, 1},
	}
	// Normalize to radius
	for i := range verts {
		v := &verts[i]
		l := math.Sqrt(v.X*v.X + v.Y*v.Y + v.Z*v.Z)
		v.X = v.X / l * radius
		v.Y = v.Y / l * radius
		v.Z = v.Z / l * radius
	}

	// Icosahedron faces (20 triangles)
	faces := [][3]int{
		{0, 1, 4}, {0, 4, 11}, {0, 11, 5}, {0, 5, 1}, {1, 5, 9},
		{1, 9, 8}, {1, 8, 4}, {4, 8, 2}, {4, 2, 11}, {11, 2, 10},
		{11, 10, 5}, {5, 10, 6}, {5, 6, 9}, {9, 6, 7}, {9, 7, 8},
		{8, 7, 2}, {2, 7, 3}, {2, 3, 10}, {10, 3, 6}, {6, 3, 7},
	}

	// Subdivision
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

	// Build mesh
	m := mesh.NewMesh()
	for _, f := range faces {
		v0, v1, v2 := verts[f[0]], verts[f[1]], verts[f[2]]
		edge1 := mesh.Vec3{X: v1.X - v0.X, Y: v1.Y - v0.Y, Z: v1.Z - v0.Z}
		edge2 := mesh.Vec3{X: v2.X - v0.X, Y: v2.Y - v0.Y, Z: v2.Z - v0.Z}
		nx := edge1.Y*edge2.Z - edge1.Z*edge2.Y
		ny := edge1.Z*edge2.X - edge1.X*edge2.Z
		nz := edge1.X*edge2.Y - edge1.Y*edge2.X
		area := math.Sqrt(nx*nx + ny*ny + nz*nz)
		n := mesh.Vec3{}
		if area > 1e-12 {
			n = mesh.Vec3{X: nx / area, Y: ny / area, Z: nz / area}
		}
		m.AddTriangle(mesh.Triangle{V0: v0, V1: v1, V2: v2, Normal: n})
	}
	return m
}

// buildCubeMesh creates an axis-aligned cube from (-size, -size, -size) to (size, size, size).
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

// TestPenetrationCubeCenter checks penetration through the center of a cube.
// A ray along +X through the center of a 100mm cube travels exactly 100mm.
func TestPenetrationCubeCenter(t *testing.T) {
	cubeSize := 50.0 // 100mm on each side
	m := buildCubeMesh(cubeSize)
	bvhTree := bvh.Build(m)

	// Ray through center along +X
	hits, _ := bvhTree.IntersectAll(mesh.Vec3{-200, 0, 0}, mesh.Vec3{1, 0, 0})
	if len(hits) < 2 {
		t.Fatalf("expected at least 2 intersections, got %d", len(hits))
	}

	penetration := hits[len(hits)-1] - hits[0]
	expected := 100.0 // 2 * 50 mm
	if math.Abs(penetration-expected) > 1.0 {
		t.Errorf("cube penetration: got %.3f mm, want %.3f ± 1.0 mm", penetration, expected)
	}
}

// TestPenetrationCubeOffCenter checks penetration through a cube at an offset.
// A cube has uniform cross-section at any y, so chord length = full width = 2*size.
func TestPenetrationCubeOffCenter(t *testing.T) {
	cubeSize := 50.0
	m := buildCubeMesh(cubeSize)
	bvhTree := bvh.Build(m)

	// Ray at y = 25 (half-height), z = 0, along +X
	hits, _ := bvhTree.IntersectAll(mesh.Vec3{-200, 25, 0}, mesh.Vec3{1, 0, 0})
	if len(hits) < 2 {
		t.Fatalf("expected at least 2 intersections, got %d", len(hits))
	}

	penetration := hits[len(hits)-1] - hits[0]
	expected := 2 * cubeSize // 100mm for full width
	if math.Abs(penetration-expected) > 1.0 {
		t.Errorf("cube off-center: got %.3f mm, want %.3f ± 1.0 mm", penetration, expected)
	}
}

// TestPenetrationSphereCenter checks penetration through center of a sphere.
// For a sphere radius R, centered ray penetrates 2R.
func TestPenetrationSphereCenter(t *testing.T) {
	radius := 30.0
	m := buildSphereMesh(radius, 2) // 2 subdivisions = 320 triangles, close enough
	bvhTree := bvh.Build(m)

	// Ray through sphere center along +X
	hits, _ := bvhTree.IntersectAll(mesh.Vec3{-200, 0, 0}, mesh.Vec3{1, 0, 0})
	if len(hits) < 2 {
		t.Fatalf("expected at least 2 intersections, got %d", len(hits))
	}

	penetration := hits[len(hits)-1] - hits[0]
	expected := 2 * radius // 60 mm
	// Allow 1mm error for sphere approximation
	if math.Abs(penetration-expected) > 1.0 {
		t.Errorf("sphere center: got %.3f mm, want %.3f ± 1.0 mm (error: %.3f mm)", penetration, expected, math.Abs(penetration-expected))
	}
}



// TestPenetrationSlab checks penetration through a thin slab.
// A slab of thickness t should give penetration = t for a perpendicular ray.
func TestPenetrationSlab(t *testing.T) {
	m := mesh.NewMesh()
	thickness := 5.0
	// A thin slab at x=0, thickness = 5mm
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, -50, -50}, V1: mesh.Vec3{0, 50, -50}, V2: mesh.Vec3{0, 50, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, -50, -50}, V1: mesh.Vec3{0, 50, 50}, V2: mesh.Vec3{0, -50, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{thickness, -50, -50}, V1: mesh.Vec3{thickness, 50, -50}, V2: mesh.Vec3{thickness, 50, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{thickness, -50, -50}, V1: mesh.Vec3{thickness, 50, 50}, V2: mesh.Vec3{thickness, -50, 50}})
	// Connect front and back (4 side faces)
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, -50, -50}, V1: mesh.Vec3{thickness, -50, -50}, V2: mesh.Vec3{thickness, 50, -50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, -50, -50}, V1: mesh.Vec3{thickness, 50, -50}, V2: mesh.Vec3{0, 50, -50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, -50, 50}, V1: mesh.Vec3{thickness, 50, 50}, V2: mesh.Vec3{thickness, -50, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, -50, 50}, V1: mesh.Vec3{thickness, -50, 50}, V2: mesh.Vec3{0, 50, 50}})
	// Top/bottom
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, 50, -50}, V1: mesh.Vec3{thickness, 50, -50}, V2: mesh.Vec3{thickness, 50, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, 50, -50}, V1: mesh.Vec3{thickness, 50, 50}, V2: mesh.Vec3{0, 50, 50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, -50, -50}, V1: mesh.Vec3{thickness, -50, 50}, V2: mesh.Vec3{thickness, -50, -50}})
	m.AddTriangle(mesh.Triangle{V0: mesh.Vec3{0, -50, -50}, V1: mesh.Vec3{0, -50, 50}, V2: mesh.Vec3{thickness, -50, 50}})
	m.CenterAtOrigin()

	bvhTree := bvh.Build(m)

	// Ray through center along +X
	hits, _ := bvhTree.IntersectAll(mesh.Vec3{-200, 0, 0}, mesh.Vec3{1, 0, 0})
	if len(hits) < 2 {
		t.Fatalf("expected at least 2 intersections, got %d", len(hits))
	}

	penetration := hits[len(hits)-1] - hits[0]
	if math.Abs(penetration-thickness) > 0.1 {
		t.Errorf("slab penetration: got %.3f mm, want %.3f ± 0.1 mm", penetration, thickness)
	}
}

// TestPenetrationCubeVsSphere compares penetration through cube vs sphere.
// A cube of side 2R has larger cross-section than a sphere of radius R at center.
func TestPenetrationCubeVsSphere(t *testing.T) {
	size := 40.0
	cubeMesh := buildCubeMesh(size)
	cubeBVH := bvh.Build(cubeMesh)

	sphereMesh := buildSphereMesh(size, 3)
	sphereBVH := bvh.Build(sphereMesh)

	// Center-through ray for cube: 2*size = 80mm
	cubeHits, _ := cubeBVH.IntersectAll(mesh.Vec3{-200, 0, 0}, mesh.Vec3{1, 0, 0})
	cubePen := cubeHits[len(cubeHits)-1] - cubeHits[0]

	// Center-through ray for sphere: 2*size = 80mm
	sphereHits, _ := sphereBVH.IntersectAll(mesh.Vec3{-200, 0, 0}, mesh.Vec3{1, 0, 0})
	spherePen := sphereHits[len(sphereHits)-1] - sphereHits[0]

	expectedCube := 2 * size // 80mm
	expectedSphere := 2 * size // 80mm for centered ray
	if math.Abs(cubePen-expectedCube) > 1.0 {
		t.Errorf("cube center: got %.3f mm, want %.3f ± 1.0 mm", cubePen, expectedCube)
	}
	if math.Abs(spherePen-expectedSphere) > 1.0 {
		t.Errorf("sphere center: got %.3f mm, want %.3f ± 1.0 mm", spherePen, expectedSphere)
	}
}

func TestCoverageFraction_SmallPart(t *testing.T) {
	// A tiny mesh on a large detector at coarse grid should produce low coverage
	m := buildCubeMesh(0.5) // 1mm cube (size=0.5 → half-extent 0.5, full extent 1mm)
	bvhTree := bvh.Build(m)
	cfg := DefaultScannerConfig() // default 400mm detector
	cfg.RayGridX = 8
	cfg.RayGridY = 8
	cfg.NumProjections = 8

	grid := ComputeRayGrid(cfg)
	result := ComputeTransmissionLengths(0, 0, bvhTree, cfg, grid)

	if result.CoverageFraction > 0.1 {
		t.Errorf("Small part on coarse grid: coverage = %.4f, expected < 0.1", result.CoverageFraction)
	}
}

func TestCoverageFraction_ZeroCoverage(t *testing.T) {
	// With an empty mesh, coverage should be exactly 0.
	m := mesh.NewMesh()
	bvhTree := bvh.Build(m)
	cfg := DefaultScannerConfig()
	cfg.RayGridX = 8
	cfg.RayGridY = 8
	cfg.NumProjections = 4

	grid := ComputeRayGrid(cfg)
	result := ComputeTransmissionLengths(0, 0, bvhTree, cfg, grid)

	if result.CoverageFraction != 0.0 {
		t.Errorf("Empty mesh: coverage = %.4f, expected 0.0", result.CoverageFraction)
	}
}

func TestCoverageFraction_NonZeroForNormalMesh(t *testing.T) {
	// A reasonably sized part should have some non-zero coverage on a fine grid
	m := buildCubeMesh(60.0) // 120mm cube
	bvhTree := bvh.Build(m)
	cfg := DefaultScannerConfig()
	cfg.RayGridX = 32
	cfg.RayGridY = 32
	cfg.NumProjections = 4

	grid := ComputeRayGrid(cfg)
	result := ComputeTransmissionLengths(0, 0, bvhTree, cfg, grid)

	if result.CoverageFraction <= 0.0 {
		t.Errorf("120mm cube on 32x32 grid: coverage = %.4f, expected > 0", result.CoverageFraction)
	}
	t.Logf("120mm cube at 32x32: coverage = %.4f", result.CoverageFraction)
}

func TestCoverageFraction_SmallVsLarge(t *testing.T) {
	// A small part should have lower coverage than a large part
	small := buildCubeMesh(2.0)   // 4mm cube
	large := buildCubeMesh(100.0) // 200mm cube
	smallBVH := bvh.Build(small)
	largeBVH := bvh.Build(large)
	cfg := DefaultScannerConfig()
	cfg.RayGridX = 8
	cfg.RayGridY = 8
	cfg.NumProjections = 4

	grid := ComputeRayGrid(cfg)
	smallResult := ComputeTransmissionLengths(0, 0, smallBVH, cfg, grid)
	largeResult := ComputeTransmissionLengths(0, 0, largeBVH, cfg, grid)

	if smallResult.CoverageFraction >= largeResult.CoverageFraction {
		t.Errorf("Small part coverage (%.4f) should be less than large part coverage (%.4f)",
			smallResult.CoverageFraction, largeResult.CoverageFraction)
	}
}




