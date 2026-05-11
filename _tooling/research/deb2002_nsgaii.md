# Deb et al. 2002 — NSGA-II: A Fast and Elitist Multiobjective Genetic Algorithm

## Reference

**Authors:** Kalyanmoy Deb (Associate Member, IEEE), Amrit Pratap, Sameer Agarwal, T. Meyarivan  
**Title:** *A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II*  
**Venue:** IEEE Transactions on Evolutionary Computation, Vol. 6(2), pp. 182–197 (April 2002)  
**DOI:** [10.1109/4235.996017](https://doi.org/10.1109/4235.996017)  
**URL:** https://ieeexplore.ieee.org/document/996017

## Abstract

Multiobjective evolutionary algorithms (EAs) using nondominated sorting and sharing have been criticised for their O(MN³) computational complexity, non-elitism approach, and need for specifying a sharing parameter. NSGA-II alleviates all three difficulties: (1) a fast nondominated sorting approach with O(MN²) complexity; (2) a selection operator that combines parent and offspring populations, selecting the best solutions with respect to fitness and spread; and (3) an explicit diversity-preserving mechanism (crowding distance) that requires no sharing parameter. Simulation results on difficult test problems show NSGA-II finds better spread and convergence compared to PAES and SPEA. The paper also extends NSGA-II to constrained problems via modified dominance definition.

## Key Contributions & PenOpt Alignment

### 1. Core NSGA-II Components (PenOpt: `internal/search/nsgaii.go`)

| Component | Paper | PenOpt Implementation |
|---|---|---|
| **Fast nondominated sorting** | O(MN²) sorting by Pareto rank | `nondominatedSort()` — O(MN²) |
| **Crowding distance** | Density estimation in objective space | `crowdingDistance()` |
| **Selection** | Binary tournament on (rank, crowding) | Binary tournament via `select()` |
| **Crossover** | SBX (Simulated Binary Crossover) | `sbxCrossover()` |
| **Mutation** | Polynomial mutation | `polynomialMutate()` |
| **Elitism** | Parent+offspring combined pool | µ+λ selection with combined population |
| **Constraint handling** | Modified dominance definition | Constrained dominance via `dominates()` |

### 2. PenOpt-Specific Extensions

The paper's base NSGA-II is extended in PenOpt with:

- **Frozen genotype masking** — `Frozen []bool` prevents crossover/mutation from altering user-locked variables
- **Warm-start initialisation** — Top-10 coarse-search results seed the initial population of 100 (50 for standard mode, 100 for 6-DOF)
- **6-DOF support** — Genotype expanded to `[x, y, z, θ, φ, ψ, n_projections, kV, trajectory_type, pitch]` (10 variables)
- **Event-driven progress reporting** — `runtime.EventsEmit` for Wails UI updates

### 3. Parameter Choices

| Parameter | Paper Default | PenOpt Default | Rationale |
|---|---|---|---|
| Population size | — | 50 | 10 warm-start + 40 random |
| Crossover prob. | 0.9 | 0.9 | SBX default |
| Mutation prob. | 1/n_vars | 1/n_vars | Polynomial mutation |
| Crossover index η_c | 20 | **15** | **Deviation from paper** — code uses 15, paper recommends 20 |
| Mutation index η_m | 20 | 20 | Polynomial distribution index |
| Generations | — | 30–50 | Converges within this range for 7 objectives |

## Implementation Alignment Checklist

- [x] Fast nondominated sorting (O(MN²))
- [x] Crowding distance computation
- [x] Binary tournament selection by (rank, crowding)
- [x] SBX crossover operator
- [x] Polynomial mutation operator
- [x] Elitist µ+λ replacement
- [x] Constrained dominance handling
- [ ] Reference-point-based selection (NSGA-III — not needed for ≤7 objectives)
- [ ] Adaptive population sizing — not implemented
