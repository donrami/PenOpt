// Optimizer — search lifecycle, progress, results, IntelliScan, heatmap loading
import { S, $, qsa, DEG, WEIGHT_PRESETS, showError, setStatus } from './state.js';
import { applyHeatmap } from './scene.js';
import { recalcBeam } from './materials.js';
import { RunOptimization, ComputeFaceHeatmap, CalcEnergyRecommendation } from '../wailsjs/go/main/App';
import { drawContourPlot, drawPenetrationRose } from './plots.js';
import { exportJSON, exportPNG } from './export.js';

const runtime = window.runtime;

// ── Optimization ──
export function runOptimization() {
  if (!S.meshLoaded || S.searching) return;
  S.searching = true; S.searchCancel = false;

  // Show search UI
  $('btn-optimize').disabled = true; $('btn-optimize').innerHTML = '\u25B6 Searching...';
  $('vp-progress').classList.remove('hidden'); $('results-panel').classList.remove('hidden');
  $('progress-ring').classList.remove('hidden'); $('hud-rot').classList.remove('hidden');
  $('os-dot').className = 'os-dot os-dot--searching'; $('os-text').textContent = 'Searching...';
  $('progress-fill').style.width = '0%';
  $('pr-fill').style.strokeDashoffset = '100.53';
  setStatus('Grid search in progress...');

  const w = WEIGHT_PRESETS[S.weightPreset];

  // Listen for progress events
  runtime.EventsOn('search:progress', function(data) {
    if (S.searchCancel) return;
    $('progress-fill').style.width = data.pct + '%';
    $('pr-pct').textContent = Math.round(data.pct) + '%';
    $('progress-label').textContent = Math.round(data.pct) + '%';
    $('pr-info').textContent = data.label || 'Evaluating...';
    // Parse theta/phi from label for HUD
    var thetaMatch = data.label?.match(/θ=([\d.]+)/);
    var phiMatch = data.label?.match(/φ=([\d.]+)/);
    if (thetaMatch && phiMatch) {
      $('hud-rot').innerHTML = '\u03B8: ' + thetaMatch[1] + '\u00B0 \u03C6: ' + phiMatch[1] + '\u00B0';
    }
    // Update progress ring
    var offset = 100.53 - (data.pct / 100) * 100.53;
    $('pr-fill').style.strokeDashoffset = Math.max(0, offset);
  });

  // Listen for done event
  runtime.EventsOn('search:done', function(data) {
    // Clean up event listeners
    runtime.EventsOff('search:progress');
    runtime.EventsOff('search:done');

    if (S.searchCancel) { finishSearch(); return; }

    if (data.error) {
      showError('Optimization error: ' + data.error);
      $('progress-ring').classList.add('hidden');
      finishSearch();
      return;
    }

    try {
      const result = JSON.parse(data.result);
      S.result = result;
      showResults(result);
      renderIntelliScan(result);
      // Redraw rose with IntelliScan ticks
      if (result.penetrationRose && result.intelliScan) {
        drawPenetrationRose(result.penetrationRose, result.worstPenetrationRose, result.isPartial, null, result.intelliScan.angles);
      }
      $('progress-ring').classList.add('hidden');
      loadHeatmap(result);
      try { localStorage.setItem('penopt-last-result', JSON.stringify({ bestOrientation: result.bestOrientation, worstOrientation: result.worstOrientation })); } catch (_) {}
    } catch (err) {
      showError('Result parse error: ' + err.message);
      $('progress-ring').classList.add('hidden');
    }
    finishSearch();
  });

  // Start the search (returns "started" immediately, results via events)
  RunOptimization({ weights: [w.wMtl, w.wEnergy, w.wHdn], method: S.method })
    .catch(function(err) {
      if (!S.searchCancel) showError('Failed to start search: ' + err);
      runtime.EventsOff('search:progress');
      runtime.EventsOff('search:done');
      $('progress-ring').classList.add('hidden');
      finishSearch();
    });
}

function finishSearch() {
  S.searching = false;
  $('btn-optimize').disabled = false; $('btn-optimize').innerHTML = '\u25B6 <span>Optimize</span>';
  $('vp-progress').classList.add('hidden'); $('hud-rot').classList.add('hidden');
  $('os-dot').className = 'os-dot os-dot--ready';
  $('os-text').textContent = S.searchCancel ? 'Cancelled' : 'Complete';
  setStatus(S.searchCancel ? 'Search cancelled' : 'Optimization complete');
}

export function cancelSearch() { S.searchCancel = true; setStatus('Cancelling...'); }

function showResults(result) {
  const best = result.bestOrientation, worst = result.worstOrientation;
  const bestScore = result.allScores.find(s => s.theta === best.theta && s.phi === best.phi);
  const worstScore = result.allScores.find(s => s.theta === worst.theta && s.phi === worst.phi);
  if (!bestScore || !worstScore) return;

  // Summary bar
  $('rs-angle').textContent = `\u03B8=${best.theta}\u00B0 \u03C6=${best.phi}\u00B0`;
  $('rs-fmtl').textContent = ((bestScore.fMtl - worstScore.fMtl) / worstScore.fMtl * 100).toFixed(1) + '%';
  $('rs-fenergy').textContent = ((bestScore.fEnergy - worstScore.fEnergy) / worstScore.fEnergy * 100).toFixed(1) + '%';
  $('rs-evals').textContent = result.allScores.length + ' orientations';

  // Optimal orientation card
  $('opt-angles').textContent = `\u03B8 = ${best.theta}\u00B0  \u03C6 = ${best.phi}\u00B0`;
  const pct = (bv, wv) => { if (!wv) return '--'; const ch = ((bv - wv) / wv * 100); return (ch >= 0 ? '+' : '') + ch.toFixed(1) + '%'; };
  const style = (ch) => ch < 0 ? 'style="color:var(--green-500)"' : '';

  const rows = [
    ['f_mtl', worstScore.fMtl.toFixed(3), bestScore.fMtl.toFixed(3), pct(bestScore.fMtl, worstScore.fMtl), (bestScore.fMtl - worstScore.fMtl)],
    ['f_energy', worstScore.fEnergy.toFixed(1) + ' mm', bestScore.fEnergy.toFixed(1) + ' mm', pct(bestScore.fEnergy, worstScore.fEnergy), (bestScore.fEnergy - worstScore.fEnergy)],
    ['f_hdn', worstScore.fHdn.toFixed(3), bestScore.fHdn.toFixed(3), pct(bestScore.fHdn, worstScore.fHdn), (bestScore.fHdn - worstScore.fHdn)],
  ];
  $('opt-table-body').innerHTML = rows.map(r =>
    `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td ${style(r[4])}>${r[3]}</td></tr>`
  ).join('');

  // Energy
  CalcEnergyRecommendation(S.materialID, bestScore.fEnergy, S.tPct).then(json => {
    const rec = JSON.parse(json);
    if (rec.error) return;
    $('energy-val').textContent = rec.kv + ' kV';
    $('rs-energy').textContent = rec.kv + ' kV';
    // Qualitative label
    let qual, color;
    if (rec.kv < 100) { qual = '\u25B2 Higher kV recommended'; color = 'var(--amber-500)'; }
    else if (rec.kv <= 200) { qual = 'Medium kV suitable'; color = 'var(--text)'; }
    else { qual = '\u25BC Lower kV sufficient'; color = 'var(--green-500)'; }
    $('energy-qual').innerHTML = `<span style="color:${color}">${qual}</span>`;
    // Savings vs worst
    const savings = ((1 - bestScore.fEnergy / worstScore.fEnergy) * 100).toFixed(0);
    $('energy-savings').textContent = '~' + savings + '% less energy than worst orientation';
    $('energy-caveat').textContent = 'Qualitative estimate. Actual consumption depends on scanner hardware.';
  }).catch(() => {});

  // Rotate mesh
  if (S.meshObject) {
    S.meshObject.rotation.x = best.theta * DEG; S.meshObject.rotation.y = best.phi * DEG;
  }

  // Draw plots
  drawContourPlot(result.allScores, best, worst, result.isPartial);
  drawPenetrationRose(result.penetrationRose, result.worstPenetrationRose, result.isPartial, null, null);

  // Enable tradeoff card (also unhide if previously hidden by removeMesh)
  $('card-tradeoff').style.display = '';
  $('card-tradeoff').classList.remove('tradeoff-disabled');

  // Results visible
  S.facePenetrations = null;
  $('results-panel').classList.remove('hidden');
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
    if (!head) return;
    head.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      card.classList.toggle('open');
      const body = card.querySelector('.card-body');
      if (body) body.classList.toggle('collapsed', isOpen);
      const chev = head.querySelector('.chevron');
      if (chev) chev.classList.toggle('open', !isOpen);
    });
  });
}

// ── Accordion ──
export function setupAccordion() {
  qsa('.acc-head').forEach(head => {
    head.addEventListener('click', () => { head.parentElement.classList.toggle('open'); });
  });
  const a = document.querySelector('.acc'); if (a) a.classList.add('open');
}

// ── Tradeoff ──
export function setupTradeoff() {
  qsa('.tradeoff-stop').forEach(el => {
    el.addEventListener('click', () => {
      qsa('.tradeoff-stop').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      S.weightPreset = parseInt(el.dataset.w);
    });
  });
  qsa('.method-btn').forEach(el => {
    el.addEventListener('click', () => {
      qsa('.method-btn').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      S.method = el.dataset.method;
    });
  });
  $('btn-update-search').addEventListener('click', () => {
    // Re-run with new weights
    runOptimization();
  });
}

// ── Export ──
export function setupExport() {
  $('btn-export').addEventListener('click', () => {
    if (S.result) exportJSON(S.result);
  });
  $('btn-export-png').addEventListener('click', () => {
    if (S.result) exportPNG(S.renderer, S.result, $('energy-val')?.textContent || '--');
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

// ── Ray Grid ──
export function setupRayGrid() {
  qsa('.ray-opt').forEach(el => {
    el.addEventListener('click', () => {
      qsa('.ray-opt').forEach(o => o.classList.remove('active'));
      el.classList.add('active');
      $('acc-ray-val').textContent = el.textContent;
    });
  });
}
