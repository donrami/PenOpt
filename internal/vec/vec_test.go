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
