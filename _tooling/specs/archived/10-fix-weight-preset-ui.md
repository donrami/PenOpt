# Spec 10: Fix Weight Preset UI

**Gap analysis ref**: F1, F2  
**Packages**: `frontend/`  
**Depends on**: Spec 01 (FTuy inversion — must be done first so presets optimize correctly)  
**Effort**: ~20 lines of JavaScript

---

## 1. Paper Ground Truth

Ito 2020 defines three objectives: f_mtl, f_hdn, f_fdk (Tuy-Smith completeness). PenOpt adds f_energy (max penetration) for practical kV estimation and f_bh (beam hardening) as a planned enhancement.

The weight presets should accurately reflect which objectives are actually functional and produce correct optimization signals.

## 2. Current Code Behaviour

**File**: `frontend/src/optimizer.js` lines 162-165

The results table shows f_mtl, f_energy, f_hdn, f_tuy. After Spec 01, f_tuy will show correctly inverted values in the scoring, but the display column shows raw completeness (good — users understand percentages).

**File**: `frontend/src/state.js` lines 6-8

```js
{ id: 0, name: 'Quality',   wMtl: 0.5, wEnergy: 0.2, wHdn: 0.2, wTuy: 0.05, wBh: 0.05 },
{ id: 1, name: 'Balanced',  wMtl: 0.3, wEnergy: 0.3, wHdn: 0.2, wTuy: 0.1,  wBh: 0.1  },
{ id: 2, name: 'Energy',    wMtl: 0.2, wEnergy: 0.5, wHdn: 0.2, wTuy: 0.05, wBh: 0.05 },
```

After Spec 01, wTuy correctly penalizes poor Tuy-Smith completeness. But wBh still does nothing (fBh = 0 placeholder).

## 3. Correct Behaviour

### 3.1 Immediate fix

The weight presets should redistribute wBh to the other objectives until fBh is implemented:

```js
// Option A: Redistribute wBh into the remaining objectives
{ id: 0, name: 'Quality',   wMtl: 0.55, wEnergy: 0.2, wHdn: 0.2,  wTuy: 0.05, wBh: 0.0 },
{ id: 1, name: 'Balanced',  wMtl: 0.35, wEnergy: 0.3, wHdn: 0.2,  wTuy: 0.15, wBh: 0.0 },
{ id: 2, name: 'Energy',    wMtl: 0.2,  wEnergy: 0.55, wHdn: 0.2, wTuy: 0.05, wBh: 0.0 },

// Option B: Keep wBh in the code but zero it out, with a note
// Simpler and makes re-enabling trivial when fBh is implemented
```

Actually, keeping wBh in the code structure but setting it to 0 is better. It keeps the API contract stable and makes it trivial to re-enable when fBh is implemented:

```js
{ id: 0, name: 'Quality',   wMtl: 0.5, wEnergy: 0.2, wHdn: 0.2, wTuy: 0.1, wBh: 0.0 },
{ id: 1, name: 'Balanced',  wMtl: 0.3, wEnergy: 0.3, wHdn: 0.2, wTuy: 0.2, wBh: 0.0 },
{ id: 2, name: 'Energy',    wMtl: 0.2, wEnergy: 0.5, wHdn: 0.2, wTuy: 0.1, wBh: 0.0 },
```

(Redistributed wBh weight to wTuy since both are artifact-related objectives.)

### 3.2 Weight preset descriptions

The trade-off card tooltips/descriptions should note that beam-hardening optimization is not yet active. Add a small text element:

```html
<div class="preset-note">Beam-hardening objective (fBh) not yet active — weight redistributed.</div>
```

### 3.3 f_tuy display in results table

The results table shows `(bestScore.fTuy * 100).toFixed(1) + '%'` as a percentage. After Spec 01, `bestScore.fTuy` is the raw completeness (not inverted — `EvaluateSingle` stores raw values). This is correct for display purposes. No change needed.

## 4. Implementation

### 4.1 In `state.js`, update weight presets

```js
export const WEIGHT_PRESETS = [
  // wBh = 0.0: beam-hardening objective is a placeholder, returns 0 for all orientations.
  // Weight redistributed to wTuy (both are artifact-related).
  { id: 0, name: 'Quality',   wMtl: 0.5, wEnergy: 0.2, wHdn: 0.2, wTuy: 0.1,  wBh: 0.0 },
  { id: 1, name: 'Balanced',  wMtl: 0.3, wEnergy: 0.3, wHdn: 0.2, wTuy: 0.2,  wBh: 0.0 },
  { id: 2, name: 'Energy',    wMtl: 0.2, wEnergy: 0.5, wHdn: 0.2, wTuy: 0.1,  wBh: 0.0 },
];
```

### 4.2 In the trade-off card HTML/code, add note

In the trade-off card section of the sidebar, add a small note below the preset buttons:

```js
// In state.js or optimizer.js setup code
var bhNote = document.getElementById('bh-placeholder-note');
if (!bhNote) {
    bhNote = document.createElement('div');
    bhNote.id = 'bh-placeholder-note';
    bhNote.style.cssText = 'margin-top:4px;font-size:9px;color:var(--text-dim);';
    bhNote.textContent = 'Note: Beam-hardening optimization (fBh) coming in a future release.';
    document.querySelector('.tradeoff-options')?.after(bhNote);
}
```

## 5. Validation

### 5.1 Existing tests that must still pass

```
go test ./internal/search   # Verify scoring with new weight presets
```

### 5.2 Manual verification

1. Open the app, observe trade-off card shows "Balanced" selected
2. Verify the fBh note text is visible
3. Run optimization with all three presets
4. Verify results change meaningfully between presets (different optimal orientations)
5. Verify f_tuy column in results shows correct values
