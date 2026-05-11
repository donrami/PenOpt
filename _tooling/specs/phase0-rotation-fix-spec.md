# Phase 0 Spec: Replace φ (Y-axis Tilt) with ψ (Z-axis Tilt)

## Overview

The CT orientation parameterization uses two tilt angles: θ (rotation around X, the "tilt") and φ (rotation around Y, the "rotation"). However, φ rotates around the same axis as the gantry rotation α — both rotate around Y. This is degenerate: φ and α commute, giving effectively only one degree of freedom for penetration optimization instead of two.

**Fix:** Replace φ (Y-axis tilt) with ψ (Z-axis tilt). This gives two independent tilt axes: θ around X (elevation) and ψ around Z (in-plane rotation), matching real hexapod positioning systems.

## Requirements (EARS Format)

1. WHEN `ComputeTransmissionLengths` is called with (θ, ψ) THEN tilt ψ SHALL rotate the mesh around the Z axis
2. WHEN ψ=0 THEN results SHALL be identical to the old (θ, φ=0) results for the same θ
3. WHEN a non-zero ψ is used THEN the two tilt axes SHALL be independent (changing θ SHALL NOT change the ψ rotation axis and vice versa)
4. WHEN `ComputeFacePenetrations` is called THEN ψ SHALL be used instead of φ for Z-axis rotation
5. WHEN `ComputeIntelliScanAngles` is called THEN ψ SHALL be used for Z-axis rotation of face normals
6. WHEN `search.Run` or `search.EvaluateSingle` is called THEN the second parameter SHALL be ψ (Z-axis tilt), not φ (Y-axis tilt)
7. WHEN the frontend displays tilt angles THEN ψ (ψ=Z-axis tilt) SHALL replace φ (φ=Y-axis tilt) in all labels, displays, and JSON serialization
8. WHEN `CoarsePhis` is referenced THEN it SHALL be renamed to `CoarsePsis`
9. WHEN the `OrientationResult`, `Orient`, and `OrientationScore` structs are serialized THEN the field SHALL be named `psi` in JSON
10. WHEN a `rotateZ` function is needed THEN it SHALL be added to the raycaster package
11. WHEN `go test ./...` is run THEN all tests SHALL pass (note: no tests exist in committed state, so this is vacuously true)

## Design

### Architecture

The change is purely a renaming + physics rotation change. No new data structures are introduced. The function signatures change from `(theta, phi float64)` to `(theta, psi float64)` everywhere.

### Components and Interfaces

#### 1. `internal/raycaster/raycaster.go`

**Add new function:**
```go
// rotateZ returns a Vec3 rotated around the Z axis by angle radians.
func rotateZ(v mesh.Vec3, angle float64) mesh.Vec3 {
    c := math.Cos(angle)
    s := math.Sin(angle)
    return mesh.Vec3{
        X: v.X*c - v.Y*s,
        Y: v.X*s + v.Y*c,
        Z: v.Z,
    }
}
```

**Modify `OrientationResult`:**
- `Phi float64` → `Psi float64`

**Modify `ComputeTransmissionLengths`:**
- Signature: `(theta, phi float64)` → `(theta, psi float64)`
- Body: `phiRad := phi * math.Pi / 180` → `psiRad := psi * math.Pi / 180`
- Body: `rotateY(localOrigin, -phiRad)` → `rotateZ(localOrigin, -psiRad)` (2 occurrences)
- Body: `rotateY(localDir, -phiRad)` → `rotateZ(localDir, -psiRad)` (2 occurrences)
- Return: `Phi: phi` → `Psi: psi`

**Modify `ComputeFacePenetrations`:**
- Signature: `(..., theta, phi float64, ...)` → `(..., theta, psi float64, ...)`
- Body: `phiRad := phi * math.Pi / 180` → `psiRad := psi * math.Pi / 180`
- Body: `rotateY(localSrc, -phiRad)` → `rotateZ(localSrc, -psiRad)`
- Body: `rotateY(worldCentroid, phiRad)` → `rotateZ(worldCentroid, psiRad)`
- Body: `rotateY(localDir, -phiRad)` → `rotateZ(localDir, -psiRad)`

#### 2. `internal/search/search.go`

**Rename variables:**
- `CoarsePhis` → `CoarsePsis` (declaration + comment)
- `Orient.Phi` → `Orient.Psi`
- `OrientationScore.Phi` → `OrientationScore.Psi` (struct + json tag)

**Modify function signatures:**
- `EvaluateSingle(bvhTree, theta, phi, ...)` → `EvaluateSingle(bvhTree, theta, psi, ...)`
- `ProgressFn(idx, total int, theta, phi float64)` → `ProgressFn(idx, total int, theta, psi float64)`
- `Run(bvhTree, cfg, weights, method, onProgress, mesh)` — `onProgress` type changes implicitly

**Update all internal references:**
- `runevaluater(,.,.)` — `o.Phi` → `o.Psi` in both `evaluateOrientations` and `Run`
- `OrientationScore{...:,0]`: `Phi: phi` → `Psi: psi`
- Coarse grid iteration: `for _, phi := range CoarsePhis` → `for _, psi := range CoarsePsis`

#### 3. `internal/search/intelliscan.go`

**Modify `ComputeIntelliScanAngles`:**
- Signature: `(m, theta, phi)` → `(m, theta, psi)`
- Body: `phiRad := phi * math.Pi / 180` → `psiRad := psi * math.Pi / 180`
- Normal rotation: change from "rotate by phi around Y, then theta around X" to "rotate by psi around Z, then theta around X"

The new normal rotation:
```go
// Rotate by psi around Z, then theta around X
cosP, sinP := math.Cos(psiRad), math.Sin(psiRad)
cosT, sinT := math.Cos(thetaRad), math.Sin(thetaRad)
nx, ny = nx*cosP - ny*sinP, nx*sinP + ny*cosP  // Z rotation
ny, nz = ny*cosT - nz*sinT, ny*sinT + nz*cosT  // X rotation
```

#### 4. `app.go`

**Modify function signatures:**
- `EvaluateOrientation(theta, phi float64)` → `EvaluateOrientation(theta, psi float64)`
- `ComputeFaceHeatmap(theta, phi float64)` → `ComputeFaceHeatmap(theta, psi float64)`
- `RunOptimization` — the progress callback changes its `phi` parameter name
- `EmitProgress` — comment update only

**Update internal references:**
- `search.EvaluateSingle(bvhTree, theta, phi, cfg)` → `search.EvaluateSingle(bvhTree, theta, psi, cfg)`
- `search.Run(bvhTree, coarseCfg, ...)` — the progress closure parameter name changes
- `raycaster.ComputeFacePenetrations(m, bvhTree, theta, phi, cfg)` → `raycaster.ComputeFacePenetrations(m, bvhTree, theta, psi, cfg)`

#### 5. `frontend/src/main.js`

**Rename JSON field access:**
- `best.phi` → `best.psi` (10+ occurrences)
- `worst.phi` → `worst.psi` (2+ occurrences)
- `s.phi` → `s.psi` (for allScores iteration)

**Update display strings:**
- `\u03C6` (φ) → `\u03C8` (ψ) in all template strings (6+ occurrences)

#### 6. `frontend/src/plots.js`

**Update parameter references:**
- `s.phi` → `s.psi` (contour plot)
- `best.phi` → `best.psi` (contour plot markers)
- `worst.phi` → `worst.psi` (contour plot markers)
- Display labels: `\u03C6` → `\u03C8`

#### 7. `frontend/src/export.js`

**Update:**
- `best.phi` → `best.psi` in PNG export text overlay

### Error Handling

No new error paths are introduced. All existing error handling remains unchanged.

### Testing Strategy

No tests exist in the committed state. The change is verified by:
1. `go build ./...` must pass
2. Manual verification: at ψ=0, results match old (θ, φ=0) results
3. The change is purely mechanical (rename + rotation axis swap)

## Tasks

- [ ] 1. Add `rotateZ` function and modify `ComputeTransmissionLengths` and `ComputeFacePenetrations` in `raycaster.go`
  - _Files:_ `internal/raycaster/raycaster.go`
  - _Changes:_ Add rotateZ(), modify OrientationResult struct, update rotation calls and parameter names

- [ ] 2. Update `search.go` — rename CoarsePhis, Orient.Phi, OrientationScore.Phi and all references
  - _Files:_ `internal/search/search.go`
  - _Changes:_ CoarsePhis→CoarsePsis, Phi→Psi throughout

- [ ] 3. Update `intelliscan.go` — change normal rotation from Y-axis to Z-axis
  - _Files:_ `internal/search/intelliscan.go`
  - _Changes:_ Parameter rename and rotation matrix change

- [ ] 4. Update `app.go` — rename phi→psi in all bindings
  - _Files:_ `app.go`
  - _Changes:_ All function signatures and internal references

- [ ] 5. Update `frontend/src/main.js` — rename phi→psi in all displays
  - _Files:_ `frontend/src/main.js`
  - _Changes:_ All .phi→.psi field access and display strings

- [ ] 6. Update `frontend/src/plots.js` — rename phi→psi
  - _Files:_ `frontend/src/plots.js`
  - _Changes:_ All .phi→.psi and φ→ψ labels

- [ ] 7. Update `frontend/src/export.js` — rename phi→psi
  - _Files:_ `frontend/src/export.js`
  - _Changes:_ .phi→.psi in export text

- [ ] 8. Build verification and ADR
  - _Action:_ `go build ./...` must pass
  - _Action:_ Write ADR-0001 documenting the φ→ψ change
