// Bootstrap — initializes all modules and sets up keyboard shortcuts
import './style.css';
import { S, $, qsa, showError, setStatus } from './state.js';
import { initScene, resizeViewport, resetCamera, switchViewMode, switchLayoutMode, createBeamVisualization, destroyBeamVisualization } from './scene.js';
import { setupFileUpload, handlePickedMesh } from './filehandler.js';
import { setupSliders, renderMatGrid, renderFilters, selectMaterial, recalcBeam, setupScannerPresets, setMatFilter } from './materials.js';
import { setupRayGrid, setupAccordion, setupCardAccordion, setupTradeoff, setupExport, setupPlotTabs, runOptimization, cancelSearch } from './optimizer.js';
import { GetMaterials, GetFilters, GetScannerPresets, PickAndLoadMesh } from '../wailsjs/go/main/App';

// ── Keyboard shortcuts ──
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'Escape': $('error-banner').classList.add('hidden'); $('help-overlay').classList.add('hidden'); break;
      case 'o': if (e.ctrlKey) { e.preventDefault(); PickAndLoadMesh().then(info => { if (info) handlePickedMesh(info); }).catch(err => showError('File picker error: ' + err)); } break;
      case 'Enter': if (e.ctrlKey) { e.preventDefault(); if (!$('btn-optimize').disabled) runOptimization(); } break;
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
async function init() {
  initScene();
  resizeViewport();
  window.addEventListener('resize', resizeViewport);

  try {
    const [matsJson, filtersJson, presetsJson] = await Promise.all([GetMaterials(), GetFilters(), GetScannerPresets()]);
    S.mats = JSON.parse(matsJson); S.filters = JSON.parse(filtersJson); S.presets = JSON.parse(presetsJson);
    renderMatGrid(); renderFilters();
  } catch (err) { showError('Failed to load database: ' + err.message); }

  setupFileUpload(); setupSliders(); setupAccordion(); setupCardAccordion(); setupRayGrid(); setupHelp(); setupKeyboard();
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
    if (S.beamVisible) { createBeamVisualization(); }
    else { destroyBeamVisualization(); }
  });

  // Default material
  selectMaterial('al'); recalcBeam();
  $('idle-prompt').style.display = ''; setStatus('Ready — drop a mesh file');

  // Restore previous result if available
  try {
    var saved = localStorage.getItem('penopt-last-result');
    if (saved) { $('restore-banner').classList.remove('hidden'); }
  } catch (_) {}
  $('btn-restore').addEventListener('click', function() {
    $('restore-banner').classList.add('hidden');
    try {
      var data = JSON.parse(localStorage.getItem('penopt-last-result'));
      if (data && data.bestOrientation) {
        $('rs-angle').textContent = '\u03B8=' + data.bestOrientation.theta + '\u00B0 \u03C6=' + data.bestOrientation.phi + '\u00B0';
        $('results-panel').classList.remove('hidden');
        $('card-tradeoff').classList.remove('tradeoff-disabled');
        setStatus('Restored previous results');
      }
    } catch (_) {}
  });
  $('btn-restore-dismiss').addEventListener('click', function() {
    $('restore-banner').classList.add('hidden');
  });

  // Results panel collapse toggle
  const resultsPanel = $('results-panel');
  const resultsContent = $('results-content');
  const resultsCollapseBtn = $('results-collapse-btn');
  if (resultsCollapseBtn && resultsPanel) {
    resultsCollapseBtn.addEventListener('click', function() {
      const isCollapsed = resultsContent.style.display === 'none';
      resultsContent.style.display = isCollapsed ? '' : 'none';
      resultsCollapseBtn.innerHTML = isCollapsed ? '&#x25BC;' : '&#x25B2;';
      resultsCollapseBtn.title = isCollapsed ? 'Collapse results' : 'Expand results';
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
