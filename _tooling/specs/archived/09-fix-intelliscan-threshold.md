# Spec 09: Fix IntelliScan Threshold Mismatch

**Gap analysis ref**: F3  
**Packages**: `frontend/`  
**Depends on**: Nothing  
**Effort**: 1 line of JavaScript

---

## 1. Paper Ground Truth

Butzhammer 2026 defines the cone-beam regime as SOD/SDD < 0.7 — the threshold below which the source is close enough to the object that parallel-beam approximation loses accuracy. The backend (`intelliscan.go`) uses this threshold correctly.

## 2. Current Code Behaviour

**Backend** (`intelliscan.go` line 51): `coneRatio < 0.7` → geometryMode = "cone-beam"

**Frontend** (`optimizer.js` line 251, hardcoded HTML):
```
For wide-angle cone-beam systems (SOD/SDD < 0.6), consider verifying critical angles manually.
```

The frontend warns at SOD/SDD < 0.6. The backend switches to cone-beam mode at < 0.7. These thresholds are inconsistent: the frontend shows the parallel-beam info text for SOD/SDD = 0.65, but the backend has already switched to cone-beam mode.

## 3. Correct Behaviour

Both thresholds must match. The frontend should use the same value as the backend: < 0.7.

## 4. Implementation

Change the hardcoded HTML in `optimizer.js` line 251:

```diff
- For wide-angle cone-beam systems (SOD/SDD &lt; 0.6)...
+ For wide-angle cone-beam systems (SOD/SDD &lt; 0.7)...
```

### 4.1 Better approach: compute from `GeometryMode`

Even better: instead of hardcoding the threshold in the HTML, have the frontend read `result.intelliScan.geometryMode` from the backend and display a dynamic message:

```js
var geoMode = data.geometryMode || 'parallel';
var infoHtml = 'Tangent angles computed for ' + geoMode + '-beam geometry.';
if (geoMode === 'cone-beam') {
    infoHtml += ' For wide-angle systems, consider verifying critical angles manually.';
}
```

This eliminates the hardcoded threshold entirely — the frontend just reports what the backend computed.

## 5. Validation

1. Set SOD/SDD = 0.68 (e.g., SOD=680, SDD=1000)
2. Run optimization
3. Frontend IntelliScan card should show "cone-beam" geometry mode
4. Previously it showed parallel-beam warning (wrong), now it correctly shows cone-beam
