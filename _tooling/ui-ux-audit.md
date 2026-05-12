# PenOpt UI/UX Audit Report

**Date:** 2026-05-12
**Auditor:** Heuristic evaluation (Nielsen 10 + Krug's 3 laws + Refactoring UI principles)
**Scope:** `index.html` + `style.css` + `state.js` + `optimizer.js` + `scene.js` in the context of the full application flow

---

## Overall Score: **5.5 / 10**

The app has a solid technical foundation and clear visual identity, but suffers from: information architecture gaps, a misleading workflow step system, cramped controls, inconsistent state feedback, accessibility oversights, and missing affordances throughout. Most issues are **correctable** without redesign.

---

## Severity Key

| Rating | Label | Description |
|--------|-------|-------------|
| 4 | **Catastrophic** | Prevents task completion |
| 3 | **Major** | Significant task failure or confusion |
| 2 | **Minor** | Causes delay or frustration |
| 1 | **Cosmetic** | Minor annoyance |

---

## 1. INFORMATION ARCHITECTURE

### 1.1 Step Numbers Create False Promise of Collapsible UI
**Severity: 3 — Major**

The sidebar cards use a numbered step system (1 Upload, 2 Material, 3 Optimize, Advanced Controls) suggesting a linear workflow with collapsible steps. However:
- Cards 1 (Upload) is **always open** and non-collapsible — step number but no chevron
- Cards 2 and 3 (Material, Optimize) **are collapsible** — step number + visible chevron
- Advanced Controls **is collapsible** but has **no step number** — just an open chevron

Users must click Material and Optimize to expand them after each new session. There is no indication that these collapsed cards are part of the step sequence until you notice the numbers.

**Fix:** Either (a) make all numbered cards collapsible and always start them in the correct state (2 and 3 open after mesh load), or (b) remove step numbers and use a clear "Step 1 of 3" progress indicator, or (c) make the step system visually distinct from plain accordion cards.

### 1.2 Wrong Default State After Mesh Load
**Severity: 3 — Major**

After loading a mesh, the Material card (step 2) and Optimize card (step 3) are **collapsed** by default. A user who just loaded a mesh will see:
1. The upload card now shows their mesh info
2. The Material card header shows "2 Material" with a chevron (collapsed)
3. The Optimize card shows "3 Optimize" with a chevron (collapsed)

The natural next action (selecting a material) requires an extra click to expand card 2. The cards should open automatically when relevant state is present.

**Fix:** In `main.js`, after `handlePickedMesh()` completes, automatically open the Material card and the Optimize card. Close the Upload card's expanded state (or leave it — the mesh info display is useful).

### 1.3 Advanced Controls: Too Dense, No Sub-Grouping
**Severity: 2 — Minor**

The Scanner Geometry accordion contains: scanner preset dropdown + 6 number inputs + Ray Sampling slider + Search Range slider + a hint paragraph. That's 8 interactive controls in one section. The Ray Sampling and Search Range sliders are important enough to be first-class controls but are buried.

**Fix:** Split Scanner Geometry into two accordion sections: "Scanner Preset" (dropdown + geometry inputs) and "Search Settings" (Ray Sampling + Search Range). This creates natural grouping and reduces visual density.

### 1.4 Layout Mode D/V/R is Cryptic
**Severity: 2 — Minor**

The three layout buttons use single letters (D, V, R) with tooltips on hover. No label is visible. The average user will not know what D means without tooltip help.

**Fix:** Change to more descriptive labels: `Default` / `Viewport` / `Results`, or use icon-only buttons with visible icons (e.g., a sidebar icon, a maximize icon, a panel icon). At minimum, use two-letter labels: "Dflt", "VP", "Res".

---

## 2. VISIBILITY OF SYSTEM STATUS

### 2.1 Header Pills Have No Labels
**Severity: 2 — Minor**

Three pills in the header show `-- keV`, `-- Tmin`, `-- Eeff`. Before a material is loaded, all three show placeholder dashes. A new user sees three cryptic pills with no explanation of what they mean.

**Fix:** Add a visible label above or beside the pills, or use a smaller `data-tip` tooltip. Or restructure as a single "Beam config" summary pill that expands on click.

### 2.2 No Confirmation for Mesh Removal
**Severity: 3 — Major**

Clicking "Remove" on a loaded mesh removes it immediately with no confirmation dialog. All results are also cleared. This is a destructive action with no recovery path.

The code in `filehandler.js` has the confirmation check, but only if `S.result` is set — if no result exists, removal is instant.

**Fix:** Always show a confirmation dialog ("Remove mesh and clear results?") before removal. The `confirm()` call should be unconditional.

### 2.3 Missing Action Feedback for Important Buttons
**Severity: 2 — Minor**

The "Update Search" button in the Tradeoff card and the "Restore" button in the restore banner have no loading state or feedback when clicked. The user clicks and waits, not knowing if the action was registered.

**Fix:** Show a subtle `opacity: 0.7` or spinner state on click until the action resolves.

### 2.4 No Toast Confirmation for Save Actions
**Severity: 1 — Cosmetic**

Exporting JSON or PNG produces no visible confirmation. The download starts silently. The user may not notice it succeeded.

**Fix:** Add a brief in-app toast ("Results saved" for 2s) or change the button text momentarily ("Saved!").

---

## 3. VISUAL HIERARCHY & SPACING

### 3.1 Results Summary Bar: Mixed Language Creates Cognitive Load
**Severity: 2 — Minor**

The summary bar contains: "Optimal", "Energy", "f_mtl Δ", "f_energy Δ", evaluation count. The use of Greek letters (θ, φ) mixed with English words ("Energy", "Delta") and subscript notation ("f_mtl") is jarring.

More critically: "f_mtl Δ" and "f_energy Δ" show **percentage improvement vs worst orientation** — but the Δ symbol doesn't clarify direction. A negative Δ means improvement, but users may read negative as bad.

**Fix:** Use "f_mtl" → "Penetration" or "f_mtl" with a proper label. Use a visual indicator for direction (a green down-arrow for improvement, red up-arrow for degradation). Consider renaming to "Max Penetration" and "Energy Demand" for broader accessibility.

### 3.2 Results Cards Layout: Auto-Fit Causes Inconsistent Widths
**Severity: 1 — Cosmetic**

`grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` produces 2-column layouts on medium screens that look unbalanced when IntelliScan and Tradeoff cards are hidden.

**Fix:** Use `auto-fill` instead of `auto-fit`, or explicitly define 2-column layout at certain breakpoints and single column at others.

### 3.3 Line Height Too Tight for Body Text
**Severity: 1 — Cosmetic**

`line-height: 1.5` on the body (`html, body`). For technical content with mixed monospace text and data, `line-height: 1.6` would improve readability.

### 3.4 Scanner Geometry Number Inputs Are Too Narrow
**Severity: 2 — Minor**

Scanner number inputs are constrained to 72px (`width: 72px`). Typical values like "1024" or "0.01" can overflow or cause horizontal scroll within the input. The spinner arrows on number inputs are also hard to hit.

**Fix:** Increase to 80-88px. Use `font-size: 12px` for better legibility of long numbers.

### 3.5 Pre-Filter Grid: 4 Columns Too Tight
**Severity: 1 — Cosmetic**

4-column filter grid at `--sidebar-w: 320px` gives ~75px per column after gaps and padding. The filter name text (e.g., "Al 1mm") may overflow.

**Fix:** Reduce to 3 columns, or make the grid wrap naturally with `auto-fill minmax(70px, 1fr)`.

---

## 4. RECOGNITION RATHER THAN RECALL

### 4.1 No Current Material Indicator in Material Grid
**Severity: 2 — Minor**

When a material is active, the grid item gets a blue border (`border-color: var(--accent)`). However, the active item is **not scrolled into view** when the Material card opens, and there's no visible label in the card header showing the currently selected material name.

The header for the Material card just says "2 Material" with no indication of "Aluminum (selected)" or similar.

**Fix:** Show the selected material name in the card header or in a subtitle: "Material: Aluminum". Scroll active item into view when the card opens.

### 4.2 Scanner Preset Doesn't Update the Accordion Summary Value
**Severity: 2 — Minor**

When a scanner preset is selected, the `acc-scanner-val` shows the SDD/SOD ratio (e.g., "1000/700") — but this is the value from the **number inputs**, not from the preset name. If a user selects "Nikon XT H 225", the accordion header still shows "800/500" (which is correct), but there's no text indication of *which* preset is active.

**Fix:** Update `acc-scanner-val` to show the preset name (e.g., "Nikon XT H 225") when a preset is selected, and fall back to the geometry values when on Custom.

### 4.3 Search Range Slider: No Inline Value Display
**Severity: 1 — Cosmetic**

The slider label area shows "Search Range (±°)" on the left and "45°" value on the right — this is correct. However, the hint text below ("Optimizer tilt/rotation limits...") provides no additional numeric feedback. On sliders with large ranges (30°–75°), the user must look at the small number display.

**Fix:** Make the value display larger or add a secondary tick-mark display.

---

## 5. ERROR PREVENTION & RECOVERY

### 5.1 Restore Banner Has No "Dismiss Without Restoring" Path
**Severity: 1 — Cosmetic**

The restore banner has "Restore" and "×" (dismiss) buttons. The × button is small (14px) and easily missed. There's no "Don't ask again" option, so it reappears on every session reload if localStorage has data.

**Fix:** Make the × button larger and clearer, or add a "Dismiss" text link. Consider a "Don't show again" checkbox for power users.

### 5.2 Non-Watertight Mesh Warning: Easy to Miss
**Severity: 3 — Major**

The watertight warning banner appears at the top of the viewport, but if the user scrolls or if the viewport is small, it can be missed. The word "watertight" is also jargon — a general user won't know what it means or why it matters for their results.

**Fix:** Add a plain-language explanation inline in the warning: "Mesh has open edges — penetration values are underestimated. Consider checking your mesh in Meshmixer or NetFabb before trusting results." Also show the warning in the sidebar's file meta section (not just as a floating banner).

### 5.3 Tuy Completeness Warning Buried in Card Body
**Severity: 2 — Minor**

The Tuy completeness warning (when below 90%) appears as a dynamically injected `<div>` after the opt-angles element. If the warning is not triggered (Tuy is good), the user never sees the metric. There's no persistent display of Tuy completeness in the results.

**Fix:** Add Tuy completeness to the results summary bar, alongside f_mtl and f_energy. Show it as a percentage with a color indicator (green >90%, amber 70-90%, red <70%).

---

## 6. CONSISTENCY & STANDARDS

### 6.1 Hardcoded Colors in SVG Logo
**Severity: 1 — Cosmetic**

The logo SVG uses `fill="#3b82f6"` hardcoded inline, not a CSS variable. If the accent color changes, the logo won't update.

**Fix:** Apply the SVG as an inline element with `currentColor` or a CSS variable, or use an `<img>` with the SVG as a source.

### 6.2 Inline Styles Scattered Throughout HTML
**Severity: 1 — Cosmetic**

Multiple elements use inline `style=` attributes for things that should be in CSS:
- `style="margin-top:6px;..."` on restore-banner
- `style="color:var(--green-500)"` on disp-tmin
- `style="margin-top:8px;..."` on optimize button
- `style="padding:0"` on plot card body

**Fix:** Move all recurring patterns to CSS classes. Use a systematic approach (e.g., `.mt-2`, `.text-green`, `.p-0`).

### 6.3 Mixed Use of `accent` Class and `var(--accent)` in Color Values
**Severity: 1 — Cosmetic**

Some elements use `.accent { color: var(--accent); }`, others use `color: var(--accent)` directly. The `.accent` class is defined but used in only a few places.

**Fix:** Establish a rule: use CSS classes for all color applications. Define semantic classes: `.text-primary`, `.text-success`, `.text-warning`, etc.

---

## 7. FLEXIBILITY & EFFICIENCY

### 7.1 No Way to Hide Sidebar for Full-Width Viewport
**Severity: 2 — Minor**

The layout buttons allow hiding the results panel (V = viewport only) and hiding the sidebar + results (R = results only). But there's no "sidebar hidden, viewport only" mode. For users who want to focus on the 3D view with a wider canvas, the options are limited.

**Fix:** Add a fourth layout mode, or change the "R" mode to "sidebar + results" and add "viewport + results" as a distinct mode.

### 7.2 No Keyboard Shortcut for View Mode Toggle
**Severity: 1 — Cosmetic**

View modes (3D/Heatmap/Compare) can be switched with keys 1/2/3, but there's no shortcut to cycle through them. Also, the `f` key toggles fullscreen but `F` (uppercase) is also accepted — this is fine but should be documented.

---

## 8. AESTHETIC & MINIMALIST DESIGN

### 8.1 Step Number Badges Create Visual Noise in Advanced Controls
**Severity: 1 — Cosmetic**

Cards 1–3 have step number badges. Advanced Controls has none, which is correct. However, the visual weight of the step badges (blue circle, 18px diameter) competes with the card head text.

**Fix:** If keeping step numbers, reduce badge size to 14–16px and reduce its visual prominence. Consider moving step numbers into the card head text itself ("Step 1 · Upload") rather than as separate elements.

### 8.2 Grid Info Text "~30s-2min" Is Vague
**Severity: 1 — Cosmetic**

The `grid-info` div shows "32² rays · coarse + fine · ~30s-2min" as static text. After the user changes the ray sampling slider, this text is not updated to reflect the new expected time.

**Fix:** Update the grid-info text dynamically when the ray sampling slider changes. E.g., "8×8 coarse / 16×16 fine · ~20s-1m".

### 8.3 Idle Prompt Opacity Too Low
**Severity: 1 — Cosmetic**

`ip-icon { opacity: 0.25 }` — at 25% opacity, the idle prompt upload icon is barely visible. On certain display setups it may be nearly invisible.

**Fix:** Increase to 0.35–0.4. The icon should be visible enough to communicate "this is where you drop files" without competing with a loaded mesh.

---

## 9. HELP & DOCUMENTATION

### 9.1 Help Modal Content Has Outdated Information
**Severity: 2 — Minor**

The Help modal's "How It Works" section mentions "five objectives (penetration, energy, uniformity, Tuy, beam-hardening)" — but beam-hardening is a placeholder (value = 0), not an active objective. The weights presets are shown as controlling 5 weights, but the frontend only sends 3 active weights.

**Fix:** Update the help modal content to match the actual 3-active-objective system. Remove mentions of f_bh as an active objective.

### 9.2 Help Modal Says "1-7" Steps But UI Has 3 Steps + Advanced
**Severity: 1 — Cosmetic**

The help lists steps 1–7 as numbered paragraphs. The UI has steps 1–3 and then "Advanced Controls". The numbering mismatch is confusing.

**Fix:** Align the help content structure with the actual UI sections.

---

## 10. ACCESSIBILITY

### 10.1 Tooltips Rely on Hover — Excludes Keyboard Users
**Severity: 3 — Major**

All `[data-tip]` attributes show tooltips only on `:hover`. Keyboard users navigating with `Tab` will never see these tooltips. The `data-tip` attribute is also non-standard (it's a data attribute, not an ARIA attribute).

**Fix:** Add `data-tooltip` using `aria-describedby` + a visually-hidden tooltip element, or use a proper tooltip library. At minimum, ensure the `:focus-visible` state also triggers the tooltip.

### 10.2 Missing Focus Styles on Custom Interactive Elements
**Severity: 2 — Minor**

Many custom elements (filter-btn, mat-item, tradeoff-stop, method-btn, plot-tab) use `<div>` or `<span>` or `<button>` without explicit focus indicators. The CSS only has `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` but this may not apply to all interactive elements.

**Fix:** Audit all interactive elements and ensure `:focus-visible` styles are present and visible. Test with keyboard-only navigation.

### 10.3 Color Contrast on Amber Tint Backgrounds
**Severity: 2 — Minor**

Amber warning elements (`#wt-banner`, `.is-warning`) use `background: rgba(245, 158, 11, 0.12)` with `color: var(--amber-500)`. The contrast ratio of amber-500 on this tinted background is approximately 2.85:1 — **below the 4.5:1 WCAG AA threshold**.

**Fix:** Use `--amber-300` (lighter amber) for text on amber-tint backgrounds, or darken the background tint to improve contrast. Example: `background: rgba(245, 158, 11, 0.20)` or `color: #fcd34d`.

---

## 11. DESIGN SYSTEM CONSISTENCY

### 11.1 No Semantic Color Classes
**Severity: 2 — Minor**

The CSS defines semantic variables (`--green-500`, `--red-500`, `--amber-500`) but no corresponding utility classes. Every color application is either a direct variable reference or a one-off class like `.accent`.

**Fix:** Add semantic utility classes:
```css
.text-success { color: var(--green-500); }
.text-warning { color: var(--amber-500); }
.text-error { color: var(--red-500); }
.bg-success { background: var(--green-tint); }
.bg-warning { background: var(--amber-tint); }
.bg-error { background: var(--red-tint); }
```

### 11.2 No Spacing Utility Classes
**Severity: 1 — Cosmetic**

Despite defining a spacing scale (`--sp-1` through `--sp-12`), there are no corresponding utility classes. Every margin/padding must be applied inline or via ad-hoc CSS selectors.

**Fix:** Add spacing utilities:
```css
.mt-1 { margin-top: var(--sp-1); }
.mt-2 { margin-top: var(--sp-2); }
.p-3 { padding: var(--sp-3); }
/* etc. */
```

---

## 12. POSITIVE FINDINGS

The following are working well and should be preserved:

- **Skeleton loading states** in the material grid — correct UX pattern
- **Progress ring overlay** — visually clear, excellent design
- **Animated mesh rotation** with ease-out cubic — feels premium
- **Heatmap legend** with gradient canvas generation — clever and functional
- **Smooth accordion animations** using grid-template-rows — performant and jank-free
- **Session persistence** (results, search range, collapsed state) — excellent for returning users
- **Watertight status dot** in file meta — clear and scannable
- **Filter grid with colored material swatches** — excellent for quick scanning
- **Help modal with backdrop blur** — feels modern and intentional
- **Reduced motion support** — respects user preferences
- **Custom scrollbar styling** — consistent with dark theme
- **Status dot pulse animation** during search — clear state feedback
- **`tab-size: 2` on pre/code elements** — readable code display
- **Scanner presets with full geometry** — comprehensive coverage
- **Stagger animations on result cards** — feels alive

---

## Priority Summary

| Priority | Issues |
|----------|--------|
| **Fix immediately** | 2.2 (mesh removal confirmation), 5.2 (watertight warning clarity), 10.1 (tooltip keyboard access), 1.1 (step number system), 1.2 (default card states) |
| **Fix soon** | 1.3 (scanner section split), 1.4 (layout button labels), 2.1 (header pill labels), 4.1 (material selection indicator), 4.2 (preset name in header), 6.1 (SVG colors), 10.3 (amber contrast) |
| **Fix if time** | 3.1 (summary bar language), 3.2 (card grid layout), 4.3 (slider value display), 7.1 (sidebar hidden mode), 8.2 (grid info dynamic), 11.1 (semantic color classes) |
| **Nice to have** | 2.4 (toast confirmations), 3.3 (line height), 3.4 (input widths), 3.5 (filter grid columns), 8.1 (badge size), 8.3 (idle prompt opacity), 9.1 (help content accuracy), 11.2 (spacing utilities) |