// State — shared application state and DOM helpers

// ── Constants ──
export const DEG = Math.PI / 180;
export const WEIGHT_PRESETS = [
  { id: 0, name: 'Quality', wMtl: 0.5, wEnergy: 0.2, wHdn: 0.2, wTuy: 0.05, wBh: 0.05 },
  { id: 1, name: 'Balanced', wMtl: 0.3, wEnergy: 0.3, wHdn: 0.2, wTuy: 0.1, wBh: 0.1 },
  { id: 2, name: 'Energy', wMtl: 0.2, wEnergy: 0.5, wHdn: 0.2, wTuy: 0.05, wBh: 0.05 },
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
  viewMode: '3d', layoutMode: 'default',
  labelsVisible: false, beamVisible: false, compareMode: false,
  result: null, weightPreset: 0, method: 'minimax',
  resultsCollapsed: false,
  facePenetrations: null,
  facePenMin: 0, facePenMax: 0,
  rayGridXY: 0,  // 0 = use defaults (8 coarse / 16 fine); override via slider
  searchRange: 45,  // degrees, 0 = default 45°
};

// ── Error / Status ──
export function showError(msg) { $('error-text').textContent = msg; $('error-banner').classList.remove('hidden'); }
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
