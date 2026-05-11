# PenOpt — Project Tree

Generated: 2026-05-10

```
penopt/
├── main.go                        # Wails entry point, asset embedding
├── app.go                         # App bindings (13 methods + types)
├── go.mod                         # Go module (penopt, Go 1.23)
├── go.sum
├── wails.json                     # Wails project config
│
├── internal/
│   ├── mesh/
│   │   ├── mesh.go                # Vec3, Triangle, Mesh, watertightness
│   │   ├── parser_stl.go          # Binary + ASCII STL
│   │   └── parser_obj.go          # OBJ with fan triangulation
│   │
│   ├── bvh/
│   │   └── bvh.go                 # Median-split BVH, ray-AABB, Möller-Trumbore
│   │
│   ├── raycaster/
│   │   └── raycaster.go           # Transmission lengths + face heatmap (parallel)
│   │
│   ├── objectives/
│   │   └── objectives.go          # f_mtl, f_energy, f_hdn, Normalize, CombinedScore
│   │
│   ├── search/
│   │   ├── search.go              # Coarse→fine grid search, EvaluateSingle
│   │   └── intelliscan.go         # Tangent-ray projection angles
│   │
│   └── physics/
│       ├── material.go            # Beer-Lambert physics functions
│       └── mats_data.go           # 40+ NIST XCOM materials + filters
│
├── frontend/
│   ├── index.html                 # SPA (all UI in one HTML file)
│   ├── package.json               # Vite + Three.js
│   ├── vite.config.js
│   │
│   ├── src/
│   │   ├── main.js                # App init, Three.js, UI logic (~670 lines)
│   │   ├── plots.js               # Canvas contour + rose plot (~320 lines)
│   │   ├── export.js              # JSON + PNG export (~90 lines)
│   │   └── style.css              # Dark theme (~710 lines)
│   │
│   ├── dist/                      # Vite output (auto-generated)
│   └── wailsjs/                   # Wails bindings (auto-generated)
│       └── go/main/
│           ├── App.js
│           └── App.d.ts
│
├── build/
│   ├── bin/penopt                 # Production binary (9.0 MB)
│   ├── appicon.png
│   ├── darwin/
│   ├── windows/
│   └── README.md
│
└── _tooling/
    ├── INDEX.md                   # ← ENTRY POINT — folder map & navigation
    ├── reference/
    │   ├── HANDOFF.md             # Full handoff document
    │   └── PROJECT_TREE.md        # This file
    ├── specs/
    │   ├── SPEC-ARCHITECTURE-DEEPENING.md
    │   ├── SPRINT1_SPEC.md
    │   ├── SPRINT2_SPEC.md
    │   ├── SPRINT3_SPEC.md
    │   ├── phase0-rotation-fix-spec.md
    │   └── UI-REFACTOR-TASKS.md
    ├── audits/
    │   ├── GUI_AUDIT.md
    │   ├── oracle-scrutiny.md
    │   ├── paper-alignment-audit.md
    │   └── PHASE3_GAPS.md
    ├── adr/
    │   └── adr-0001-replace-phi-with-psi.md
    └── research/
        ├── README.md
        └── *.md (9 paper reference files)
```

### Key counts

| Metric | Value |
|--------|-------|
| Go files | 10 |
| Go source lines | ~1,900 |
| Frontend JS files | 3 |
| Frontend JS lines | ~1,080 |
| CSS lines | ~710 |
| Binary size | 9.0 MB |
| Build time | ~3s |
| Total project size | ~15 MB (with deps) |
