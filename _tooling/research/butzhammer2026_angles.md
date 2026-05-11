# Butzhammer et al. 2026 — Automated Scan Angle Selection for Dimensional CT

## Reference

**Authors:** Lorenz Butzhammer, Colin Herath, Matthias Robert Oskar Braun, Tino Hausotte (FAU Erlangen-Nürnberg)  
**Title:** *Higher accuracy with fewer projections? Automated scan angle selection for dimensional Computed Tomography based on a simple data completeness measure for the part surface*  
**Venue:** 15th Conference on Industrial Computed Tomography (iCT 2026), Linz, Austria  
**DOI:** [10.58286/32560](https://doi.org/10.58286/32560)  
**URL:** https://www.ndt.net/article/ctc2026/papers/ict26_Contribution_184.pdf

## Abstract

Selecting scan angles where X-rays are tangential to surface segments produces sharper transitions in the reconstructed volume, enhancing dimensional accuracy in sparse-view CT. The authors propose a method using a virtual CT setup with an STL surface model to automatically identify task-specific scan angles via elementary vector calculus. Two algorithmic variants address different geometric complexity levels. Results: For a steel gauge block, the minimum task-specific projections substantially outperformed conventional high-projection scans.

## Key Contributions & PenOpt Alignment

### 1. Automated 3D Tangent-Ray Detection (PenOpt: `internal/search/intelliscan.go`)

Butzhammer extends Lifton & Poon's 2D/manual approach to fully automated 3D using STL models. PenOpt's implementation is closely aligned:

| Aspect | Butzhammer 2026 | PenOpt |
|---|---|---|
| **Input** | STL surface model | STL/OBJ mesh |
| **Orientation** | Full 3D pose (via reference scan) | (θ, φ) parameterization |
| **Algorithm** | Vector calculus on face normals | atan2(nx, nz) on rotated normals |
| **Coverage** | Complete or fractional surface | Full mesh (every face) |
| **Goal** | Dimensional metrology, conformity assessment | Scan orientation optimization |

### 2. Two Algorithmic Variants

The paper proposes two variants:
- **Method A:** Basic angle selection for complete surface coverage
- **Method B:** Extended variant for geometrically complex objects

PenOpt currently implements a single-pass approach akin to Method A, collecting all tangent angles from all faces with deduplication.

### 3. Practical Application

Butzhammer targets a specific workflow:
1. First part → full high-resolution reference scan (establishes pose)
2. All subsequent parts → optimized low-projection setup using precomputed angles

PenOpt's IntelliScan computes angles per-orientation, suitable for this workflow.

## Implementation Alignment Checklist

- [x] STL/OBJ mesh input
- [x] Face normal computation via cross product
- [x] Tangent-ray angle solving via vector calculus
- [x] Angle deduplication
- [x] Automatic processing (no manual intervention)
- [x] Two algorithmic variants (Method A + Method B)
- [x] Surface-fraction coverage selection (Method B greedy selection)
- [ ] Integration with reference-scan pose estimation

## Relationship to Other References

Butzhammer 2026 builds directly on Lifton & Poon 2023, extending their IntelliScan concept from 2D/manual to 3D/automated. Both are cited in PenOpt's `intelliscan.go` header. The lineage is:

```
Heinzl 2011 (Radon space analysis)
    └──▶ Lifton & Poon 2023 (IntelliScan: manual 2D tangent-ray selection)
            └──▶ Butzhammer 2026 (automated 3D tangent-ray selection)
                    └──▶ PenOpt (automated 3D IntelliScan + orientation optimization)
```
