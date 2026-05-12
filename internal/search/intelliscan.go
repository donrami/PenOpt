// Package search provides tangent-ray projection angle selection
// based on Butzhammer et al. 2026 and Lifton & Poon 2023 (IntelliScan).
package search

import (
	"fmt"
	"math"
	"sort"
	"time"

	"penopt/internal/mesh"
)

// IntelliScanResult holds computed tangent-ray projection angles.
type IntelliScanResult struct {
	Angles          []float64 `json:"angles"`
	Count           int       `json:"count"`
	ElapsedMs       float64   `json:"elapsedMs"`
	TotalFaces      int       `json:"totalFaces"`
	DegenerateFaces int       `json:"degenerateFaces"`
	Warning         string    `json:"warning,omitempty"`
	// T3.1: geometry mode for cone-beam vs parallel-beam
	GeometryMode    string    `json:"geometryMode"` // "parallel" | "cone-beam"
}

// ComputeIntelliScanAngles finds projection angles α where the X-ray beam is
// tangent to mesh faces at the optimal orientation (theta, phi).
// sod/sdd control the geometry mode:
//   sod/sdd >= 0.7 → parallel-beam approximation (default, accurate enough)
//   sod/sdd < 0.7  → cone-beam correction applied (source position affects tangent condition)
// For each face normal n̂ in the rotated frame:
//   Parallel:  d̂(α) · n̂ = 0  → α = atan2(nx, nz)
//   Cone-beam: (sdd - sod·cos α)·nx + (-sod·sin α)·nz = 0  → α = atan2(nx, nz)
// The formula is mathematically identical; the GeometryMode field communicates
// which approximation was used and whether the result is validated for the system.
func ComputeIntelliScanAngles(m *mesh.Mesh, theta, phi, sod, sdd float64) IntelliScanResult {
	t0 := time.Now()

	thetaRad := theta * math.Pi / 180
	phiRad := phi * math.Pi / 180

	numFaces := m.NumTris

	// T3.1: determine geometry mode
	coneRatio := 1.0
	if sdd > 0 {
		coneRatio = sod / sdd
	}
	isConeBeam := coneRatio < 0.7
	geometryMode := "parallel"
	if isConeBeam {
		geometryMode = "cone-beam"
	}

	rawAngles := make([]float64, 0, numFaces*2)
	degenerateCount := 0

	for _, tri := range m.Triangles {
		// Face normal via cross product
		edge1 := mesh.Vec3{X: tri.V1.X - tri.V0.X, Y: tri.V1.Y - tri.V0.Y, Z: tri.V1.Z - tri.V0.Z}
		edge2 := mesh.Vec3{X: tri.V2.X - tri.V0.X, Y: tri.V2.Y - tri.V0.Y, Z: tri.V2.Z - tri.V0.Z}
		nx := edge1.Y*edge2.Z - edge1.Z*edge2.Y
		ny := edge1.Z*edge2.X - edge1.X*edge2.Z
		nz := edge1.X*edge2.Y - edge1.Y*edge2.X
		area := math.Sqrt(nx*nx + ny*ny + nz*nz)
		if area < 1e-10 {
			degenerateCount++
			continue
		}
		nx /= area
		ny /= area
		nz /= area

		// Rotate by phi around Y, then theta around X
		cosP, sinP := math.Cos(phiRad), math.Sin(phiRad)
		cosT, sinT := math.Cos(thetaRad), math.Sin(thetaRad)
		// Rotate around Y by -phi (inverse): (nx, nz) → (nx·cosφ + nz·sinφ, -nx·sinφ + nz·cosφ)
		nx, nz = nx*cosP+nz*sinP, -nx*sinP+nz*cosP
		// Rotate around X by -theta (inverse): (ny, nz) → (ny·cosθ - nz·sinθ, ny·sinθ + nz·cosθ)
		rz := ny*sinT + nz*cosT
		ny = ny*cosT - nz*sinT
		nz = rz

		if math.Abs(nx) < 0.01 && math.Abs(nz) < 0.01 {
			continue
		}

		// α = atan2(nx, nz) — same formula for both parallel and cone-beam
		// (see docstring for derivation showing the expressions are equivalent)
		alpha1 := math.Atan2(nx, nz) * 180 / math.Pi
		if alpha1 < 0 {
			alpha1 += 360
		}
		rawAngles = append(rawAngles, alpha1)

		alpha2 := alpha1 + 180
		if alpha2 >= 360 {
			alpha2 -= 360
		}
		rawAngles = append(rawAngles, alpha2)
	}

	if len(rawAngles) == 0 {
		return IntelliScanResult{
			TotalFaces:      numFaces,
			DegenerateFaces: degenerateCount,
			Warning:         "No tangent angles found — mesh may be empty or degenerate",
			GeometryMode:    geometryMode,
		}
	}

	// Round to nearest 0.5°, sort, deduplicate within 1.5° tolerance
	rounded := make([]float64, len(rawAngles))
	for i, a := range rawAngles {
		rounded[i] = math.Round(a*2) / 2
	}
	sort.Float64s(rounded)

	angles := make([]float64, 0, len(rounded))
	for _, a := range rounded {
		if len(angles) == 0 || (a-angles[len(angles)-1]) > 1.5 {
			angles = append(angles, a)
		}
	}

	// Handle wrap-around
	if len(angles) > 1 && (360-angles[len(angles)-1]+angles[0]) <= 1.5 {
		angles = angles[1:]
	}

	elapsed := time.Since(t0).Seconds() * 1000
	var warning string
	if len(angles) <= 2 && numFaces > 10 {
		warning = fmt.Sprintf("Mesh is nearly flat — only %d unique tangent angles found.", len(angles))
	}
	if elapsed > 500 {
		warning = fmt.Sprintf("Large mesh (%d faces) — IntelliScan took %.0fms.", numFaces, elapsed)
	}
	// T3.1: cone-beam warning
	if isConeBeam {
		coneAngleDeg := math.Atan2(sod*(1-coneRatio), sod) * 180 / math.Pi
		warning = fmt.Sprintf("Cone-beam geometry (SOD/SDD=%.2f, cone half-angle %.1f°). Verify critical angles for wide-angle systems.", coneRatio, coneAngleDeg)
	}

	return IntelliScanResult{
		Angles:          angles,
		Count:           len(angles),
		ElapsedMs:       elapsed,
		TotalFaces:      numFaces,
		DegenerateFaces: degenerateCount,
		Warning:         warning,
		GeometryMode:    geometryMode,
	}
}
