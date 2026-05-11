# Deep UI Investigation Report

**Date:** 2026-05-12  
**Scope:** Full layout, scroll, overflow, and performance analysis

---

## 🔴 CRITICAL FINDINGS

### 1. Continuous rAF Loop — THE Performance Killer

**Location:** `frontend/src/scene.js:43`

```js
function animate() {
  S.animFrame = requestAnimationFrame(animate);
  S.controls?.update();
  S.renderer?.render(S.scene, S.camera);
}
```

**Problem:** This runs at **60fps non-stop**, even when nothing is happening. When the user scrolls the sidebar:
- The browser fires scroll events
- But the main thread is busy running a full Three.js render pass every 16ms
- The Two.js orbit controls also run their damping update
- Result: **scroll jank** because the browser's compositor thread is fighting with the rAF queue

**Why the user specifically feels it in the left pane:** The left sidebar is a native scroll container (`overflow-y: auto`). Native scrolling tries to stay on the compositor thread, but if JavaScript (`requestAnimationFrame`) is constantly queuing work, the main thread gets saturated and scroll events are delayed.

**Fix:** Stop continuous rendering. Use `renderer.setAnimationLoop()` only when needed, or use `controls.addEventListener('change', render)` pattern.

---

### 2. Double Scrollbar in Sidebar — CSS Conflict

**Location:** `frontend/src/style.css:86-90 + 176-180`

```css
/* Global: legacy WebKit scrollbar styling */
::-webkit-scrollbar { width: 6px; height: 6px; }

/* Sidebar: new standard scrollbar control */
#sidebar {
  overflow-y: auto;
  scrollbar-gutter: stable;     /* Always reserves 6px */
  scrollbar-width: thin;         /* Standard property (Firefox, Chrome 131+) */
  scrollbar-color: var(--border) transparent;  /* Standard property */
}
```

**Root cause:** On **Chrome 131+**, the browser now supports both the old `::-webkit-scrollbar` pseudo-element API AND the new `scrollbar-width` / `scrollbar-color` standard API simultaneously.

What happens:
1. `scrollbar-gutter: stable` pre-reserves a 6px scrollbar lane → creates an empty track
2. `overflow-y: auto` creates a scrollbar when content overflows
3. `::-webkit-scrollbar { width: 6px }` styles the thumb to 6px
4. `scrollbar-width: thin` tells the browser to use a "thin" scrollbar

**Result:** The browser renders TWO scrollbar tracks — one from the `::-webkit-scrollbar` API and one from the `scrollbar-width` standard API — because Chrome hasn't fully reconciled the two APIs. On the sidebar's right edge, this looks like a double-width scrollbar or two overlapping scrollbars.

**Also:** `scrollbar-gutter: stable` makes the track always visible (even when content doesn't overflow), which users perceive as a "ghost" scrollbar that never goes away.

**Fix:** Remove `::-webkit-scrollbar` global styling (it's deprecated) and rely solely on `scrollbar-width` / `scrollbar-color`. Move to per-element scrollbar control.

---

## 🟡 HIGH-IMPACT FINDINGS

### 3. Nested Scrollable Areas in Results Panel

**Location:** `frontend/src/style.css:843 + 906`

```css
#results-content { overflow-y: auto; }        /* ← Scrollbar level 1 */
.res-card          { overflow: hidden; }
.rc-body           { overflow-y: auto; }       /* ← Scrollbar level 2 (per card!) */
```

Every `.res-card` has a scrollable `.rc-body`. This means:
- The results panel has a main scrollbar (for all results)
- AND each individual result card has its own scrollbar
- If a card body overflows, its scrollbar appears INSIDE the panel, visually overlapping with the panel's scrollbar

**Impact:** Users see multiple scrollbars stacked. The card scrollbars sit inside the main results scrollbar, creating a confusing nested-scroll experience.

**Fix:** Remove `overflow-y: auto` from `.rc-body`. Let the card content grow naturally and let the main `#results-content` scroll handle overflow.

---

### 4. backdrop-filter Usage on 6 Elements

| Element | Filter | Line |
|---------|--------|------|
| `#wt-banner` | `blur(8px)` | 661 |
| `.btn-reset-float` | `blur(4px)` | 710 |
| `#heatmap-legend` | `blur(4px)` | 774 |
| `#compare-info` | `blur(4px)` | 796 |
| `#help-overlay` | `blur(4px)` | 1079 |
| `.btn-reset-float` (results) | `backdrop-filter` | — |

**Problem:** `backdrop-filter: blur()` forces the browser to:
1. Composite the element
2. Render the background behind it
3. Apply a blur
4. Layer it on top

During scroll, the browser must repaint all these composited layers, causing repaints on every scroll frame. This compounds with the rAF performance issue.

**Fix:** Use a solid semi-transparent background instead of backdrop-filter where possible. Reserve blur for the help overlay only (modal, no scroll underneath).

---

### 5. `overflow: hidden` on `.res-card` Clips Card Content

```css
.res-card { border-radius: var(--radius-md); overflow: hidden; }
```

When `.rc-body` has content that overflows, `overflow: hidden` on the parent clips it to the border-radius. This is intentional for visual polish, but it means the scrollbar INSIDE `.rc-body` gets clipped to 6px corners, potentially hiding the scrollbar bottom/top.

**Fix:** Move `overflow: hidden` from `.res-card` to `.res-card .rc-body:last-child` or remove it entirely. Let border-radius simply be visual.

---

### 6. Inconsistent sidebar layout — Cards don't fill width

```css
#sidebar { display: flex; flex-direction: column; gap: var(--sp-2); }
.card    { /* width determined by content */ }
```

Cards inside the sidebar flex column don't explicitly stretch to `width: 100%`. While flex defaults stretch items, the `overflow-x: hidden` on sidebar and `max-width: 180px` on `.fm-name` can cause content to be squished or overflow in unexpected ways.

**Fix:** Add `width: 100%` to `.card`.

---

## 🟢 MINOR FINDINGS

### 7. Plot canvases don't respond to results panel resize
`plot-content canvas { max-height: 300px }` limits canvas height even when results panel is tall.

### 8. Scrollbar styling not consistent across browsers
- Firefox: `scrollbar-width: thin` works ✅
- Chrome 131+: conflicts between `::-webkit-scrollbar` and `scrollbar-width` ❌
- Safari: only `::-webkit-scrollbar` works, `scrollbar-width` ignored → fine ✅
- Chrome <131: `::-webkit-scrollbar` works, `scrollbar-width` ignored → fine ✅

---

## Summary of Fixes (Priority Order)

| # | Fix | File | Effort |
|---|-----|------|--------|
| 1 | **Stop continuous rAF** — render only when controls change | `scene.js:43` | Small |
| 2 | **Remove `::-webkit-scrollbar`** — use standard `scrollbar-width`/`scrollbar-color` only | `style.css:86` | Tiny |
| 3 | **Remove `scrollbar-gutter: stable`** — let scrollbar appear/disappear naturally | `style.css:178` | Tiny |
| 4 | **Remove `overflow-y: auto` from `.rc-body`** — single scrollbar in results panel | `style.css:906` | Tiny |
| 5 | **Add `width: 100%` to `.card`** — consistent sidebar card sizing | `style.css:193` | Tiny |
| 6 | **Replace `backdrop-filter` blurs** with solid semi-transparent backgrounds | `style.css` (x5) | Small |
| 7 | **Remove `overflow: hidden` from `.res-card`** — let content flow naturally | `style.css:886` | Tiny |

---

## Scrollbar Architecture (Before vs After)

### Before (current)
```
┌─ SIDEBAR ─────────────────────┐
│  ┌─ Card ─────────────────┐▐  │  ← scrollbar track (always visible via stable)
│  │  Content...             │▐  │  ← scrollbar thumb (when overflow)
│  │                         │▐  │
│  └─────────────────────────┘  │
│  ┌─ Card ─────────────────┐▐  │
│  │  Long content...        │▐  │
│  │  More content...        │▐  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### After (fixed)
```
┌─ SIDEBAR ─────────────────────┐
│  ┌─ Card ───────────────────┐ │  ← no permanent track
│  │  Content...               │ │  ← thin scrollbar appears only on overflow
│  │                           │ │
│  └───────────────────────────┘ │
│  ┌─ Card ───────────────────┐ │
│  │  Long content...          │ │
│  │  More content...          │ │
│  └───────────────────────────┘ │
└───────────────────────────────┘
   ↑ thin scrollbar appears here when needed
```
