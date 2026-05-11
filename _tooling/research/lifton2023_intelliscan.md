# Lifton & Poon 2023 — IntelliScan

## Reference

**Authors:** Joseph John Lifton (ARTC Singapore), Keng Yong Poon (NTU Singapore)  
**Title:** *IntelliScan: Improving the quality of x-ray computed tomography surface data through intelligent selection of projection angles*  
**Venue:** Journal of X-Ray Science and Technology, Vol. 31(1), pp. 119–129 (2023)  
**DOI:** [10.3233/XST-221280](https://doi.org/10.3233/XST-221280)  
**PMCID:** PMC9912713  
**PMID:** 36530062

## Abstract

Conventional XCT scans use uniform angular spacing, treating all projections as equally important. This work shows that some projections contain more object information than others. By intelligently selecting projections where X-rays are tangent to object surfaces (edges aligned with ray paths), the quality of reconstructed surface models improves. Results: 16% reduction in CAD comparison errors, 3% reduction in surface form error, 14% improvement in edge contrast for a machined aluminium component. The key advantage: no exhaustive XCT simulations or optimization algorithms required — just geometric analysis of the object.

## Key Contributions & PenOpt Alignment

### 1. Tangent-Ray Projection Selection (PenOpt: `internal/search/intelliscan.go`)

**Core insight:** For a surface to be well-reconstructed, some X-ray paths must be tangent to it (i.e., ray direction · surface normal = 0). PenOpt implements this as:

```go
// For each face normal n̂, solve d̂(α) · n̂ = 0
// d̂(α) = (-cos(α), 0, sin(α)) → tan(α) = nx / nz
alpha1 := math.Atan2(nx, nz) * 180 / math.Pi
alpha2 := alpha1 + 180  // second solution
```

### 2. Implementation Details (PenOpt)

| Aspect | Lifton & Poon (2023) | PenOpt |
|---|---|---|
| **Input** | Technical drawings / manual CAD analysis | Automatic from STL mesh |
| **Dimensionality** | 2D (XY plane only) | 3D (full orientation with θ, φ) |
| **Angle computation** | Manual calculations | Automatic: atan2(nx, nz) per face |
| **Deduplication** | Manual | 1.5° tolerance automated |
| **Warning detection** | Manual | Automatic degenerate face & flat-mesh detection |

### 3. Results Alignment

PenOpt's IntelliScan outputs:
- Array of unique tangent projection angles
- Total/degenerate face counts
- Elapsed time
- Warnings for edge cases (flat meshes, large meshes, no tangent angles)

## Implementation Alignment Checklist

- [x] Tangent-ray condition: d̂(α) · n̂ = 0
- [x] Two solutions per face (α and α+180°)
- [x] Automatic computation from face normals
- [x] Angle deduplication with tolerance
- [x] Support for arbitrary theta/phi orientation
- [ ] Integration with actual CT reconstruction (validation pending)
- [ ] Multi-orientation fusion (the paper uses two orthogonal scans)

## Limitations (as noted in Butzhammer 2026)

The original IntelliScan method:
1. Is not automated — requires manual technical drawing analysis
2. Operates in 2D only (XY plane)
3. Requires two separate measurements with different object orientations
4. Introduces registration errors from fusing multiple scans

PenOpt addresses limitations 1–3 through automatic 3D computation. Limitation 4 (registration errors) remains an open consideration.
