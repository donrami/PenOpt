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
  // ── rAF-coalesced render — at most one Three.js render per frame ──
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

  // Auto-resize viewport when layout changes (results toggle, layout mode, sidebar)
  // Debounced via rAF — prevents cascade re-renders from rapid layout changes
  let _resizePending = false;
  const ro = new ResizeObserver(function() {
    if (!_resizePending) {
      _resizePending = true;
      requestAnimationFrame(function() {
        _resizePending = false;
        resizeViewport();
      });
    }
  });
  ro.observe(c);
  S._resizeObserver = ro;
}

export function resizeViewport() { if (!S.renderer) return; const c = $('viewport'); const w = c.clientWidth; const h = c.clientHeight; if (w === 0 || h === 0) return; S.camera.aspect = w / h; S.camera.updateProjectionMatrix(); S.renderer.setSize(w, h); S.renderScene?.(); }

export function resetCamera() { if (!S.camera) return; S.camera.position.set(300, 200, 400); S.controls.target.set(0, 0, 0); S.controls.update(); S.renderScene?.(); }

// ── Smooth Rotation Animation ──
// Animates mesh rotation from current angles to target over `duration` ms.
// Uses ease-out cubic for natural deceleration.
let _rotationAnimId = null;

export function animateRotation(mesh, targetTheta, targetPhi, duration = 400) {
  if (!mesh) return;
  // Cancel any in-progress rotation
  if (_rotationAnimId) { cancelAnimationFrame(_rotationAnimId); _rotationAnimId = null; }

  const startTheta = mesh.rotation.x;
  const startPhi = mesh.rotation.y;
  const deltaTheta = targetTheta - startTheta;
  const deltaPhi = targetPhi - startPhi;
  // Shortest path for phi (handle wraparound)
  let dPhi = targetPhi - startPhi;
  if (dPhi > Math.PI) dPhi -= Math.PI * 2;
  else if (dPhi < -Math.PI) dPhi += Math.PI * 2;

  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    // Ease-out cubic: 1 - (1 - t)^3
    const e = 1 - Math.pow(1 - t, 3);

    mesh.rotation.x = startTheta + deltaTheta * e;
    mesh.rotation.y = startPhi + dPhi * e;
    // Render each frame so the user sees the smooth rotation
    S.renderScene?.();

    if (t < 1) {
      _rotationAnimId = requestAnimationFrame(tick);
    } else {
      mesh.rotation.x = targetTheta;
      mesh.rotation.y = targetPhi;
      _rotationAnimId = null;
    }
  }

  _rotationAnimId = requestAnimationFrame(tick);
}

// ── Mesh Rendering ──
export function renderMesh(verts) {
  if (S.meshObject) { S.scene.remove(S.meshObject); S.meshObject.geometry.dispose(); S.meshObject.material.dispose(); S.meshObject = null; }
  if (!verts?.length) { return; }
  const pos = new Float32Array(verts);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const nt = pos.length / 9; const idx = new Uint32Array(nt * 3);
  for (let i = 0; i < nt; i++) { idx[i*3] = i*3; idx[i*3+1] = i*3+1; idx[i*3+2] = i*3+2; }
  geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeVertexNormals(); geo.computeBoundingBox();
  const center = new THREE.Vector3(); geo.boundingBox.getCenter(center); geo.translate(-center.x, -center.y, -center.z);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x3b82f6,
    metalness: 0.35,
    roughness: 0.55,
    clearcoat: 0.15,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.6,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat); S.scene.add(mesh); S.meshObject = mesh;
  const box = new THREE.Box3().setFromObject(mesh); const sz = box.getSize(new THREE.Vector3());
  const dist = Math.max(sz.x, sz.y, sz.z) * 1.8;
  S.camera.position.set(dist * 0.6, dist * 0.4, dist * 0.8); S.controls.target.set(0, 0, 0); S.controls.update();
  S.renderScene?.();
}

// ── Heatmap ──
export function applyHeatmap() {
  if (!S.meshObject || !S.meshObject.geometry) return;
  const geo = S.meshObject.geometry;
  if (S.facePenetrations) {
    if (!geo.attributes.color) {
      const pos = geo.attributes.position; const idx = geo.index;
      const numFaces = idx ? idx.count / 3 : pos.count / 3;
      const numVerts = pos.count;
      const colors = new Float32Array(numVerts * 3);
      const range = S.facePenMax - S.facePenMin || 1;
      // Build vertex-face adjacency: for each vertex, sum penetration of all adjacent faces
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
      // Per-vertex averaged value → color (GPU interpolates across triangle for smooth gradient)
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
    grad.addColorStop(0, '#1448b0'); grad.addColorStop(0.33, '#14c8c8'); grad.addColorStop(0.66, '#f5a830'); grad.addColorStop(1, '#e82020');
    gCtx.fillStyle = grad; gCtx.fillRect(0, 0, 80, 8);
    $('legend-gradient').style.background = `url(${gCv.toDataURL()})`;
    $('heatmap-legend').classList.remove('hidden');
    if (S.result) { animateRotation(S.meshObject, S.result.bestOrientation.theta * DEG, S.result.bestOrientation.phi * DEG, 300); }
  } else {
    if (Array.isArray(S.meshObject.material)) { S.meshObject.material.forEach(m => { m.color.setHex(0x3b82f6); m.vertexColors = false; m.needsUpdate = true; }); }
    else { S.meshObject.material.color.setHex(0x3b82f6); S.meshObject.material.vertexColors = false; S.meshObject.material.needsUpdate = true; }
  }
  S.renderScene?.();
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
    if (Array.isArray(S.meshObject.material)) {
      S.meshObject.material.forEach(function(m) { m.color.setHex(0x3b82f6); m.vertexColors = false; m.needsUpdate = true; });
    } else {
      S.meshObject.material.color.setHex(0x3b82f6); S.meshObject.material.vertexColors = false; S.meshObject.material.needsUpdate = true;
    }
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
  S.renderScene?.();
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
  S.renderScene?.();
}

// ── Axis Labels ──
// Creates sprite-based X, Y, Z axis labels positioned at the axes tips.
function makeTextSprite(text, color) {
  var canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  var ctx = canvas.getContext('2d');
  ctx.font = 'Bold 36px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = color;
  ctx.fillText(text, 32, 32);
  var tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, sizeAttenuation: true });
  var sprite = new THREE.Sprite(mat);
  sprite.scale.set(30, 30, 1);
  return sprite;
}

export function createLabels() {
  destroyLabels();
  S.labelsGroup = new THREE.Group();

  var axisLen = 150;
  var offset = 24; // nudge out past the arrow tip

  var xLabel = makeTextSprite('X', '#e86060');
  xLabel.position.set(axisLen + offset, 0, 0);
  S.labelsGroup.add(xLabel);

  var yLabel = makeTextSprite('Y', '#60d060');
  yLabel.position.set(0, axisLen + offset, 0);
  S.labelsGroup.add(yLabel);

  var zLabel = makeTextSprite('Z', '#6080e0');
  zLabel.position.set(0, 0, axisLen + offset);
  S.labelsGroup.add(zLabel);

  // Origin dot
  var dotGeo = new THREE.SphereGeometry(3, 8, 8);
  var dotMat = new THREE.MeshBasicMaterial({ color: 0x8890a0, transparent: true, opacity: 0.5 });
  var dot = new THREE.Mesh(dotGeo, dotMat);
  S.labelsGroup.add(dot);

  S.scene.add(S.labelsGroup);
  S.labelsGroup.visible = S.labelsVisible;
  S.renderScene?.();
}

export function destroyLabels() {
  if (!S.labelsGroup) return;
  S.scene.remove(S.labelsGroup);
  S.labelsGroup.traverse(function(child) {
    if (child.isSprite || child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(function(m) { m.dispose(); });
        else child.material.dispose();
      }
    }
  });
  S.labelsGroup = null;
  S.renderScene?.();
}
