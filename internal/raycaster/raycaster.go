// Package raycaster computes X-ray transmission lengths through a mesh
// using BVH-accelerated ray casting. Implements the Heinzl 2011 / Ito 2020 approach.
package raycaster

import (
	"math"
	"sort"
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

// Vector helpers removed — use vec.Normalize, vec.Sub, vec.RotateX, vec.RotateY from penopt/internal/vec

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

	for alpha := 0; alpha < cfg.NumProjections; alpha++ {
		go func(alpha int) {
			defer wg.Done()
			alphaRad := float64(alpha) * 2 * math.Pi / float64(cfg.NumProjections)

			var maxLen float64
			offset := alpha * raysPerProj

			for ri := 0; ri < raysPerProj; ri++ {
				worldOrigin, worldDir := pixelToRay(grid.Pixels[ri].Px, grid.Pixels[ri].Py, cfg)

				localOrigin := worldOrigin
				localDir := worldDir

				localOrigin = vec.RotateY(localOrigin, -alphaRad)
				localDir = vec.RotateY(localDir, -alphaRad)
				localOrigin = vec.RotateY(localOrigin, -phiRad)
				localDir = vec.RotateY(localDir, -phiRad)
				localOrigin = vec.RotateX(localOrigin, -thetaRad)
				localDir = vec.RotateX(localDir, -thetaRad)
				localDir = vec.Normalize(localDir)

				hits, _ := bvhTree.IntersectAll(localOrigin, localDir)

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

				lengths[offset+ri] = penetration
				if penetration > maxLen {
					maxLen = penetration
				}
			}

			maxPerProjection[alpha] = maxLen
		}(alpha)
	}
	wg.Wait()

	t1 := time.Now()

	return OrientationResult{
		Theta:            theta,
		Phi:              phi,
		NumProjections:   cfg.NumProjections,
		RayGridX:         cfg.RayGridX,
		RayGridY:         cfg.RayGridY,
		Lengths:          lengths,
		MaxPerProjection: maxPerProjection,
		BuildTimeMs:      float64(t1.Sub(t0).Microseconds()) / 1000.0,
	}
}

// ── Per-Face Heatmap ──

// ComputeFacePenetrations computes the maximum X-ray penetration through each
// triangle face at the given orientation (theta, phi). For each of N projection
// angles, casts a ray from the source through each face centroid.
// Returns per-face max penetration values (mm).
func ComputeFacePenetrations(m *mesh.Mesh, bvhTree *bvh.BVH,
	theta, phi float64, cfg ScannerConfig) []float64 {

	numFaces := m.NumTris
	numProjections := 90 // fixed for heatmap quality
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
