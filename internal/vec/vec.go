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
// Deprecated: use the builtin min() since Go 1.21.
func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Max returns the maximum of two ints.
// Deprecated: use the builtin max() since Go 1.21.
func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
