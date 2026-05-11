# UI Makeover — Redesign Proposal

**Based on:** Current State Audit  
**Target:** Fix 7 remaining critical bugs, polish UX, get to 9/10

---

## Fix Plan (ordered by impact)

### 🔴 Critical Fixes

#### Fix 1: Cards stop shrinking + overflow clipping

**Problem:** Two CSS issues combine to cause the worst UX problem:
1. `.card { overflow: hidden }` clips content when card body is tall
2. Cards are flex items in sidebar with `flex-shrink: 1` — they compress to fit

**Fix:**
```css
.card {
  flex-shrink: 0;           /* Don't shrink cards to fit sidebar */
  overflow: visible;        /* Don't clip accordion body content */
}
```

**Why:** `flex-shrink: 0` prevents cards from shrinking when total card height > sidebar height — the sidebar's `overflow-y: auto` handles scrolling of the whole sidebar instead. `overflow: visible` lets accordion bodies grow freely.

---

#### Fix 2: Tradeoff card visibility after re-optimize

**Problem:** `removeMesh()` calls `$('card-tradeoff').style.display = 'none'` but `showResults()` never clears it, so after removing + re-optimizing, the tradeoff card stays hidden.

**Fix in `optimizer.js`:**
In `showResults()`, add `$('card-tradeoff').style.display = ''` before removing `tradeoff-disabled`.

Or better: don't use inline styles for hiding — use `.hidden` class consistently. In `removeMesh()`, change `style.display = 'none'` to `classList.add('hidden')`. In `showResults()`, change `classList.remove('tradeoff-disabled')` to `classList.add('hidden', false)` — wait that doesn't work either.

Cleanest fix: In `showResults()`, explicitly set `style.display = ''` on the tradeoff card before enabling it.

---

#### Fix 3: Advanced card initial state

**Problem:** `#card-advanced` has class `open` on the card element but `.collapsed` on its body. First click unexpectedly closes it.

**Fix in `index.html`:**
Remove `.collapsed` from `#body-advanced` since the card starts `.open`.

---

#### Fix 4: Results collapse button titles

**Problem:** Button title setter logic is inverted — collapsed shows "Collapse results" instead of "Expand results".

**Fix in `main.js`:**
Swap the title strings in the collapse toggle handler.

---

### 🟡 Layout Polish

#### Fix 5: Firefox scrollbar styling

```css
/* Add to style.css */
#sidebar {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
```

---

#### Fix 6: Plot canvases responsive height

**Problem:** `canvas { height: 160px }` is hardcoded.

**Fix:** Use a percentage of available space or a `max-height` with `flex:1`.

Better approach: Make the plot tabs container flex-based:

```css
.plot-content canvas {
  width: 100%;
  height: 100%;
  min-height: 120px;
  max-height: 300px;
  display: block;
}
```

---

#### Fix 7: Visible focus styles

Add focus-visible ring for keyboard accessibility:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

### 🔵 UX Enhancements

#### Fix 8: Smooth collapse on results panel

Replace abrupt `display: none/''` with a height-based transition.

**Approach:** Since transitioning `height: auto` isn't possible without JS, we can use `max-height` transition:

```css
#results-content {
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 250ms ease-out;
}
#results-content.collapsed {
  max-height: 0;
  padding: 0;
}
```

But this creates a layout issue with padding. Simpler: just `display: none` is fine for this case — the abruptness isn't a major issue for a utility panel.

---

## Summary of Changes

| File | Changes |
|------|---------|
| `style.css` | Remove `overflow:hidden` from `.card`, add `flex-shrink:0`, Firefox scrollbar, focus-visible styles, plot canvas sizing |
| `optimizer.js` | Fix tradeoff card visibility after re-optimize |
| `main.js` | Fix collapse button title logic |
| `index.html` | Fix advanced card initial collapsed state |

---

## Verification Checklist

- [ ] Cards don't shrink in sidebar when sidebar is short
- [ ] Accordion bodies fully visible when expanded
- [ ] Tradeoff card visible after remove + re-optimize
- [ ] Advanced card starts open, first click collapses it
- [ ] Results collapse button shows correct title
- [ ] Firefox shows thin scrollbar on sidebar
- [ ] Focus ring visible on all interactive elements
- [ ] Plot canvases fill available space
