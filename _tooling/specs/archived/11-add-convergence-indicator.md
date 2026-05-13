# Spec 11: Add Convergence Indicator to Results

**Gap analysis ref**: F5  
**Packages**: `internal/search/`, `frontend/`  
**Depends on**: Nothing  
**Effort**: ~30 lines across backend and frontend

---

## 1. Paper Ground Truth

A grid search over discretised (θ, φ) with coarse→fine refinement (Ito 2020) produces a ranked list of candidates. The optimal orientation is the one with the lowest combined score. The reliability of this result depends on:

- How much better the best orientation scores vs. the second-best (the "score gap")
- Whether the top-3 refined candidates converged to the same neighborhood
- Whether the best orientation is near the search boundary (constrained optimum)

The last two are already computed (`ConstrainedOptimum`, `CoarseFineMismatch`). The score gap is not.

## 2. Current Code Behaviour

The results panel shows only the best and worst orientations. There's no indication of:

- How close the runner-up is to the best
- Whether the top-3 refined candidates cluster in the same region
- A confidence level in the result

## 3. Correct Behaviour

Add to the results display:
- **Score gap**: The difference between best and second-best normalized score. A gap < 0.05 means the two orientations are nearly tied — the user should consider both.
- **Top-3 spread**: The angular distance between the best and third-best refined candidates. If spread > 10°, the search found multiple distinct local optima — the result is less reliable.

## 4. Implementation

### 4.1 Backend: Add convergence data to Result

**File**: `internal/search/search.go`

```go
type Result struct {
    // ... existing fields ...
    ScoreGap        float64 `json:"scoreGap"`        // difference between best and 2nd-best score
    Top3Spread      float64 `json:"top3Spread"`      // max angular distance among top 3 (degrees)
    ConvergenceNote string  `json:"convergenceNote,omitempty"`
}
```

Compute in `Run()` after sorting:

```go
// Compute convergence metrics
if len(allScores) >= 2 {
    result.ScoreGap = allScores[1].Score - allScores[bestIdx].Score
}
if len(allScores) >= 3 {
    // Find top 3 distinct non-best orientations by score
    top3 := []OrientationScore{allScores[bestIdx]}
    for _, s := range allScores {
        if len(top3) >= 3 { break }
        if s.Theta != allScores[bestIdx].Theta || s.Phi != allScores[bestIdx].Phi {
            top3 = append(top3, s)
        }
    }
    if len(top3) >= 3 {
        // Max angular distance among top 3
        maxDist := 0.0
        for i := 0; i < 3; i++ {
            for j := i+1; j < 3; j++ {
                d := angularDistance(top3[i].Theta, top3[i].Phi, top3[j].Theta, top3[j].Phi)
                if d > maxDist { maxDist = d }
            }
        }
        result.Top3Spread = maxDist
    }
}

if result.ScoreGap < 0.01 {
    result.ConvergenceNote = "Best and runner-up are nearly tied. Consider the top 2 orientations."
}
if result.Top3Spread > 10 {
    note := fmt.Sprintf("Top 3 orientations span %.0f° — multiple local optima found.", result.Top3Spread)
    if result.ConvergenceNote != "" {
        result.ConvergenceNote += " " + note
    } else {
        result.ConvergenceNote = note
    }
}
```

Helper function:

```go
func angularDistance(t1, p1, t2, p2 float64) float64 {
    // Simple Euclidean in (θ, φ) space — not true great-circle but fine for small angles
    return math.Sqrt((t1-t2)*(t1-t2) + (p1-p2)*(p1-p2))
}
```

### 4.2 Frontend: Display convergence info

**File**: `frontend/src/optimizer.js`, in `showResults()`:

```js
// Convergence indicator
if (result.scoreGap !== undefined) {
    var gapEl = $('rs-score-gap');
    if (!gapEl) {
        gapEl = document.createElement('div');
        gapEl.id = 'rs-score-gap';
        gapEl.style.cssText = 'margin-top:4px;font-size:9px;color:var(--text-dim);';
        $('rs-evals').parentElement.appendChild(gapEl);
    }
    var gapPct = (result.scoreGap * 100).toFixed(1);
    var gapText = 'Score gap vs runner-up: ' + gapPct + '%';
    if (result.convergenceNote) {
        gapText += ' — ' + result.convergenceNote;
    }
    gapEl.textContent = gapText;
}
```

## 5. Validation

1. Run optimization on a box mesh (should have clear single optimum)
2. Verify score gap > 0.05 (clear winner)
3. Verify top-3 spread < 5° (converged)
4. Run on a sphere mesh (all orientations equally good)
5. Verify very small score gap, and convergence note appears
