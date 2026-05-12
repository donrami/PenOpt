# Deb et al. 2002 — NSGA-II: A Fast and Elitist Multiobjective Genetic Algorithm

## Reference

**Authors:** Kalyanmoy Deb (Associate Member, IEEE), Amrit Pratap, Sameer Agarwal, T. Meyarivan  
**Title:** *A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II*  
**Venue:** IEEE Transactions on Evolutionary Computation, Vol. 6(2), pp. 182–197 (April 2002)  
**DOI:** [10.1109/4235.996017](https://doi.org/10.1109/4235.996017)  
**URL:** https://ieeexplore.ieee.org/document/996017

## Abstract

Multiobjective evolutionary algorithms (EAs) using nondominated sorting and sharing have been criticised for their O(MN³) computational complexity, non-elitism approach, and need for specifying a sharing parameter. NSGA-II alleviates all three difficulties: (1) a fast nondominated sorting approach with O(MN²) complexity; (2) a selection operator that combines parent and offspring populations, selecting the best solutions with respect to fitness and spread; and (3) an explicit diversity-preserving mechanism (crowding distance) that requires no sharing parameter. Simulation results on difficult test problems show NSGA-II finds better spread and convergence compared to PAES and SPEA. The paper also extends NSGA-II to constrained problems via modified dominance definition.

## Status in PenOpt: **Not Yet Implemented**

> ⚠️ **ASPIRATIONAL — NOT YET IMPLEMENTED**
> This research note documents a planned future feature. The code described here does not yet exist in the codebase.

**Current optimization method**: PenOpt uses the coarse→fine grid search (Ito et al. 2020, see `internal/search/search.go`) described in [`ito2020_orientation.md`](./ito2020_orientation.md). This scalarizes multiple objectives into a weighted sum or minimax combination, then searches a discretised (θ, φ) grid. It does not produce a Pareto front.

**Planned enhancement**: Replacing or supplementing the grid search with NSGA-II would enable true multiobjective optimization with Pareto-front exploration, eliminating the need for weight presets and revealing trade-offs between penetration, energy, and artifact objectives.

### Proposed Core Components (for when implementation begins)

| Component | Paper | Planned Implementation |
|---|---|---|
| **Fast nondominated sorting** | O(MN²) sorting by Pareto rank | `nondominatedSort()` — O(MN²) |
| **Crowding distance** | Density estimation in objective space | `crowdingDistance()` |
| **Selection** | Binary tournament on (rank, crowding) | Binary tournament via `select()` |
| **Crossover** | SBX (Simulated Binary Crossover) | `sbxCrossover()` |
| **Mutation** | Polynomial mutation | `polynomialMutate()` |
| **Elitism** | Parent+offspring combined pool | µ+λ selection with combined population |
| **Constraint handling** | Modified dominance definition | Constrained dominance via `dominates()` |

### Proposed PenOpt-Specific Extensions

- **Frozen genotype masking** — `Frozen []bool` prevents crossover/mutation from altering user-locked variables
- **Warm-start initialisation** — Top-10 coarse-search results seed the initial population of 100 (50 for standard mode, 100 for 6-DOF)
- **6-DOF support** — Genotype expanded to `[x, y, z, θ, φ, ψ, n_projections, kV, trajectory_type, pitch]` (10 variables)
- **Event-driven progress reporting** — `runtime.EventsEmit` for Wails UI updates

### Proposed Parameter Choices

| Parameter | Paper Default | Proposed Default | Rationale |
|---|---|---|---|
| Population size | — | 50 | 10 warm-start + 40 random |
| Crossover prob. | 0.9 | 0.9 | SBX default |
| Mutation prob. | 1/n_vars | 1/n_vars | Polynomial mutation |
| Crossover index η_c | 20 | 15 | Tighter offspring distribution vs. paper |
| Mutation index η_m | 20 | 20 | Polynomial distribution index |
| Generations | — | 30–50 | Converges within this range for 7 objectives |

## Relationship to Other References

NSGA-II would complement Ito 2020 by replacing the scalarized grid search with true multiobjective Pareto-front exploration. The coarse→fine grid search would remain valuable for initialization (warm-starting NSGA-II's population) and for fallback when deterministic results are needed.

## See Also

- Current optimization implementation: `internal/search/search.go`
- Current objective functions: `internal/objectives/objectives.go`
- Ito et al. 2020 orientation optimization: [`ito2020_orientation.md`](./ito2020_orientation.md)
