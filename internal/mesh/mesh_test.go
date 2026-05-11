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
