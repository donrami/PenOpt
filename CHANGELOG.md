# Changelog

All notable changes to PenOpt will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-10

### Added

- BVH-accelerated ray casting for X-ray path simulation through triangle meshes
- Multi-objective search with three objective functions:
  - f_mtl: generalized-mean penetration (cube-root mean)
  - f_energy: maximum path length across all rays
  - f_hdn: projection non-uniformity (range of max path lengths)
- Coarse-to-fine grid search: 10° initial grid over (θ, φ), top-3 refinement at 1°
- NIST XCOM material database with energy-dependent attenuation coefficients
- Beam filter presets (Cu, Al, Sn, Ti) with effective energy computation
- CT scanner presets for industrial and medical scanners (Nikon, GE, Zeiss, Siemens, Philips, dental CBCT)
- IntelliScan: adaptive projection allocation for high-variance orientations
- 3D viewport with mesh inspection, rotation, and per-face penetration heatmaps
- Contour plots and penetration roses for objective landscape visualization
- Energy recommendation from max path length and material properties
- JSON result export and PNG screenshot export with summary overlay
- STL and OBJ mesh parser with watertight validation
- Wails v2 desktop application with Go backend and Three.js/WebGL frontend

[0.1.0]: https://github.com/rami-abu-hamad/penopt/releases/tag/v0.1.0
