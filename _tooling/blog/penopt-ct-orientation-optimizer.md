---
title: "PenOpt: Finding the Optimal CT Scan Orientation with BVH-Accelerated Ray Casting"
date: 2026-05-13
slug: penopt-ct-orientation-optimizer
excerpt: "Five years working in volume graphics taught me one thing: the hardest part of industrial CT scanning isn't the reconstruction — it's deciding where to put the part."
---

Five years working in volume graphics taught me one thing: the hardest part of industrial CT scanning isn't the reconstruction — it's deciding where to put the part. You load a manufactured part into the scanner, and every orientation produces a different quality of result. Point a scan trajectory through a long cross-section and you need higher X-ray energy, which means more beam hardening, more scatter, and poorer image quality. Point it through a thin section and you might miss a critical feature entirely. What looks like a routine inspection problem is, at its core, a ray casting optimization problem.

PenOpt is a desktop application that solves this. Load a 3D mesh, configure your scanner geometry, and it searches across hundreds of orientations to find the one that minimizes penetration, energy requirements, and reconstruction artifacts. The code is open source, written in Go with a Wails desktop shell and a Three.js frontend.

## The Architecture

PenOpt's pipeline has four stages: mesh loading and BVH construction, ray casting at each orientation, objective function evaluation, and the coarse-to-fine search that ties everything together.

### Mesh Loading and BVH Construction

When you load an STL or OBJ file, the mesh is parsed into a flat list of triangles and centered at the origin — the ray caster and the Three.js viewer both assume the mesh sits at the origin. The mesh struct is straightforward:

```go
type Mesh struct {
    Triangles  []Triangle
    NumVerts   int
    NumTris    int
    Min, Max   Vec3
}
```

From this triangle soup, PenOpt builds a bounding volume hierarchy. The BVH implementation uses a median-split strategy along the longest axis of the bounding box, which is simpler than a surface area heuristic but adequate for the ray counts we need. Each node stores an axis-aligned bounding box; leaf nodes contain up to eight triangles.

```go
func (bvh *BVH) buildRange(start, end int) *Node {
    node := &Node{
        TriStart: start,
        TriEnd:   end,
    }
    node.Bounds = computeBounds(bvh.Triangles[start:end])

    count := end - start
    if count <= LeafSize {
        return node
    }

    extent := vec.Sub(node.Bounds.Max, node.Bounds.Min)
    axis := 0
    if extent.Y >= extent.X && extent.Y >= extent.Z {
        axis = 1
    } else if extent.Z >= extent.X && extent.Z >= extent.Y {
        axis = 2
    }

    centroids := computeCentroids(bvh.Triangles[start:end], axis)
    sort.Slice(bvh.Triangles[start:end], ...)
    mid := start + count/2

    node.Left = bvh.buildRange(start, mid)
    node.Right = bvh.buildRange(mid, end)
    return node
}
```

The reason for the BVH is straightforward: casting rays through raw triangles would be O(n) per ray. With a BVH, each ray traversal is O(log n), and we cast tens of thousands of rays per orientation. The difference is the difference between waiting ten seconds and waiting ten minutes.

### Ray Casting at Scale

At each orientation defined by a tilt angle θ and a rotation angle φ, PenOpt simulates X-ray projections at N angles around the part (180 by default). For each projection, it fires a grid of rays from the source position through the detector plane and into the BVH. The rays use the Möller-Trumbore algorithm for triangle intersection — the gold standard for in-memory ray tracing because it requires no additional storage beyond the triangle vertices.

Each ray accumulates its penetration path length: the total distance it travels through solid material. This is the primary quantity driving every objective function.

```go
func ComputeTransmissionLengths(theta, phi float64, bvhTree *bvh.BVH,
    cfg ScannerConfig, grid RayGrid) OrientationResult {

    totalRays := cfg.NumProjections * grid.NumRays
    lengths := make([]float64, totalRays)
    maxPerProjection := make([]float64, cfg.NumProjections)

    var wg sync.WaitGroup
    wg.Add(cfg.NumProjections)

    cosP, sinP := math.Cos(-phiRad), math.Sin(-phiRad)
    cosT, sinT := math.Cos(-thetaRad), math.Sin(-thetaRad)

    for alpha := 0; alpha < cfg.NumProjections; alpha++ {
        go func(alpha int) {
            defer wg.Done()
            alphaRad := float64(alpha) * 2 * math.Pi / float64(cfg.NumProjections)
            cosA, sinA := math.Cos(-alphaRad), math.Sin(-alphaRad)

            for ri := 0; ri < grid.NumRays; ri++ {
                worldOrigin, worldDir := pixelToRay(grid.Pixels[ri].Px, grid.Pixels[ri].Py, cfg)

                // Rotate into mesh-local space by composing the inverse of
                // (projection rotation × orientation rotation)
                localOrigin := rotateY(worldOrigin, cosA, sinA)
                localOrigin = rotateY(localOrigin, cosP, sinP)
                localOrigin = rotateX(localOrigin, cosT, sinT)

                hits, _ := bvhTree.IntersectAll(localOrigin, localDir)

                penetration := accumulateSegments(hits)
                lengths[offset+ri] = penetration
            }
        }(alpha)
    }
    wg.Wait()
    return OrientationResult{...}
}
```

The parallelization is per-projection: each of the 180 goroutines computes rays for one projection angle. Since BVH traversal is read-only and the mesh data is immutable during a search, there is no lock contention. The rotation matrices for θ, φ, and each α are pre-computed outside the inner loop, with the matrix entries expanded inline to avoid function call overhead. Since orthogonal rotations preserve vector length, the ray direction remains unit-length after transformation — one normalization step is skipped per ray.

### The Objectives

PenOpt implements three objective functions from Ito et al. 2020, plus a Tuy-Smith completeness metric. Each measures a different aspect of scan quality.

The generalized mean penetration f_mtl takes the cube-root mean of all ray lengths. Raising each length to the third power penalizes long paths disproportionately, so the optimizer naturally avoids orientations that produce a few very thick cross-sections even if most of the part is thin.

The maximum penetration f_energy is simpler: it returns the single longest path through the mesh. This determines the required X-ray tube voltage. An orientation that needs 200 kV costs more in equipment and produces more scatter than one that needs 120 kV.

The penetration range f_hdn captures a subtler effect: the variation in maximum penetration across projection angles. If one projection sees a thick cross-section while another sees only thin material, the reconstructed slice will have non-uniform contrast. The range of per-projection maxima is a fast geometric proxy for this.

The Tuy-Smith completeness metric evaluates how many mesh faces satisfy the condition for exact cone-beam reconstruction: each face must have at least one projection angle where the X-ray beam is tangent to the face. Faces that never see a tangent direction produce reconstruction artifacts. The metric returns the fraction of faces that are Tuy-complete, inverted so that lower is better for the optimizer.

```go
func ComputeTuyCompleteness(m *Mesh, theta, phi float64) float64 {
    completeCount := 0
    for _, tri := range m.Triangles {
        n := faceNormal(tri)
        // Rotate normal by (theta, phi)
        n = rotateX(n, thetaRad)
        n = rotateY(n, phiRad)
        // Tuy-Smith condition for circular trajectory:
        // A face is complete if its normal has a component in the XZ plane
        // (the plane of the source trajectory)
        if n.X*n.X + n.Z*n.Z > 1e-8 {
            completeCount++
        }
    }
    return float64(completeCount) / float64(m.NumTris)
}
```

These four raw values are min-max normalized across all evaluated orientations and combined into a single scalar via a weighted sum (or a minimax formulation). The user can adjust the weights to prioritize penetration, energy, or artifact reduction depending on their inspection goals.

### The Search Strategy

A brute-force search over θ ∈ [-45°, 45°] and φ ∈ [-45°, 45°] at 1° resolution would evaluate 8,281 orientations. At roughly 50 ms per orientation (for a modest mesh), that takes nearly seven minutes. PenOpt uses a coarse-to-fine strategy instead.

The coarse phase evaluates a 15° grid: 7 × 7 = 49 orientations. Each uses a sparse ray grid and 36 projections — enough to separate good orientations from bad ones. The top three candidates, measured by their combined score, advance to the fine phase. For each candidate, the fine phase evaluates a 11 × 11 neighborhood at 1° resolution centered on the candidate, doubling the ray grid density to 16 × 16 and using 90 projections for accuracy. Overlapping points with the coarse grid are skipped.

```go
topCandidates := topN(provisionals, 3)

fineSet := make(map[[2]float64]bool)
for _, cand := range topCandidates {
    for dt := -5.0; dt <= 5; dt++ {
        for dp := -5.0; dp <= 5; dp++ {
            key := [2]float64{round(cand.Theta + dt), round(cand.Phi + dp)}
            fineSet[key] = true
        }
    }
}
```

This evaluates roughly 49 + 3 × (121 − 1) ≈ 400 orientations total, reducing the search time from seven minutes to under thirty seconds for most meshes.

PenOpt also detects constrained optima. If the best orientation lies within 5° of the search boundary, it warns the user that the true optimum may lie outside the ±45° range. It also checks whether the coarse-phase ranking of the winner differed significantly from the fine-phase re-evaluation — a mismatch suggests the ray resolution changed the score enough to potentially miss the true best orientation.

### IntelliScan: Smarter Projection Scheduling

Once the optimal orientation is found, PenOpt generates an IntelliScan projection schedule. The insight from Butzhammer 2026 and Lifton & Poon 2023 is that most projection angles add no information — only the angles where the X-ray beam is tangent to a mesh face contribute to the reconstruction. For each mesh face, the tangent condition reduces to α = atan2(n_x, n_z) where n̂ is the face normal in the rotated coordinate frame. The result is a minimal set of 20-50 projection angles instead of the standard 360, cutting scan time by an order of magnitude.

```go
for _, tri := range m.Triangles {
    n := faceNormal(tri)
    n = rotate(phi, theta, n)
    if math.Abs(n.X) < 0.01 && math.Abs(n.Z) < 0.01 {
        continue  // face normal points along Y — no tangent solution
    }
    alpha1 := math.Atan2(n.X, n.Z) * 180 / math.Pi
    rawAngles = append(rawAngles, alpha1, alpha1 + 180)
}
```

PenOpt handles both parallel-beam and cone-beam geometry. The formula is the same in both cases — a consequence of how the source position scales out of the tangent condition — but the geometry mode is tracked separately so operators know which approximation their system maps to.

### NIST XCOM Energy Recommendation

The final piece is the energy recommendation. Given the maximum penetration path found at the optimal orientation, PenOpt looks up the material's mass attenuation coefficient from NIST XCOM data (40+ materials built into the application), applies the Beer-Lambert law with a configurable transmission target (typically 5-10%), and computes the required X-ray tube voltage. It accounts for beam pre-filters (copper, zinc, and their combinations) which harden the beam and reduce beam hardening artifacts at the cost of flux.

### The Tech Stack

PenOpt is built with Go for the backend and Wails v2 for the desktop shell. Wails provides a native window with a webview running the frontend — lighter than Electron, closer to the metal than Tauri's Rust. The frontend is Three.js for 3D mesh visualization, a custom canvas heatmap overlay for per-face penetration visualization, and Plotly.js for the search result charts.

The decision to use Go was deliberate. Go's goroutine model maps directly to the per-projection parallelism in the ray caster, and its compiled performance means the inner loops run at hardware speed without a JIT warmup phase. The BVH traversal, the Möller-Trumbore intersections, and the rotation matrices are all in pure Go with no CGo or assembly — the compiler produces fast code on its own.

## What's Next

The current implementation handles three objective functions, but the framework is designed for five. Beam hardening (f_bh) and cone-beam artifact (f_tuy) metrics are wired in at the scoring level but need deeper per-projection data collection to produce meaningful values. A forthcoming update traces the full polyenergetic spectrum through each ray path and computes the beam hardening coefficient as the variance of effective energy across the detector.

There is also room to replace the median-split BVH with a surface area heuristic builder. For meshes with highly non-uniform triangle distributions — a turbine blade with dense curvature on the leading edge and flat surfaces everywhere else — SAH produces better tree balance and faster traversal. The median split was a pragmatic starting point: it works for the meshes I tested during development, but it is not optimal for all geometries.

---

If you work in industrial CT or NDT and have found yourself manually rotating a part in the fixture, running a test scan, adjusting, and repeating, PenOpt was written for you. The source is at [github.com/abu-hamad/penopt](https://github.com/abu-hamad/penopt) — clone it, load a mesh, and see whether the orientation you have been using is the one you should be.
