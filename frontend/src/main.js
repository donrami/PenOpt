// ── Scrollbar fix for Plasma/KDE overlay scrollbars ──
// Forces consistent 6px scrollbars on all scrollable elements, preventing
// the KDE compositor from injecting widening overlay scrollbars on Wayland.
(function enforceScrollbars() {
  var enforced = false;

  function apply() {
    var targets = document.querySelectorAll(
      'html, body, #sidebar, #results-content, #mat-grid, ' +
      '.is-table-wrap, .help-body, .acc-body'
    );
    targets.forEach(function(el) {
      // Inline style wins over CSS — use !important to prevent enlargement
      el.style.setProperty('scrollbar-width', 'thin', 'important');
      el.style.setProperty('scrollbar-color',
        getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() || '#353850'
        + ' ' +
        (getComputedStyle(document.documentElement).getPropertyValue('--bg2').trim() || '#13151e'),
        'important'
      );
    });

    var webkitTargets = [
      'html', 'body',
      '#sidebar', '#results-content', '#mat-grid',
      '.is-table-wrap', '.help-body', '.acc-body'
    ];
    webkitTargets.forEach(function(sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      // Force thumb to stay 6px wide on hover via inline style
      var style = el.style;
      style.setProperty('--sb-w', '6px');
      style.setProperty('--sb-h', '6px');
    });
  }

  function tryApply() {
    if (document.body) {
      apply();
      enforced = true;
    } else if (!enforced) {
      requestAnimationFrame(tryApply);
    }
  }

  document.addEventListener('DOMContentLoaded', tryApply);
  if (document.readyState !== 'loading') tryApply();

  // Fallback: observe until the first successful application, then disconnect
  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(function() {
      if (!enforced && document.body) { apply(); enforced = true; mo.disconnect(); }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

// ── Animated Modal Helpers ──
function animateModalOpen(el) {
  el.classList.remove('modal-closing', 'hidden');
  // Force reflow so the animation plays
  void el.offsetWidth;
}

function animateModalClose(el) {
  if (el.classList.contains('hidden')) return;
  el.classList.add('modal-closing');
  el.addEventListener('animationend', function onEnd() {
    el.removeEventListener('animationend', onEnd);
    el.classList.add('hidden');
    el.classList.remove('modal-closing');
  });
}

// Bootstrap — initializes all modules and sets up keyboard shortcuts
import './style.css';
import { S, $, qsa, showError, setStatus, setOptimizeBtnState } from './state.js';
import { initScene, resizeViewport, resetCamera, switchViewMode, createBeamVisualization, destroyBeamVisualization, createLabels, destroyLabels } from './scene.js';
import { setupFileUpload, handlePickedMesh } from './filehandler.js';
import { setupSliders, renderMatGrid, renderFilters, selectMaterial, recalcBeam, setupScannerPresets, setMatFilter } from './materials.js';
import { setupAccordion, setupCardAccordion, setupTradeoff, setupExport, setupPlotTabs, runOptimization, cancelSearch } from './optimizer.js';
import { GetMaterials, GetFilters, GetScannerPresets, PickAndLoadMesh } from '../wailsjs/go/main/App';

// ── Keyboard shortcuts ──
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'Escape':
        $('error-banner').classList.add('hidden');
        if (window.__prevFocusOnError && window.__prevFocusOnError !== document.body && document.body.contains(window.__prevFocusOnError)) {
          window.__prevFocusOnError.focus();
        }
        window.__prevFocusOnError = null;
        animateModalClose($('help-overlay'));
        break;
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
  $('btn-help').addEventListener('click', () => {
    animateModalOpen($('help-overlay'));
    requestAnimationFrame(() => $('btn-help-close')?.focus());
  });
  $('btn-help-close').addEventListener('click', () => animateModalClose($('help-overlay')));
  $('help-overlay').addEventListener('click', e => { if (e.target === $('help-overlay')) animateModalClose($('help-overlay')); });

  // Focus trap — keeps keyboard navigation inside the open modal
  $('help-overlay').addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from($('help-card').querySelectorAll(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

// SOD ≥ SDD guard — physically impossible; show inline validation
function setupScannerValidation() {
  const sddInput = $('cfg-sdd');
  const sodInput = $('cfg-sod');
  if (!sddInput || !sodInput) return;

  let errorEl = null;

  function validate() {
    const sdd = parseFloat(sddInput.value) || 0;
    const sod = parseFloat(sodInput.value) || 0;
    if (sod >= sdd) {
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.style.cssText = 'grid-column:1/-1;font-size:11px;color:var(--red-500);margin-top:var(--sp-1)';
        errorEl.setAttribute('role', 'alert');
        sodInput.closest('.scanner-grid').appendChild(errorEl);
      }
      errorEl.textContent = 'SOD must be less than SDD';
      sddInput.style.borderColor = 'var(--red-500)';
      sodInput.style.borderColor = 'var(--red-500)';
    } else {
      if (errorEl) { errorEl.remove(); errorEl = null; }
      sddInput.style.borderColor = '';
      sodInput.style.borderColor = '';
    }
  }

  sddInput.addEventListener('input', validate);
  sodInput.addEventListener('input', validate);
}

$('btn-error-dismiss').addEventListener('click', function() {
  var banner = $('error-banner');
  banner.classList.add('hidden');
  // Restore focus to previously focused element
  if (window.__prevFocusOnError && window.__prevFocusOnError !== document.body && document.body.contains(window.__prevFocusOnError)) {
    window.__prevFocusOnError.focus();
  }
  window.__prevFocusOnError = null;
});

// ── Bootstrap ──
function setupTooltips() {
  // Suppress CSS tooltips when JS is active
  document.body.classList.add('js-tooltip-active');

  var tooltipEl = null;
  var tooltipTarget = null;

  // Shared hidden measuring element — prevents repeated DOM thrash
  var measEl = document.createElement('div');
  measEl.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;padding:4px 8px;font-size:10px;font-weight:500;font-family:var(--font,Inter,sans-serif);line-height:1.4;max-width:300px;white-space:nowrap';
  document.body.appendChild(measEl);

  function measureTooltip(text) {
    measEl.textContent = text;
    var rect = measEl.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  function createTooltip(text) {
    var el = document.createElement('div');
    el.className = 'js-tooltip';
    el.textContent = text;
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;padding:4px 8px;background:var(--surface,#1e2130);color:var(--text,#dde0ed);border:1px solid var(--border-light,#353850);border-radius:4px;font-size:10px;font-weight:500;font-family:var(--font,Inter,sans-serif);white-space:nowrap;pointer-events:none;z-index:9999;box-shadow:0 10px 20px rgba(0,0,0,0.45),0 4px 8px rgba(0,0,0,0.3);line-height:1.4;opacity:0;max-width:300px;overflow:hidden;text-overflow:ellipsis';
    document.body.appendChild(el);
    return el;
  }

  function positionTooltip(el, target, text) {
    // Measure first via hidden element (avoids layout thrash on the visible tooltip)
    var dims = measureTooltip(text);
    var tipW = dims.width;
    var tipH = dims.height;

    var rect = target.getBoundingClientRect();
    var gap = 6;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var spaceAbove = rect.top - gap;
    var spaceBelow = vh - rect.bottom - gap;

    var above;
    // Vertical: prefer above, flip below if not enough room
    if (spaceAbove >= tipH) {
      above = rect.top - tipH - gap;
    } else if (spaceBelow >= tipH) {
      above = rect.bottom + gap;
    } else {
      // Neither side has full room — use the side with more space
      above = spaceAbove >= spaceBelow
        ? rect.top - tipH - gap
        : rect.bottom + gap;
    }

    // Horizontal: center on target, clamp to viewport with padding
    var centerX = rect.left + rect.width / 2 - tipW / 2;
    var left = Math.max(4, Math.min(centerX, vw - tipW - 4));

    // Edge-nudge: when target is near the viewport edge, align tooltip
    // to the target's side rather than centering in void space
    if (left === 4 && centerX < 4) {
      left = Math.max(4, rect.left + 4);
    } else if (left === vw - tipW - 4 && centerX > vw - tipW - 4) {
      left = Math.min(vw - tipW - 4, rect.right - tipW - 4);
    }

    // Apply position
    el.style.left = left + 'px';
    el.style.top = above + 'px';
    el.style.opacity = '1';

    // Arrow
    var arrowDir = (above < rect.top) ? 'bottom' : 'top';
    var arrowSize = 4;
    var arrowLeft = rect.left + rect.width / 2 - left;

    var existingArrow = el.querySelector('.js-tip-arrow');
    var arrowDiv = existingArrow || document.createElement('div');
    arrowDiv.className = 'js-tip-arrow';
    arrowDiv.style.cssText = 'position:absolute;pointer-events:none;z-index:1;' +
      (arrowDir === 'bottom'
        ? 'bottom:-' + (arrowSize * 2) + 'px;left:' + arrowLeft + 'px;border:' + arrowSize + 'px solid transparent;border-top-color:var(--border-light,#353850)'
        : 'top:-' + (arrowSize * 2) + 'px;left:' + arrowLeft + 'px;border:' + arrowSize + 'px solid transparent;border-bottom-color:var(--border-light,#353850)');
    if (!existingArrow) el.appendChild(arrowDiv);
  }

  document.addEventListener('mouseenter', function(e) {
    var target = e.target.closest('[data-tip]');
    if (!target) return;
    var text = target.getAttribute('data-tip');
    if (!text) return;

    // Dismiss previous
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }

    tooltipEl = createTooltip(text);
    tooltipTarget = target;
    positionTooltip(tooltipEl, target, text);
  }, true);

  document.addEventListener('mouseleave', function(e) {
    var target = e.target.closest('[data-tip]');
    if (!target) return;
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
    tooltipTarget = null;
  }, true);

  // Reposition on scroll/resize while active — rAF-coalesced to avoid layout thrash
  var _tipTickPending = false;
  function reposition() {
    if (_tipTickPending) return;
    _tipTickPending = true;
    requestAnimationFrame(function() {
      _tipTickPending = false;
      if (tooltipEl && tooltipTarget && document.body.contains(tooltipTarget)) {
        positionTooltip(tooltipEl, tooltipTarget, tooltipEl.textContent);
      }
    });
  }
  window.addEventListener('scroll', reposition, { capture: true, passive: true });
  window.addEventListener('resize', reposition, { passive: true });
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
  setupScannerValidation();

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

  // Buttons
  $('btn-reset-cam').addEventListener('click', resetCamera);
  $('btn-fullscreen').addEventListener('click', toggleFullscreen);
  $('btn-labels').addEventListener('click', function() {
    S.labelsVisible = !S.labelsVisible;
    $('btn-labels').classList.toggle('active', S.labelsVisible);
    $('btn-labels').setAttribute('aria-pressed', S.labelsVisible ? 'true' : 'false');
    if (S.labelsGroup) {
      S.labelsGroup.visible = S.labelsVisible;
      S.renderScene?.();
    } else {
      createLabels();
    }
  });
  $('btn-beam').addEventListener('click', function() {
    S.beamVisible = !S.beamVisible;
    $('btn-beam').classList.toggle('active', S.beamVisible);
    $('btn-beam').setAttribute('aria-pressed', S.beamVisible ? 'true' : 'false');
    if (S.beamGroup) {
      S.beamGroup.visible = S.beamVisible;
      S.renderScene?.();
    }
  });

  // Default material
  selectMaterial('al'); recalcBeam();
  $('idle-prompt').style.display = ''; setStatus('Ready — drop a mesh file');


  // Results panel collapse toggle
  const CHEV_DOWN = '<svg width="10" height="10" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
  const CHEV_UP   = '<svg width="10" height="10" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" style="transform:rotate(180deg)" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';

  const resultsPanel = $('results-panel');
  const resultsContent = $('results-content');
  const resultsCollapseBtn = $('results-collapse-btn');
  if (resultsCollapseBtn && resultsPanel) {
    // Apply persisted collapsed state
    if (S.resultsCollapsed) {
      resultsContent.style.display = 'none';
      resultsCollapseBtn.innerHTML = CHEV_UP;
      resultsCollapseBtn.setAttribute('aria-label', 'Expand results');
    }
    resultsCollapseBtn.addEventListener('click', function() {
      S.resultsCollapsed = resultsContent.style.display !== 'none';
      resultsContent.style.display = S.resultsCollapsed ? 'none' : '';
      resultsCollapseBtn.innerHTML = S.resultsCollapsed ? CHEV_UP : CHEV_DOWN;
      resultsCollapseBtn.setAttribute('aria-label', S.resultsCollapsed ? 'Expand results' : 'Collapse results');
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
