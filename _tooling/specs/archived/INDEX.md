# PenOpt — Implementation Specs

**Based on**: `_tooling/audits/paper-code-gap-analysis.md`  
**Priority**: Accuracy and faithfulness to science over speed  
**Workflow**: Execute in order. Each spec has acceptance criteria that must pass before moving to the next.

---

## Execution Order

| # | Spec | Finding(s) | Package | Effort | Dependency |
|---|---|---|---|---|---|
| **Phase 0 — Critical correctness (fix the broken signal first)** |
| 01 | Fix FTuy inversion | G7 (BLOCKER) | `objectives/`, `search/` | ~10 lines | None |
| 02 | Add known-answer tests | T3 | `search/`, `objectives/` | ~60 lines | None |
| **Phase 1 — Physics integrity** |
| 03 | Validate NIST XCOM material data | T2, W3 | `physics/` | ~40 lines | None |
| **Phase 2 — Small-part robustness** |
| 06 | Add ray coverage detection | G9 (part 1) | `raycaster/`, `search/` | ~25 lines | None |
| 07 | Auto-size ray grid by part extent | G9 (part 2) | `search/` | ~20 lines | 06 |
| 08 | Face-centroid fallback sampling | G9 (part 3) | `raycaster/` | ~50 lines | 06 |
| **Phase 3 — Frontend, energy caveat, cleanup** |
| 09 | Fix IntelliScan threshold mismatch | F3 | `frontend/` | ~1 line | None |
| 10 | Fix weight preset UI for real objectives | F1, F2 | `frontend/` | ~20 lines | 01 (must invert first) |
| 11 | Add convergence indicator | F5 | `frontend/`, `search/` | ~30 lines | None |
| 12 | Fix energy recommendation caveat | F4 | `frontend/` | ~5 lines | None |
| 13 | Document 15° coarse grid deviation | G1, D1 | research note | ~10 lines | None |
| 14 | Clean up dead code & artifacts | P1, D2 | `app/`, `vec/`, `raycaster/` | ~20 lines | None |

---

## Reading Guide

Each spec follows this structure:

```
## 1. Paper Ground Truth
What the cited research says. The reference standard.

## 2. Current Code Behaviour
What the code actually does (with link to gap analysis finding).

## 3. Correct Behaviour
Precise, testable acceptance criteria.

## 4. Implementation
- Files to change
- Key code decisions
- Edge cases to handle

## 5. Validation
- Existing tests that must still pass
- New tests to write
- Manual verification steps
```

## Phase Order Rationale

**Phase 0 first** because FTuy inversion makes every optimization result systematically wrong. Fixing it first means all subsequent work builds on correct foundations. Known-answer tests go here too so every subsequent change gets validated automatically.

**Phase 1 next** because physics accuracy propagates through everything — kV recommendations, material comparisons, beam-hardening (if ever implemented). Validating the NIST XCOM data catches transcription errors before any spectrum work.

**Phase 2 in the middle** because small-part handling is important but independent of the physics fixes. The face-centroid fallback depends on coverage detection existing.

**Phase 3 last** because frontend changes that display objective values (F1, F2) must wait until the objectives actually produce correct values (01). Documentation changes go last since the code should be right first.

---

## Traceability

Each spec references:
- The gap analysis finding ID (G7, T3, etc.)
- The original paper/standard from `_tooling/research/`
- Specific file paths and line numbers in the current codebase
