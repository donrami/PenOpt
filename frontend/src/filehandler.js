// FileHandler — file upload, drag-drop, mesh loading
import { S, $, showError, setStatus, setOptimizeBtnState } from './state.js';
import { renderMesh, createBeamVisualization, destroyBeamVisualization, exitCompareMode } from './scene.js';
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
    $('grid-info').classList.remove('hidden');
    const wtDot = $('fm-dot'), wtText = $('fm-wt'), wtBanner = $('wt-banner');
    if (info.isWatertight) { wtDot.className = 'dot dot--green'; wtText.textContent = 'watertight'; wtBanner.classList.add('hidden'); }
    else { wtDot.className = 'dot dot--amber'; wtText.textContent = `${info.boundaryEdges} boundary edges — non-watertight`; wtBanner.textContent = '⚠ Mesh has open edges — results may be unreliable'; wtBanner.classList.remove('hidden'); }
    $('os-text').textContent = 'Ready'; $('os-dot').className = 'os-dot os-dot--ready';
    setOptimizeBtnState({ enabled: true });
    setStatus(`Loaded ${info.numTriangles.toLocaleString()} tris`);
    $('status-mesh').textContent = info.numTriangles.toLocaleString() + ' tris';
    $('card-tradeoff').classList.add('tradeoff-disabled');
    $('vp-loading').classList.add('hidden');
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
    $('fm-bbox').textContent = `${info.boundsMinX.toFixed(0)}..${info.boundsMaxX.toFixed(0)}`;
    $('file-meta').classList.remove('hidden');
    $('grid-info').classList.remove('hidden');
    const wtDot = $('fm-dot'), wtText = $('fm-wt'), wtBanner = $('wt-banner');
    if (info.isWatertight) { wtDot.className = 'dot dot--green'; wtText.textContent = 'watertight'; wtBanner.classList.add('hidden'); }
    else { wtDot.className = 'dot dot--amber'; wtText.textContent = info.boundaryEdges + ' boundary edges — non-watertight'; wtBanner.textContent = '⚠ Mesh has open edges — results may be unreliable'; wtBanner.classList.remove('hidden'); }
    $('os-text').textContent = 'Ready'; $('os-dot').className = 'os-dot os-dot--ready';
    setOptimizeBtnState({ enabled: true });
    setStatus('Loaded ' + info.numTriangles.toLocaleString() + ' tris');
    $('status-mesh').textContent = info.numTriangles.toLocaleString() + ' tris';
    $('card-tradeoff').classList.add('tradeoff-disabled');
    try { localStorage.setItem('penopt-last-mesh', info.name); } catch (_) {}
  } catch (err) { showError('Render error: ' + err.message); }
  $('vp-loading').classList.add('hidden');
}

export function removeMesh() {
  if (S.result && !confirm('Remove current mesh and clear all results?')) return;
  if (S.meshObject) { S.scene.remove(S.meshObject); S.meshObject.geometry.dispose(); S.meshObject.material.dispose(); S.meshObject = null; }
  destroyBeamVisualization();
  exitCompareMode();
  S.renderScene?.();
  S.meshLoaded = false; S.meshInfo = null; S.result = null; S.facePenetrations = null;
  $('file-meta').classList.add('hidden'); $('grid-info').classList.add('hidden'); $('results-panel').classList.add('hidden');
  $('wt-banner').classList.add('hidden'); $('btn-reset-float').classList.add('hidden');
  $('card-tradeoff').style.display = 'none'; $('heatmap-legend').classList.add('hidden');
  // Clear result warnings (rendered by optimizer.js renderResultWarnings)
  [].slice.call(document.querySelectorAll('.result-warning')).forEach(el => el.remove());
  $('os-dot').className = 'os-dot os-dot--idle'; $('os-text').textContent = 'Upload a mesh and select a material';
  setOptimizeBtnState({ enabled: false, html: '\u25B6 <span>Optimize</span>' }); setStatus('Ready'); $('status-mesh').textContent = ''; $('idle-prompt').style.display = '';
}
