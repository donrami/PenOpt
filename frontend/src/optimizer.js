// Optimizer — search lifecycle, progress, results, IntelliScan, heatmap loading
import { S, $, qsa, DEG, WEIGHT_PRESETS, TUBE_BIAS_BAND_KV, TUBE_COMFORT_MARGIN_KV, showError, setStatus, invalidateResults, clearStaleResults } from './state.js';
import { applyHeatmap, animateRotation } from './scene.js';
import { recalcBeam } from './materials.js';
import { RunOptimization, ComputeFaceHeatmap, CalcEnergyRecommendation } from '../wailsjs/go/main/App';
import { drawContourPlot, drawPenetrationRose } from './plots.js';
import { exportJSON, exportPNG } from './export.js';

const runtime = window.runtime;

// ── Energy Card Constants ──
const KV_THRESHOLDS = {
  LOW_MAX: 100,
  MEDIUM_MAX: 300,
  CEILING: 500,
};
const MARGIN_THRESHOLDS = {
  LOW: 1.10,
  AMPLE: 2.0,
};

// ── Optimization ──
export function runOptimization() {
  if (!S.meshLoaded || S.searching) return;
  S.searching = true; S.searchCancel = false;
  // Clear stale state — fresh optimization is starting
  clearStaleResults();

  // Show search UI
  $('btn-optimize').disabled = true; $('btn-optimize').innerHTML = '\u25B6 Searching...';
  $('vp-progress').classList.remove('hidden'); $('results-panel').classList.remove('hidden');
  $('results-panel').classList.remove('collapsed');
  // Sync collapse button state to expanded
  var rcb = $('results-collapse-btn');
  if (rcb) {
    rcb.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
    rcb.setAttribute('aria-label', 'Collapse results');
  }
  $('vp-search-overlay').classList.remove('hidden');
  clearResultsContent();
  $('os-dot').className = 'os-dot os-dot--searching'; $('os-text').textContent = 'Searching...';
  $('progress-fill').style.width = '0%';
  setStatus('Grid search in progress...');

  const w = WEIGHT_PRESETS[S.weightPreset];

  // Listen for progress events — batched through rAF to avoid layout thrash
  S._progressTickPending = false;
  runtime.EventsOn('search:progress', function(data) {
    if (S.searchCancel) return;
    S._lastProgressData = data;
    if (!S._progressTickPending) {
      S._progressTickPending = true;
      requestAnimationFrame(function() {
        S._progressTickPending = false;
        var d = S._lastProgressData;
        if (!d) return;
        $('progress-fill').style.width = d.pct + '%';
        $('progress-label').textContent = Math.round(d.pct) + '%';
        var thetaMatch = d.label?.match(/θ=([\d.]+)/);
        var phiMatch = d.label?.match(/φ=([\d.]+)/);
        if (thetaMatch && phiMatch) {
          $('hud-rot').innerHTML = '\u03B8: ' + thetaMatch[1] + '\u00B0 \u03C6: ' + phiMatch[1] + '\u00B0';
        }
      });
    }
  });

  // Listen for done event
  runtime.EventsOn('search:done', function(data) {
    // Clean up event listeners
    runtime.EventsOff('search:progress');
    runtime.EventsOff('search:done');

    if (S.searchCancel) { finishSearch('cancel'); return; }

    if (data.error) {
      showError('Optimization error: ' + data.error);
      finishSearch('error');
      return;
    }

    try {
      const result = JSON.parse(data.result);
      S.result = result;
      // Fresh results — clear stale state
      clearStaleResults();
      showResults(result);
      renderIntelliScan(result);
      // Redraw rose with IntelliScan ticks
      var bestProj = result.bestOrientation && result.bestOrientation.maxPerProjection;
      var worstProj = result.worstOrientation && result.worstOrientation.maxPerProjection;
      if (bestProj && bestProj.length >= 2 && result.intelliScan) {
        drawPenetrationRose(bestProj, worstProj, result.isPartial, null, result.intelliScan.angles);
      }
      loadHeatmap(result);

    } catch (err) {
      showError('Result parse error: ' + err.message);
    }
    finishSearch('success');
  });

  // Start the search (returns "started" immediately, results via events)
  RunOptimization({ weights: [w.wMtl, w.wEnergy, w.wHdn, w.wTuy, w.wBh], method: S.method })
    .catch(function(err) {
      if (!S.searchCancel) showError('Failed to start search: ' + err);
      runtime.EventsOff('search:progress');
      runtime.EventsOff('search:done');
      finishSearch('error');
    });
}

function finishSearch(outcome) {
  // outcome: 'success' | 'cancel' | 'error'
  S.searching = false;
  $('btn-optimize').disabled = false; $('btn-optimize').innerHTML = '\u25B6 <span>Optimize</span>';
  $('vp-progress').classList.add('hidden'); $('hud-rot').classList.add('hidden');
  $('vp-search-overlay').classList.add('hidden');

  if (outcome === 'error') {
    $('os-dot').className = 'os-dot os-dot--error';
    $('os-text').textContent = 'Search failed';
    setStatus('Optimization error — see details above');
  } else if (outcome === 'cancel') {
    $('os-dot').className = 'os-dot os-dot--ready';
    $('os-text').textContent = 'Cancelled';
    setStatus('Search cancelled');
  } else {
    $('os-dot').className = 'os-dot os-dot--ready';
    $('os-text').textContent = 'Complete';
    setStatus('Optimization complete');
  }

  // Reset Update Search button
  var updateBtn = $('btn-update-search');
  if (updateBtn) { updateBtn.textContent = 'Update Search'; updateBtn.style.opacity = ''; }
}

export function cancelSearch() { S.searchCancel = true; setStatus('Cancelling...'); }

// Clear previous result content to avoid flash of stale data on new search
function clearResultsContent() {
  // Reset result summary elements
  var angleEl = $('rs-angle'); if (angleEl) angleEl.textContent = '--';
  var energyEl = $('rs-energy'); if (energyEl) energyEl.textContent = '--';
  var fmtlEl = $('rs-fmtl'); if (fmtlEl) { fmtlEl.textContent = '--'; fmtlEl.style.color = ''; }
  var fenergyEl = $('rs-fenergy'); if (fenergyEl) { fenergyEl.textContent = '--'; fenergyEl.style.color = ''; }
  var tuyEl = $('rs-tuy'); if (tuyEl) { tuyEl.textContent = '--'; tuyEl.style.color = ''; }
  var evalsEl = $('rs-evals'); if (evalsEl) evalsEl.textContent = '';

  // Clear optimal orientation card
  var optAngles = $('opt-angles'); if (optAngles) optAngles.textContent = '--';
  var optBody = $('opt-table-body'); if (optBody) optBody.innerHTML = '';

  // Remove dynamically-created result elements
  var scoreGap = $('rs-score-gap'); if (scoreGap) scoreGap.remove();
  var tuyWarn = $('tuy-warning'); if (tuyWarn) tuyWarn.remove();
  var savingsSub = $('energy-savings-sub'); if (savingsSub) savingsSub.remove();

  // Clear energy card
  var energyVal = $('energy-val'); if (energyVal) energyVal.textContent = '--';
  var energyQual = $('energy-qual'); if (energyQual) energyQual.innerHTML = '';
  var energyTmin = $('energy-tmin'); if (energyTmin) energyTmin.textContent = '';
  var energyMargin = $('energy-margin'); if (energyMargin) energyMargin.textContent = '';
  var energyTubeStatus = $('energy-tube-status'); if (energyTubeStatus) { energyTubeStatus.textContent = ''; energyTubeStatus.style.color = ''; }
  var energyTubeSub = $('energy-tube-status-sub'); if (energyTubeSub) energyTubeSub.remove();
  var energySavings = $('energy-savings'); if (energySavings) energySavings.textContent = '';
  var energyCaveat = $('energy-caveat'); if (energyCaveat) energyCaveat.textContent = '';

  // Hide IntelliScan card
  var isCard = $('card-intelliscan'); if (isCard) isCard.style.display = 'none';

  // Reset tradeoff card to disabled state
  var tradeoffCard = $('card-tradeoff');
  if (tradeoffCard) {
    tradeoffCard.classList.add('tradeoff-disabled');
    var tradeoffStatus = $('tradeoff-status');
    if (tradeoffStatus) tradeoffStatus.style.display = 'block';
    // Deactivate all tradeoff stops except the first
    var stops = tradeoffCard.querySelectorAll('.tradeoff-stop');
    stops.forEach(function(s, i) { s.classList.toggle('active', i === 0); });
  }

  // Reset plot canvases (clear them so old plots don't linger)
  var contourCanvas = $('canvas-contour');
  if (contourCanvas) {
    var ctx = contourCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, contourCanvas.width, contourCanvas.height);
  }
  var roseCanvas = $('canvas-rose');
  if (roseCanvas) {
    var ctx = roseCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, roseCanvas.width, roseCanvas.height);
  }
}

function showResults(result) {
  const best = result.bestOrientation, worst = result.worstOrientation;
  // Use epsilon comparison — Go JSON may produce 179.0000001 vs frontend 179
  const matchOrientation = (a, b) => Math.abs(a.theta - b.theta) < 0.001 && Math.abs(a.phi - b.phi) < 0.001;
  const bestScore = result.allScores.find(s => matchOrientation(s, best));
  const worstScore = result.allScores.find(s => matchOrientation(s, worst));
  if (!bestScore || !worstScore) return;

  // Summary bar — plain language + directional indicators
  $('rs-angle').textContent = `\u03B8=${best.theta}\u00B0 \u03C6=${best.phi}\u00B0`;
  function pctDelta(best, worst) {
    if (!worst || Math.abs(worst) < 1e-12) return null;
    return (best - worst) / worst * 100;
  }
  const fmtlDelta = pctDelta(bestScore.fMtl, worstScore.fMtl);
  const fenergyDelta = pctDelta(bestScore.fEnergy, worstScore.fEnergy);
  $('rs-fmtl').textContent = fmtlDelta !== null ? (fmtlDelta < 0 ? '\u2193 ' : '\u2191 ') + Math.abs(fmtlDelta).toFixed(1) + '%' : '--';
  $('rs-fmtl').style.color = fmtlDelta !== null && fmtlDelta < 0 ? 'var(--green-500)' : 'var(--text)';
  $('rs-fenergy').textContent = fenergyDelta !== null ? (fenergyDelta < 0 ? '\u2193 ' : '\u2191 ') + Math.abs(fenergyDelta).toFixed(1) + '%' : '--';
  $('rs-fenergy').style.color = fenergyDelta !== null && fenergyDelta < 0 ? 'var(--green-500)' : 'var(--text)';
  var totalEval = result.allScores.length;
  var coarseEval = result.numCoarseEval || 0;
  var fineEval = result.numFineEval || 0;
  var timeStr = result.searchTimeMs.toFixed(0) + 'ms';
  if (result.coarseTimeMs) {
    timeStr = result.coarseTimeMs.toFixed(0) + '+' + result.fineTimeMs.toFixed(0) + 'ms';
  }
  // Tuy completeness indicator
  var tuyEl = $('rs-tuy');
  if (tuyEl) {
    var tuyPct = bestScore.fTuy !== undefined ? (bestScore.fTuy * 100) : null;
    if (tuyPct !== null) {
      tuyEl.textContent = tuyPct.toFixed(0) + '%';
      tuyEl.style.color = tuyPct > 90 ? 'var(--green-500)' : tuyPct >= 70 ? 'var(--amber-300)' : 'var(--red-500)';
    }
  }

  $('rs-evals').textContent = totalEval + ' orientations (' + timeStr + ')';
  $('rs-evals').parentElement.title = coarseEval + ' coarse + ' + fineEval + ' fine | ' + result.searchTimeMs.toFixed(0) + 'ms total';

  // Convergence indicator
  if (result.scoreGap !== undefined) {
    var gapEl = $('rs-score-gap');
    if (!gapEl) {
      gapEl = document.createElement('div');
      gapEl.id = 'rs-score-gap';
      $('rs-evals').parentElement.appendChild(gapEl);
    }
    var gapPct = (result.scoreGap * 100).toFixed(1);
    var isAmbiguous = result.scoreGap < 0.01 || (result.top3Spread || 0) > 10;
    gapEl.style.cssText = 'margin-top:4px;font-size:9px;color:' + (isAmbiguous ? 'var(--amber-500)' : 'var(--text-dim)');
    var gapText = 'Score gap vs runner-up: ' + gapPct + '%';
    if (result.convergenceNote) {
      gapText += ' \u2014 ' + result.convergenceNote;
    } else if (isAmbiguous) {
      gapText += ' \u2014 Multiple orientations score similarly. The selected angle may not be uniquely optimal.';
    }
    gapEl.textContent = gapText;
  }

  // Optimal orientation card
  $('opt-angles').textContent = `\u03B8 = ${best.theta}\u00B0  \u03C6 = ${best.phi}\u00B0`;
  const pct = (bv, wv) => { if (!wv) return '--'; const ch = ((bv - wv) / wv * 100); return (ch >= 0 ? '+' : '') + ch.toFixed(1) + '%'; };
  const style = (ch, higherIsBetter) => {
    if (higherIsBetter) return ch > 0 ? 'style="color:var(--green-500)"' : '';
    return ch < 0 ? 'style="color:var(--green-500)"' : '';
  };

  var fTuyBest = bestScore.fTuy !== undefined ? (bestScore.fTuy * 100).toFixed(1) + '%' : '--';
  var fTuyWorst = worstScore.fTuy !== undefined ? (worstScore.fTuy * 100).toFixed(1) + '%' : '--';
  var ppTuySign = (bestScore.fTuy !== undefined && worstScore.fTuy !== undefined && Math.abs(bestScore.fTuy - worstScore.fTuy) > 1e-12)
    ? (bestScore.fTuy > worstScore.fTuy ? '\u2191 ' : '\u2193 ')
    : '';
  var ppTuy = ppTuySign + ((bestScore.fTuy !== undefined && worstScore.fTuy !== undefined)
    ? Math.abs((bestScore.fTuy - worstScore.fTuy) * 100).toFixed(1) + ' pp'
    : '--');

  const rows = [
    ['Mean Pen.', worstScore.fMtl.toFixed(3), bestScore.fMtl.toFixed(3), pct(bestScore.fMtl, worstScore.fMtl), (bestScore.fMtl - worstScore.fMtl)],
    ['Peak Path', worstScore.fEnergy.toFixed(1) + ' mm', bestScore.fEnergy.toFixed(1) + ' mm', pct(bestScore.fEnergy, worstScore.fEnergy), (bestScore.fEnergy - worstScore.fEnergy)],
    ['Range', worstScore.fHdn.toFixed(3), bestScore.fHdn.toFixed(3), pct(bestScore.fHdn, worstScore.fHdn), (bestScore.fHdn - worstScore.fHdn)],
    ['Completeness', fTuyWorst, fTuyBest, ppTuy, (bestScore.fTuy - worstScore.fTuy), true],
  ];
  $('opt-table-body').innerHTML = rows.map(r =>
    `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td ${style(r[4], r[5])}>${r[3]}</td></tr>`
  ).join('');

  // Tuy completeness warning
  var tuyWarn = $('tuy-warning');
  if (bestScore.fTuy !== undefined && bestScore.fTuy < 0.90) {
    var tuyPct = (bestScore.fTuy * 100).toFixed(0);
    if (!tuyWarn) {
      tuyWarn = document.createElement('div');
      tuyWarn.id = 'tuy-warning';
      tuyWarn.style.cssText = 'margin-top:8px;padding:6px 8px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:4px;font-size:11px;color:var(--amber-500);display:flex;align-items:center;gap:6px';
      $('opt-angles').parentElement.appendChild(tuyWarn);
    }
    tuyWarn.innerHTML = '\u26A0 Only ' + tuyPct + '% of faces satisfy Tuy-Smith condition — cone-beam artifacts may occur';
    tuyWarn.style.display = '';
  } else if (tuyWarn) {
    tuyWarn.style.display = 'none';
  }

  // ── Energy recommendation (best + worst) ──
  var bestPeakPath = bestScore.fEnergy;
  var worstPeakPath = worstScore.fEnergy;
  Promise.all([
    CalcEnergyRecommendation(S.materialID, bestPeakPath, S.tPct),
    CalcEnergyRecommendation(S.materialID, worstPeakPath, S.tPct),
  ]).then(function(jsons) {
    var bestRec = JSON.parse(jsons[0]);
    var worstRec = JSON.parse(jsons[1]);
    if (bestRec.error) return;

    // Best-kV display
    $('energy-val').textContent = bestRec.kv + ' kV';
    $('rs-energy').textContent = bestRec.kv + ' kV';

    // ── A1: Qualitative label ──
    var qual, color;
    if (bestRec.kv === KV_THRESHOLDS.CEILING && bestRec.transmission < S.tPct / 100) {
      qual = 'Exceeds recommended range — may require higher-energy system';
      color = 'var(--red-500)';
    } else if (bestRec.kv >= KV_THRESHOLDS.MEDIUM_MAX) {
      qual = 'High kV — verify tube capability';
      color = 'var(--amber-500)';
    } else if (bestRec.kv >= KV_THRESHOLDS.LOW_MAX) {
      qual = 'Medium kV range';
      color = 'var(--text)';
    } else {
      qual = 'Low kV range';
      color = 'var(--text)';
    }
    $('energy-qual').innerHTML = '<span style="color:' + color + '">' + qual + '</span>';

    // ── A3: Tmin display ──
    var tminEl = $('energy-tmin');
    if (tminEl) tminEl.textContent = 'at Tmin = ' + S.tPct.toFixed(2) + '%';

    // ── A4: Transmission margin ──
    var marginEl = $('energy-margin');
    if (marginEl) {
      var marginRatio = bestRec.transmission / (S.tPct / 100);
      var marginText, marginColor;
      if (bestRec.transmission < S.tPct / 100) {
        marginText = 'Transmission: ' + (bestRec.transmission * 100).toFixed(2) + '% — Below target, see warning';
        marginColor = 'var(--red-500)';
      } else if (marginRatio < MARGIN_THRESHOLDS.LOW) {
        marginText = 'Transmission: ' + (bestRec.transmission * 100).toFixed(2) + '% — low margin';
        marginColor = 'var(--amber-500)';
      } else if (marginRatio >= MARGIN_THRESHOLDS.AMPLE) {
        marginText = 'Transmission: ' + (bestRec.transmission * 100).toFixed(2) + '% — ample margin';
        marginColor = 'var(--green-500)';
      } else {
        marginText = 'Transmission: ' + (bestRec.transmission * 100).toFixed(2) + '%';
        marginColor = 'var(--text-dim)';
      }
      marginEl.textContent = marginText;
      marginEl.style.color = marginColor;
    }

    // ── A1: Tube status (scanner power context) ──
    var tubeStatusEl = $('energy-tube-status');
    if (tubeStatusEl) {
      var preset = S.presets.find(function(p) { return p.id === S.scannerPresetID; });
      if (!preset || !preset.tube) {
        tubeStatusEl.textContent = 'Tube specifications not configured for custom preset. Select a scanner preset or configure manually.';
        tubeStatusEl.style.color = 'var(--text-muted)';
      } else {
        var maxKV = preset.tube.maxKV;
        var dist = maxKV - bestRec.kv;
        var msg, color;
        if (bestRec.kv > maxKV) {
          msg = bestRec.kv + ' kV exceeds tube limit of ' + maxKV + ' kV — scan not feasible on this hardware';
          color = 'var(--red-500)';
        } else if (dist <= TUBE_BIAS_BAND_KV) {
          msg = bestRec.kv + ' kV near tube limit (max: ' + maxKV + ' kV) — verify with caution; spectrum model uncertainty of 10–30 kV may affect feasibility';
          color = 'var(--amber-500)';
        } else if (dist > TUBE_COMFORT_MARGIN_KV) {
          msg = bestRec.kv + ' kV — comfortable margin (tube max: ' + maxKV + ' kV)';
          color = 'var(--green-500)';
        } else {
          msg = bestRec.kv + ' kV within range (tube max: ' + maxKV + ' kV)';
          color = 'var(--text-dim)';
        }
        tubeStatusEl.textContent = msg;
        tubeStatusEl.style.color = color;

        // ── A2: Medical CT caveat sub-line ──
        var caveatEl = $('energy-tube-status-sub');
        if (preset.tube.tubeType === 'medical') {
          if (!caveatEl) {
            caveatEl = document.createElement('div');
            caveatEl.className = 'energy-tube-status-sub';
            caveatEl.id = 'energy-tube-status-sub';
            tubeStatusEl.parentNode.insertBefore(caveatEl, tubeStatusEl.nextSibling);
          }
          caveatEl.textContent = 'Medical CT scanner — not designed for industrial kV ranges above 140 kV. PenOpt\'s spectrum model (Boone 1997) is validated only to 140 kV. Check tube rating before use.';
        } else if (caveatEl) {
          caveatEl.remove();
        }
      }
    }

    // ── A2: Actual kV savings (not path-length savings) ──
    if (worstRec.error) {
      $('energy-savings').textContent = '—';
    } else {
      var savingsLabel;
      var worstKV = worstRec.kv;
      var bestKV = bestRec.kv;
      var worstOK = !(worstKV === KV_THRESHOLDS.CEILING && worstRec.transmission < S.tPct / 100);
      var bestOK  = !(bestKV  === KV_THRESHOLDS.CEILING && bestRec.transmission  < S.tPct / 100);

      if (!worstOK && !bestOK) {
        // Both at ceiling, neither meets Tmin
        savingsLabel = 'Indeterminate — peak path exceeds penetrable range';
      } else if (!worstOK) {
        // Best OK, worst at ceiling: lower bound
        var lowerBound = ((worstKV - bestKV) / worstKV * 100).toFixed(0);
        savingsLabel = '\u2265' + lowerBound + '% less tube voltage vs worst orientation (rough estimate)';
      } else if (worstKV === bestKV) {
        savingsLabel = '0%';
      } else {
        var savingsPct = ((worstKV - bestKV) / worstKV * 100).toFixed(0);
        savingsLabel = '~' + savingsPct + '% less tube voltage vs worst orientation (rough estimate)';
      }
      $('energy-savings').textContent = savingsLabel;
    }

    // Peak path sub-line (A2.7)
    var peakPathLabel = 'Peak path: ' + bestPeakPath.toFixed(1) + ' mm (opt) vs ' + worstPeakPath.toFixed(1) + ' mm (worst)';
    var subLine = $('energy-savings-sub');
    if (!subLine) {
      subLine = document.createElement('div');
      subLine.id = 'energy-savings-sub';
      subLine.style.cssText = 'font-size:10px;color:var(--text-muted);margin-top:2px';
      var savingsEl = $('energy-savings');
      if (savingsEl && savingsEl.parentNode) {
        savingsEl.parentNode.insertBefore(subLine, savingsEl.nextSibling);
      }
    }
    subLine.textContent = peakPathLabel;

    // ── A6: Updated caveat text ──
    $('energy-caveat').textContent = 'Rough estimate: simplified 120-point spectrum (no W K-characteristic lines, no self-filtration). Actual kV depends on scanner hardware and tube spectrum. K-edge-aware stepping requires a full spectrum model (planned).';
  }).catch(function() {});

  // Smoothly rotate mesh to optimal orientation
  if (S.meshObject) {
    animateRotation(S.meshObject, best.theta * DEG, best.phi * DEG);
  }

  // Draw plots
  drawContourPlot(result.allScores, best, worst, result.isPartial);
  var bestProj = bestScore && bestScore.maxPerProjection;
  var worstProj = worstScore && worstScore.maxPerProjection;
  drawPenetrationRose(bestProj, worstProj, result.isPartial, null, null);

  // Enable tradeoff card (also unhide if previously hidden by removeMesh)
  $('card-tradeoff').style.display = '';
  $('card-tradeoff').classList.remove('tradeoff-disabled');

  // Results visible
  S.facePenetrations = null;
  $('results-panel').classList.remove('hidden');
  $('results-panel').classList.remove('collapsed');
  var rcb = $('results-collapse-btn');
  if (rcb) {
    rcb.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
    rcb.setAttribute('aria-label', 'Collapse results');
  }
}

// ── IntelliScan ──
function renderIntelliScan(result) {
  var card = $('card-intelliscan');
  var body = $('intelliscan-body');
  if (!card || !body) return;
  if (!result.intelliScan || !result.intelliScan.angles || result.intelliScan.angles.length === 0) {
    card.style.display = 'none';
    return;
  }
  card.style.display = '';
  var data = result.intelliScan;
  var savings = ((1 - data.count / 360) * 100).toFixed(0);
  var html = '';
  html += '<div class="is-summary">';
  html += '<div class="is-row"><span>Recommended projections:</span><strong>' + data.count + '</strong></div>';
  html += '<div class="is-row"><span>vs conventional 360°:</span><strong>\u2212' + savings + '% scan time</strong></div>';
  html += '<div class="is-row"><span>Computation:</span><span>' + data.elapsedMs.toFixed(0) + 'ms on ' + data.totalFaces.toLocaleString() + ' faces</span></div>';
  html += '</div>';
  html += '<div class="is-table-wrap"><table class="is-table"><thead><tr><th>#</th><th>Angle \u03B1</th></tr></thead><tbody>';
  data.angles.forEach(function(a, i) {
    html += '<tr><td>' + (i + 1) + '</td><td>' + a.toFixed(1) + '\u00B0</td></tr>';
  });
  html += '</tbody></table></div>';
  html += '<div class="is-actions"><button class="is-btn" id="is-copy-btn">Copy angles</button><button class="is-btn" id="is-export-btn">Export JSON</button></div>';
  if (data.warning) html += '<div class="is-warning">\u2139 ' + data.warning + '</div>';
  html += '<div class="is-ref">Based on Butzhammer 2026 tangent-ray selection.</div>';
  var geoMode = data.geometryMode || 'parallel';
  var infoHtml = 'Tangent angles computed for ' + geoMode + '-beam geometry.';
  if (geoMode === 'cone-beam') {
    infoHtml += ' For wide-angle cone-beam systems, consider verifying critical angles manually.';
  }
  html += '<div class="is-info">' + infoHtml + '</div>';
  body.innerHTML = html;

  var cb = document.getElementById('is-copy-btn');
  if (cb) cb.onclick = function() {
    var text = data.angles.map(function(a) { return a.toFixed(1); }).join(', ');
    navigator.clipboard.writeText(text).then(function() {
      cb.textContent = 'Copied!';
      setTimeout(function() { cb.textContent = 'Copy angles'; }, 1500);
    });
  };
  var eb = document.getElementById('is-export-btn');
  if (eb) eb.onclick = function() {
    var json = JSON.stringify({ intelliScanAngles: data.angles, count: data.count }, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'intelliscan-angles.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  };
}

// ── Heatmap ──
async function loadHeatmap(result) {
  if (!S.meshInfo || !S.meshInfo.isWatertight) return;
  const best = result.bestOrientation;
  try {
    const json = await ComputeFaceHeatmap(best.theta, best.phi);
    const data = JSON.parse(json);
    if (data.error) return;
    S.facePenetrations = data;
    let mn = Infinity, mx = -Infinity;
    for (const v of data) { if (v < mn) mn = v; if (v > mx) mx = v; }
    S.facePenMin = mn; S.facePenMax = mx;
    if (S.viewMode === 'heatmap') applyHeatmap();
  } catch (err) { console.warn('Heatmap error:', err); }
}

// ── Sidebar Card Accordions ──
export function setupCardAccordion() {
  qsa('.card.accordion').forEach(card => {
    const head = card.querySelector('.card-head');
    const body = card.querySelector('.card-body');
    if (!head || !body) return;

    // After expand transition completes, remove inline max-height
    // so content can grow freely (nested accordions, dynamic content).
    body.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName === 'max-height' && card.classList.contains('open')) {
        body.style.maxHeight = '';
      }
    });

    head.addEventListener('click', () => {
      const wasOpen = card.classList.contains('open');
      card.classList.toggle('open');
      head.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
      const chev = head.querySelector('.chevron');
      if (chev) chev.classList.toggle('open');

      if (wasOpen) {
        // Close: measure full height, set as starting point, then animate to 0
        // Uses double-rAF to let the browser paint the start state before transitioning
        body.style.maxHeight = '';
        var closeH = body.scrollHeight;
        body.style.maxHeight = closeH + 'px';
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            body.style.maxHeight = '0px';
          });
        });
      } else {
        // Open: measure target height, set to 0 first, then animate to full
        body.style.maxHeight = '';
        var h = body.scrollHeight;
        body.style.maxHeight = '0px';
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            body.style.maxHeight = h + 'px';
          });
        });
      }
    });
  });
}

// ── Accordion ──
export function setupAccordion() {
  qsa('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      head.parentElement.classList.toggle('open');
      head.setAttribute('aria-expanded', head.parentElement.classList.contains('open') ? 'true' : 'false');
    });
  });
  // Open the first nested accordion by default and mark it expanded
  const a = document.querySelector('.acc');
  if (a) {
    a.classList.add('open');
    const firstHead = a.querySelector('.acc-head');
    if (firstHead) firstHead.setAttribute('aria-expanded', 'true');
  }
}

// ── Client-side re-scoring (Tradeoff card) ──

function normalize(values) {
  var n = values.length;
  if (n === 0) return [];
  var min = values[0], max = values[0];
  for (var i = 1; i < n; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }
  var range = max - min;
  if (range === 0) {
    var zeros = new Array(n);
    for (var i = 0; i < n; i++) zeros[i] = 0;
    return zeros;
  }
  var result = new Array(n);
  for (var i = 0; i < n; i++) result[i] = (values[i] - min) / range;
  return result;
}

function combinedScore(fMtlVals, fEnergyVals, fHdnVals, fTuyVals, fBhVals,
    wMtl, wEnergy, wHdn, wTuy, wBh, method) {
  var n = fMtlVals.length;
  var nFMtl = normalize(fMtlVals);
  var nFEnergy = normalize(fEnergyVals);
  var nFHdn = normalize(fHdnVals);
  // FTuy: invert (1 - value) before normalizing — matches Go
  var fTuyInv = new Array(n);
  for (var i = 0; i < n; i++) fTuyInv[i] = 1 - fTuyVals[i];
  var nFTuy = normalize(fTuyInv);
  var nFBh = normalize(fBhVals);
  var scores = new Array(n);
  if (method === 'minimax') {
    for (var i = 0; i < n; i++) {
      scores[i] = Math.max(wMtl * nFMtl[i], wEnergy * nFEnergy[i],
        wHdn * nFHdn[i], wTuy * nFTuy[i], wBh * nFBh[i]);
    }
  } else {
    for (var i = 0; i < n; i++) {
      scores[i] = wMtl * nFMtl[i] + wEnergy * nFEnergy[i] +
        wHdn * nFHdn[i] + wTuy * nFTuy[i] + wBh * nFBh[i];
    }
  }
  return scores;
}

function rescoreAndDisplay(weights, method) {
  if (!S.result || !S.result.allScores || S.result.allScores.length === 0) return;
  var allScores = S.result.allScores;
  var n = allScores.length;
  var fMtlVals = new Array(n), fEnergyVals = new Array(n);
  var fHdnVals = new Array(n), fTuyVals = new Array(n), fBhVals = new Array(n);
  for (var i = 0; i < n; i++) {
    fMtlVals[i] = allScores[i].fMtl;
    fEnergyVals[i] = allScores[i].fEnergy;
    fHdnVals[i] = allScores[i].fHdn;
    fTuyVals[i] = allScores[i].fTuy !== undefined ? allScores[i].fTuy : 0;
    fBhVals[i] = allScores[i].fBh || 0;
  }
  var newScores = combinedScore(fMtlVals, fEnergyVals, fHdnVals, fTuyVals, fBhVals,
    weights.wMtl, weights.wEnergy, weights.wHdn, weights.wTuy, weights.wBh, method);
  var bestIdx = 0, worstIdx = 0;
  for (var i = 0; i < n; i++) {
    allScores[i].score = newScores[i];
    if (newScores[i] < newScores[bestIdx]) bestIdx = i;
    if (newScores[i] > newScores[worstIdx]) worstIdx = i;
  }
  S.result.bestOrientation = allScores[bestIdx];
  S.result.worstOrientation = allScores[worstIdx];
  showResults(S.result);
}

// ── Tradeoff ──
export function setupTradeoff() {
  qsa('.tradeoff-stop').forEach(el => {
    el.addEventListener('click', () => {
      qsa('.tradeoff-stop').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      S.weightPreset = parseInt(el.dataset.w);
      rescoreAndDisplay(WEIGHT_PRESETS[S.weightPreset], S.method);
    });
  });
  qsa('.method-btn').forEach(el => {
    el.addEventListener('click', () => {
      qsa('.method-btn').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      S.method = el.dataset.method;
      rescoreAndDisplay(WEIGHT_PRESETS[S.weightPreset], S.method);
    });
  });
  // Add fBh placeholder note below the preset buttons
  if (!document.getElementById('bh-placeholder-note')) {
    var bhNote = document.createElement('div');
    bhNote.id = 'bh-placeholder-note';
    bhNote.className = 'bh-note';
    bhNote.textContent = 'Note: Beam-hardening optimization (fBh) coming in a future release. Weight redistributed to Tuy-Smith completeness.';
    var tradeoffOpts = document.querySelector('.tradeoff-options');
    if (tradeoffOpts) { tradeoffOpts.after(bhNote); }
  }

  $('btn-update-search').addEventListener('click', () => {
    rescoreAndDisplay(WEIGHT_PRESETS[S.weightPreset], S.method);
  });
}

// ── Export ──
export function setupExport() {
  $('btn-export').addEventListener('click', () => {
    if (S.result) exportJSON(S.result, $('btn-export'));
  });
  $('btn-export-png').addEventListener('click', () => {
    if (S.result) exportPNG(S.renderer, S.result, $('energy-val')?.textContent || '--', $('btn-export-png'));
  });
}

// ── Plot Tabs ──
export function setupPlotTabs() {
  qsa('.plot-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('.plot-tab').forEach(t => t.classList.remove('active'));
      qsa('.plot-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`plot-${tab.dataset.plot}`).classList.add('active');
    });
  });
}


