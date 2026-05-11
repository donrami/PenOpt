// State — shared application state and DOM helpers

// ── Constants ──
export const DEG = Math.PI / 180;
export const WEIGHT_PRESETS = [
  { id: 0, name: 'Quality', wMtl: 0.6, wEnergy: 0.2, wHdn: 0.2 },
  { id: 1, name: 'Balanced', wMtl: 0.4, wEnergy: 0.4, wHdn: 0.2 },
  { id: 2, name: 'Energy', wMtl: 0.2, wEnergy: 0.6, wHdn: 0.2 },
];

// ── DOM Aliases ──
export const $ = id => document.getElementById(id);
export const qs = (s, p) => (p || document).querySelector(s);
export const qsa = (s, p) => [...(p || document).querySelectorAll(s)];

// ── State ──
export const S = {
  meshLoaded: false, meshInfo: null,
  scene: null, camera: null, renderer: null, controls: null,
  meshObject: null, meshClone: null, beamGroup: null, animFrame: null,
  materialID: 'al', filterID: 'none', energy: 76, tPct: 0.1,
  searching: false, searchCancel: false,
  mats: [], filters: [], presets: [],
  viewMode: '3d', layoutMode: 'default',
  labelsVisible: false, beamVisible: false, compareMode: false,
  result: null, weightPreset: 0, method: 'minimax',
  facePenetrations: null,
  facePenMin: 0, facePenMax: 0,
};

// ── Error / Status ──
export function showError(msg) { $('error-text').textContent = msg; $('error-banner').classList.remove('hidden'); }
export function setStatus(msg) { $('status-text').textContent = msg; }
