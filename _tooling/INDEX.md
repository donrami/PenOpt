# PenOpt — `_tooling/` Index

> **Entry point for agents.** Everything an agent needs to understand the project lives here.
> Start with this file to find the right document for your task.

---

## Quick Navigation

| You need to… | Start here |
|---|---|
| Understand the app architecture, tech stack, and how things fit together | [`reference/HANDOFF.md`](reference/HANDOFF.md) |
| See the project file tree and source code layout | [`reference/PROJECT_TREE.md`](reference/PROJECT_TREE.md) |
| Learn the domain language (mesh, orientation, projection, ray, BVH…) | [`../../CONTEXT.md`](../../CONTEXT.md) (project root) || 
| Read the research papers this project implements | [`research/`](research/) |
| Review implementation specs and sprint plans | [`specs/`](specs/) |
| See audit reports (correctness, paper alignment, UI quality) | [`audits/`](audits/) |
| Find what's pending or deferred | [`specs/UI-REFACTOR-TASKS.md`](specs/UI-REFACTOR-TASKS.md) & each sprint spec |

---

## Directory Map

```
_tooling/
├── INDEX.md                       ← YOU ARE HERE
│
├── reference/                     # Stable project knowledge (architecture, file map)
│   ├── HANDOFF.md                 # Full architecture handoff: background, data flow, 
│   │                              #   tech stack, known issues, how to extend
│   └── PROJECT_TREE.md            # Complete file tree with line counts & descriptions
│
├── specs/                         # Implementation specs and sprint plans
│   ├── SPEC-ARCHITECTURE-DEEPENING.md   # 7-step codebase deepening plan
│   ├── SPRINT1_SPEC.md            # Sprint 1: Correctness (tests, search cancellation)
│   ├── SPRINT2_SPEC.md            # Sprint 2: Butzhammer Method B + surface-fraction
│   ├── SPRINT3_SPEC.md            # Sprint 3: Radon space, critical faces, Pareto front
│   ├── phase0-rotation-fix-spec.md       # Phase 0: φ→ψ rotation axis fix
│   ├── UI-REFACTOR-TASKS.md       # Phased CSS/UI refactoring task list
│   └── REMEDIATION_PLAN.md        # Spec-driven plan: expert review + oracle corrections → 19 tasks across 5 phases
│
├── audits/                        # Audits, gap analyses, and reviews
│   ├── GUI_AUDIT.md               # UX heuristic audit against reference app
│   ├── oracle-scrutiny.md         # Cross-check of audit claims against research files
│   ├── paper-alignment-audit.md   # Full fidelity audit against 9 academic references
│   ├── PHASE3_GAPS.md             # Gap analysis for Phase 3 features
│   ├── EXPERT_REVIEW.md           # Expert review: scientific accuracy, performance, UX/UI
│   └── ORACLE_REVIEW.md            # Oracle 2nd opinion: challenges EXPERT_REVIEW claims against ground truth
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
| **ADR** | Record architectural decisions that have lasting consequences | Any time you need to understand *why* something is the way it is | Before implementing a significant decision |
| **Spec** | Define *what* to build and *how* to verify it | Start here when implementing a feature | Before starting development on a new feature/sprint |
| **Audit** | Assess existing code against criteria | When prioritizing fixes or evaluating quality | After significant implementation work |
| **Research** | Capture paper methods as reference material | When modifying code that implements a paper | When adding a new paper-derived feature |
| **Reference** | Stable project knowledge (architecture, file map) | When onboarding, planning changes, or tracing data flow | Updated as architecture evolves |

---

## Change History

- **2026-05-12** — Reorganized `_tooling/` into subdirectories (`reference/`, `specs/`, `audits/`, `adr/`, `research/`). Created this index.
