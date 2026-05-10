import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { drawContourPlot, drawPenetrationRose } from './plots.js';
import { exportJSON, exportPNG } from './export.js';

// ── Wails bindings ──
import {
  LoadMeshFromBytes, PickAndLoadMesh, RunOptimization, GetVertexBuffer, GetMaterials, GetFilters,
  CalcBeamParams, CalcEnergyRecommendation, GetScannerPresets, ComputeFaceHeatmap,
} from '../wailsjs/go/main/App';

// Wails runtime for async events
const runtime = window.runtime;

// ── Constants ──
const DEG = Math.PI / 180;
const WEIGHT_PRESETS = [
  { id: 0, name: 'Quality', wMtl: 0.6, wEnergy: 0.2, wHdn: 0.2 },
  { id: 1, name: 'Balanced', wMtl: 0.4, wEnergy: 0.4, wHdn: 0.2 },
  { id: 2, name: 'Energy', wMtl: 0.2, wEnergy: 0.6, wHdn: 0.2 },
];

// ── State ──
const S = {
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

// ── DOM Aliases ──
const $ = id => document.getElementById(id);
const qs = (s, p) => (p || document).querySelector(s);
const qsa = (s, p) => [...(p || document).querySelectorAll(s)];

// ── Error / Status ──
function showError(msg) { $('error-text').textContent = msg; $('error-banner').classList.remove('hidden'); }
$('btn-error-dismiss').addEventListener('click', () => $('error-banner').classList.add('hidden'));
function setStatus(msg) { $('status-text').textContent = msg; }

// ── Three.js ──
function initScene() {
  const c = $('viewport');
  const w = c.clientWidth, h = c.clientHeight;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0e14);
  const camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
  camera.position.set(300, 200, 400);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  c.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.target.set(0, 0, 0);
  scene.add(new THREE.AmbientLight(0x404060, 0.5));
  const d1 = new THREE.DirectionalLight(0xffffff, 0.8); d1.position.set(200, 300, 400); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x6688cc, 0.3); d2.position.set(-200, -100, -300); scene.add(d2);
  scene.add(new THREE.GridHelper(800, 20, 0x2a2d3e, 0x1e2130));
  scene.add(new THREE.AxesHelper(200));
  S.scene = scene; S.camera = camera; S.renderer = renderer; S.controls = controls;
  animate();
}
function animate() { S.animFrame = requestAnimationFrame(animate); S.controls?.update(); S.renderer?.render(S.scene, S.camera); }
function resizeViewport() { if (!S.renderer) return; const c = $('viewport'); S.camera.aspect = c.clientWidth / c.clientHeight; S.camera.updateProjectionMatrix(); S.renderer.setSize(c.clientWidth, c.clientHeight); }
function resetCamera() { if (!S.camera) return; S.camera.position.set(300, 200, 400); S.controls.target.set(0, 0, 0); S.controls.update(); }

// ── Mesh Rendering ──
function renderMesh(verts) {
  if (S.meshObject) { S.scene.remove(S.meshObject); S.meshObject.geometry.dispose(); S.meshObject.material.dispose(); S.meshObject = null; }
  if (!verts?.length) { $('btn-reset-float').classList.add('hidden'); return; }
  const pos = new Float32Array(verts);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const nt = pos.length / 9; const idx = new Uint32Array(nt * 3);
  for (let i = 0; i < nt; i++) { idx[i*3] = i*3; idx[i*3+1] = i*3+1; idx[i*3+2] = i*3+2; }
  geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeVertexNormals(); geo.computeBoundingBox();
  const center = new THREE.Vector3(); geo.boundingBox.getCenter(center); geo.translate(-center.x, -center.y, -center.z);
  const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.3, roughness: 0.6, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat); S.scene.add(mesh); S.meshObject = mesh;
  const box = new THREE.Box3().setFromObject(mesh); const sz = box.getSize(new THREE.Vector3());
  const dist = Math.max(sz.x, sz.y, sz.z) * 1.8;
  S.camera.position.set(dist * 0.6, dist * 0.4, dist * 0.8); S.controls.target.set(0, 0, 0); S.controls.update();
  $('btn-reset-float').classList.remove('hidden');
}

// ── File Handling ──
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
    $('fm-name').textContent = file.name;
    $('fm-tris').textContent = info.numTriangles.toLocaleString() + ' triangles';
    $('fm-bbox').textContent = `${info.boundsMinX.toFixed(0)}..${info.boundsMaxX.toFixed(0)}`;
    $('file-meta').classList.remove('hidden');
    $('grid-info').classList.remove('hidden');
    const wtDot = $('fm-dot'), wtText = $('fm-wt'), wtBanner = $('wt-banner');
    if (info.isWatertight) { wtDot.className = 'dot dot--green'; wtText.textContent = 'watertight'; wtBanner.classList.add('hidden'); }
    else { wtDot.className = 'dot dot--amber'; wtText.textContent = `${info.boundaryEdges} boundary edges — non-watertight`; wtBanner.textContent = '⚠ Mesh has open edges — results may be unreliable'; wtBanner.classList.remove('hidden'); }
    $('os-text').textContent = 'Ready'; $('os-dot').className = 'os-dot os-dot--ready';
    $('btn-optimize').disabled = false;
    setStatus(`Loaded ${info.numTriangles.toLocaleString()} tris`);
    $('status-mesh').textContent = info.numTriangles.toLocaleString() + ' tris';
    $('vp-loading').classList.add('hidden');
    // Persist mesh info
    try { localStorage.setItem('penopt-last-mesh', file.name); } catch (_) {}
  } catch (err) { showError('Load error: ' + err.message); $('vp-loading').classList.add('hidden'); }
}

// ── Material Picker ──
let _matFilter = 'all', _matSearch = '';
function renderMatGrid() {
  const grid = $('mat-grid'); grid.innerHTML = '';
  const filtered = S.mats.filter(m => {
    if (_matFilter !== 'all' && m.cat !== _matFilter) return false;
    if (_matSearch) return m.name.toLowerCase().includes(_matSearch.toLowerCase()) || m.id.toLowerCase().includes(_matSearch);
    return true;
  });
  for (const m of filtered) {
    const el = document.createElement('div');
    el.className = 'mat-item'; el.dataset.id = m.id;
    if (S.materialID === m.id) el.classList.add('active');
    el.innerHTML = `<span class="mat-swatch" style="background:${m.color}"></span><span class="mat-name">${m.name}</span>`;
    el.addEventListener('click', () => selectMaterial(m.id));
    grid.appendChild(el);
  }
}
function selectMaterial(id) {
  S.materialID = id;
  qsa('.mat-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
  recalcBeam();
}

// ── Beam Energy ──
function recalcBeam() {
  CalcBeamParams(S.energy, S.tPct, S.filterID, S.materialID).then(json => {
    const res = JSON.parse(json); if (res.error) return;
    $('disp-energy').textContent = S.energy; $('disp-tmin').textContent = S.tPct.toFixed(2);
    $('pill-kev').textContent = S.energy + ' keV'; $('pill-tmin').textContent = S.tPct.toFixed(2) + '% Tmin';
    $('pill-eeff').textContent = res.eEff.toFixed(0) + ' Eeff'; $('acc-beam-val').textContent = res.eEff.toFixed(0) + ' keV';
    if (res.filter) {
      $('filter-stats').hidden = false;
      $('fs-eeff').textContent = res.filter.eEff.toFixed(1); $('fs-shift').textContent = '+' + res.filter.eShift.toFixed(1);
      $('fs-flux').textContent = (res.filter.fluxRatio * 100).toFixed(1) + '%'; $('fs-hvl').textContent = res.filter.hvlCu.toFixed(2) + ' mm';
    } else { $('filter-stats').hidden = true; }
  }).catch(() => {});
}

// ── View Modes ──
// ── Compare Mode ──
function enterCompareMode() {
  if (S.compareMode || !S.meshObject || !S.result) return;
  exitCompareMode();

  var best = S.result.bestOrientation;

  S.meshObject.rotation.x = best.theta * DEG;
  S.meshObject.rotation.y = best.phi * DEG;
  S.meshObject.material.transparent = false;
  S.meshObject.material.opacity = 1;
  S.meshObject.material.depthWrite = true;
  if (!S.meshObject.material.vertexColors) {
    S.meshObject.material.color.setHex(0x3b82f6);
  }
  S.meshObject.material.needsUpdate = true;

  var ghostMat = S.meshObject.material.clone();
  ghostMat.color.setHex(0xff6b35);
  ghostMat.vertexColors = false;
  ghostMat.transparent = true;
  ghostMat.opacity = 0.35;
  ghostMat.depthWrite = false;

  S.meshClone = new THREE.Mesh(S.meshObject.geometry, ghostMat);
  S.meshClone.position.copy(S.meshObject.position);
  S.meshClone.rotation.set(0, 0, 0);
  S.scene.add(S.meshClone);
  S.compareMode = true;
  $('compare-info').classList.remove('hidden');
}

function exitCompareMode() {
  if (!S.compareMode) return;
  S.compareMode = false;
  if (S.meshClone) {
    S.scene.remove(S.meshClone);
    S.meshClone.material.dispose();
    S.meshClone = null;
  }
  $('compare-info').classList.add('hidden');
  if (S.meshObject && S.result) {
    var best = S.result.bestOrientation;
    S.meshObject.rotation.x = best.theta * DEG;
    S.meshObject.rotation.y = best.phi * DEG;
    S.meshObject.material.transparent = false;
    S.meshObject.material.opacity = 1;
    S.meshObject.material.depthWrite = true;
    S.meshObject.material.needsUpdate = true;
  }
}

// ── Beam Visualization ──
function createBeamVisualization() {
  destroyBeamVisualization();
  S.beamGroup = new THREE.Group();

  var sod = parseFloat($('cfg-sod').value) || 700;
  var sdd = parseFloat($('cfg-sdd').value) || 1000;
  var detW = parseFloat($('cfg-detw').value) || 400;
  var detH = parseFloat($('cfg-deth').value) || 400;
  var detX = sdd - sod;
  var objBaseY = -100;
  if (S.meshObject && S.meshObject.geometry.boundingBox) {
    objBaseY = S.meshObject.geometry.boundingBox.min.y;
  }
  var srcPos = new THREE.Vector3(-sod, 0, 0);
  var detCenter = new THREE.Vector3(detX, 0, 0);

  function structMat(c, o, m, r) {
    return new THREE.MeshStandardMaterial({ color: c, roughness: r || 0.7, metalness: m || 0.3, transparent: true, opacity: o || 0.5, depthWrite: false });
  }
  function basicMat(c, o) {
    return new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o || 1, depthWrite: false });
  }

  var floorY = objBaseY - 120;

  // Floor
  var floor = new THREE.Mesh(new THREE.BoxGeometry(1200, 6, 700), basicMat(0x181e28, 0.10));
  floor.position.y = floorY;
  S.beamGroup.add(floor);

  // Source housing
  var housingRad = 100, housingLen = 300, housingEndX = -sod - 60;
  var housing = new THREE.Mesh(new THREE.CylinderGeometry(housingRad, housingRad, housingLen, 20), structMat(0x2a3545, 0.4, 0.3, 0.7));
  housing.rotation.z = Math.PI / 2;
  housing.position.set((-sod + housingEndX) / 2, 0, 0);
  S.beamGroup.add(housing);

  var cap = new THREE.Mesh(new THREE.SphereGeometry(housingRad, 16, 16, 0, Math.PI*2, 0, Math.PI/2), structMat(0x2a3545, 0.45, 0.3, 0.7));
  cap.position.set(-sod, 0, 0);
  cap.rotation.z = -Math.PI / 2;
  S.beamGroup.add(cap);

  // Window
  var ring = new THREE.Mesh(new THREE.RingGeometry(6, 14, 16), basicMat(0xe07040, 0.55));
  ring.position.set(-sod + 2, 0, 0);
  ring.rotation.y = Math.PI / 2;
  S.beamGroup.add(ring);

  // Cone edges
  var corners = [
    new THREE.Vector3(detX, -detH/2, -detW/2), new THREE.Vector3(detX, -detH/2, detW/2),
    new THREE.Vector3(detX, detH/2, -detW/2), new THREE.Vector3(detX, detH/2, detW/2),
  ];
  var coneMat = new THREE.LineBasicMaterial({ color: 0xe07040, transparent: true, opacity: 0.20 });
  corners.forEach(function(c) {
    var g = new THREE.BufferGeometry().setFromPoints([srcPos.clone(), c]);
    S.beamGroup.add(new THREE.Line(g, coneMat));
  });

  // Central ray
  var rayPts = [srcPos.clone(), new THREE.Vector3(0, 0, 0), detCenter.clone()];
  var rayLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(rayPts),
    new THREE.LineDashedMaterial({ color: 0xe86030, transparent: true, opacity: 0.35, dashSize: 4, gapSize: 3 }));
  rayLine.computeLineDistances();
  S.beamGroup.add(rayLine);

  // Arrow
  var arrow = new THREE.Mesh(new THREE.ConeGeometry(4, 10, 8), basicMat(0xe86030, 0.35));
  arrow.position.set(-sod * 0.3, 0, 0);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
  S.beamGroup.add(arrow);

  // Source sphere
  var srcSphere = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), basicMat(0xe86030, 0.70));
  srcSphere.position.copy(srcPos);
  S.beamGroup.add(srcSphere);

  // Turntable
  var disc = new THREE.Mesh(new THREE.CylinderGeometry(78, 80, 14, 32), structMat(0x3a4a5a, 0.5, 0.4, 0.6));
  disc.position.set(0, objBaseY - 8, 0);
  S.beamGroup.add(disc);
  var hub = new THREE.Mesh(new THREE.CylinderGeometry(24, 30, 12, 16), structMat(0x3a4a5a, 0.5, 0.4, 0.6));
  hub.position.set(0, objBaseY - 15, 0);
  S.beamGroup.add(hub);

  // Detector
  var detBox = new THREE.Mesh(new THREE.BoxGeometry(80, detH + 80, detW + 80), structMat(0x182435, 0.4, 0.1, 0.7));
  detBox.position.copy(detCenter);
  S.beamGroup.add(detBox);

  var panel = new THREE.Mesh(new THREE.PlaneGeometry(detW, detH),
    new THREE.MeshBasicMaterial({ color: 0x3570d0, transparent: true, opacity: 0.30, side: THREE.DoubleSide, depthWrite: false }));
  panel.position.set(detX - 39, 0, 0);
  panel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0));
  S.beamGroup.add(panel);

  var pe = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(detW, detH)),
    new THREE.LineBasicMaterial({ color: 0x4080e0, transparent: true, opacity: 0.60 }));
  pe.position.copy(panel.position);
  pe.quaternion.copy(panel.quaternion);
  S.beamGroup.add(pe);

  // Detector stand
  var dsh = detCenter.y - floorY;
  if (dsh > 0) {
    var dp = new THREE.Mesh(new THREE.BoxGeometry(10, dsh, 10), structMat(0x1e2838, 0.2, 0.2, 0.7));
    dp.position.set(detX, floorY + dsh / 2, 0);
    S.beamGroup.add(dp);
  }

  S.scene.add(S.beamGroup);
  S.beamGroup.visible = S.beamVisible;
}

function destroyBeamVisualization() {
  if (!S.beamGroup) return;
  S.scene.remove(S.beamGroup);
  S.beamGroup.traverse(function(child) {
    if (child.isMesh || child.isLine || child.isLineSegments) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(function(m) { m.dispose(); });
        else child.material.dispose();
      }
    }
  });
  S.beamGroup = null;
}

// ── View Modes ──
function switchViewMode(mode) {
  S.viewMode = mode;
  qsa('.vp-mode-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.mode === mode); });
  $('heatmap-legend').classList.add('hidden');
  exitCompareMode();
  if (mode === '3d' && S.meshObject) {
    if (Array.isArray(S.meshObject.material)) {
      S.meshObject.material.forEach(function(m) { m.color.setHex(0x3b82f6); m.vertexColors = false; m.needsUpdate = true; });
    } else {
      S.meshObject.material.color.setHex(0x3b82f6); S.meshObject.material.vertexColors = false; S.meshObject.material.needsUpdate = true;
    }
    if (S.result) { S.meshObject.rotation.x = S.result.bestOrientation.theta * DEG; S.meshObject.rotation.y = S.result.bestOrientation.phi * DEG; }
  }
  if (mode === 'heatmap') applyHeatmap();
  if (mode === 'compare') enterCompareMode();
}

function applyHeatmap() {
  if (!S.meshObject || !S.meshObject.geometry) return;
  const geo = S.meshObject.geometry;
  if (S.facePenetrations) {
    if (!geo.attributes.color) {
      const pos = geo.attributes.position; const idx = geo.index;
      const numFaces = idx ? idx.count / 3 : pos.count / 3;
      const colors = new Float32Array(pos.count * 3);
      const range = S.facePenMax - S.facePenMin || 1;
      for (let fi = 0; fi < numFaces && fi < S.facePenetrations.length; fi++) {
        const norm = (S.facePenetrations[fi] - S.facePenMin) / range;
        let r, g, b;
        if (norm <= 0.5) { const t = norm / 0.5; r = 30 + t * 200; g = 180 - t * 130; b = 40 - t * 30; }
        else { const t = (norm - 0.5) / 0.5; r = 230 + t * 25; g = 50 - t * 40; b = 10 - t * 8; }
        const i3 = fi * 3;
        const ia = idx ? idx.getX(i3) : i3; const ib = idx ? idx.getX(i3 + 1) : i3 + 1; const ic = idx ? idx.getX(i3 + 2) : i3 + 2;
        [ia, ib, ic].forEach(vi => { colors[vi*3] = r/255; colors[vi*3+1] = g/255; colors[vi*3+2] = b/255; });
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    if (Array.isArray(S.meshObject.material)) {
      S.meshObject.material.forEach(m => { m.vertexColors = true; m.needsUpdate = true; });
    } else { S.meshObject.material.vertexColors = true; S.meshObject.material.needsUpdate = true; }
    // Show legend
    $('legend-min').textContent = (S.facePenMin || 0).toFixed(0) + ' mm';
    $('legend-mid').textContent = ((S.facePenMin + S.facePenMax) / 2 || 0).toFixed(0) + ' mm';
    $('legend-max').textContent = (S.facePenMax || 0).toFixed(0) + ' mm';
    // Create gradient
    const gCv = document.createElement('canvas'); gCv.width = 80; gCv.height = 8;
    const gCtx = gCv.getContext('2d');
    const grad = gCtx.createLinearGradient(0, 0, 80, 0);
    grad.addColorStop(0, '#1eb848'); grad.addColorStop(0.5, '#f5c542'); grad.addColorStop(1, '#e82e1a');
    gCtx.fillStyle = grad; gCtx.fillRect(0, 0, 80, 8);
    $('legend-gradient').style.background = `url(${gCv.toDataURL()})`;
    $('heatmap-legend').classList.remove('hidden');
    if (S.result) { S.meshObject.rotation.x = S.result.bestOrientation.theta * DEG; S.meshObject.rotation.y = S.result.bestOrientation.phi * DEG; }
  } else {
    if (Array.isArray(S.meshObject.material)) { S.meshObject.material.forEach(m => { m.color.setHex(0x3b82f6); m.vertexColors = false; m.needsUpdate = true; }); }
    else { S.meshObject.material.color.setHex(0x3b82f6); S.meshObject.material.vertexColors = false; S.meshObject.material.needsUpdate = true; }
  }
}

// ── Layout Modes ──
function switchLayoutMode(mode) {
  S.layoutMode = mode;
  qsa('.vp-layout-btn').forEach(b => b.classList.toggle('active', b.dataset.layout === mode));
  const sb = $('sidebar'), res = $('results');
  if (mode === 'viewport') { sb.style.display = 'none'; res.style.display = 'none'; }
  else if (mode === 'results') { sb.style.display = 'none'; res.style.display = ''; }
  else { sb.style.display = ''; res.style.display = ''; }
}

// ── Optimization (Async via Wails Events) ──
function runOptimization() {
  if (!S.meshLoaded || S.searching) return;
  S.searching = true; S.searchCancel = false;

  // Show search UI
  $('btn-optimize').disabled = true; $('btn-optimize').innerHTML = '\u25B6 Searching...';
  $('vp-progress').classList.remove('hidden'); $('results').classList.add('hidden');
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
    // Parse θ, φ from label for HUD
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
function cancelSearch() { S.searchCancel = true; setStatus('Cancelling...'); }

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
  const style = (ch) => ch < 0 ? 'style="color:var(--green)"' : '';

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
    if (rec.kv < 100) { qual = '\u25B2 Higher kV recommended'; color = 'var(--amber)'; }
    else if (rec.kv <= 200) { qual = 'Medium kV suitable'; color = 'var(--text)'; }
    else { qual = '\u25BC Lower kV sufficient'; color = 'var(--green)'; }
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

  // Show tradeoff card
  $('card-tradeoff').style.display = 'block';

  // Results visible
  S.facePenetrations = null;
  $('results').classList.remove('hidden');
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
  html += '<div class="is-row"><span>vs conventional 360°:</span><strong>−' + savings + '% scan time</strong></div>';
  html += '<div class="is-row"><span>Computation:</span><span>' + data.elapsedMs.toFixed(0) + 'ms on ' + data.totalFaces.toLocaleString() + ' faces</span></div>';
  html += '</div>';
  html += '<div class="is-table-wrap"><table class="is-table"><thead><tr><th>#</th><th>Angle α</th></tr></thead><tbody>';
  data.angles.forEach(function(a, i) {
    html += '<tr><td>' + (i + 1) + '</td><td>' + a.toFixed(1) + '°</td></tr>';
  });
  html += '</tbody></table></div>';
  html += '<div class="is-actions"><button class="is-btn" id="is-copy-btn">Copy angles</button><button class="is-btn" id="is-export-btn">Export JSON</button></div>';
  if (data.warning) html += '<div class="is-warning">ℹ ' + data.warning + '</div>';
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

// ── Accordion ──
function setupAccordion() {
  qsa('.acc-head').forEach(head => {
    head.addEventListener('click', () => { head.parentElement.classList.toggle('open'); });
  });
  const a = qs('.acc'); if (a) a.classList.add('open');
}

// ── Filters ──
function renderFilters() {
  const grid = $('filter-grid'); grid.innerHTML = '';
  for (const f of S.filters) {
    const el = document.createElement('div');
    el.className = 'filter-btn' + (S.filterID === f.id ? ' active' : '');
    el.innerHTML = `<span class="fb-icon">${f.icon}</span><span class="fb-name">${f.name}</span>`;
    el.addEventListener('click', () => selectFilter(f.id));
    grid.appendChild(el);
  }
}
function selectFilter(id) {
  S.filterID = id;
  qsa('.filter-btn').forEach(el => el.classList.toggle('active', el.textContent.includes(id)));
  const f = S.filters.find(f => f.id === id);
  $('acc-filter-val').textContent = f ? f.name : 'None';
  recalcBeam();
}

// ── Sliders ──
function setupSliders() {
  const eSl = $('sl-energy');
  eSl.addEventListener('input', () => { S.energy = parseFloat(eSl.value); recalcBeam(); });
  [30, 50, 76, 100, 150, 200, 300].forEach(v => {
    const btn = document.createElement('button');
    btn.textContent = v; btn.addEventListener('click', () => { eSl.value = v; S.energy = v; recalcBeam(); });
    $('presets-energy').appendChild(btn);
  });
  const tSl = $('sl-tmin');
  tSl.addEventListener('input', () => { S.tPct = parseFloat(tSl.value); recalcBeam(); });
  [0.01, 0.05, 0.10, 0.20, 0.50, 1.0, 2.0].forEach(v => {
    const btn = document.createElement('button');
    btn.textContent = v.toFixed(2); btn.addEventListener('click', () => { tSl.value = v; S.tPct = v; recalcBeam(); });
    $('presets-tmin').appendChild(btn);
  });
}

// ── File Upload ──
function setupFileUpload() {
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

// ── Handle mesh loaded via native file dialog ──
async function handlePickedMesh(info) {
  $('vp-loading').classList.remove('hidden');
  $('idle-prompt').style.display = 'none';
  setStatus('Loading mesh...');
  S.meshInfo = info;
  S.meshLoaded = true;
  try {
    const verts = await GetVertexBuffer();
    renderMesh(verts);
    $('fm-name').textContent = info.name;
    $('fm-tris').textContent = info.numTriangles.toLocaleString() + ' triangles';
    $('fm-bbox').textContent = `${info.boundsMinX.toFixed(0)}..${info.boundsMaxX.toFixed(0)}`;
    $('file-meta').classList.remove('hidden');
    $('grid-info').classList.remove('hidden');
    const wtDot = $('fm-dot'), wtText = $('fm-wt'), wtBanner = $('wt-banner');
    if (info.isWatertight) { wtDot.className = 'dot dot--green'; wtText.textContent = 'watertight'; wtBanner.classList.add('hidden'); }
    else { wtDot.className = 'dot dot--amber'; wtText.textContent = info.boundaryEdges + ' boundary edges — non-watertight'; wtBanner.textContent = '⚠ Mesh has open edges — results may be unreliable'; wtBanner.classList.remove('hidden'); }
    $('os-text').textContent = 'Ready'; $('os-dot').className = 'os-dot os-dot--ready';
    $('btn-optimize').disabled = false;
    setStatus('Loaded ' + info.numTriangles.toLocaleString() + ' tris');
    $('status-mesh').textContent = info.numTriangles.toLocaleString() + ' tris';
    try { localStorage.setItem('penopt-last-mesh', info.name); } catch (_) {}
  } catch (err) { showError('Render error: ' + err.message); }
  $('vp-loading').classList.add('hidden');
}

function removeMesh() {
  if (S.meshObject) { S.scene.remove(S.meshObject); S.meshObject.geometry.dispose(); S.meshObject.material.dispose(); S.meshObject = null; }
  destroyBeamVisualization();
  exitCompareMode();
  S.meshLoaded = false; S.meshInfo = null; S.result = null; S.facePenetrations = null;
  $('file-meta').classList.add('hidden'); $('grid-info').classList.add('hidden'); $('results').classList.add('hidden');
  $('wt-banner').classList.add('hidden'); $('btn-reset-float').classList.add('hidden');
  $('card-tradeoff').style.display = 'none'; $('heatmap-legend').classList.add('hidden');
  $('os-dot').className = 'os-dot os-dot--idle'; $('os-text').textContent = 'Upload a mesh and select a material';
  $('btn-optimize').disabled = true; setStatus('Ready'); $('status-mesh').textContent = ''; $('idle-prompt').style.display = '';
}

// ── Scanner Presets ──
function setupScannerPresets() {
  const sel = $('scanner-preset');
  for (const p of S.presets) {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = p.name;
    sel.appendChild(opt);
  }
  sel.addEventListener('change', () => {
    const p = S.presets.find(x => x.id === sel.value);
    if (!p) return;
    $('cfg-sdd').value = p.sdd; $('cfg-sod').value = p.sod;
    $('cfg-detw').value = p.detWidth; $('cfg-deth').value = p.detHeight;
    $('cfg-px').value = p.pixelsX; $('cfg-py').value = p.pixelsY;
    $('acc-scanner-val').textContent = p.sdd + '/' + p.sod;
  });
}

// ── Tradeoff ──
function setupTradeoff() {
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
function setupExport() {
  $('btn-export').addEventListener('click', () => {
    if (S.result) exportJSON(S.result);
  });
  $('btn-export-png').addEventListener('click', () => {
    if (S.result) exportPNG(S.renderer, S.result, $('energy-val')?.textContent || '--');
  });
}

// ── Plot Tabs ──
function setupPlotTabs() {
  qsa('.plot-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('.plot-tab').forEach(t => t.classList.remove('active'));
      qsa('.plot-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`plot-${tab.dataset.plot}`).classList.add('active');
    });
  });
}

// ── Keyboard ──
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

// ── Fullscreen ──
function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

// ── Help ──
function setupHelp() {
  $('btn-help').addEventListener('click', () => $('help-overlay').classList.remove('hidden'));
  $('btn-help-close').addEventListener('click', () => $('help-overlay').classList.add('hidden'));
  $('help-overlay').addEventListener('click', e => { if (e.target === $('help-overlay')) $('help-overlay').classList.add('hidden'); });
}

// ── Ray Grid ──
function setupRayGrid() {
  qsa('.ray-opt').forEach(el => {
    el.addEventListener('click', () => {
      qsa('.ray-opt').forEach(o => o.classList.remove('active'));
      el.classList.add('active');
      $('acc-ray-val').textContent = el.textContent;
    });
  });
}

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

  setupFileUpload(); setupSliders(); setupAccordion(); setupRayGrid(); setupHelp(); setupKeyboard();
  setupScannerPresets(); setupTradeoff(); setupExport(); setupPlotTabs();

  // Material tabs
  qsa('.mat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('.mat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active'); _matFilter = tab.dataset.cat; renderMatGrid();
    });
  });
  $('mat-search').addEventListener('input', () => { _matSearch = $('mat-search').value; renderMatGrid(); });

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
        $('results').classList.remove('hidden');
        $('card-tradeoff').style.display = 'block';
        setStatus('Restored previous results');
      }
    } catch (_) {}
  });
  $('btn-restore-dismiss').addEventListener('click', function() {
    $('restore-banner').classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', init);
