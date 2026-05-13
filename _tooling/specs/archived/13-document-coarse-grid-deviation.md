# Spec 13: Document 15° Coarse Grid Deviation

**Gap analysis ref**: G1, D1  
**Packages**: `internal/search/search.go` (docstring fix), `_tooling/research/ito2020_orientation.md` (documentation)  
**Depends on**: Nothing  
**Effort**: ~5 lines of comments

---

## 1. Paper Ground Truth

Ito 2020 §2.4: "discretize (θ, φ) at 10° intervals."

## 2. Current Code Behaviour

**Package docstring** (search.go line 2): Says 10° intervals (matches paper but not code)  
**Code** (search.go line 24): `step := 15.0` (actual step, 50% coarser than paper)  
**Function docstring** (search.go line 19): Correctly says "15° steps"

The package-level docstring contradicts both the code and the function-level docstring.

## 3. Correct Behaviour

1. Fix the package docstring to say "15° intervals" with a note about the deviation
2. Document the deviation in the Ito research note with rationale

## 4. Implementation

### 4.1 Fix search.go package docstring

Change line 2:
```diff
- // Based on Ito et al. 2020 §2.4: discretize (θ, φ) at 10° intervals, find top 3,
+ // Based on Ito et al. 2020 §2.4: discretize (θ, φ) at 15° intervals (deviation from paper's
+ // 10° for speed — evaluates ~50% of the coarse orientations). Find top 3, then refine at 1°.
```

### 4.2 Document in Ito research note

In `_tooling/research/ito2020_orientation.md`, add a note under "Deviations from Paper":

```markdown
### Grid Step Size

PenOpt uses 15° coarse intervals vs. the paper's 10°. This reduces coarse evaluations from 100 to 49 (for ±45° range). The deviation is a deliberate speed/accuracy trade-off:

- **Benefit**: 51% fewer ray-casting evaluations, ~2× faster search
- **Risk**: The coarser grid may miss the global optimum if it falls between coarse points. The ±5°/1° refinement around top-3 candidates compensates for most of this risk.
- **Validation**: No systematic study has compared 10° vs 15° success rates on standard test geometries.
```

## 5. Validation

1. Read the updated docstring — it should be self-consistent
2. Read the research note — it should accurately document the deviation
