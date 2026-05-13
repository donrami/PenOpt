// Scene — Three.js setup, mesh rendering, heatmap, beam visualization
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { S, $, qsa, DEG, showError } from './state.js';

export function initScene() {
  const c = $('viewport');
  const w = c.clientWidth, h = c.clientHeight;
  const scene = new THREE.Scene();
  // Subtle gradient background
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = 2; bgCanvas.height = 256;
  const bgCtx = bgCanvas.getContext('2d');
  const bgGrad = bgCtx.createLinearGradient(0, 0, 0, 256);
  bgGrad.addColorStop(0, '#0a0c12');
  bgGrad.addColorStop(0.5, '#0c0e14');
  bgGrad.addColorStop(1, '#11131c');
  bgCtx.fillStyle = bgGrad; bgCtx.fillRect(0, 0, 2, 256);
  const bgTexture = new THREE.CanvasTexture(bgCanvas);
  bgTexture.magFilter = THREE.LinearFilter;
  scene.background = bgTexture;
  const camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
  camera.position.set(300, 200, 400);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.2;
  c.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.target.set(0, 0, 0);
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  controls.touches = { ONE: THREE.TOUCH.ROTATE_PAN, TWO: THREE.TOUCH.DOLLY_PAN };
  scene.add(new THREE.AmbientLight(0x8888cc, 1.2));
  scene.add(new THREE.HemisphereLight(0x88aadd, 0x554466, 0.6));
  const d1 = new THREE.DirectionalLight(0xffffff, 0.9); d1.position.set(200, 300, 400); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x6688cc, 0.35); d2.position.set(-200, -100, -300); scene.add(d2);
  const grid = new THREE.GridHelper(800, 20, 0x2a2d3e, 0x1e2130);
  grid.material.transparent = true;
  grid.material.opacity = 0.6;
  scene.add(grid);
  scene.add(new THREE.AxesHelper(150));
  S.scene = scene; S.camera = camera; S.renderer = renderer; S.controls = controls;

  // Pre-create axis labels (hidden until toggled)
  createLabels();
  if (S.labelsGroup) S.labelsGroup.visible = false;

  // Render on demand — only when controls change or programmatic updates
  let _renderQueued = false;
  S.renderScene = function() {
    if (!_renderQueued) {
      _renderQueued = true;
      requestAnimationFrame(function() {
        _renderQueued = false;
        if (S.renderer) S.renderer.render(S.scene, S.camera);
      });
    }
  };

  controls.addEventListener('change', S.renderScene);
  S.renderScene();

  // Cache for heatmap-colored geometry
  S._heatmapGeo = null;
}

export function resizeViewport() {
  if (!S.renderer) return;
  const c = $('viewport');
  const w = c.clientWidth, h = c.clientHeight;
  if (w === 0 || h === 0) return;
  S.camera.aspect = w / h;
  S.camera.updateProjectionMatrix();
  S.renderer.setSize(w, h);
  S.renderScene?.();
}

// ── Mesh rendering ──
export function renderMesh(verts) {
  destroyMesh();
  const geo = new THREE.BufferGeometry();
  const triCount = verts.length / 9;
  const pos = new Float32Array(verts.length);
  for (let i = 0; i < verts.length; i++) pos[i] = verts[i];
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const idx = new Uint32Array(triCount * 3);
  for (let i = 0; i < triCount; i++) { idx[i*3] = i*3; idx[i*3+1] = i*3+1; idx[i*3+2] = i*3+2; }
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  const center = new THREE.Vector3();
  geo.boundingBox.getCenter(center);
  geo.translate(-center.x, -center.y, -center.z);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x3b82f6,
    metalness: 0.35,
    roughness: 0.55,
    clearcoat: 0.15,
    clearcoatRoughness: 0.4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  S.meshObject = mesh;
  S.scene.add(mesh);
  S.renderScene();

  // Store the ORIGINAL geometry (without vertex colors) for quick 3D mode restore
  S._originalGeo = geo;

  // Fit camera to mesh
  const sz = new THREE.Vector3();
  geo.boundingBox.getSize(sz);
  const dist = Math.max(sz.x, sz.y, sz.z) * 1.8;
  S.camera.position.set(dist * 0.6, dist * 0.4, dist * 0.8);
  S.controls.target.set(0, 0, 0);
  S.controls.update();
  S.renderScene?.();
}

function destroyMesh() {
  if (S.meshObject) {
    S.scene.remove(S.meshObject);
    S.meshObject.geometry.dispose();
    S.meshObject.material.dispose();
    S.meshObject = null;
  }
  if (S._heatmapGeo) {
    S._heatmapGeo.dispose();
    S._heatmapGeo = null;
  }
  S._originalGeo = null;
  exitCompareMode();
  $('heatmap-legend').classList.add('hidden');
}

// ── Heatmap ──
export function applyHeatmap() {
  if (!S.meshObject || !S.meshObject.geometry) return;
  if (!S.facePenetrations) {
    // No data — revert to solid blue
    resetToSolidColor();
    S.renderScene?.();
    return;
  }

  // Use cached heatmap geometry if available
  if (S._heatmapGeo) {
    swapGeometry(S._heatmapGeo);
    showHeatmapLegend();
    S.renderScene?.();
    return;
  }

  // First-time: compute vertex colors and cache
  const geo = S._originalGeo || S.meshObject.geometry;
  const pos = geo.attributes.position;
  const idx = geo.index;
  const numFaces = idx ? idx.count / 3 : pos.count / 3;
  const numVerts = pos.count;
  const colors = new Float32Array(numVerts * 3);
  const range = S.facePenMax - S.facePenMin || 1;

  // Build vertex-face adjacency
  const vSum = new Float32Array(numVerts);
  const vCount = new Uint16Array(numVerts);
  for (let fi = 0; fi < numFaces && fi < S.facePenetrations.length; fi++) {
    const val = S.facePenetrations[fi] || 0;
    const i3 = fi * 3;
    const ia = idx ? idx.getX(i3) : i3;
    const ib = idx ? idx.getX(i3 + 1) : i3 + 1;
    const ic = idx ? idx.getX(i3 + 2) : i3 + 2;
    vSum[ia] += val; vCount[ia]++;
    vSum[ib] += val; vCount[ib]++;
    vSum[ic] += val; vCount[ic]++;
  }

  // High-contrast heatmap: deep blue → cyan → yellow → bright red
  function valToColor(norm) {
    if (norm <= 0.25) { const t = norm / 0.25; return [20 + t * 60, 60 + t * 140, 140 + t * 40]; }
    else if (norm <= 0.5) { const t = (norm - 0.25) / 0.25; return [80 + t * 140, 200 - t * 30, 180 - t * 120]; }
    else if (norm <= 0.75) { const t = (norm - 0.5) / 0.25; return [220 - t * 20, 170 - t * 60, 60 + t * 40]; }
    else { const t = (norm - 0.75) / 0.25; return [200 + t * 55, 110 - t * 80, 100 - t * 70]; }
  }

  for (let vi = 0; vi < numVerts; vi++) {
    const avg = vCount[vi] > 0 ? vSum[vi] / vCount[vi] : 0;
    const norm = (avg - S.facePenMin) / range;
    const [r, g, b] = valToColor(Math.max(0, Math.min(1, norm)));
    colors[vi*3] = r/255; colors[vi*3+1] = g/255; colors[vi*3+2] = b/255;
  }

  // Clone original geometry and add colors
  const heatGeo = geo.clone();
  heatGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  S._heatmapGeo = heatGeo;

  swapGeometry(heatGeo);
  showHeatmapLegend();
  S.renderScene?.();
}

function swapGeometry(newGeo) {
  if (!S.meshObject) return;
  S.meshObject.geometry = newGeo;
  if (Array.isArray(S.meshObject.material)) {
    S.meshObject.material.forEach(m => { m.vertexColors = true; m.needsUpdate = true; });
  } else {
    S.meshObject.material.vertexColors = true;
    S.meshObject.material.needsUpdate = true;
  }
}

function resetToSolidColor() {
  if (!S.meshObject) return;
  // Restore original geometry if we're on heatmap geometry
  if (S._originalGeo && S.meshObject.geometry !== S._originalGeo) {
    S.meshObject.geometry = S._originalGeo;
  }
  if (Array.isArray(S.meshObject.material)) {
    S.meshObject.material.forEach(m => { m.color.setHex(0x3b82f6); m.vertexColors = false; m.needsUpdate = true; });
  } else {
    S.meshObject.material.color.setHex(0x3b82f6); S.meshObject.material.vertexColors = false; S.meshObject.material.needsUpdate = true;
  }
}

var _legendGradientDataURL = null;
function showHeatmapLegend() {
  $('legend-min').textContent = (S.facePenMin || 0).toFixed(0) + ' mm';
  $('legend-mid').textContent = ((S.facePenMin + S.facePenMax) / 2 || 0).toFixed(0) + ' mm';
  $('legend-max').textContent = (S.facePenMax || 0).toFixed(0) + ' mm';
  if (!_legendGradientDataURL) {
    const gCv = document.createElement('canvas'); gCv.width = 80; gCv.height = 8;
    const gCtx = gCv.getContext('2d');
    const grad = gCtx.createLinearGradient(0, 0, 80, 0);
    grad.addColorStop(0, '#1448b0'); grad.addColorStop(0.33, '#14c8c8'); grad.addColorStop(0.66, '#f5a830'); grad.addColorStop(1, '#e82020');
    gCtx.fillStyle = grad; gCtx.fillRect(0, 0, 80, 8);
    _legendGradientDataURL = gCv.toDataURL();
  }
  $('legend-gradient').style.background = 'url(' + _legendGradientDataURL + ')';
  $('heatmap-legend').classList.remove('hidden');
}

export function invalidateHeatmapCache() {
  if (S._heatmapGeo) {
    S._heatmapGeo.dispose();
    S._heatmapGeo = null;
  }
}

// ── Compare Mode ──
export function enterCompareMode() {
  if (S.compareMode || !S.meshObject || !S.result) return;
  exitCompareMode();

  var best = S.result.bestOrientation;

  // Restore original geometry if heatmap was active
  if (S._heatmapGeo && S.meshObject.geometry === S._heatmapGeo) {
    S.meshObject.geometry = S._originalGeo;
  }

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
  S.renderScene?.();
}

export function exitCompareMode() {
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
  S.renderScene?.();
}

// ── View Modes ──
export function switchViewMode(mode) {
  S.viewMode = mode;
  qsa('.vp-mode-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.mode === mode); });
  $('heatmap-legend').classList.add('hidden');
  exitCompareMode();
  if (mode === '3d' && S.meshObject) {
    // Restore original geometry and blue color
    if (S._heatmapGeo && S.meshObject.geometry === S._heatmapGeo) {
      S.meshObject.geometry = S._originalGeo;
    }
    resetToSolidColor();
    if (S.result) { animateRotation(S.meshObject, S.result.bestOrientation.theta * DEG, S.result.bestOrientation.phi * DEG, 300); }
  }
  if (mode === 'heatmap') applyHeatmap();
  if (mode === 'compare') enterCompareMode();
}

// ── Beam Visualization ──
export function createBeamVisualization() {
  destroyBeamVisualization();
  S.beamGroup = new THREE.Group();

  var sod = parseFloat($('cfg-sod').value) || 700;
  var sdd = parseFloat($('cfg-sdd').value) || 1000;
  var detW = parseFloat($('cfg-detw').value) || 400;
  var detH = parseFloat($('cfg-deth').value) || 400;

  // Source point
  var srcGeo = new THREE.SphereGeometry(5, 12, 12);
  var srcMat = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
  var src = new THREE.Mesh(srcGeo, srcMat);
  src.position.set(-sod, 0, 0);
  S.beamGroup.add(src);

  // Detector plane
  var detGeo = new THREE.PlaneGeometry(detW, detH);
  var detMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
  var det = new THREE.Mesh(detGeo, detMat);
  det.position.set(sdd - sod, 0, 0);
  S.beamGroup.add(det);

  // Boundary rays (4 corners)
  var corners = [
    [-detW/2, -detH/2], [-detW/2, detH/2],
    [detW/2, -detH/2], [detW/2, detH/2]
  ];
  var lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.15 });
  corners.forEach(function(c) {
    var points = [
      new THREE.Vector3(-sod, 0, 0),
      new THREE.Vector3(sdd - sod, c[0], c[1])
    ];
    var lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    S.beamGroup.add(new THREE.Line(lineGeo, lineMat));
  });

  S.scene.add(S.beamGroup);
  S.renderScene?.();
}

export function destroyBeamVisualization() {
  if (S.beamGroup) {
    S.scene.remove(S.beamGroup);
    S.beamGroup.traverse(function(child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    S.beamGroup = null;
    S.renderScene?.();
  }
}

// ── Compare mode cleanup (exported for optimizer use) ──
export { exitCompareMode as cleanupCompareMode };

// ── Axis Labels ──
export function createLabels() {
  destroyLabels();
  S.labelsGroup = new THREE.Group();
  var labels = [
    { text: 'X', pos: [180, 0, 0], color: '#ff4d4d' },
    { text: 'Y', pos: [0, 180, 0], color: '#4dff4d' },
    { text: 'Z', pos: [0, 0, 180], color: '#4d4dff' },
  ];
  labels.forEach(function(l) {
    var canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = l.color; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(l.text, 32, 32);
    var texture = new THREE.CanvasTexture(canvas);
    var spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    var sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(l.pos[0], l.pos[1], l.pos[2]);
    sprite.scale.set(30, 30, 1);
    S.labelsGroup.add(sprite);
  });
  S.scene.add(S.labelsGroup);
  S.renderScene?.();
}

export function destroyLabels() {
  if (S.labelsGroup) {
    S.scene.remove(S.labelsGroup);
    S.labelsGroup.traverse(function(c) {
      if (c.material) {
        if (c.material.map) c.material.map.dispose();
        c.material.dispose();
      }
    });
    S.labelsGroup = null;
    S.renderScene?.();
  }
}

// ── Camera ──
var _rotationAnimId = null;
export function animateRotation(obj, targetTheta, targetPhi, duration) {
  if (!obj) return;
  if (_rotationAnimId) { cancelAnimationFrame(_rotationAnimId); _rotationAnimId = null; }
  var startTheta = obj.rotation.x;
  var startPhi = obj.rotation.y;
  var t0 = performance.now();
  function tick(t) {
    var p = Math.min(1, (t - t0) / duration);
    var ease = 1 - Math.pow(1 - p, 3);
    obj.rotation.x = startTheta + (targetTheta - startTheta) * ease;
    obj.rotation.y = startPhi + (targetPhi - startPhi) * ease;
    S.renderScene?.();
    if (p < 1) _rotationAnimId = requestAnimationFrame(tick);
    else _rotationAnimId = null;
  }
  _rotationAnimId = requestAnimationFrame(tick);
}

export function resetCamera() {
  if (!S.meshObject || !S.meshObject.geometry) return;
  var geo = S.meshObject.geometry;
  geo.computeBoundingBox();
  if (!geo.boundingBox) return;
  var sz = new THREE.Vector3();
  geo.boundingBox.getSize(sz);
  var dist = Math.max(sz.x, sz.y, sz.z) * 1.8;
  S.camera.position.set(dist * 0.6, dist * 0.4, dist * 0.8);
  S.controls.target.set(0, 0, 0);
  S.controls.update();
  S.renderScene?.();
}
