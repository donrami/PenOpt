# PenOpt Architecture Deepening — Implementation Spec

## Overview

This spec describes 8 deepening opportunities for the PenOpt codebase, ordered by dependency (smallest/least risky first). Each step has clear file paths, interface changes, and verification criteria.

**Order of execution:**
1. Create `CONTEXT.md` (domain glossary)
2. Write characterization tests (before any refactors)
3. Step 1 — Mutable slices → immutable grid accessor (`search`)
4. Step 2 — Pre-compute ray grid (`raycaster`)
5. Step 3 — Extract shared vector math module (`internal/vec`)
6. Step 4 — Decouple IntelliScan from `search.Run`
7. Step 5 — Reduce mutex contention in `ComputeFacePenetrations`
8. Step 6 — Decompose `App` god struct
9. Step 7 — Split frontend `main.js`
10. Update/add tests for changed modules

**Git workflow:** Commit after each successful step. Use `git commit -m "step N: <description>"`. If a step fails, roll back with `git reset --hard` and fix before proceeding.

---

## Phase 0: Domain Glossary

### 0.1 Create `CONTEXT.md`

Create `/home/mainuser/Desktop/penopt/CONTEXT.md`:

```markdown
# PenOpt — CT Scan Orientation Optimizer

A desktop tool that finds the optimal orientation for CT scanning a manufactured part. It loads a 3D triangle mesh representing the part, simulates X-ray projections through the mesh at various orientations using BVH-accelerated ray casting, and searches over orientations to minimize penetration, energy requirements, and beam-hardening artifacts.

## Language

**Mesh:**
A 3D triangle mesh representing the scanned part. Loaded from STL or OBJ files. Stored as a flat list of triangles.
_Avoid:_ Model, object, geometry

**Orientation:**
A pair of angles (θ around X-axis, φ around Y-axis) defining the part's pose during scanning. The search space is θ ∈ [-45°, 45°] and φ ∈ [-45°, 45°].
_Avoid:_ Pose, rotation, angle

**Projection:**
A simulated 2D X-ray image at one rotation angle α around the object. Each projection consists of a grid of rays cast from the source through the mesh.
_Avoid:_ Shot, exposure, frame

**Ray:**
A single X-ray beam traced from the source through the mesh to the detector. The penetration length is the total distance the ray travels through solid material.
_Avoid:_ Beam, line, trace

**Penetration:**
The total path length a ray travels through mesh material (mm). The primary quantity being minimized.
_Avoid:_ Thickness, path length, distance

**BVH (Bounding Volume Hierarchy):**
A spatial acceleration structure that organizes mesh triangles so ray-triangle intersections can be found in O(log n) instead of O(n).
_Avoid:_ Tree, acceleration structure

**IntelliScan:**
An adaptive projection allocation method (Butzhammer 2026, Lifton & Poon 2023) that identifies projection angles where X-rays are tangent to mesh faces, and allocates more rays to informative orientations.
_Avoid:_ Adaptive scanning, tangent-ray selection

**Scanner Config:**
The geometric parameters of a CT scanner: source-to-detector distance (SDD), source-to-object distance (SOD), detector dimensions, pixel count, ray sampling grid size, and number of projection angles.
_Avoid:_ Scanner geometry, scan setup

**Objective function:**
One of three metrics evaluated at each orientation: f_mtl (generalized mean penetration), f_energy (max penetration), f_hdn (projection non-uniformity). Combined into a weighted score.
_Avoid:_ Metric, cost, target

## Relationships

- A **Mesh** is loaded from a file → a **BVH** is built from it
- An **Orientation** is evaluated by casting a grid of **Rays** through the **BVH**
- Each **Projection** produces a set of **Penetration** values (one per **Ray**)
- All **Projections** for an **Orientation** produce the three **Objective function** values
- **IntelliScan** analyzes mesh face normals at the best **Orientation** to recommend minimal projection angles

## Example dialogue

> **Dev:** "When I load a Mesh, the BVH is rebuilt every time?"
> **Domain expert:** "Yes — the BVH depends on triangle positions. Reloading the mesh replaces both."
> **Dev:** "And after the search, IntelliScan uses the Mesh to compute tangent angles?"
> **Domain expert:** "Right — it needs face normals, which come from the Mesh, not the BVH."
```

### 0.2 Commit

```bash
git add CONTEXT.md && git commit -m "step 0: add CONTEXT.md domain glossary"
```

---

## Phase 1: Characterization Tests

Before any refactoring, write tests that characterize the current behavior. This catches regressions when code changes.

### 1.1 Create test files

Create `/home/mainuser/Desktop/penopt/internal/objectives/objectives_test.go`:

```go
package objectives

import (
	"math"
	"testing"
)

func TestFMtl_AllZeros(t *testing.T) {
	lengths := []float64{0, 0, 0, 0}
	got := FMtl(lengths, 3)
	if got != 0 {
		t.Errorf("FMtl(all zeros) = %v, want 0", got)
	}
}

func TestFMtl_Identical(t *testing.T) {
	lengths := []float64{10, 10, 10, 10}
	got := FMtl(lengths, 3)
	if math.Abs(got-10) > 1e-10 {
		t.Errorf("FMtl(identical) = %v, want 10", got)
	}
}

func TestFMtl_OrderInvariant(t *testing.T) {
	a := FMtl([]float64{1, 2, 3, 4, 5}, 3)
	b := FMtl([]float64{5, 4, 3, 2, 1}, 3)
	if math.Abs(a-b) > 1e-10 {
		t.Errorf("FMtl not order-invariant: %v vs %v", a, b)
	}
}

func TestFEnergy(t *testing.T) {
	cases := []struct {
		vals []float64
		want float64
	}{
		{[]float64{1, 5, 3, 2}, 5},
		{[]float64{0, 0, 0}, 0},
		{[]float64{-1, -5, -3}, -1},
		{[]float64{100}, 100},
	}
	for _, c := range cases {
		got := FEnergy(c.vals)
		if got != c.want {
			t.Errorf("FEnergy(%v) = %v, want %v", c.vals, got, c.want)
		}
	}
}

func TestFHdn(t *testing.T) {
	cases := []struct {
		vals []float64
		want float64
	}{
		{[]float64{1, 5, 3}, 4},
		{[]float64{10, 10, 10}, 0},
		{[]float64{}, 0},
	}
	for _, c := range cases {
		got := FHdn(c.vals)
		if got != c.want {
			t.Errorf("FHdn(%v) = %v, want %v", c.vals, got, c.want)
		}
	}
}

func TestNormalize(t *testing.T) {
	got := Normalize([]float64{1, 3, 5})
	want := []float64{0, 0.5, 1}
	for i := range got {
		if math.Abs(got[i]-want[i]) > 1e-10 {
			t.Errorf("Normalize[%d] = %v, want %v", i, got[i], want[i])
		}
	}
}

func TestNormalize_AllEqual(t *testing.T) {
	got := Normalize([]float64{5, 5, 5})
	if len(got) != 3 {
		t.Fatal("expected 3 results")
	}
	for i, v := range got {
		if v != 0 {
			t.Errorf("Normalize[%d] on equal vals = %v, want 0", i, v)
		}
	}
}

func TestCombinedScore_Weighted(t *testing.T) {
	fMtl := []float64{1, 2, 3}
	fEnergy := []float64{4, 5, 6}
	fHdn := []float64{7, 8, 9}
	scores := CombinedScore(fMtl, fEnergy, fHdn, 0.5, 0.3, 0.2, "weighted")
	if len(scores) != 3 {
		t.Fatalf("expected 3 scores, got %d", len(scores))
	}
	// Check scores are in [0,1.0]
	for i, s := range scores {
		if s < 0 || s > 1.0+1e-10 {
			t.Errorf("score[%d] = %v, outside [0,1]", i, s)
		}
	}
}

func TestCombinedScore_Minimax(t *testing.T) {
	fMtl := []float64{1, 2, 3}
	fEnergy := []float64{4, 5, 6}
	fHdn := []float64{7, 8, 9}
	scores := CombinedScore(fMtl, fEnergy, fHdn, 0.5, 0.3, 0.2, "minimax")
	if len(scores) != 3 {
		t.Fatalf("expected 3 scores, got %d", len(scores))
	}
}
```

Create `/home/mainuser/Desktop/penopt/internal/physics/physics_test.go`:

```go
package physics

import (
	"math"
	"testing"
)

func TestLogLogInterp_ExactMatch(t *testing.T) {
	pts := []MuRhoPoint{
		{Energy: 30, MuRho: 0.600},
		{Energy: 50, MuRho: 0.278},
		{Energy: 80, MuRho: 0.202},
	}
	got := LogLogInterp(30, pts)
	if math.Abs(got-0.600) > 1e-6 {
		t.Errorf("LogLogInterp(30) = %v, want 0.600", got)
	}
}

func TestLogLogInterp_BelowRange(t *testing.T) {
	pts := []MuRhoPoint{
		{Energy: 30, MuRho: 0.600},
		{Energy: 50, MuRho: 0.278},
	}
	got := LogLogInterp(10, pts)
	if math.Abs(got-0.600) > 1e-6 {
		t.Errorf("LogLogInterp(10, below range) = %v, want 0.600", got)
	}
}

func TestLogLogInterp_AboveRange(t *testing.T) {
	pts := []MuRhoPoint{
		{Energy: 30, MuRho: 0.600},
		{Energy: 50, MuRho: 0.278},
	}
	got := LogLogInterp(100, pts)
	if math.Abs(got-0.278) > 1e-6 {
		t.Errorf("LogLogInterp(100, above range) = %v, want 0.278", got)
	}
}

func TestLogLogInterp_Empty(t *testing.T) {
	got := LogLogInterp(50, []MuRhoPoint{})
	if got != 0 {
		t.Errorf("LogLogInterp(empty) = %v, want 0", got)
	}
}

func TestCalcMu(t *testing.T) {
	mat := Material{ID: "al", Name: "Aluminum", Rho: 2.70,
		Data: []MuRhoPoint{{Energy: 30, MuRho: 0.600}, {Energy: 50, MuRho: 0.278}},
	}
	mu := CalcMu(mat, 30)
	// mu = muRho * rho = 0.600 * 2.70 = 1.62
	if math.Abs(mu-1.62) > 1e-6 {
		t.Errorf("CalcMu(Al, 30keV) = %v, want 1.62", mu)
	}
}

func TestCalcTransmission(t *testing.T) {
	// T = exp(-mu * x/10) where mu is cm^-1, x is mm
	// mu=1, x=10mm -> T = exp(-1 * 1) = 0.3679
	T := CalcTransmission(1.0, 10.0)
	if math.Abs(T-0.367879) > 1e-4 {
		t.Errorf("CalcTransmission(1, 10) = %v, want ~0.3679", T)
	}
}

func TestCalcTMm(t *testing.T) {
	// T = exp(-mu * x/10) -> x = -ln(T) / mu * 10
	// mu=1, T=0.5 -> x = -ln(0.5) / 1 * 10 = 6.931
	x := CalcTMm(1.0, 0.5)
	if math.Abs(x-6.93147) > 1e-3 {
		t.Errorf("CalcTMm(1, 0.5) = %v, want ~6.931", x)
	}
}

func TestMaterialByID_Found(t *testing.T) {
	m, ok := MaterialByID("al")
	if !ok {
		t.Fatal("MaterialByID('al') should find Aluminium")
	}
	if m.Name != "Aluminum" {
		t.Errorf("got name %q, want 'Aluminum'", m.Name)
	}
}

func TestMaterialByID_NotFound(t *testing.T) {
	_, ok := MaterialByID("nonexistent")
	if ok {
		t.Error("MaterialByID('nonexistent') should return false")
	}
}

func TestFmtPenetration(t *testing.T) {
	cases := []struct {
		mm   float64
		want string
	}{
		{5.2, "5.2 mm"},
		{150, "150 mm"},
		{150.0, "150 mm"},
		{1500, "1.50 m"},
		{10000, ">10 m"},
	}
	for _, c := range cases {
		got := FmtPenetration(c.mm)
		if got != c.want {
			t.Errorf("FmtPenetration(%v) = %q, want %q", c.mm, got, c.want)
		}
	}
}
```

Create `/home/mainuser/Desktop/penopt/internal/bvh/bvh_test.go`:

```go
package bvh

import (
	"math"
	"testing"

	"penopt/internal/mesh"
)

func TestBuildAndIntersect(t *testing.T) {
	// A simple mesh: one triangle at z=100
	m := mesh.NewMesh()
	m.AddTriangle(mesh.Triangle{
		V0: mesh.Vec3{X: -10, Y: -10, Z: 100},
		V1: mesh.Vec3{X: 10, Y: -10, Z: 100},
		V2: mesh.Vec3{X: 0, Y: 10, Z: 100},
	})

	bvhTree := Build(m)
	if bvhTree.NumTris != 1 {
		t.Fatalf("expected 1 tri, got %d", bvhTree.NumTris)
	}

	// Ray from origin along +Z should hit
	hit, t, idx := bvhTree.Intersect(mesh.Vec3{0, 0, 0}, mesh.Vec3{0, 0, 1})
	if !hit {
		t.Fatal("expected hit")
	}
	if math.Abs(t-100) > 1e-6 {
		t.Errorf("expected t=100, got %f", t)
	}
	if idx != 0 {
		t.Errorf("expected idx=0, got %d", idx)
	}
}

func TestIntersect_Miss(t *testing.T) {
	m := mesh.NewMesh()
	m.AddTriangle(mesh.Triangle{
		V0: mesh.Vec3{X: -10, Y: -10, Z: 100},
		V1: mesh.Vec3{X: 10, Y: -10, Z: 100},
		V2: mesh.Vec3{X: 0, Y: 10, Z: 100},
	})
	bvhTree := Build(m)

	// Ray along +X should miss
	hit, _, _ := bvhTree.Intersect(mesh.Vec3{0, 0, 0}, mesh.Vec3{1, 0, 0})
	if hit {
		t.Fatal("expected no hit")
	}
}

func TestIntersectAll(t *testing.T) {
	// Two triangles forming a box with front and back faces along Z axis
	m := mesh.NewMesh()
	m.AddTriangle(mesh.Triangle{
		V0: mesh.Vec3{X: -10, Y: -10, Z: 90},
		V1: mesh.Vec3{X: 10, Y: -10, Z: 90},
		V2: mesh.Vec3{X: 0, Y: 10, Z: 90},
	})
	m.AddTriangle(mesh.Triangle{
		V0: mesh.Vec3{X: -10, Y: -10, Z: 110},
		V1: mesh.Vec3{X: 0, Y: 10, Z: 110},
		V2: mesh.Vec3{X: 10, Y: -10, Z: 110},
	})
	bvhTree := Build(m)

	hits, indices := bvhTree.IntersectAll(mesh.Vec3{0, 0, 0}, mesh.Vec3{0, 0, 1})
	if len(hits) != 2 {
		t.Fatalf("expected 2 hits, got %d: %v", len(hits), hits)
	}

	// Should hit front (z=90) first, then back (z=110)
	if hits[0] > hits[1] {
		t.Errorf("expected hits sorted: %v", hits)
	}
	if len(indices) != 2 {
		t.Errorf("expected 2 indices, got %d", len(indices))
	}
}

func TestAABB(t *testing.T) {
	b := AABB{
		Min: mesh.Vec3{X: -10, Y: -10, Z: -10},
		Max: mesh.Vec3{X: 10, Y: 10, Z: 10},
	}

	// Ray through center should hit
	hit, tn, tf := RayAABBIntersect(mesh.Vec3{0, 0, -20}, mesh.Vec3{0, 0, 1}, b)
	if !hit {
		t.Fatal("expected hit")
	}
	if math.Abs(tn-10) > 1e-6 {
		t.Errorf("expected tn=10, got %f", tn)
	}
	if math.Abs(tf-30) > 1e-6 {
		t.Errorf("expected tf=30, got %f", tf)
	}

	// Ray missing on X axis
	hit2, _, _ := RayAABBIntersect(mesh.Vec3{50, 0, 0}, mesh.Vec3{0, 0, 1}, b)
	if hit2 {
		t.Fatal("expected miss for ray outside AABB on X axis")
	}
}

func TestBuild_MultiTri(t *testing.T) {
	m := mesh.NewMesh()
	for i := 0; i < 50; i++ {
		z := float64(i) * 5
		m.AddTriangle(mesh.Triangle{
			V0: mesh.Vec3{X: -10, Y: -10, Z: z},
			V1: mesh.Vec3{X: 10, Y: -10, Z: z},
			V2: mesh.Vec3{X: 0, Y: 10, Z: z},
		})
	}
	bvhTree := Build(m)
	if bvhTree.NumTris != 50 {
		t.Fatalf("expected 50 tris, got %d", bvhTree.NumTris)
	}

	// All triangles should still be reachable via intersection
	hit, _, _ := bvhTree.Intersect(mesh.Vec3{0, 0, 0}, mesh.Vec3{0, 0, 1})
	if !hit {
		t.Fatal("expected a hit in multi-tri BVH")
	}
}
```

Create `/home/mainuser/Desktop/penopt/internal/mesh/mesh_test.go`:

```go
package mesh

import (
	"math"
	"testing"
)

func TestCenterAtOrigin(t *testing.T) {
	m := NewMesh()
	m.AddTriangle(Triangle{
		V0: Vec3{10, 20, 30},
		V1: Vec3{40, 50, 60},
		V2: Vec3{70, 80, 90},
	})
	m.CenterAtOrigin()
	c := m.Center()
	if math.Abs(c.X) > 1e-10 || math.Abs(c.Y) > 1e-10 || math.Abs(c.Z) > 1e-10 {
		t.Errorf("CenterAtOrigin: center not at origin: %v", c)
	}
}

func TestCheckWatertight_OpenMesh(t *testing.T) {
	m := NewMesh()
	m.AddTriangle(Triangle{
		V0: Vec3{0, 0, 0}, V1: Vec3{10, 0, 0}, V2: Vec3{5, 10, 0},
	})
	wt, be := m.CheckWatertight()
	if wt {
		t.Error("single triangle should not be watertight")
	}
	if be != 3 {
		t.Errorf("single triangle should have 3 boundary edges, got %d", be)
	}
}

func TestVertexBuffer(t *testing.T) {
	m := NewMesh()
	m.AddTriangle(Triangle{
		V0: Vec3{1, 2, 3}, V1: Vec3{4, 5, 6}, V2: Vec3{7, 8, 9},
	})
	buf := m.VertexBuffer()
	if len(buf) != 9 {
		t.Fatalf("expected 9 floats, got %d", len(buf))
	}
	if buf[0] != 1 || buf[4] != 5 || buf[8] != 9 {
		t.Errorf("unexpected buffer values: %v", buf)
	}
}

func TestExtent(t *testing.T) {
	m := NewMesh()
	m.AddTriangle(Triangle{
		V0: Vec3{0, 0, 0}, V1: Vec3{10, 0, 0}, V2: Vec3{5, 20, 0},
	})
	e := m.Extent()
	if math.Abs(e.X-5) > 1e-10 || math.Abs(e.Y-10) > 1e-10 {
		t.Errorf("Extent: got %v, want {5, 10, 0}", e)
	}
}
```

Create `/home/mainuser/Desktop/penopt/internal/search/search_test.go`:

```go
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
	m, bvhTree := buildTestMesh()
	cfg := raycaster.DefaultScannerConfig()
	cfg.RayGridX = 4
	cfg.RayGridY = 4
	cfg.NumProjections = 8

	result, err := Run(bvhTree, cfg, [3]float64{0.4, 0.4, 0.2}, "weighted", nil, m)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}
	if result == nil {
		t.Fatal("Run() returned nil result")
	}
	if result.BestOrientation.Score == 0 && result.BestOrientation.FEnergy == 0 {
		t.Error("BestOrientation has zero score — possibly all orientations had zero penetration")
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

	result, err := Run(bvhTree, cfg, [3]float64{0.4, 0.4, 0.2}, "weighted", nil, nil)
	if err != nil {
		t.Fatalf("Run() returned error: %v", err)
	}
	if result.IntelliScan != nil {
		t.Error("expected IntelliScan to be nil when mesh is nil")
	}
}
```

### 1.2 Run all tests and confirm they pass

```bash
cd /home/mainuser/Desktop/penopt && go test ./internal/...
```

Expected: all tests pass.

### 1.3 Commit

```bash
git add internal/ && git commit -m "step 1: add characterization tests for objectives, physics, bvh, mesh, search"
```

---

## Step 2: Mutable Slices → Immutable Grid Accessor (#8)

### Problem

`var CoarseThetas = []float64{-45, -30, -15, 0, 15, 30, 45}` in `internal/search/search.go` is public and mutable. Callers could mutate it, breaking global behavior.

### Changes

In `/home/mainuser/Desktop/penopt/internal/search/search.go`:

1. Rename `CoarseThetas` → `coarseThetas` (unexported)
2. Rename `CoarsePhis` → `coarsePhis` (unexported)
3. Add a function:

```go
// DefaultSearchGrid returns a copy of the default coarse search grid.
func DefaultSearchGrid() (thetas, phis []float64) {
	thetas = make([]float64, len(coarseThetas))
	phis = make([]float64, len(coarsePhis))
	copy(thetas, coarseThetas)
	copy(phis, coarsePhis)
	return
}
```

4. Update all internal references (within `search/search.go` and `search/intelliscan.go`) from `CoarseThetas`/`CoarsePhis` to `coarseThetas`/`coarsePhis`.

If any external package references `search.CoarseThetas` or `search.CoarsePhis` (check with `grep`), update those references to use the new function. Currently only `search/search.go` references them internally, but verify.

### Verification

```bash
cd /home/mainuser/Desktop/penopt && go build ./...
go test ./internal/search/...
```

### Commit

```bash
git commit -am "step 2: make CoarseThetas/CoarsePhis private with DefaultSearchGrid() accessor"
```

---

## Step 3: Pre-compute Ray Grid (#7)

### Problem

`ComputeTransmissionLengths` in `internal/raycaster/raycaster.go` recomputes grid pixel positions on every call, even when the `ScannerConfig` hasn't changed.

### Changes

In `/home/mainuser/Desktop/penopt/internal/raycaster/raycaster.go`:

1. Add a type for the pre-computed grid:

```go
// RayGrid is a pre-computed grid of detector pixel positions.
type RayGrid struct {
	Pixels    []struct{ Px, Py int }
	NumRays   int
}
```

2. Add a function to compute it once:

```go
// ComputeRayGrid pre-computes the ray grid positions from a ScannerConfig.
func ComputeRayGrid(cfg ScannerConfig) RayGrid {
	stepX := float64(cfg.DetPixelsX+1) / float64(cfg.RayGridX+1)
	stepY := float64(cfg.DetPixelsY+1) / float64(cfg.RayGridY+1)
	pixels := make([]struct{ Px, Py int }, 0, cfg.RayGridX*cfg.RayGridY)
	for iy := 0; iy < cfg.RayGridY; iy++ {
		py := int(stepY * float64(iy+1))
		if py >= cfg.DetPixelsY {
			py = cfg.DetPixelsY - 1
		}
		for ix := 0; ix < cfg.RayGridX; ix++ {
			px := int(stepX * float64(ix+1))
			if px >= cfg.DetPixelsX {
				px = cfg.DetPixelsX - 1
			}
			pixels = append(pixels, struct{ Px, Py int }{px, py})
		}
	}
	return RayGrid{Pixels: pixels, NumRays: len(pixels)}
}
```

3. Update `ComputeTransmissionLengths` to accept a `RayGrid` parameter instead of computing it internally. Remove the grid computation code from inside the function.

4. Update all callers of `ComputeTransmissionLengths`:
   - `internal/search/search.go` — `evaluateOrientations` calls it; pre-compute grid before the loop.
   - `internal/search/search.go` — `EvaluateSingle` calls it; pre-compute grid before calling.
   - `internal/raycaster/raycaster.go` — `ComputeFacePenetrations` also needs updating.

5. Update the search package to pre-compute the grid once per config and reuse it across orientations.

In `internal/search/search.go`, modify `evaluateOrientations` to accept a `RayGrid`:

```go
func evaluateOrientations(bvhTree *bvh.BVH,
	orientations []Orient,
	cfg raycaster.ScannerConfig,
	grid raycaster.RayGrid,
	weights [3]float64, method string,
	onProgress ProgressFn, baseIdx, total int) []OrientationScore {
    // ...
    result := raycaster.ComputeTransmissionLengths(o.Theta, o.Phi, bvhTree, cfg, grid)
    // ...
}
```

And update `Run` to compute the grid once:

```go
grid := raycaster.ComputeRayGrid(cfg)
// ... pass to evaluateOrientations calls
```

### Verification

```bash
cd /home/mainuser/Desktop/penopt && go build ./...
go test ./internal/...
```

### Commit

```bash
git commit -am "step 3: pre-compute ray grid, pass as parameter instead of recomputing per orientation"
```

---

## Step 4: Extract Shared Vector Math Module (#1)

### Problem

`dot`, `cross`, `sub`, `add`, `mul`, `normalize` are duplicated across `internal/bvh/bvh.go` and `internal/raycaster/raycaster.go`. This is the highest-leverage refactor.

### Changes

**4.1** Create `/home/mainuser/Desktop/penopt/internal/vec/vec.go`:

```go
// Package vec provides 3D vector math operations for geometry computations.
package vec

import (
	"math"
	"penopt/internal/mesh"
)

// Epsilon for floating-point comparisons.
const Epsilon = 1e-8

// Dot returns the dot product of two vectors.
func Dot(a, b mesh.Vec3) float64 {
	return a.X*b.X + a.Y*b.Y + a.Z*b.Z
}

// Cross returns the cross product a × b.
func Cross(a, b mesh.Vec3) mesh.Vec3 {
	return mesh.Vec3{
		X: a.Y*b.Z - a.Z*b.Y,
		Y: a.Z*b.X - a.X*b.Z,
		Z: a.X*b.Y - a.Y*b.X,
	}
}

// Sub returns a - b.
func Sub(a, b mesh.Vec3) mesh.Vec3 {
	return mesh.Vec3{X: a.X - b.X, Y: a.Y - b.Y, Z: a.Z - b.Z}
}

// Add returns a + b.
func Add(a, b mesh.Vec3) mesh.Vec3 {
	return mesh.Vec3{X: a.X + b.X, Y: a.Y + b.Y, Z: a.Z + b.Z}
}

// Mul returns v * s (scalar multiplication).
func Mul(v mesh.Vec3, s float64) mesh.Vec3 {
	return mesh.Vec3{X: v.X * s, Y: v.Y * s, Z: v.Z * s}
}

// Normalize returns the unit vector in the direction of v.
func Normalize(v mesh.Vec3) mesh.Vec3 {
	l := math.Sqrt(v.X*v.X + v.Y*v.Y + v.Z*v.Z)
	if l < Epsilon {
		return v
	}
	return mesh.Vec3{X: v.X / l, Y: v.Y / l, Z: v.Z / l}
}

// RotateX returns v rotated around the X axis by angle radians.
func RotateX(v mesh.Vec3, angle float64) mesh.Vec3 {
	c := math.Cos(angle)
	s := math.Sin(angle)
	return mesh.Vec3{
		X: v.X,
		Y: v.Y*c - v.Z*s,
		Z: v.Y*s + v.Z*c,
	}
}

// RotateY returns v rotated around the Y axis by angle radians.
func RotateY(v mesh.Vec3, angle float64) mesh.Vec3 {
	c := math.Cos(angle)
	s := math.Sin(angle)
	return mesh.Vec3{
		X: v.X*c + v.Z*s,
		Y: v.Y,
		Z: -v.X*s + v.Z*c,
	}
}

// Min returns the minimum of two ints.
func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Max returns the maximum of two ints.
func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
```

**4.2** Replace duplicated functions in `internal/bvh/bvh.go`:

- Remove the local `Epsilon` constant (use `vec.Epsilon` or keep a local alias)
- Replace `dot`, `cross`, `sub`, `add`, `mul`, `normalize` function bodies to call `vec.Dot`, `vec.Cross`, etc.
- Or better: remove them entirely and update all call sites to use `vec.Dot(...)` etc.

The functions to replace in `bvh.go`:
- `dot(a, b mesh.Vec3) float64` → `vec.Dot(a, b)`
- `cross(a, b mesh.Vec3) mesh.Vec3` → `vec.Cross(a, b)`
- `sub(a, b mesh.Vec3) mesh.Vec3` → `vec.Sub(a, b)`
- `add(a, b mesh.Vec3) mesh.Vec3` → `vec.Add(a, b)`
- `mul(v mesh.Vec3, s float64) mesh.Vec3` → `vec.Mul(v, s)`
- `normalize(v mesh.Vec3) mesh.Vec3` → `vec.Normalize(v)`

**4.3** Replace duplicated functions in `internal/raycaster/raycaster.go`:

- Remove local `sub` and `normalize` functions
- Replace their usages with `vec.Sub` and `vec.Normalize`

**4.4** Update `internal/mesh/mesh.go` to use `vec.Min`/`vec.Max` or inline helpers.

**4.5** Update `internal/search/intelliscan.go`:
- Replace any inline `mesh.Vec3` operations with `vec` calls where appropriate (optional optimization).

**4.6** Add tests in `/home/mainuser/Desktop/penopt/internal/vec/vec_test.go`:

```go
package vec

import (
	"math"
	"testing"
	"penopt/internal/mesh"
)

func TestDot(t *testing.T) {
	a := mesh.Vec3{1, 0, 0}
	b := mesh.Vec3{0, 1, 0}
	if Dot(a, b) != 0 {
		t.Error("perpendicular vectors should have dot=0")
	}
	if Dot(a, a) != 1 {
		t.Error("unit vector dot itself should be 1")
	}
}

func TestCross(t *testing.T) {
	x := mesh.Vec3{1, 0, 0}
	y := mesh.Vec3{0, 1, 0}
	z := Cross(x, y)
	if math.Abs(z.X) > 1e-10 || math.Abs(z.Y) > 1e-10 || math.Abs(z.Z-1) > 1e-10 {
		t.Errorf("Cross(x,y) = %v, want {0,0,1}", z)
	}
}

func TestNormalize(t *testing.T) {
	v := mesh.Vec3{3, 4, 0}
	n := Normalize(v)
	expected := mesh.Vec3{0.6, 0.8, 0}
	if math.Abs(n.X-expected.X) > 1e-10 || math.Abs(n.Y-expected.Y) > 1e-10 || math.Abs(n.Z) > 1e-10 {
		t.Errorf("Normalize({3,4,0}) = %v, want {0.6, 0.8, 0}", n)
	}
}

func TestRotateX(t *testing.T) {
	v := mesh.Vec3{0, 1, 0}
	r := RotateX(v, math.Pi/2)
	if math.Abs(r.Y) > 1e-10 || math.Abs(r.Z-1) > 1e-10 {
		t.Errorf("RotateX 90° = %v, want {0,0,1}", r)
	}
}

func TestRotateY(t *testing.T) {
	v := mesh.Vec3{1, 0, 0}
	r := RotateY(v, math.Pi/2)
	if math.Abs(r.X) > 1e-10 || math.Abs(r.Z+1) > 1e-10 {
		t.Errorf("RotateY 90° = %v, want {0,0,-1}", r)
	}
}
```

### Verification

```bash
cd /home/mainuser/Desktop/penopt && go build ./...
go test ./internal/...
```

### Commit

```bash
git commit -am "step 4: extract shared vector math into internal/vec package"
```

---

## Step 5: Decouple IntelliScan from search.Run (#2)

### Problem

`search.Run` takes a `*mesh.Mesh` parameter only to optionally compute IntelliScan after the search completes. This creates a dependency that `search/search.go` has on `mesh` just for one optional post-processing step.

### Changes

**5.1** Remove the `mesh *mesh.Mesh` parameter from `Run` in `internal/search/search.go`.

```go
func Run(bvhTree *bvh.BVH, cfg raycaster.ScannerConfig,
	weights [3]float64, method string, onProgress ProgressFn) (*Result, error) {
```

Remove the IntelliScan computation from inside `Run`. Remove the `"penopt/internal/mesh"` import.

**5.2** Update `app.go` to compute IntelliScan separately after calling `Run`:

```go
// In app.go, inside the RunOptimization goroutine:
result, err := search.Run(bvhTree, coarseCfg, req.Weights, req.Method,
    func(idx, total int, theta, phi float64) { ... })

if result != nil && m != nil {
    is := search.ComputeIntelliScanAngles(m, result.BestOrientation.Theta, result.BestOrientation.Phi)
    result.IntelliScan = &is
}
```

**5.3** Remove the `mesh` import from `search/search.go` if it's no longer needed (only `search/intelliscan.go` should import it).

**5.4** Add `"penopt/internal/mesh"` import to `app.go` if it's not already there (it is — `app.go` already imports `"penopt/internal/mesh"`).

**5.5** Update the test file `internal/search/search_test.go` to no longer pass `m` to `Run`:

```go
result, err := Run(bvhTree, cfg, [3]float64{0.4, 0.4, 0.2}, "weighted", nil)
```

Add a separate test for `ComputeIntelliScanAngles` if desired.

### Verification

```bash
cd /home/mainuser/Desktop/penopt && go build ./...
go test ./internal/...
```

### Commit

```bash
git commit -am "step 5: decouple IntelliScan from search.Run, compute separately in app.go"
```

---

## Step 6: Reduce Mutex Contention in ComputeFacePenetrations (#6)

### Problem

Each of 90 goroutines computes local face maxima and merges under a single `sync.Mutex` per-face. For large meshes (100k+ faces), the merge loop runs 100k times under the lock.

### Changes

In `internal/raycaster/raycaster.go`, modify `ComputeFacePenetrations`:

1. Remove the mutex-based merging pattern.
2. Have each goroutine write into a pre-allocated slice of per-goroutine partial results.
3. After all goroutines complete, merge sequentially.

```go
func ComputeFacePenetrations(m *mesh.Mesh, bvhTree *bvh.BVH,
	theta, phi float64, cfg ScannerConfig) []float64 {

	numFaces := m.NumTris
	numProjections := 90
	faceMax := make([]float64, numFaces)

	if numFaces == 0 {
		return faceMax
	}

	thetaRad := theta * math.Pi / 180
	phiRad := phi * math.Pi / 180

	// Pre-compute face centroids
	centroids := make([]mesh.Vec3, numFaces)
	for i, tri := range m.Triangles {
		centroids[i] = mesh.Vec3{
			X: (tri.V0.X + tri.V1.X + tri.V2.X) / 3,
			Y: (tri.V0.Y + tri.V1.Y + tri.V2.Y) / 3,
			Z: (tri.V0.Z + tri.V1.Z + tri.V2.Z) / 3,
		}
	}

	sourcePos := mesh.Vec3{X: -cfg.SOD, Y: 0, Z: 0}

	// Per-goroutine partial results, merged after all complete
	type partial struct {
		index int
		max   []float64
	}
	results := make(chan partial, numProjections)

	var wg sync.WaitGroup
	wg.Add(numProjections)

	for alpha := 0; alpha < numProjections; alpha++ {
		go func(alpha int) {
			defer wg.Done()
			alphaRad := float64(alpha) * 2 * math.Pi / float64(numProjections)

			localSrc := sourcePos
			localSrc = vec.RotateY(localSrc, -alphaRad)
			localSrc = vec.RotateY(localSrc, -phiRad)
			localSrc = vec.RotateX(localSrc, -thetaRad)

			localMax := make([]float64, numFaces)

			for fi := 0; fi < numFaces; fi++ {
				worldCentroid := centroids[fi]
				worldCentroid = vec.RotateX(worldCentroid, thetaRad)
				worldCentroid = vec.RotateY(worldCentroid, phiRad)
				worldCentroid = vec.RotateY(worldCentroid, alphaRad)

				rayDir := vec.Sub(worldCentroid, sourcePos)
				rayDir = vec.Normalize(rayDir)

				localDir := rayDir
				localDir = vec.RotateY(localDir, -alphaRad)
				localDir = vec.RotateY(localDir, -phiRad)
				localDir = vec.RotateX(localDir, -thetaRad)
				localDir = vec.Normalize(localDir)

				hits, _ := bvhTree.IntersectAll(localSrc, localDir)

				var penetration float64
				if len(hits) > 1 {
					sort.Float64s(hits)
					for i := 0; i < len(hits)-1; i += 2 {
						if i+1 < len(hits) {
							seg := hits[i+1] - hits[i]
							if seg > MIN_SEGMENT {
								penetration += seg
							}
						}
					}
				}

				if penetration > localMax[fi] {
					localMax[fi] = penetration
				}
			}

			results <- partial{index: alpha, max: localMax}
		}(alpha)
	}

	wg.Wait()
	close(results)

	// Merge sequentially — no lock contention
	for p := range results {
		for fi, v := range p.max {
			if v > faceMax[fi] {
				faceMax[fi] = v
			}
		}
	}

	return faceMax
}
```

Note: this also replaces the `sub`/`normalize`/`rotateX`/`rotateY` calls with `vec.Sub`/`vec.Normalize`/`vec.RotateX`/`vec.RotateY` (if Step 4 is done first, which it should be).

### Verification

```bash
cd /home/mainuser/Desktop/penopt && go build ./...
go test ./internal/...
```

### Commit

```bash
git commit -am "step 6: reduce mutex contention in ComputeFacePenetrations via channel-based merge"
```

---

## Step 7: Decompose App God Struct (#3)

### Problem

The `App` struct in `app.go` exposes ~20 methods covering mesh loading, optimization, physics, scanners, and more. Its interface is as complex as its implementation.

### Changes

**7.1** Create `/home/mainuser/Desktop/penopt/internal/app/meshloader.go`:

```go
package app

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// MeshLoader handles mesh file loading and BVH building.
type MeshLoader struct {
	mu          sync.Mutex
	CurrentMesh *mesh.Mesh
	CurrentBVH  *bvh.BVH
}

// MeshInfo holds mesh metadata returned to the frontend.
type MeshInfo struct {
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

func NewMeshLoader() *MeshLoader {
	return &MeshLoader{}
}

func (ml *MeshLoader) LoadMesh(name string, data []byte) (*MeshInfo, error) {
	ml.mu.Lock()
	defer ml.mu.Unlock()

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
	return ml.setMesh(m, name), nil
}

func (ml *MeshLoader) PickAndLoad(ctx context.Context) (*MeshInfo, error) {
	path, err := runtime.OpenFileDialog(ctx, runtime.OpenDialogOptions{
		Title: "Select STL or OBJ file",
		Filters: []runtime.FileFilter{
			{DisplayName: "STL/OBJ Files (*.stl, *.obj)", Pattern: "*.stl;*.obj"},
		},
	})
	if err != nil {
		return nil, err
	}
	if path == "" {
		return nil, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("file read error: %w", err)
	}

	_, name := filepath.Split(path)
	return ml.LoadMesh(name, data)
}

func (ml *MeshLoader) setMesh(m *mesh.Mesh, name string) *MeshInfo {
	m.CenterAtOrigin()
	bvhTree := bvh.Build(m)
	ml.CurrentMesh = m
	ml.CurrentBVH = bvhTree
	return meshToInfo(m, name)
}

func (ml *MeshLoader) GetInfo() *MeshInfo {
	ml.mu.Lock()
	defer ml.mu.Unlock()
	if ml.CurrentMesh == nil {
		return nil
	}
	return meshToInfo(ml.CurrentMesh, "")
}

func (ml *MeshLoader) GetVertexBuffer() []float64 {
	ml.mu.Lock()
	defer ml.mu.Unlock()
	if ml.CurrentMesh == nil {
		return nil
	}
	return ml.CurrentMesh.VertexBuffer()
}

// Lock/Unlock for callers that need direct access to the BVH.
func (ml *MeshLoader) Lock()   { ml.mu.Lock() }
func (ml *MeshLoader) Unlock() { ml.mu.Unlock() }

func meshToInfo(m *mesh.Mesh, name string) *MeshInfo {
	wt, be := m.CheckWatertight()
	mc := m.Center()
	me := m.Extent()
	return &MeshInfo{
		Name:          name,
		NumTriangles:  m.NumTris,
		NumVertices:   m.NumVerts,
		IsWatertight:  wt,
		BoundaryEdges: be,
		BoundsMinX: m.Min.X, BoundsMinY: m.Min.Y, BoundsMinZ: m.Min.Z,
		BoundsMaxX: m.Max.X, BoundsMaxY: m.Max.Y, BoundsMaxZ: m.Max.Z,
		CenterX: mc.X, CenterY: mc.Y, CenterZ: mc.Z,
		ExtentX: me.X, ExtentY: me.Y, ExtentZ: me.Z,
	}
}
```

**7.2** Create `/home/mainuser/Desktop/penopt/internal/app/optimizer.go`:

```go
package app

import (
	"context"
	"encoding/json"
	"fmt"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"penopt/internal/raycaster"
	"penopt/internal/search"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Optimizer runs the coarse→fine orientation search.
type Optimizer struct {
	loader   *MeshLoader
}

func NewOptimizer(loader *MeshLoader) *Optimizer {
	return &Optimizer{loader: loader}
}

// RunRequest holds the optimization parameters from the frontend.
type RunRequest struct {
	Weights [3]float64 `json:"weights"`
	Method  string     `json:"method"`
}

// Run starts the search asynchronously, emitting events to ctx.
func (opt *Optimizer) Run(ctx context.Context, req RunRequest) (string, error) {
	opt.loader.Lock()
	bvhTree := opt.loader.CurrentBVH
	m := opt.loader.CurrentMesh
	opt.loader.Unlock()

	if bvhTree == nil {
		return "", fmt.Errorf("no mesh loaded")
	}

	coarseCfg := raycaster.DefaultScannerConfig()
	coarseCfg.RayGridX = 8
	coarseCfg.RayGridY = 8
	coarseCfg.NumProjections = 36

	go func() {
		result, err := search.Run(bvhTree, coarseCfg, req.Weights, req.Method,
			func(idx, total int, theta, phi float64) {
				pct := float64(idx) / float64(total) * 100
				runtime.EventsEmit(ctx, "search:progress", map[string]interface{}{
					"pct": pct, "label": fmt.Sprintf("θ=%.0f° φ=%.0f°", theta, phi),
					"idx": idx, "total": total,
				})
			})

		if result != nil && m != nil {
			is := search.ComputeIntelliScanAngles(m, result.BestOrientation.Theta, result.BestOrientation.Phi)
			result.IntelliScan = &is
		}

		if err != nil || result == nil {
			runtime.EventsEmit(ctx, "search:done", map[string]interface{}{
				"error": fmt.Sprintf("Search failed: %v", err),
			})
			return
		}

		data, err := json.Marshal(result)
		if err != nil {
			runtime.EventsEmit(ctx, "search:done", map[string]interface{}{
				"error": fmt.Sprintf("JSON error: %v", err),
			})
			return
		}

		runtime.EventsEmit(ctx, "search:done", map[string]interface{}{
			"result": string(data),
		})
	}()

	return "started", nil
}

// EvaluateSingle evaluates one orientation (for UI preview).
func (opt *Optimizer) EvaluateSingle(theta, phi float64) (string, error) {
	opt.loader.Lock()
	bvhTree := opt.loader.CurrentBVH
	opt.loader.Unlock()

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
```

**7.3** Create `/home/mainuser/Desktop/penopt/internal/app/physicsapi.go`:

```go
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
```

**7.4** Create `/home/mainuser/Desktop/penopt/internal/app/scannerapi.go`:

```go
package app

import (
	"encoding/json"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
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
	cfg.NumProjections = 90

	faceData := raycaster.ComputeFacePenetrations(m, bvhTree, theta, phi, cfg)
	data, _ := json.Marshal(faceData)
	return string(data)
}

func (sa *ScannerAPI) GetDefaultScannerConfig() raycaster.ScannerConfig {
	return raycaster.DefaultScannerConfig()
}
```

**7.5** Rewrite `app.go` to compose the adapters:

```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"penopt/internal/app"
	"penopt/internal/raycaster"
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

type runRequest struct {
	Weights [3]float64 `json:"weights"`
	Method  string     `json:"method"`
}

func (a *App) RunOptimization(req runRequest) (string, error) {
	return a.Optimizer.Run(a.ctx, app.RunRequest{Weights: req.Weights, Method: req.Method})
}

func (a *App) EvaluateOrientation(theta, phi float64) (string, error) {
	return a.Optimizer.EvaluateSingle(theta, phi)
}

// ── Materials / Filters / Physics ──

func (a *App) GetMaterials() string    { return a.PhysicsAPI.GetMaterials() }
func (a *App) GetFilters() string      { return a.PhysicsAPI.GetFilters() }
func (a *App) CalcBeamParams(energy float64, tPct float64, filterID string, materialID string) string {
	return a.PhysicsAPI.CalcBeamParams(energy, tPct, filterID, materialID)
}
func (a *App) CalcEnergyRecommendation(materialID string, maxPenetrationMM float64, tPct float64) string {
	return a.PhysicsAPI.CalcEnergyRecommendation(materialID, maxPenetrationMM, tPct)
}

// ── Scanner Presets / Heatmap ──

func (a *App) GetScannerPresets() string           { return a.ScannerAPI.GetScannerPresets() }
func (a *App) GetDefaultScannerConfig() raycaster.ScannerConfig { return a.ScannerAPI.GetDefaultScannerConfig() }
func (a *App) ComputeFaceHeatmap(theta, phi float64) string    { return a.ScannerAPI.ComputeFaceHeatmap(theta, phi) }

// ── Events (kept for Wails compatibility) ──
func (a *App) EmitProgress(pct float64, label string) {
	_ = a.ctx; _ = pct; _ = label
}
```

**Important:** Before writing this, verify the exact current `app.go` content to ensure the `runRequest` struct still has the right JSON tag. If the frontend sends different field names, keep them.

### Verification

```bash
cd /home/mainuser/Desktop/penopt && go build ./...
go test ./internal/...
# Also verify Wails build works
wails build -skipbindings 2>&1 || echo "wails build may need frontend deps"
```

If Wails binding generation fails, the method signatures must match exactly what the frontend's `wailsjs/go/main/App.js` expects. Check `frontend/wailsjs/go/main/App.js` to verify method names and parameter types match.

### Commit

```bash
git commit -am "step 7: decompose App god struct into focused internal/app adapters"
```

---

## Step 8: Split Frontend main.js (#4)

### Problem

`frontend/src/main.js` is ~900 lines handling scene setup, mesh rendering, optimization UI, heatmaps, materials, file handling, exports, keyboard shortcuts, local storage, beam visualization, tradeoffs, and IntelliScan rendering — all in one file with a global `S` state object.

### Changes

Split into focused modules. Create the following files in `frontend/src/`:

**8.1** `frontend/src/state.js` — shared state (the `S` object) and reactive helpers:

```js
// State — shared application state
const S = {
  meshLoaded: false, meshInfo: null,
  scene: null, camera: null, renderer: null, controls: null,
  meshObject: null, meshClone: null, beamGroup: null, animFrame: null,
  materialID: 'al', filterID: 'none', energy: 76, tPct: 0.1,
  searching: false, searchCancel: false,
  mats: [], filters: [], presets: [],
  viewMode: '3d', layoutMode: 'default',
  labelsVisible: false, beamVisible: false, compareMode: false,
  result: null, weightPreset: 0, method: 'minimax',
  facePenetrations: null, facePenMin: 0, facePenMax: 0,
};

export { S };
```

**8.2** `frontend/src/scene.js` — Three.js scene, camera, renderer, mesh rendering, heatmap, beam viz:

Move these functions from `main.js`:
- `initScene`, `animate`, `resizeViewport`, `resetCamera`
- `renderMesh`, `applyHeatmap`, `enterCompareMode`, `exitCompareMode`
- `createBeamVisualization`, `destroyBeamVisualization`
- Re-export whatever switchViewMode needs

**8.3** `frontend/src/filehandler.js` — file upload, drag-drop, PickAndLoadMesh wrapper:

Move:
- `handleFile`, `handlePickedMesh`, `removeMesh`
- `setupFileUpload`

**8.4** `frontend/src/optimizer.js` — search lifecycle, progress, results display, IntelliScan rendering:

Move:
- `runOptimization`, `finishSearch`, `cancelSearch`
- `showResults`, `renderIntelliScan`, `loadHeatmap`

**8.5** `frontend/src/materials.js` — material picker, filter picker, beam energy:

Move:
- `renderMatGrid`, `selectMaterial`, `recalcBeam`
- `renderFilters`, `selectFilter`
- `setupSliders`

**8.6** `frontend/src/optimizer.js` should also own:
- `setupTradeoff`, `setupRayGrid`, `setupPlotTabs`

**8.7** Keep in `main.js` only the bootstrap (`init` function) and keyboard shortcuts:

```js
import './style.css';
import { initScene } from './scene.js';
import { setupFileUpload } from './filehandler.js';
import { initMaterials } from './materials.js';
import { initOptimization } from './optimizer.js';
// ... etc

async function init() {
  initScene();
  // ... delegate to setup functions from each module
  setupFileUpload();
  initMaterials();
  // ...
}

document.addEventListener('DOMContentLoaded', init);
```

### Verification

```bash
cd /home/mainuser/Desktop/penopt/frontend && npm run build 2>&1 || echo "check for syntax errors"
```

No tests for the frontend — verify by checking the build succeeds.

### Commit

```bash
git commit -am "step 8: split frontend main.js into focused modules"
```

---

## Phase 9: Final Verification

### 9.1 Run all Go tests

```bash
cd /home/mainuser/Desktop/penopt && go test -v ./internal/... 2>&1
```

All tests must pass.

### 9.2 Build the full application

```bash
cd /home/mainuser/Desktop/penopt && go build ./...
```

### 9.3 Run Wails build (if Wails CLI is available)

```bash
cd /home/mainuser/Desktop/penopt && wails build -skipbindings 2>&1
```

Or at minimum verify the Wails binding generation:

```bash
cd /home/mainuser/Desktop/penopt && wails generate module 2>&1
```

### 9.4 Update README project structure if needed

The project structure changed with new `internal/app/` and `internal/vec/` packages. Update the structure diagram in `README.md` if present.

### 9.5 Record ADRs

If any decision is worth recording (e.g., "App struct decomposed into adapters under internal/app/"), create `docs/adr/0001-internal-app-adapters.md`:

```markdown
# ADR-0001: App struct decomposed into focused adapters

The App god struct was split into four adapters under internal/app/
(MeshLoader, Optimizer, PhysicsAPI, ScannerAPI) to improve testability
and locality. Each adapter has a narrower interface than the original
App struct. App itself becomes a thin composition layer.

Status: accepted
```

---

## Rollback Instructions

If a step fails to build or pass tests:

```bash
# Check what changed
git diff --stat

# Roll back the last commit
git reset --hard HEAD~1

# Fix the issue and try again
```

## Summary

| Step | Change | Risk | Packages Touched |
|------|--------|------|-----------------|
| Phase 0-1 | CONTEXT.md + tests | None | New files |
| 2 | Mutable slices → accessor | Low | search |
| 3 | Pre-compute ray grid | Low | raycaster, search |
| 4 | Shared vector math | Medium | bvh, raycaster, search, mesh |
| 5 | Decouple IntelliScan | Medium | search, app |
| 6 | Mutex contention → channel | Low | raycaster |
| 7 | App god struct decomposition | High | app.go, new internal/app/ |
| 8 | Frontend split | Medium | frontend/src/ |
| Phase 9 | Final verification | — | All |
