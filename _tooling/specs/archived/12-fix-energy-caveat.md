# Spec 12: Fix Energy Recommendation Caveat

**Gap analysis ref**: F4  
**Packages**: `frontend/`  
**Depends on**: Nothing (cosmetic text change)  
**Effort**: ~1 line of JavaScript

---

## 1. Paper Ground Truth

The kV recommendation uses a heuristic spectrum model (`ComputeEffectiveEnergy` in `material.go`), not the full Tucker/Boone model. The uncertainty from this simplification is larger than hardware variation alone — potentially 10-30 kV for heavily filtered beams.

## 2. Current Code Behaviour

```js
$('energy-caveat').textContent = 'Qualitative estimate. Actual consumption depends on scanner hardware.';
```

This attributes inaccuracy to hardware variation only. It doesn't mention the physics model limitation.

## 3. Correct Behaviour

The caveat should say:

```js
$('energy-caveat').textContent = 'Qualitative estimate based on simplified spectrum model. Actual kV requirement depends on scanner hardware and tube spectrum characteristics.';
```

This is honest about the underlying physics without being alarmist.

## 4. Implementation

Change the one line in `optimizer.js`. No other changes needed.

## 5. Validation

1. Load a mesh, configure material/filter
2. Run optimization
3. Verify energy recommendation shows the updated text
