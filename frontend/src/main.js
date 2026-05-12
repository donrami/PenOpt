// Bootstrap — initializes all modules and sets up keyboard shortcuts
import './style.css';
import { S, $, qsa, showError, setStatus, setOptimizeBtnState } from './state.js';
import { initScene, resizeViewport, resetCamera, switchViewMode, switchLayoutMode, createBeamVisualization, destroyBeamVisualization } from './scene.js';
import { setupFileUpload, handlePickedMesh } from './filehandler.js';
import { setupSliders, renderMatGrid, renderFilters, selectMaterial, recalcBeam, setupScannerPresets, setMatFilter } from './materials.js';
import { setupAccordion, setupCardAccordion, setupTradeoff, setupExport, setupPlotTabs, runOptimization, cancelSearch } from './optimizer.js';
import { GetMaterials, GetFilters, GetScannerPresets, PickAndLoadMesh } from '../wailsjs/go/main/App';

// ── Keyboard shortcuts ──
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'Escape': $('error-banner').classList.add('hidden'); $('help-overlay').classList.add('hidden'); break;
      case 'o': if (e.ctrlKey) { e.preventDefault(); PickAndLoadMesh().then(info => { if (info) handlePickedMesh(info); }).catch(err => showError('File picker error: ' + err)); } break;
      case 'Enter': if (e.ctrlKey) { e.preventDefault(); if (!($('btn-optimize')?.disabled ?? true) && !($('btn-optimize-sidebar')?.disabled ?? true)) runOptimization(); } break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'r': case 'R': resetCamera(); break;
      case '1': switchViewMode('3d'); break;
      case '2': switchViewMode('heatmap'); break;
      case '3': switchViewMode('compare'); break;
    }
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

function setupHelp() {
  $('btn-help').addEventListener('click', () => $('help-overlay').classList.remove('hidden'));
  $('btn-help-close').addEventListener('click', () => $('help-overlay').classList.add('hidden'));
  $('help-overlay').addEventListener('click', e => { if (e.target === $('help-overlay')) $('help-overlay').classList.add('hidden'); });
}

$('btn-error-dismiss').addEventListener('click', () => $('error-banner').classList.add('hidden'));

// ── Bootstrap ──
function setupTooltips() {
  // CSS ::after tooltips handle all display.
  // No native title attribute — that would create double tooltips.
}

async function init() {
  initScene();
  resizeViewport();

  try {
    const [matsJson, filtersJson, presetsJson] = await Promise.all([GetMaterials(), GetFilters(), GetScannerPresets()]);
    S.mats = JSON.parse(matsJson); S.filters = JSON.parse(filtersJson); S.presets = JSON.parse(presetsJson);
    renderMatGrid(); renderFilters();
  } catch (err) { showError('Failed to load database: ' + err.message); }

  setupTooltips();
  setupFileUpload(); setupSliders(); setupAccordion(); setupCardAccordion(); setupHelp(); setupKeyboard();
  setupScannerPresets(); setupTradeoff(); setupExport(); setupPlotTabs();

  // Material tabs
  qsa('.mat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('.mat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active'); setMatFilter(tab.dataset.cat);
    });
  });
  $('mat-search').addEventListener('input', () => {
    renderMatGrid();
  });

  // Optimize / Stop
  $('btn-optimize').addEventListener('click', runOptimization);
  $('btn-optimize-sidebar').addEventListener('click', runOptimization);
  $('btn-stop').addEventListener('click', cancelSearch);

  // View modes
  qsa('.vp-mode-btn').forEach(btn => btn.addEventListener('click', () => switchViewMode(btn.dataset.mode)));
  qsa('.vp-layout-btn').forEach(btn => btn.addEventListener('click', () => switchLayoutMode(btn.dataset.layout)));

  // Buttons
  $('btn-reset-cam').addEventListener('click', resetCamera);
  $('btn-reset-float').addEventListener('click', resetCamera);
  $('btn-fullscreen').addEventListener('click', toggleFullscreen);
  $('btn-labels').addEventListener('click', function() {
    S.labelsVisible = !S.labelsVisible;
    $('btn-labels').classList.toggle('active', S.labelsVisible);
  });
  $('btn-beam').addEventListener('click', function() {
    S.beamVisible = !S.beamVisible;
    $('btn-beam').classList.toggle('active', S.beamVisible);
    if (S.beamGroup) S.beamGroup.visible = S.beamVisible;
  });

  // Default material
  selectMaterial('al'); recalcBeam();
  $('idle-prompt').style.display = ''; setStatus('Ready — drop a mesh file');
  // Initialize sidebar progress
  const sp = $('sidebar-progress');
  if (sp) sp.textContent = 'Step 1 of 3 — Load a mesh to begin';

  // Restore previous result if available
  try {
    var saved = localStorage.getItem('penopt-last-result');
    if (saved) { $('restore-banner').classList.remove('hidden'); }
  } catch (_) {}
  $('btn-restore').addEventListener('click', function() {
    const btn = $('btn-restore');
    btn.textContent = 'Restoring...';
    $('restore-banner').classList.add('hidden');
    try {
      var data = JSON.parse(localStorage.getItem('penopt-last-result'));
      if (data && data.bestOrientation) {
        $('rs-angle').textContent = '\u03B8=' + data.bestOrientation.theta + '\u00B0 \u03C6=' + data.bestOrientation.phi + '\u00B0';
        $('results-panel').classList.remove('hidden');
        $('card-tradeoff').classList.remove('tradeoff-disabled');

        // T1.1 + T1.2: re-render result warnings from persisted data
        var resultsArea = $('results-content');
        if (resultsArea) {
          // Clear existing warnings first
          [].slice.call(document.querySelectorAll('.result-warning')).forEach(function(el) { el.remove(); });
          // Constrained optimum warning
          if (data.constrainedOptimum && data.boundaryWarning) {
            var warnEl = document.createElement('div');
            warnEl.className = 'result-warning result-warning--boundary';
            warnEl.style.cssText = 'margin:0 0 8px 0;padding:8px 12px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.4);border-radius:var(--radius-sm);font-size:11px;color:var(--amber-500);display:flex;align-items:flex-start;gap:8px';
            warnEl.innerHTML = '<span style="font-size:14px;flex-shrink:0">\u26A0</span><span>' + data.boundaryWarning + '</span>';
            resultsArea.insertBefore(warnEl, resultsArea.firstChild);
          }
          // Non-watertight warning
          if (S.meshInfo && !S.meshInfo.isWatertight) {
            var wtEl = document.createElement('div');
            wtEl.className = 'result-warning result-warning--watertight';
            wtEl.style.cssText = 'margin:0 0 8px 0;padding:8px 12px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-sm);font-size:11px;color:var(--amber-500);display:flex;align-items:flex-start;gap:8px';
            wtEl.innerHTML = '<span style="font-size:14px;flex-shrink:0">\u26A0</span><span>Mesh has open edges — penetration values may be underestimated.</span>';
            resultsArea.insertBefore(wtEl, resultsArea.firstChild);
          }
        }

        // Restart staggered CSS animation on result cards
        qsa('.res-card').forEach(function(c) {
          c.style.animation = 'none';
          void c.offsetHeight; // force reflow
          c.style.animation = '';
        });
        setStatus('Restored previous results');
        setTimeout(function() { btn.textContent = 'Restore'; }, 1500);
      }
    } catch (_) { btn.textContent = 'Restore'; }
  });
  $('btn-restore-dismiss').addEventListener('click', function() {
    $('restore-banner').classList.add('hidden');
  });

  // Results panel collapse toggle
  const resultsPanel = $('results-panel');
  const resultsContent = $('results-content');
  const resultsCollapseBtn = $('results-collapse-btn');
  if (resultsCollapseBtn && resultsPanel) {
    // Apply persisted collapsed state
    if (S.resultsCollapsed) {
      resultsContent.style.display = 'none';
      resultsCollapseBtn.innerHTML = '&#x25B2;';
      resultsCollapseBtn.title = 'Expand results';
    }
    resultsCollapseBtn.addEventListener('click', function() {
      S.resultsCollapsed = resultsContent.style.display !== 'none';
      resultsContent.style.display = S.resultsCollapsed ? 'none' : '';
      resultsCollapseBtn.innerHTML = S.resultsCollapsed ? '&#x25B2;' : '&#x25BC;';
      resultsCollapseBtn.title = S.resultsCollapsed ? 'Expand results' : 'Collapse results';
      try { localStorage.setItem('penopt-results-collapsed', S.resultsCollapsed ? '1' : ''); } catch (_) {}
    });
    // Persist across sessions
    try {
      if (localStorage.getItem('penopt-results-collapsed') === '1') {
        S.resultsCollapsed = true;
      }
      var savedRange = localStorage.getItem('penopt-search-range');
      if (savedRange !== null) {
        var rangeVal = parseInt(savedRange, 10);
        if (!isNaN(rangeVal) && rangeVal >= 30 && rangeVal <= 75) {
          S.searchRange = rangeVal;
          var rangeInput = $('cfg-searchrange');
          if (rangeInput) rangeInput.value = rangeVal;
        }
      }
    } catch (_) {}
  }
}

document.addEventListener('DOMContentLoaded', init);
