// Package search provides Tuy-Smith completeness evaluation
// for the cone-beam artifact objective (Ito et al. 2020 §2.2).
//
// The Tuy-Smith sufficiency condition states that for exact cone-beam
// reconstruction, every plane intersecting the object must also intersect
// the X-ray source trajectory. For a circular scanning trajectory, this
// means each face must have at least one projection angle where the ray
// direction is tangent to the face (d̂(α) · n̂ = 0).
//
// This implementation evaluates the fraction of mesh faces that satisfy
// this condition at a given orientation (θ, φ). Higher is better.
package search

import (
	"math"

	"penopt/internal/mesh"
)

// ComputeTuyCompleteness computes the fraction of mesh faces that satisfy
// the Tuy-Smith condition at orientation (theta, phi). Returns a value in
// [0, 1] where 1.0 means all faces have at least one tangent projection.
//
// For each face normal n̂ rotated by (θ, φ), solves d̂(α) · n̂ = 0 for the
// circular trajectory d̂(α) = (-cos α, 0, sin α). A face is Tuy-complete
// if nx² + nz² > ε (i.e., the normal has a component in the XZ plane,
// meaning α = atan2(nx, nz) exists).
func ComputeTuyCompleteness(m *mesh.Mesh, theta, phi float64) float64 {
	thetaRad := theta * math.Pi / 180
	phiRad := phi * math.Pi / 180

	numFaces := m.NumTris
	if numFaces == 0 {
		return 0
	}

	completeCount := 0

	for _, tri := range m.Triangles {
		// Compute face normal via cross product
		edge1 := mesh.Vec3{X: tri.V1.X - tri.V0.X, Y: tri.V1.Y - tri.V0.Y, Z: tri.V1.Z - tri.V0.Z}
		edge2 := mesh.Vec3{X: tri.V2.X - tri.V0.X, Y: tri.V2.Y - tri.V0.Y, Z: tri.V2.Z - tri.V0.Z}
		nx := edge1.Y*edge2.Z - edge1.Z*edge2.Y
		ny := edge1.Z*edge2.X - edge1.X*edge2.Z
		nz := edge1.X*edge2.Y - edge1.Y*edge2.X

		// Normalize
		area := math.Sqrt(nx*nx + ny*ny + nz*nz)
		if area < 1e-12 {
			continue // degenerate face, skip
		}
		nx /= area
		ny /= area
		nz /= area

		// Rotate normal by (θ, φ) to match orientation.
		// Forward rotation: Ry(φ) · Rx(θ) — matches raycaster.go convention.
		// Step 1: rotate around X by θ (Rx(θ))
		// Step 2: rotate around Y by φ (Ry(φ))
		cosT, sinT := math.Cos(thetaRad), math.Sin(thetaRad)
		cosP, sinP := math.Cos(phiRad), math.Sin(phiRad)

		// Rx(θ): (nx, ny, nz) → (nx, ny·cosθ − nz·sinθ, ny·sinθ + nz·cosθ)
		ry := ny*cosT - nz*sinT
		nz = ny*sinT + nz*cosT
		ny = ry

		// Ry(φ): (nx, ny, nz) → (nx·cosφ + nz·sinφ, ny, −nx·sinφ + nz·cosφ)
		rx := nx*cosP + nz*sinP
		nz = -nx*sinP + nz*cosP
		nx = rx

		// A face is Tuy-complete if it has at least one tangent ray direction.
		// For the circular trajectory d̂(α) = (-cos α, 0, sin α), the equation
		// d̂(α) · n̂ = 0 simplifies to: -nx·cos α + nz·sin α = 0
		// which has solution α = atan2(nx, nz) when nx² + nz² > 0.
		if nx*nx+nz*nz > 1e-8 {
			completeCount++
		}
	}

	return float64(completeCount) / float64(numFaces)
}
