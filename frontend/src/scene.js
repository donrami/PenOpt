// Scene — Three.js setup, mesh rendering, heatmap, beam visualization
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { S, $, qsa, DEG, showError } from './state.js';

export function initScene() {
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

export function resizeViewport() { if (!S.renderer) return; const c = $('viewport'); S.camera.aspect = c.clientWidth / c.clientHeight; S.camera.updateProjectionMatrix(); S.renderer.setSize(c.clientWidth, c.clientHeight); }

export function resetCamera() { if (!S.camera) return; S.camera.position.set(300, 200, 400); S.controls.target.set(0, 0, 0); S.controls.update(); }

// ── Mesh Rendering ──
export function renderMesh(verts) {
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

// ── Heatmap ──
export function applyHeatmap() {
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

// ── Compare Mode ──
export function enterCompareMode() {
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
}

// ── View Modes ──
export function switchViewMode(mode) {
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

export function switchLayoutMode(mode) {
  S.layoutMode = mode;
  qsa('.vp-layout-btn').forEach(b => b.classList.toggle('active', b.dataset.layout === mode));
  const sb = $('sidebar'), res = $('results');
  if (mode === 'viewport') { sb.style.display = 'none'; res.style.display = 'none'; }
  else if (mode === 'results') { sb.style.display = 'none'; res.style.display = ''; }
  else { sb.style.display = ''; res.style.display = ''; }
}

// ── Beam Visualization ──
export function createBeamVisualization() {
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

export function destroyBeamVisualization() {
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
