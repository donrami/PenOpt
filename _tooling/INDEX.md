# PenOpt — `_tooling/` Index

> **Entry point for agents.** Everything an agent needs to understand the project lives here.
> Start with this file to find the right document for your task.

---

## Quick Navigation

| You need to… | Start here |
|---|---|
| Learn the domain language (mesh, orientation, projection, ray, BVH…) | [`../../CONTEXT.md`](../../CONTEXT.md) (project root) || 
| Read the research papers this project implements | [`research/`](research/) |
| Review implementation specs and sprint plans | [`specs/`](specs/) |
| See audit reports (correctness, paper alignment, UI quality) | [`audits/`](audits/) |

---

## Directory Map

```
_tooling/
├── INDEX.md                       ← YOU ARE HERE
│
├── reference/                     # Stable project knowledge (architecture, file map)
│
├── specs/                         # Implementation specs and sprint plans
│
├── audits/                        # Audits, gap analyses, and reviews
│
└── research/                      # Academic paper reference files (one per paper)
    ├── README.md                  # Index of all papers with venues & usage
    ├── ito2020_orientation.md     # Orientation optimization (objectives/, search/)
    ├── heinzl2011_placement.md    # Placement estimation (raycaster/, bvh/)
    ├── lifton2023_intelliscan.md  # IntelliScan (search/intelliscan.go)
    ├── butzhammer2026_angles.md   # Scan angle selection (search/)
    ├── grozmani2019_uncertainty.md # Measurement uncertainty (objectives/)
    ├── deb2002_nsgaii.md          # NSGA-II multiobjective GA (search/)
    ├── tucker1991_boone1997_spectrum.md # X-ray spectrum models (physics/)
    ├── alsaffar2022_scatter.md    # MC scatter correction (physics/)
    └── nist_xcom.md               # NIST XCOM cross sections (physics/)
```

---

## Document Lifecycle

| Document type | Purpose | When to read | When to write |
|---|---|---|---|
| **Spec** | Define *what* to build and *how* to verify it | Start here when implementing a feature | Before starting development on a new feature/sprint |
| **Audit** | Assess existing code against criteria | When prioritizing fixes or evaluating quality | After significant implementation work |
| **Research** | Capture paper methods as reference material | When modifying code that implements a paper | When adding a new paper-derived feature |
| **Reference** | Stable project knowledge (architecture, file map) | When onboarding, planning changes, or tracing data flow | Updated as architecture evolves |

---

## Change History

