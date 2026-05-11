# PenOpt — Batch B + C: UI Polish & 3D Scene

---

## Batch B: High-Impact UI Items

### B1. Tooltips (16 `data-tip` attributes, zero CSS)
The HTML has `data-tip="..."` on 16 elements but no CSS renders them.
**Fix:** Add `::after` pseudo-element tooltip CSS that activates on hover.

### B2. Verify Energy Recommendation Card
Code in `optimizer.js` calls `CalcEnergyRecommendation()` and populates `#energy-val`, `#energy-qual`, `#energy-savings`. Looks complete — just needs runtime verification.

### B3. Verify Export Buttons
`export.js` has working JSON blob download and PNG composite capture. Functions are wired in `setupExport()`. Looks complete.

### B4. Verify Quality vs Energy Tradeoff
Card with `tradeoff-stop` buttons, method selector, and `#btn-update-search`. Backend handles re-running with new weights. Wired in `setupTradeoff()`. Looks complete.

### B5. State Badges
`os-dot` with `os-dot--idle/ready/searching` classes + CSS animation. Works.

---

## Batch C: 3D Scene Polish

### C1. Better Lighting
Current: AmbientLight + 2 DirectionalLights.
**Improvements:**
- Add HemisphereLight for sky/ground color
- Increase ambient intensity slightly (0.5 → 0.6)
- Soften directional shadows for more depth

### C2. Nicer Mesh Materials
Current: `MeshStandardMaterial` with metalness/roughness.
**Improvements:**
- Use `MeshPhysicalMaterial` for better PBR
- Add subtle `clearcoat` for surfaces
- Add `envMapIntensity` for reflections
- Keep the blue accent color but with more depth

### C3. Smooth Rotation Transition
Current: `S.meshObject.rotation.x = best.theta * DEG` — instant snap.
**Improvement:** Animate the rotation using `requestAnimationFrame` interpolation over 400ms with ease-out.

### C4. Scene Background Gradient
Current: Solid `0x0c0e14`.
**Improvement:** Subtle gradient or slightly lighter bottom for depth perception.

### C5. Grid & Axes Polish
Current: Standard GridHelper + AxesHelper.
**Improvement:** 
- Thinner grid lines
- Fainter axis helpers
- Maybe a subtle floor reflection

---

## Implementation Order

1. **B1: Tooltip CSS** (5 min, high impact)
2. **C1: Better lighting** (5 min)
3. **C2: Nicer materials** (10 min)
4. **C3: Smooth rotation** (15 min)
5. **C4: Background** (2 min)
6. **C5: Grid polish** (5 min)

**Estimated: ~42 min total**
