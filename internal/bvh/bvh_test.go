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
	hit, tVal, idx := bvhTree.Intersect(mesh.Vec3{0, 0, 0}, mesh.Vec3{0, 0, 1})
	if !hit {
		t.Fatal("expected hit")
	}
	if math.Abs(tVal-100) > 1e-6 {
		t.Errorf("expected t=100, got %f", tVal)
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
