// FileHandler — file upload, drag-drop, mesh loading
import { S, $, showError, setStatus, setOptimizeBtnState, showConfirm, invalidateResults, clearStaleResults } from './state.js';
import { renderMesh, createBeamVisualization, destroyBeamVisualization, destroyLabels, exitCompareMode } from './scene.js';
import { recalcBeam } from './materials.js';
import { LoadMeshFromBytes, PickAndLoadMesh, GetVertexBuffer } from '../wailsjs/go/main/App';

export function setupFileUpload() {
  const dz = $('drop-zone');
  // Click uses native Wails file dialog with .stl/.obj filter
  dz.addEventListener('click', async () => {
    try {
      const info = await PickAndLoadMesh();
      if (info) handlePickedMesh(info);
    } catch (err) { showError('File picker error: ' + err); }
  });
  // Fallback HTML input for environments where Wails dialog is unavailable
  $('file-input').addEventListener('change', () => { if ($('file-input').files[0]) handleFile($('file-input').files[0]); });
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  $('viewport').addEventListener('dragover', e => e.preventDefault());
  $('viewport').addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  $('btn-remove').addEventListener('click', removeMesh);
}

async function handleFile(file) {
  $('vp-loading').classList.remove('hidden');
  $('idle-prompt').style.display = 'none';
  setStatus('Reading file...');
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (ext !== '.stl' && ext !== '.obj') { showError('Unsupported format'); $('vp-loading').classList.add('hidden'); return; }
  try {
    const buf = await file.arrayBuffer();
    // Wails v2 expects Array<number> for []byte (Uint8Array serializes as {"0":0,"1":1,...})
    const info = await LoadMeshFromBytes(file.name, Array.from(new Uint8Array(buf)));
    if (!info) { showError('Failed to parse mesh'); $('vp-loading').classList.add('hidden'); return; }
    S.meshInfo = info; S.meshLoaded = true;
    const verts = await GetVertexBuffer(); renderMesh(verts);
    // Pre-create beam visualization (hidden until toggled)
    createBeamVisualization();
    if (S.beamGroup) S.beamGroup.visible = false;
    $('fm-name').textContent = file.name;
    $('fm-tris').textContent = info.numTriangles.toLocaleString() + ' triangles';
    $('fm-bbox').textContent = `${info.boundsMinX.toFixed(0)}..${info.boundsMaxX.toFixed(0)}`;
    $('file-meta').classList.remove('hidden');
    $('drop-zone').classList.add('hidden');
    $('grid-info').classList.remove('hidden');
    const wtDot = $('fm-dot'), wtText = $('fm-wt'), wtBanner = $('wt-banner');
    if (info.isWatertight) {
      wtDot.className = 'dot dot--green'; wtText.textContent = 'watertight';
      wtBanner.classList.add('hidden');
    } else {
      wtDot.className = 'dot dot--amber'; wtText.textContent = `${info.boundaryEdges} boundary edges — non-watertight`;
      wtBanner.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="flex-shrink:0"><path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 3v3m0 1.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg> Mesh has open edges — penetration values may be underestimated';
      wtBanner.classList.remove('hidden');
    }
    $('os-text').textContent = 'Ready'; $('os-dot').className = 'os-dot os-dot--ready';
    setOptimizeBtnState({ enabled: true });
    setStatus(`Loaded ${info.numTriangles.toLocaleString()} tris`);
    $('status-mesh').textContent = info.numTriangles.toLocaleString() + ' tris';
    $('card-tradeoff').classList.add('tradeoff-disabled');
    // Auto-open Material + Optimize cards
    const matCard = $('card-material');
    const optCard = $('card-optimize');
    if (matCard) {
      var matBody = matCard.querySelector('.card-body');
      if (matBody) { matBody.classList.add('no-animate'); matBody.style.maxHeight = ''; }
      matCard.classList.add('open');
      matCard.querySelector('.chevron')?.classList.add('open');
      if (matBody) { requestAnimationFrame(function() { requestAnimationFrame(function() { matBody.classList.remove('no-animate'); }); }); }
    }
    if (optCard) {
      var optBody = optCard.querySelector('.card-body');
      if (optBody) { optBody.classList.add('no-animate'); optBody.style.maxHeight = ''; }
      optCard.classList.add('open');
      optCard.querySelector('.chevron')?.classList.add('open');
      if (optBody) { requestAnimationFrame(function() { requestAnimationFrame(function() { optBody.classList.remove('no-animate'); }); }); }
    }
    $('vp-loading').classList.add('hidden');
    // New mesh invalidates any previous results
    invalidateResults();
    // Persist mesh info
    try { localStorage.setItem('penopt-last-mesh', file.name); } catch (_) {}
  } catch (err) { showError('Load error: ' + err.message); $('vp-loading').classList.add('hidden'); }
}

export async function handlePickedMesh(info) {
  $('vp-loading').classList.remove('hidden');
  $('idle-prompt').style.display = 'none';
  setStatus('Loading mesh...');
  S.meshInfo = info;
  S.meshLoaded = true;
  try {
    const verts = await GetVertexBuffer();
    renderMesh(verts);
    // Pre-create beam visualization (hidden until toggled)
    createBeamVisualization();
    if (S.beamGroup) S.beamGroup.visible = false;
    $('fm-name').textContent = info.name;
    $('fm-tris').textContent = info.numTriangles.toLocaleString() + ' triangles';
    $('fm-bbox').textContent = `${info.extentX.toFixed(0)} × ${info.extentY.toFixed(0)} × ${info.extentZ.toFixed(0)} mm`;
    $('file-meta').classList.remove('hidden');
    $('drop-zone').classList.add('hidden');
    $('grid-info').classList.remove('hidden');
    const wtDot = $('fm-dot'), wtText = $('fm-wt'), wtBanner = $('wt-banner');
    if (info.isWatertight) {
      wtDot.className = 'dot dot--green'; wtText.textContent = 'watertight';
      wtBanner.classList.add('hidden');
    } else {
      wtDot.className = 'dot dot--amber'; wtText.textContent = info.boundaryEdges + ' boundary edges — non-watertight';
      wtBanner.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="flex-shrink:0"><path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 3v3m0 1.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg> Mesh has open edges — penetration values may be underestimated';
      wtBanner.classList.remove('hidden');
    }
    $('os-text').textContent = 'Ready'; $('os-dot').className = 'os-dot os-dot--ready';
    setOptimizeBtnState({ enabled: true });
    setStatus('Loaded ' + info.numTriangles.toLocaleString() + ' tris');
    $('status-mesh').textContent = info.numTriangles.toLocaleString() + ' tris';
    $('card-tradeoff').classList.add('tradeoff-disabled');
    // Auto-open Material + Optimize cards
    const matCard = $('card-material');
    const optCard = $('card-optimize');
    if (matCard) {
      var matBody = matCard.querySelector('.card-body');
      if (matBody) { matBody.classList.add('no-animate'); matBody.style.maxHeight = ''; }
      matCard.classList.add('open');
      matCard.querySelector('.chevron')?.classList.add('open');
      if (matBody) { requestAnimationFrame(function() { requestAnimationFrame(function() { matBody.classList.remove('no-animate'); }); }); }
    }
    if (optCard) {
      var optBody = optCard.querySelector('.card-body');
      if (optBody) { optBody.classList.add('no-animate'); optBody.style.maxHeight = ''; }
      optCard.classList.add('open');
      optCard.querySelector('.chevron')?.classList.add('open');
      if (optBody) { requestAnimationFrame(function() { requestAnimationFrame(function() { optBody.classList.remove('no-animate'); }); }); }
    }
    try { localStorage.setItem('penopt-last-mesh', info.name); } catch (_) {}
  } catch (err) { showError('Render error: ' + err.message); }
  $('vp-loading').classList.add('hidden');
  // New mesh invalidates any previous results
  invalidateResults();
}

export async function removeMesh() {
  const confirmed = await showConfirm('Remove mesh and clear all results?');
  if (!confirmed) return;
  if (S.meshObject) { S.scene.remove(S.meshObject); S.meshObject.geometry.dispose(); S.meshObject.material.dispose(); S.meshObject = null; }
  destroyBeamVisualization();
  destroyLabels();
  exitCompareMode();
  S.renderScene?.();
  S.meshLoaded = false; S.meshInfo = null; S.result = null; S.facePenetrations = null;
  $('file-meta').classList.add('hidden'); $('drop-zone').classList.remove('hidden'); $('grid-info').classList.add('hidden'); $('results-panel').classList.add('hidden');
  $('wt-banner').classList.add('hidden');
  $('card-tradeoff').style.display = 'none'; $('heatmap-legend').classList.add('hidden');
  // Clear result warnings
  [].slice.call(document.querySelectorAll('.result-warning')).forEach(el => el.remove());
  $('os-dot').className = 'os-dot os-dot--idle'; $('os-text').textContent = 'Upload a mesh and select a material';
  setOptimizeBtnState({ enabled: false, html: '\u25B6 <span>Optimize</span>' }); setStatus('Ready'); $('status-mesh').textContent = ''; $('idle-prompt').style.display = '';
  clearStaleResults();

  // Close Material + Optimize cards (suppress transitions during programmatic close)
  ['card-material', 'card-optimize'].forEach(function(id) {
    const card = $(id);
    if (!card) return;
    var cb = card.querySelector('.card-body');
    if (cb) { cb.classList.add('no-animate'); cb.style.maxHeight = ''; }
    card.classList.remove('open');
    card.querySelector('.chevron')?.classList.remove('open');
    if (cb) { requestAnimationFrame(function() { requestAnimationFrame(function() { cb.classList.remove('no-animate'); }); }); }
  });
}
