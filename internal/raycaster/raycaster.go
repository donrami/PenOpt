// Package raycaster computes X-ray transmission lengths through a mesh
// using BVH-accelerated ray casting. Implements the Heinzl 2011 / Ito 2020 approach.
package raycaster

import (
	"math"
	"sync"
	"time"

	"penopt/internal/bvh"
	"penopt/internal/mesh"
	"penopt/internal/vec"
)

// ScannerConfig holds CT scanner geometry parameters.
type ScannerConfig struct {
	SDD       float64 // source-to-detector (mm)
	SOD       float64 // source-to-object (mm)
	DetWidth  float64 // detector width (mm)
	DetHeight float64 // detector height (mm)
	DetPixelsX int    // detector pixel columns
	DetPixelsY int    // detector pixel rows
	RayGridX  int     // ray sampling columns (MVP: 16-32)
	RayGridY  int     // ray sampling rows (MVP: 16-32)
	NumProjections int // projection angles per orientation (360)
}

// DefaultScannerConfig returns sensible defaults.
func DefaultScannerConfig() ScannerConfig {
	return ScannerConfig{
		SDD:            1000,
		SOD:            700,
		DetWidth:       400,
		DetHeight:      400,
		DetPixelsX:     1024,
		DetPixelsY:     1024,
		RayGridX:       16,
		RayGridY:       16,
		NumProjections: 180,
	}
}

// OrientationResult holds the ray casting result for one orientation.
type OrientationResult struct {
	Theta             float64
	Phi               float64
	NumProjections    int
	RayGridX, RayGridY int
	Lengths           []float64   // [proj][rayY*rayGridX + rayX]
	MaxPerProjection  []float64   // max transmission per projection angle
	CoverageFraction  float64     // fraction of rays with non-zero penetration
	BuildTimeMs       float64
}

// RayGrid is a pre-computed grid of detector pixel positions.
type RayGrid struct {
	Pixels  []struct{ Px, Py int }
	NumRays int
}

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

// MIN_SEGMENT is the minimum segment length to count (avoids noise from coplanar tris).
const MIN_SEGMENT = 0.01

// pixelToRay computes the ray origin and direction for a given detector pixel.
func pixelToRay(px, py int, cfg ScannerConfig) (origin, dir mesh.Vec3) {
	dy := (float64(py)/float64(cfg.DetPixelsY) - 0.5) * cfg.DetHeight
	dz := (float64(px)/float64(cfg.DetPixelsX) - 0.5) * cfg.DetWidth

	sod := cfg.SOD
	sdd := cfg.SDD

	origin = mesh.Vec3{X: -sod, Y: 0, Z: 0}
	dir = mesh.Vec3{X: sdd - sod, Y: dy, Z: dz}
	dir = vec.Normalize(dir)
	return
}

// ComputeTransmissionLengthsFaceCentroid evaluates penetration using one ray
// per face centroid per projection. Guarantees every face is sampled, at the
// cost of more rays for high-triangle-count meshes.
// Used as a fallback when the regular ray grid would undersample a small part.
func ComputeTransmissionLengthsFaceCentroid(theta, phi float64,
	m *mesh.Mesh, bvhTree *bvh.BVH, cfg ScannerConfig) OrientationResult {
	t0 := time.Now()

	numFaces := m.NumTris
	numProjections := cfg.NumProjections
	totalRays := numProjections * numFaces

	if numFaces == 0 {
		return OrientationResult{
			Theta:            theta,
			Phi:              phi,
			NumProjections:   numProjections,
			Lengths:           nil,
			MaxPerProjection:  make([]float64, numProjections),
			CoverageFraction:  0,
			BuildTimeMs:       0,
		}
	}

	lengths := make([]float64, totalRays)
	maxPerProjection := make([]float64, numProjections)

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

	// Source position in world space
	sourcePos := mesh.Vec3{X: -cfg.SOD, Y: 0, Z: 0}

	var wg sync.WaitGroup
	wg.Add(numProjections)

	// Pre-compute orientation rotation trig
	cosP, sinP := math.Cos(-phiRad), math.Sin(-phiRad)
	cosT, sinT := math.Cos(-thetaRad), math.Sin(-thetaRad)
	cosPf, sinPf := math.Cos(phiRad), math.Sin(phiRad)
	cosTf, sinTf := math.Cos(thetaRad), math.Sin(thetaRad)

	for alpha := 0; alpha < numProjections; alpha++ {
		go func(alpha int) {
			defer wg.Done()
			alphaRad := float64(alpha) * 2 * math.Pi / float64(numProjections)
			cosA, sinA := math.Cos(-alphaRad), math.Sin(-alphaRad)
			cosAf, sinAf := math.Cos(alphaRad), math.Sin(alphaRad)

			// Rotate source position by inverse rotation (inline)
			localSrc := sourcePos
			// RotateY by -alphaRad (inverse)
			ox, oz := localSrc.X, localSrc.Z
			localSrc.X = ox*cosA + oz*sinA
			localSrc.Z = -ox*sinA + oz*cosA
			// RotateY by -phiRad (inverse)
			ox, oz = localSrc.X, localSrc.Z
			localSrc.X = ox*cosP + oz*sinP
			localSrc.Z = -ox*sinP + oz*cosP
			// RotateX by -thetaRad (inverse)
			oy, oz := localSrc.Y, localSrc.Z
			localSrc.Y = oy*cosT - oz*sinT
			localSrc.Z = oy*sinT + oz*cosT

			var maxLen float64
			offset := alpha * numFaces

			for fi := 0; fi < numFaces; fi++ {
				// Rotate centroid by forward orientation + projection
				wc := centroids[fi]
				// RotateX by thetaRad (forward)
				oy, oz := wc.Y, wc.Z
				wc.Y = oy*cosTf - oz*sinTf
				wc.Z = oy*sinTf + oz*cosTf
				// RotateY by phiRad (forward)
				ox, oz := wc.X, wc.Z
				wc.X = ox*cosPf + oz*sinPf
				wc.Z = -ox*sinPf + oz*cosPf
				// RotateY by alphaRad (forward)
				ox, oz = wc.X, wc.Z
				wc.X = ox*cosAf + oz*sinAf
				wc.Z = -ox*sinAf + oz*cosAf

				// Ray from source through centroid
				rayDir := vec.Sub(wc, sourcePos)
				rayDir = vec.Normalize(rayDir)

				// Inverse rotation preserves length, no second Normalize needed
				localDir := rayDir
				// RotateY by -alphaRad (inverse)
				dx, dz := localDir.X, localDir.Z
				localDir.X = dx*cosA + dz*sinA
				localDir.Z = -dx*sinA + dz*cosA
				// RotateY by -phiRad (inverse)
				dx, dz = localDir.X, localDir.Z
				localDir.X = dx*cosP + dz*sinP
				localDir.Z = -dx*sinP + dz*cosP
				// RotateX by -thetaRad (inverse)
				dy, dz := localDir.Y, localDir.Z
				localDir.Y = dy*cosT - dz*sinT
				localDir.Z = dy*sinT + dz*cosT

				hits, _ := bvhTree.IntersectAll(localSrc, localDir)

				var penetration float64
				if len(hits) > 1 {
					for i := 0; i < len(hits)-1; i += 2 {
						if i+1 < len(hits) {
							seg := hits[i+1] - hits[i]
							if seg > MIN_SEGMENT {
								penetration += seg
							}
						}
					}
				}

				lengths[offset+fi] = penetration
				if penetration > maxLen {
					maxLen = penetration
				}
			}

			maxPerProjection[alpha] = maxLen
		}(alpha)
	}
	wg.Wait()

	// Coverage fraction
	nonZero := 0
	for _, l := range lengths {
		if l > MIN_SEGMENT {
			nonZero++
		}
	}
	coverageFraction := float64(nonZero) / float64(totalRays)

	t1 := time.Now()

	return OrientationResult{
		Theta:            theta,
		Phi:              phi,
		NumProjections:   numProjections,
		Lengths:           lengths,
		MaxPerProjection:  maxPerProjection,
		CoverageFraction:  coverageFraction,
		BuildTimeMs:       float64(t1.Sub(t0).Microseconds()) / 1000.0,
	}
}

// ComputeTransmissionLengths computes X-ray transmission lengths for one orientation.
// This is the core computation: project rays through the mesh at N projection angles,
// measuring the total path length through solid material for each ray.
func ComputeTransmissionLengths(theta, phi float64, bvhTree *bvh.BVH, cfg ScannerConfig, grid RayGrid) OrientationResult {
	t0 := time.Now()

	thetaRad := theta * math.Pi / 180
	phiRad := phi * math.Pi / 180

	raysPerProj := grid.NumRays

	// Pre-compute the orientation rotation (applied to the geometry, i.e., to each ray)
	// We rotate the mesh by (theta, phi) and then each projection by alpha.
	// Equivalent: for each ray, apply R_total^{-1} = R_orient^{-1} * R_alpha^{-1}
	// Since rotation is orthogonal, inverse = transpose.
	// We apply R_orient * R_alpha to the mesh, which is same as applying R_total^{-1} to rays.

	// Actually simpler: for each projection angle alpha:
	//   localRay = R_total^(-1) * worldRay
	// where R_total = R_alpha * R_orient

	totalRays := cfg.NumProjections * raysPerProj
	lengths := make([]float64, totalRays)
	maxPerProjection := make([]float64, cfg.NumProjections)

	var wg sync.WaitGroup
	wg.Add(cfg.NumProjections)

	// Pre-compute orientation rotation trig (constant for all rays in this orientation)
	cosP, sinP := math.Cos(-phiRad), math.Sin(-phiRad)
	cosT, sinT := math.Cos(-thetaRad), math.Sin(-thetaRad)

	for alpha := 0; alpha < cfg.NumProjections; alpha++ {
		go func(alpha int) {
			defer wg.Done()
			alphaRad := float64(alpha) * 2 * math.Pi / float64(cfg.NumProjections)

			// Pre-compute projection rotation trig (constant for all rays in this projection)
			cosA, sinA := math.Cos(-alphaRad), math.Sin(-alphaRad)

			var maxLen float64
			offset := alpha * raysPerProj

			for ri := 0; ri < raysPerProj; ri++ {
				worldOrigin, worldDir := pixelToRay(grid.Pixels[ri].Px, grid.Pixels[ri].Py, cfg)

				localOrigin := worldOrigin
				localDir := worldDir

				// RotateY by -alphaRad (inline — avoid vec.RotateY which recomputes trig)
				ox, oz := localOrigin.X, localOrigin.Z
				localOrigin.X = ox*cosA + oz*sinA
				localOrigin.Z = -ox*sinA + oz*cosA
				dx, dz := localDir.X, localDir.Z
				localDir.X = dx*cosA + dz*sinA
				localDir.Z = -dx*sinA + dz*cosA

				// RotateY by -phiRad (inline)
				ox, oz = localOrigin.X, localOrigin.Z
				localOrigin.X = ox*cosP + oz*sinP
				localOrigin.Z = -ox*sinP + oz*cosP
				dx, dz = localDir.X, localDir.Z
				localDir.X = dx*cosP + dz*sinP
				localDir.Z = -dx*sinP + dz*cosP

				// RotateX by -thetaRad (inline)
				oy, oz := localOrigin.Y, localOrigin.Z
				localOrigin.Y = oy*cosT - oz*sinT
				localOrigin.Z = oy*sinT + oz*cosT
				dy, dz := localDir.Y, localDir.Z
				localDir.Y = dy*cosT - dz*sinT
				localDir.Z = dy*sinT + dz*cosT

				// Direction is still unit length after orthogonal rotations — no Normalize needed

				hits, _ := bvhTree.IntersectAll(localOrigin, localDir)

				var penetration float64
				if len(hits) > 1 {
					// hits are sorted by IntersectAll
					for i := 0; i < len(hits)-1; i += 2 {
						if i+1 < len(hits) {
							seg := hits[i+1] - hits[i]
							if seg > MIN_SEGMENT {
								penetration += seg
							}
						}
					}
				}

				lengths[offset+ri] = penetration
				if penetration > maxLen {
					maxLen = penetration
				}
			}

			maxPerProjection[alpha] = maxLen
		}(alpha)
	}
	wg.Wait()

	// Compute coverage fraction: non-zero rays / total rays
	nonZero := 0
	for _, l := range lengths {
		if l > MIN_SEGMENT {
			nonZero++
		}
	}
	coverageFraction := float64(nonZero) / float64(totalRays)

	t1 := time.Now()

	return OrientationResult{
		Theta:            theta,
		Phi:              phi,
		NumProjections:   cfg.NumProjections,
		RayGridX:         cfg.RayGridX,
		RayGridY:         cfg.RayGridY,
		Lengths:           lengths,
		MaxPerProjection:  maxPerProjection,
		CoverageFraction:  coverageFraction,
		BuildTimeMs:       float64(t1.Sub(t0).Microseconds()) / 1000.0,
	}
}

// ── Per-Face Heatmap ──

// ComputeFacePenetrations computes the maximum X-ray penetration through each
// triangle face at the given orientation (theta, phi). When cfg.RayGridX > 0,
// uses grid-based sampling (fast, matches the search resolution). Otherwise
// casts one ray per face centroid per projection (comprehensive but slower).
// Returns per-face max penetration values (mm).
func ComputeFacePenetrations(m *mesh.Mesh, bvhTree *bvh.BVH,
	theta, phi float64, cfg ScannerConfig) []float64 {

	numFaces := m.NumTris
	if numFaces == 0 {
		return make([]float64, 0)
	}

	// Grid-based heatmap: use the same ray grid as the search (fast path)
	if cfg.RayGridX > 0 && cfg.RayGridY > 0 {
		return computeFacePenetrationsGrid(m, bvhTree, theta, phi, cfg)
	}

	// Face-centroid fallback: comprehensive but slower
	// Scale projection count based on mesh size
	numProjections := 90
	if numFaces > 100000 {
		numProjections = 36
	} else if numFaces > 50000 {
		numProjections = 54
	}
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

	// Source position in world space
	sourcePos := mesh.Vec3{X: -cfg.SOD, Y: 0, Z: 0}

	// Per-goroutine partial results, merged after all complete
	type partial struct {
		index int
		max   []float64
	}
	results := make(chan partial, numProjections)

	var wg sync.WaitGroup
	wg.Add(numProjections)

	// Pre-compute orientation rotation trig (constant for all projections)
	cosP, sinP := math.Cos(-phiRad), math.Sin(-phiRad)
	cosT, sinT := math.Cos(-thetaRad), math.Sin(-thetaRad)
	// Forward trig for centroid rotations
	cosPf, sinPf := math.Cos(phiRad), math.Sin(phiRad)
	cosTf, sinTf := math.Cos(thetaRad), math.Sin(thetaRad)

	for alpha := 0; alpha < numProjections; alpha++ {
		go func(alpha int) {
			defer wg.Done()
			alphaRad := float64(alpha) * 2 * math.Pi / float64(numProjections)

			// Pre-compute projection rotation trig
			cosA, sinA := math.Cos(-alphaRad), math.Sin(-alphaRad)
			cosAf, sinAf := math.Cos(alphaRad), math.Sin(alphaRad)

			// Rotate source position by inverse rotation (inline)
			localSrc := sourcePos
			ox, oz := localSrc.X, localSrc.Z
			localSrc.X = ox*cosA + oz*sinA
			localSrc.Z = -ox*sinA + oz*cosA
			ox, oz = localSrc.X, localSrc.Z
			localSrc.X = ox*cosP + oz*sinP
			localSrc.Z = -ox*sinP + oz*cosP
			oy, oz := localSrc.Y, localSrc.Z
			localSrc.Y = oy*cosT - oz*sinT
			localSrc.Z = oy*sinT + oz*cosT

			localMax := make([]float64, numFaces)

			for fi := 0; fi < numFaces; fi++ {
				// Rotate centroid by forward orientation + projection (inline)
				wc := centroids[fi]
				// RotateX by thetaRad (forward)
				oy, oz := wc.Y, wc.Z
				wc.Y = oy*cosTf - oz*sinTf
				wc.Z = oy*sinTf + oz*cosTf
				// RotateY by phiRad (forward)
				ox, oz := wc.X, wc.Z
				wc.X = ox*cosPf + oz*sinPf
				wc.Z = -ox*sinPf + oz*cosPf
				// RotateY by alphaRad (forward)
				ox, oz = wc.X, wc.Z
				wc.X = ox*cosAf + oz*sinAf
				wc.Z = -ox*sinAf + oz*cosAf

				rayDir := vec.Sub(wc, sourcePos)
				rayDir = vec.Normalize(rayDir)

				// Ray direction is unit length after first Normalize
				// Inverse rotation preserves length, so second Normalize is redundant
				localDir := rayDir
				// RotateY by -alphaRad (inverse)
				dx, dz := localDir.X, localDir.Z
				localDir.X = dx*cosA + dz*sinA
				localDir.Z = -dx*sinA + dz*cosA
				// RotateY by -phiRad (inverse)
				dx, dz = localDir.X, localDir.Z
				localDir.X = dx*cosP + dz*sinP
				localDir.Z = -dx*sinP + dz*cosP
				// RotateX by -thetaRad (inverse)
				dy, dz := localDir.Y, localDir.Z
				localDir.Y = dy*cosT - dz*sinT
				localDir.Z = dy*sinT + dz*cosT

				hits, _ := bvhTree.IntersectAll(localSrc, localDir)

				var penetration float64
				if len(hits) > 1 {
					// hits are sorted by IntersectAll
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

// computeFacePenetrationsGrid computes per-face max penetration using grid-based ray sampling.
// It casts rays through the ray grid defined in cfg (same as the search pipeline)
// and records the max penetration for each face that is intersected by any ray.
// Faces that are never hit get 0 penetration — the frontend will interpolate
// vertex colors across unsampled faces for a smooth display.
func computeFacePenetrationsGrid(m *mesh.Mesh, bvhTree *bvh.BVH,
	theta, phi float64, cfg ScannerConfig) []float64 {

	numFaces := m.NumTris
	faceMax := make([]float64, numFaces)
	grid := ComputeRayGrid(cfg)
	thetaRad := theta * math.Pi / 180
	phiRad := phi * math.Pi / 180

	cosP, sinP := math.Cos(-phiRad), math.Sin(-phiRad)
	cosT, sinT := math.Cos(-thetaRad), math.Sin(-thetaRad)

	type partial struct {
		index int
		max   []float64
	}
	results := make(chan partial, cfg.NumProjections)
	var wg sync.WaitGroup
	wg.Add(cfg.NumProjections)

	for alpha := 0; alpha < cfg.NumProjections; alpha++ {
		go func(alpha int) {
			defer wg.Done()
			alphaRad := float64(alpha) * 2 * math.Pi / float64(cfg.NumProjections)
			cosA, sinA := math.Cos(-alphaRad), math.Sin(-alphaRad)

			localMax := make([]float64, numFaces)

			for ri := 0; ri < grid.NumRays; ri++ {
				worldOrigin, worldDir := pixelToRay(grid.Pixels[ri].Px, grid.Pixels[ri].Py, cfg)
				localOrigin, localDir := worldOrigin, worldDir

				// RotateY by -alphaRad
				ox, oz := localOrigin.X, localOrigin.Z
				localOrigin.X = ox*cosA + oz*sinA
				localOrigin.Z = -ox*sinA + oz*cosA
				dx, dz := localDir.X, localDir.Z
				localDir.X = dx*cosA + dz*sinA
				localDir.Z = -dx*sinA + dz*cosA

				// RotateY by -phiRad
				ox, oz = localOrigin.X, localOrigin.Z
				localOrigin.X = ox*cosP + oz*sinP
				localOrigin.Z = -ox*sinP + oz*cosP
				dx, dz = localDir.X, localDir.Z
				localDir.X = dx*cosP + dz*sinP
				localDir.Z = -dx*sinP + dz*cosP

				// RotateX by -thetaRad
				oy, oz := localOrigin.Y, localOrigin.Z
				localOrigin.Y = oy*cosT - oz*sinT
				localOrigin.Z = oy*sinT + oz*cosT
				dy, dz := localDir.Y, localDir.Z
				localDir.Y = dy*cosT - dz*sinT
				localDir.Z = dy*sinT + dz*cosT

				hits, triIndices := bvhTree.IntersectAll(localOrigin, localDir)
				if len(hits) < 2 {
					continue
				}
				// Accumulate penetration per intersected triangle
				for i := 0; i < len(hits)-1; i += 2 {
					if i+1 >= len(hits) {
						break
					}
					seg := hits[i+1] - hits[i]
					if seg > MIN_SEGMENT {
						ti := triIndices[i]
						if seg > localMax[ti] {
							localMax[ti] = seg
						}
					}
				}
			}
			results <- partial{index: alpha, max: localMax}
		}(alpha)
	}

	wg.Wait()
	close(results)

	for p := range results {
		for fi, v := range p.max {
			if v > faceMax[fi] {
				faceMax[fi] = v
			}
		}
	}

	return faceMax
}
