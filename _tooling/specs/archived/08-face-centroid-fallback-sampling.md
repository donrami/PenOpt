# Spec 08: Face-Centroid Fallback Sampling

**Gap analysis ref**: G9 (part 3)  
**Packages**: `internal/raycaster/`, `internal/search/`  
**Depends on**: Spec 06 (needs coverage detection to trigger the fallback)  
**Effort**: ~50 lines of Go

---

## 1. Paper Ground Truth

Heinzl et al. 2011 and Ito et al. 2020 both use ray-casting through the mesh to compute penetration lengths. They don't specify grid vs. centroid-based sampling — the choice is an implementation detail.

The key insight: for a part smaller than the inter-ray spacing, a regular grid can miss it entirely. An alternative is to cast rays through each face centroid, guaranteeing every face is sampled at least once. This is the approach already used in `ComputeFacePenetrations()` for the heatmap.

## 2. Current Code Behaviour

**File**: `internal/raycaster/raycaster.go`

Two separate sampling modes exist:

1. **Grid-based** (`ComputeTransmissionLengths`): Casts rays at evenly-spaced detector pixel positions. Used for optimization search. Default: 8×8 to 32×32 rays per projection.

2. **Face-centroid-based** (`ComputeFacePenetrations`): Casts one ray per face through the face centroid. Used for the per-face heatmap visualization. Samples every face unconditionally.

These two modes are never combined. The grid-based mode is used for optimization; the face-centroid mode is used only for the heatmap display.

## 3. Correct Behaviour

When the ray grid undersamples the mesh (coverage fraction < 5%), the search should fall back to face-centroid sampling automatically. This guarantees that every face is sampled, at the cost of more rays (N faces per projection vs. fixed grid size).

**Trade-off**: For a 100k-face mesh at 36 projections, face-centroid sampling casts 3.6M rays vs. grid-based at 16×16 with 36 projections = 9,216 rays. This is ~400× more rays, so it's only suitable as a fallback for small parts.

For small parts (low triangle count), the cost is manageable:
- 1,000-face part at 36 projections = 36,000 rays (comparable to 16×16 grid × 36 proj = 9,216 rays)
- 10,000-face part at 18 projections (reduced) = 180,000 rays (still acceptable for desktop app)

## 4. Implementation

### 4.1 Add switching logic to `search.Run()`

**File**: `internal/search/search.go`

In `Run()`, before starting evaluations, decide which sampling method to use:

```go
// Decide sampling method based on coverage estimate
// Coverage is proportional to (partExtent / interRaySpacing)²
partExtent := math.Max(m.Extent().X, math.Max(m.Extent().Y, m.Extent().Z))
interRaySpacing := cfg.DetWidth / float64(cfg.RayGridX)
useFaceCentroid := (partExtent * 2) < interRaySpacing * 2  // part fits in < 2 inter-ray cells

var samplingMethod string
if useFaceCentroid && m.NumTris < 50000 {
    samplingMethod = "face-centroid"
    // Reduce projections for performance when using face-centroid
    cfg.NumProjections = min(cfg.NumProjections, 18)
} else {
    samplingMethod = "grid"
}
```

### 4.2 Add face-centroid evaluation function

**File**: `internal/raycaster/raycaster.go`

New function that evaluates a single orientation using face-centroid rays:

```go
// ComputeTransmissionLengthsFaceCentroid evaluates penetration using one ray
// per face centroid per projection. Guarantees every face is sampled, at the
// cost of more rays for high-triangle-count meshes.
func ComputeTransmissionLengthsFaceCentroid(theta, phi float64, 
    m *mesh.Mesh, bvhTree *bvh.BVH, cfg ScannerConfig) OrientationResult {
    
    numFaces := m.NumTris
    numProjections := cfg.NumProjections
    totalRays := numProjections * numFaces
    
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
    
    // Source position
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
            
            // Rotate source position by inverse rotation (same as in grid-based path)
            // ... (identical rotation code from ComputeTransmissionLengths)
            
            var maxLen float64
            offset := alpha * numFaces
            
            for fi := 0; fi < numFaces; fi++ {
                // Rotate centroid by forward orientation + projection
                // ... (rotation code similar to ComputeFacePenetrations)
                
                // Cast ray from source through centroid
                // ... (ray-AABB traversal + penetration summing)
                // Same logic as ComputeTransmissionLengths inner loop
                
                lengths[offset+fi] = penetration
                if penetration > maxLen {
                    maxLen = penetration
                }
            }
            maxPerProjection[alpha] = maxLen
        }(alpha)
    }
    wg.Wait()
    
    // Compute coverage fraction (non-zero rays / total)
    nonZero := 0
    for _, l := range lengths {
        if l > MIN_SEGMENT {
            nonZero++
        }
    }
    
    return OrientationResult{
        Lengths:          lengths,
        MaxPerProjection: maxPerProjection,
        CoverageFraction: float64(nonZero) / float64(totalRays),
        // ... other fields
    }
}
```

### 4.3 Wire into `evaluateOrientationsRaw`

```go
func evaluateOrientationsRaw(bvhTree *bvh.BVH, m *mesh.Mesh,
    orientations []Orient,
    cfg raycaster.ScannerConfig,
    grid raycaster.RayGrid,
    onProgress ProgressFn, baseIdx, total int,
    useFaceCentroid bool) []OrientationRaw {  // NEW parameter

    for i, o := range orientations {
        var result raycaster.OrientationResult
        if useFaceCentroid && m != nil {
            result = raycaster.ComputeTransmissionLengthsFaceCentroid(
                o.Theta, o.Phi, m, bvhTree, cfg)
        } else {
            result = raycaster.ComputeTransmissionLengths(o.Theta, o.Phi, bvhTree, cfg, grid)
        }
        // ... rest of evaluation
    }
}
```

### 4.4 Edge cases

- **High triangle count + face-centroid**: For a 500k-face mesh, face-centroid sampling would cast 500k rays per projection. This is prohibitive. Guard with a triangle count threshold (< 50,000 faces) and fall back to grid-based with a coverage warning instead.
- **Mixed modes**: Coarse search could use grid-based (fast) and fine search face-centroid (accurate at the critical few orientations). This is a future enhancement.
- **Zero-face mesh**: `numFaces = 0`, loop is a no-op, all lengths = 0. Coverage = 0. Correct.

## 5. Validation

### 5.1 Existing tests that must still pass

```
go test ./internal/raycaster
go test ./internal/search
```

### 5.2 New test

```go
func TestFaceCentroid_CoversAllFaces(t *testing.T) {
    m, bvhTree := buildTestMesh() // 12-face box
    cfg := raycaster.DefaultScannerConfig()
    cfg.NumProjections = 4
    
    result := raycaster.ComputeTransmissionLengthsFaceCentroid(0, 0, m, bvhTree, cfg)
    
    // With 12 faces × 4 projections = 48 rays, and a box that fills the detector,
    // coverage should be high
    if result.CoverageFraction < 0.5 {
        t.Errorf("Face-centroid coverage = %.4f, expected > 0.5", result.CoverageFraction)
    }
    if len(result.Lengths) != 12 * 4 {
        t.Errorf("Expected %d lengths, got %d", 12*4, len(result.Lengths))
    }
}
```

### 5.3 Performance benchmark (informal)

```go
func BenchmarkFaceCentroid(b *testing.B) {
    m, bvhTree := buildSphereMesh(30, 3) // ~1280 faces
    cfg := raycaster.DefaultScannerConfig()
    cfg.NumProjections = 18
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        raycaster.ComputeTransmissionLengthsFaceCentroid(0, 0, m, bvhTree, cfg)
    }
}
```
