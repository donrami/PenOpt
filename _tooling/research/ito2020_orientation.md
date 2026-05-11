# Ito et al. 2020 — Orientation Optimization and Jig Construction for X-ray CT scanning

## Reference

**Authors:** Toshimasa Ito, Yutaka Ohtake, Hiromasa Suzuki (The University of Tokyo)  
**Venue:** 10th Conference on Industrial Computed Tomography (iCT 2020), Wels, Austria  
**DOI:** [10.58286/25108](https://doi.org/10.58286/25108)  
**URL:** https://www.ndt.net/article/ctc2020/papers/ICT2020_paper_id146.pdf

## Abstract

The authors propose a method to find the optimal object orientation for X-ray CT scanning by simulating X-ray projections using CAD surface mesh data. Three artifact types are evaluated: metal artifacts (via generalized mean of transmission lengths), beam hardening artifacts (via projection area variance), and cone-beam artifacts (via Tuy-Smith sufficiency condition). Multiobjective optimization determines the optimal orientation. Additionally, a method for automatically constructing support jigs for the optimal orientation is described.

## Key Contributions & PenOpt Alignment

### 1. Objective Functions (PenOpt: `internal/objectives/objectives.go`)

| Objective | Formula | PenOpt Function | Status |
|---|---|---|---|
| **f_mtl** — Generalized mean of transmission length | (1/N · Σ x_i^m)^(1/m) | `FMtl(lengths, m=3)` | ✅ Implemented |
| **f_hdn** — Projection area range | Amax − Amin | `FHdn(maxPerProjection)` | ✅ Implemented |
| **f_fdk** — Tuy-Smith condition violation | Faces not satisfying Tuy-Smith | Not yet implemented | ❌ Missing |

### 2. Search Strategy (PenOpt: `internal/search/search.go`)

The paper describes a coarse-to-fine two-phase search:

- **§2.4 Multiobjective Optimization:** Evaluate orientations at coarse intervals (15° spacing for θ, φ).
- PenOpt uses 7×7 = 49 coarse orientations at 15° spacing (θ: −45° to +45°, φ: −45° to +45°).
- Top 3 candidates are refined at ±5° with 1° steps = 121 fine orientations.
- Combined scoring uses min-max normalization then either `weighted` (Σ w_i·n_i) or `minimax` (max(w_i·n_i)).

### 3. Optimization Objective (PenOpt: `internal/search/search.go`)

The paper uses a two-degree-of-freedom parameterization of orientation:
1. Rotate around X-axis by θ
2. Rotate around Y-axis by φ

This matches PenOpt's `theta` and `phi` convention exactly.

## Implementation Alignment Checklist

- [x] `f_mtl` uses m=3 (cube-root mean) as specified in the paper
- [x] `f_energy` tracks max transmission length (surrogate for metal artifact severity)
- [x] `f_hdn` computes A_max − A_min across projections
- [x] Coarse grid: 15° spacing over [−45°, 45°] for both θ and φ
- [x] Fine grid: ±5° refinement at 1° steps around top 3 coarse candidates
- [x] Min-max normalization before combination
- [x] `weighted` and `minimax` combination methods available
- [ ] `f_fdk` (Tuy-Smith condition) not yet implemented — future enhancement

## Deviations from Paper

- PenOpt uses a simpler BVH approach (median-split, no SAH) vs. the paper's unspecified acceleration structure
- PenOpt combines the three objectives as a weighted sum or minimax; the paper uses multiobjective optimization with Pareto front analysis (conceptual difference — the code comment references the paper's approach)
- The jig construction component is partially implemented: a simplified box-pocket + base plate (jig.go), not the paper's conforming support pocket. STL export is working.
