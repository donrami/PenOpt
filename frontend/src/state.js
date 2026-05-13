// State — shared application state and DOM helpers

// ── Constants ──
export const DEG = Math.PI / 180;
export const WEIGHT_PRESETS = [
  // wBh = 0.0: fBh is a placeholder returning 0 for all orientations.
  // Weight redistributed to wTuy (both are artifact-related objectives).
  { id: 0, name: 'Quality',   wMtl: 0.5, wEnergy: 0.2, wHdn: 0.2, wTuy: 0.1,  wBh: 0.0 },
  { id: 1, name: 'Balanced',  wMtl: 0.3, wEnergy: 0.3, wHdn: 0.2, wTuy: 0.2,  wBh: 0.0 },
  { id: 2, name: 'Energy',    wMtl: 0.2, wEnergy: 0.5, wHdn: 0.2, wTuy: 0.1,  wBh: 0.0 },
];

// ── DOM Aliases ──
export const $ = id => document.getElementById(id);
export const qs = (s, p) => (p || document).querySelector(s);
export const qsa = (s, p) => [...(p || document).querySelectorAll(s)];

// ── State ──
export const S = {
  meshLoaded: false, meshInfo: null,
  scene: null, camera: null, renderer: null, controls: null,
  meshObject: null, meshClone: null, beamGroup: null, labelsGroup: null, animFrame: null,
  materialID: 'al', filterID: 'none', energy: 76, tPct: 0.1,
  searching: false, searchCancel: false,
  mats: [], filters: [], presets: [],
  viewMode: '3d',
  labelsVisible: false, beamVisible: false, compareMode: false,
  result: null, resultsStale: false, weightPreset: 0, method: 'minimax',
  resultsCollapsed: false,
  facePenetrations: null,
  facePenMin: 0, facePenMax: 0,
  rayGridXY: 0,  // 0 = use defaults (8 coarse / 16 fine); override via slider
  searchRange: 45,  // degrees, 0 = default 45°
};

// ── Error / Status ──
export function showError(msg) {
  var banner = $('error-banner');
  var textEl = $('error-text');
  textEl.textContent = msg;
  banner.classList.remove('hidden');
  // Store focus and move to the error banner for accessibility
  window.__prevFocusOnError = document.activeElement;
  banner.setAttribute('tabindex', '-1');
  banner.focus();
}
export function setStatus(msg) { $('status-text').textContent = msg; }

// T3.3: format milliseconds into human-readable time string
export function formatTime(ms) {
  if (ms < 1000) return '<1s>';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return sec + 's';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + 'm ' + s + 's';
}

// ── Themed confirmation dialog (replaces window.confirm) ──
export function showConfirm(message) {
  return new Promise(function(resolve) {
    var overlay = $('confirm-overlay');
    var textEl = $('confirm-text');
    var cancelBtn = $('confirm-cancel');
    var okBtn = $('confirm-ok');

    textEl.textContent = message;

    function closeOverlay() {
      overlay.classList.add('modal-closing');
      overlay.addEventListener('animationend', function onEnd() {
        overlay.removeEventListener('animationend', onEnd);
        overlay.classList.add('hidden');
        overlay.classList.remove('modal-closing');
      });
    }

    function cleanup(result) {
      closeOverlay();
      cancelBtn.removeEventListener('click', onCancel);
      okBtn.removeEventListener('click', onOk);
      document.removeEventListener('keydown', onKey);
      overlay.removeEventListener('click', onOverlayClick);
      resolve(result);
    }

    function onCancel() { cleanup(false); }
    function onOk() { cleanup(true); }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); cleanup(false); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === cancelBtn) {
          e.preventDefault();
          okBtn.focus();
        } else if (!e.shiftKey && document.activeElement === okBtn) {
          e.preventDefault();
          cancelBtn.focus();
        }
      }
    }

    function onOverlayClick(e) {
      if (e.target === overlay) cleanup(false);
    }

    cancelBtn.addEventListener('click', onCancel);
    okBtn.addEventListener('click', onOk);
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', onOverlayClick);

    overlay.classList.remove('modal-closing', 'hidden');
    cancelBtn.focus();
  });
}

// ── Stale results state machine ──
// When any parameter that invalidates the current results changes,
// the system marks results as stale and shows a clear visual indicator
// telling the user they need to rerun the optimization.

export function invalidateResults() {
  if (!S.result) return; // No results to invalidate
  S.resultsStale = true;

  // Status dot → amber
  const osDot = $('os-dot');
  if (osDot) osDot.className = 'os-dot os-dot--stale';
  const osText = $('os-text');
  if (osText) osText.textContent = 'Results outdated — rerun to update';
  setStatus('Results outdated — click Optimize to rerun');

  // Stale banner at the top of the results panel
  const resultsContent = $('results-content');
  if (resultsContent) {
    let banner = document.getElementById('stale-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'stale-banner';
      banner.className = 'stale-banner';
      banner.innerHTML = '<span class="stale-icon">\u26A0</span> <span>Parameters changed \u2014 <strong>results are outdated</strong>. Click <strong>Optimize</strong> to rerun with current settings.</span>';
      resultsContent.insertBefore(banner, resultsContent.firstChild);
    } else {
      banner.classList.remove('hidden');
    }
  }

  // Stale visual class on the results panel container
  const resultsPanel = $('results-panel');
  if (resultsPanel) resultsPanel.classList.add('results-stale');

  // Change Optimize buttons to "Re-optimize" with orangish fill
  const main = $('btn-optimize');
  const side = $('btn-optimize-sidebar');
  if (main && !main.disabled) { main.classList.add('btn-stale'); main.innerHTML = '\u25B6 Re-optimize'; }
  if (side && !side.disabled) { side.classList.add('btn-stale'); side.innerHTML = '\u25B6 Re-optimize'; }
}

export function clearStaleResults() {
  S.resultsStale = false;

  // Hide stale banner
  const banner = document.getElementById('stale-banner');
  if (banner) banner.classList.add('hidden');

  // Remove stale class from results panel
  const resultsPanel = $('results-panel');
  if (resultsPanel) resultsPanel.classList.remove('results-stale');

  // Restore Optimize buttons to default state
  const main = $('btn-optimize');
  const side = $('btn-optimize-sidebar');
  if (main) { main.classList.remove('btn-stale'); main.innerHTML = '\u25B6 <span>Optimize</span>'; }
  if (side) { side.classList.remove('btn-stale'); side.innerHTML = '\u25B6 <span>Optimize</span>'; }
}

// ── Optimize button state (syncs viewport header + sidebar) ──
export function setOptimizeBtnState(opts) {
  const main = $('btn-optimize');
  const side = $('btn-optimize-sidebar');
  if (opts.enabled !== undefined) {
    if (main) main.disabled = !opts.enabled;
    if (side) side.disabled = !opts.enabled;
  }
  if (opts.html !== undefined) {
    if (main) main.innerHTML = opts.html;
    if (side) side.innerHTML = opts.html;
  }
}
