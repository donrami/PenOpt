# PenOpt — Research References

This directory documents the academic papers and standards referenced throughout the PenOpt codebase. All implementations should align with the methods described in these sources unless explicitly noted otherwise.

This directory is reserved exclusively for paper reference files. Do not use it for documentation, notes, code, configuration, or any other purpose.

## References

| # | Paper | Year | Venue | Used In |
|---|---|---|---|---|
| 1 | [Ito et al. — *Orientation Optimization and Jig Construction for X-ray CT scanning*](./ito2020_orientation.md) | 2020 | iCT 2020 | `search/`, `objectives/` |
| 2 | [Heinzl et al. — *Fast Estimation of Optimal Specimen Placements in 3D X-ray Computed Tomography*](./heinzl2011_placement.md) | 2011 | DIR 2011 | `raycaster/`, `bvh/` |
| 3 | [Lifton & Poon — *IntelliScan: Improving the quality of x-ray computed tomography surface data through intelligent selection of projection angles*](./lifton2023_intelliscan.md) | 2023 | J. X-Ray Sci. Tech. | `search/intelliscan.go` |
| 4 | [Butzhammer et al. — *Higher accuracy with fewer projections? Automated scan angle selection for dimensional Computed Tomography…*](./butzhammer2026_angles.md) | 2026 | iCT 2026 | `search/intelliscan.go` |
| 5 | [Grozmani et al. — *Investigating the influence of workpiece placement on the uncertainty of measurements in industrial CT*](./grozmani2019_uncertainty.md) | 2019 | iCT 2019 | `objectives/` (`f_uncertainty`) |
| 6 | [Deb et al. — *A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II*](./deb2002_nsgaii.md) | 2002 | IEEE Trans. Evol. Comp. | `search/nsgaii.go` |
| 7 | [Tucker et al. / Boone & Seibert — *Tungsten anode x-ray spectrum models*](./tucker1991_boone1997_spectrum.md) | 1991/1997 | Medical Physics | `physics/spectrum.go` |
| 8 | [Alsaffar et al. — *Computational scatter correction in near real-time with a fast Monte Carlo photon transport model*](./alsaffar2022_scatter.md) | 2022 | J. Real-Time Image Proc. | `physics/scatter.go` |
| 9 | [NIST XCOM — Photon Cross Sections Database](./nist_xcom.md) | — | NIST Standard | `physics/` |
