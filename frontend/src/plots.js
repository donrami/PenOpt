// ── Canvas Plotting Utilities ──
// Ported from the old project: contour.js, rose.js, display.js

// setupCanvas configures a canvas element for HiDPI rendering.
// Returns dimensions plus a resize callback to re-render on container changes.
export function setupCanvas(canvasId, defaultWidth, defaultHeight, targetCanvas, sizeOverride) {
  const cv = targetCanvas || document.getElementById(canvasId);
  if (!cv) return { cv: null, ctx: null, w: 0, h: 0 };
  const dpr = window.devicePixelRatio || 1;
  let w, h;
  if (sizeOverride) {
    w = sizeOverride.w;
    h = sizeOverride.h;
  } else {
    const parent = cv.parentElement;
    const rect = parent.getBoundingClientRect();
    w = Math.max(rect.width - 4, Math.min(defaultWidth, 200));
    h = Math.max(defaultHeight, 100);
  }
  cv.width = w * dpr;
  cv.height = h * dpr;
  cv.style.width = w + 'px';
  cv.style.height = h + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  return { cv, ctx, w, h };
}

// ── Plot Interaction State ──
let _contourState = null;
let _contourCache = null;
let _roseState = null;
let _hoverInfo = null;

const DEG = Math.PI / 180;

// ── Shared hover tooltip ──
function getHoverInfo() {
  if (!_hoverInfo) {
    _hoverInfo = document.createElement('div');
    _hoverInfo.style.cssText = 'position:fixed;pointer-events:none;z-index:999;'
      + 'padding:4px 8px;background:var(--surface,#1e2130);color:var(--text,#dde0ed);'
      + 'border:1px solid var(--border-light,#353850);border-radius:4px;'
      + 'font-size:11px;font-weight:500;font-family:var(--font,Inter,sans-serif);'
      + 'white-space:nowrap;opacity:0;transition:opacity 0.1s;'
      + 'box-shadow:0 10px 20px rgba(0,0,0,0.45)';
    document.body.appendChild(_hoverInfo);
  }
  return _hoverInfo;
}

function showHoverInfo(x, y, text) {
  const el = getHoverInfo();
  el.textContent = text;
  el.style.left = (x + 12) + 'px';
  el.style.top = (y - 10) + 'px';
  el.style.opacity = '1';
}

function hideHoverInfo() {
  if (_hoverInfo) _hoverInfo.style.opacity = '0';
}

// ── Expanded plot modal ──
// Hover for canvas-expanded — replaces listeners each time to avoid accumulation.
function setupExpandedHover(kind) {
  var canvas = document.getElementById('canvas-expanded');
  if (!canvas) return;

  // Stale listener cleanup
  if (canvas._expandedHandler) {
    canvas.removeEventListener('mousemove', canvas._expandedHandler);
    canvas.removeEventListener('mouseleave', canvas._expandedLeaveHandler);
  }

  var handler = function(e) {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var cw = parseInt(canvas.style.width) || (canvas.width / dpr);
    var ch = parseInt(canvas.style.height) || (canvas.height / dpr);
    if (kind === 'contour') { expandedContourHover(e, rect, cw, ch); }
    else { expandedRoseHover(e, rect, cw, ch); }
  };

  canvas._expandedHandler = handler;
  canvas._expandedLeaveHandler = hideHoverInfo;
  canvas.addEventListener('mousemove', handler);
  canvas.addEventListener('mouseleave', hideHoverInfo);
}

function expandedContourHover(e, rect, canvasW, canvasH) {
  if (!_contourCache) { hideHoverInfo(); return; }
  var padL = 42, padR = 32, padT = 14, padB = 30;
  var pw = canvasW - padL - padR;
  var ph = canvasH - padT - padB;
  var mx = e.clientX - rect.left;
  var my = e.clientY - rect.top;
  if (mx < padL || mx > padL + pw || my < padT || my > padT + ph) { hideHoverInfo(); return; }

  var cache = _contourCache;
  var cuThetas = cache.cuThetas, cuPhis = cache.cuPhis;
  if (cuThetas.length < 2 || cuPhis.length < 2) { hideHoverInfo(); return; }

  var tMin = cache.tMin, tMax = cache.tMax;
  var pMin = cache.pMin, pMax = cache.pMax;
  var tRange = tMax - tMin || 1, pRange = pMax - pMin || 1;

  var theta = tMin + ((mx - padL) / pw) * tRange;
  var phi = pMin + (1 - (my - padT) / ph) * pRange;
  var clampedTheta = Math.min(tMax, Math.max(tMin, theta));
  var clampedPhi = Math.min(pMax, Math.max(pMin, phi));

  var lookup = cache.lookup, minS = cache.minS;
  // Inline interpolation
  var ti = 0;
  for (var i = 0; i < cuThetas.length - 1; i++) { if (clampedTheta >= cuThetas[i] && clampedTheta <= cuThetas[i + 1]) { ti = i; break; } }
  var pi = 0;
  for (var j = 0; j < cuPhis.length - 1; j++) { if (clampedPhi >= cuPhis[j] && clampedPhi <= cuPhis[j + 1]) { pi = j; break; } }
  var ct0 = cuThetas[ti], ct1 = cuThetas[ti + 1];
  var cp0 = cuPhis[pi], cp1 = cuPhis[pi + 1];
  var f00 = lookup.get(ct0 + ',' + cp0) || minS;
  var f10 = lookup.get(ct1 + ',' + cp0) || minS;
  var f01 = lookup.get(ct0 + ',' + cp1) || minS;
  var f11 = lookup.get(ct1 + ',' + cp1) || minS;
  var tx = (clampedTheta - ct0) / (ct1 - ct0 || 1);
  var px = (clampedPhi - cp0) / (cp1 - cp0 || 1);
  var score = (f00 * (1 - tx) + f10 * tx) * (1 - px) + (f01 * (1 - tx) + f11 * tx) * px;

  showHoverInfo(e.clientX, e.clientY,
    '\u03B8=' + clampedTheta.toFixed(1) + '\u00B0  \u03C6=' + clampedPhi.toFixed(1) + '\u00B0  score=' + score.toFixed(4));
}

function expandedRoseHover(e, rect, canvasW, canvasH) {
  if (!_roseState || !_roseState.bestData || _roseState.bestData.length < 2) { hideHoverInfo(); return; }
  var cx = canvasW / 2, cy = canvasH / 2;
  var radius = Math.min(cx, cy) - 32;
  var mx = e.clientX - rect.left;
  var my = e.clientY - rect.top;
  var dx = mx - cx, dy = my - cy;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > radius + 10 || dist < 6) { hideHoverInfo(); return; }

  var angleRad = Math.atan2(dx, -dy);
  if (angleRad < 0) angleRad += Math.PI * 2;
  var angleDeg = angleRad * 180 / Math.PI;
  var data = _roseState.bestData;
  var numProj = data.length;
  var nearestIdx = Math.round(angleDeg / 360 * numProj) % numProj;
  var projAngle = nearestIdx / numProj * 360;
  showHoverInfo(e.clientX, e.clientY,
    '\u03B1=' + projAngle.toFixed(0) + '\u00B0  max=' + data[nearestIdx].toFixed(2) + ' mm');
}

export function showExpandedPlot(kind) {
  if (kind === 'contour' && !_contourState) return;
  if (kind === 'rose' && (!_roseState || !_roseState.bestData || _roseState.bestData.length < 2)) return;

  var overlay = document.getElementById('plot-overlay');
  var canvas = document.getElementById('canvas-expanded');
  if (!overlay || !canvas) return;

  // Compute aspect ratio from data
  var aspect = 1;
  if (kind === 'contour' && _contourCache) {
    var tr = _contourCache.tMax - _contourCache.tMin || 1;
    var pr = _contourCache.pMax - _contourCache.pMin || 1;
    aspect = tr / pr;
  }

  // Size canvas: fill up to ~88% viewport while preserving aspect ratio
  var maxW = window.innerWidth * 0.88;
  var maxH = window.innerHeight * 0.85;
  var w, h;
  if (aspect >= 1) {
    w = maxW;
    h = maxW / aspect;
    if (h > maxH) { h = maxH; w = maxH * aspect; }
  } else {
    h = maxH;
    w = maxH * aspect;
    if (w > maxW) { w = maxW; h = maxW / aspect; }
  }
  w = Math.round(w);
  h = Math.round(h);

  var dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  var ctx = canvas.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Show overlay immediately so backdrop paints before canvas draw
  overlay.classList.remove('hidden');

  // Defer canvas draw one frame so backdrop appears without lag
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      var sizeOverride = { w: w, h: h };
      if (kind === 'contour') {
        drawContourPlot(
          _contourState.scores, _contourState.best, _contourState.worst,
          _contourState.isPartial, null, canvas, _contourState.result, sizeOverride);
        setupExpandedHover('contour');
      } else {
        drawPenetrationRose(
          _roseState.bestData, _roseState.worstData, _roseState.isPartial,
          canvas, _roseState.intelliScanAngles, sizeOverride);
        setupExpandedHover('rose');
      }
    });
  });
}

// ── Contour Plot (preview small canvas) ──
function drawContourPlot(scores, best, worst, isPartial, zoomBounds, targetCanvas, result, sizeOverride) {
  const { ctx, w, h } = setupCanvas('canvas-contour', 236, 176, targetCanvas, sizeOverride);
  if (!ctx) return;

  const bgColor = '#131519';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const pad = { l: 32, r: 24, t: 10, b: 22 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  const cuThetas = [...new Set(scores.map(s => s.theta))].sort((a, b) => a - b);
  const cuPhis = [...new Set(scores.map(s => s.phi))].sort((a, b) => a - b);
  if (cuThetas.length < 2 || cuPhis.length < 2) {
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not enough data', w / 2, h / 2);
    return;
  }

  const lookup = new Map();
  for (const s of scores) lookup.set(s.theta + ',' + s.phi, s.score);

  let minS = Infinity, maxS = -Infinity;
  for (const s of scores) { if (s.score < minS) minS = s.score; if (s.score > maxS) maxS = s.score; }
  const range = maxS - minS || 1;

  const tMinGlobal = cuThetas[0], tMaxGlobal = cuThetas[cuThetas.length - 1];
  const pMinGlobal = cuPhis[0], pMaxGlobal = cuPhis[cuPhis.length - 1];

  let viewTMin = tMinGlobal, viewTMax = tMaxGlobal;
  let viewPMin = pMinGlobal, viewPMax = pMaxGlobal;

  if (zoomBounds) {
    viewTMin = zoomBounds.tMin; viewTMax = zoomBounds.tMax;
    viewPMin = zoomBounds.pMin; viewPMax = zoomBounds.pMax;
  }

  const viewTRange = viewTMax - viewTMin || 1;
  const viewPRange = viewPMax - viewPMin || 1;

  function scoreColor(norm) {
    let r, g, b;
    if (norm <= 0.5) {
      const t = norm / 0.5;
      r = Math.round(20 + t * 200);
      g = Math.round(80 + t * 140);
      b = Math.round(200 - t * 40);
    } else {
      const t = (norm - 0.5) / 0.5;
      r = Math.round(220 + t * 35);
      g = Math.round(220 - t * 200);
      b = Math.round(160 - t * 140);
    }
    return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
  }

  function interpScore(theta, phi) {
    const tc = Math.min(tMaxGlobal, Math.max(tMinGlobal, theta));
    const pc = Math.min(pMaxGlobal, Math.max(pMinGlobal, phi));
    let ti = 0;
    for (let i = 0; i < cuThetas.length - 1; i++) { if (tc >= cuThetas[i] && tc <= cuThetas[i + 1]) { ti = i; break; } }
    let pi = 0;
    for (let i = 0; i < cuPhis.length - 1; i++) { if (pc >= cuPhis[i] && pc <= cuPhis[i + 1]) { pi = i; break; } }
    const ct0 = cuThetas[ti], ct1 = cuThetas[ti + 1];
    const cp0 = cuPhis[pi], cp1 = cuPhis[pi + 1];
    const f00 = lookup.get(ct0 + ',' + cp0) || minS;
    const f10 = lookup.get(ct1 + ',' + cp0) || minS;
    const f01 = lookup.get(ct0 + ',' + cp1) || minS;
    const f11 = lookup.get(ct1 + ',' + cp1) || minS;
    const tx = (tc - ct0) / (ct1 - ct0 || 1);
    const px = (pc - cp0) / (cp1 - cp0 || 1);
    return (f00 * (1 - tx) + f10 * tx) * (1 - px) + (f01 * (1 - tx) + f11 * tx) * px;
  }

  // Heatmap cells
  const subDiv = 4;
  for (let i = 0; i < cuThetas.length - 1; i++) {
    for (let j = 0; j < cuPhis.length - 1; j++) {
      const t0 = cuThetas[i], t1 = cuThetas[i + 1];
      const p0 = cuPhis[j], p1 = cuPhis[j + 1];
      for (let si = 0; si < subDiv; si++) {
        for (let sj = 0; sj < subDiv; sj++) {
          const theta = t0 + (t1 - t0) * (si + 0.5) / subDiv;
          const phi = p0 + (p1 - p0) * (sj + 0.5) / subDiv;
          if (theta < viewTMin || theta > viewTMax || phi < viewPMin || phi > viewPMax) continue;
          const norm = (interpScore(theta, phi) - minS) / range;
          const px = pad.l + ((theta - viewTMin) / viewTRange) * pw;
          const py = pad.t + (1 - (phi - viewPMin) / viewPRange) * ph;
          const cw = ((t1 - t0) / viewTRange) * pw / subDiv + 0.5;
          const ch = ((p1 - p0) / viewPRange) * ph / subDiv + 0.5;
          ctx.fillStyle = scoreColor(norm);
          ctx.fillRect(px - cw / 2, py - ch / 2, cw, ch);
        }
      }
    }
  }

  // Color bar
  const cbX = w - 18, cbW = 8, cbH = ph;
  for (let i = 0; i < cbH; i++) {
    const t = 1 - i / cbH;
    ctx.fillStyle = scoreColor(t);
    ctx.fillRect(cbX, pad.t + i, cbW, 1);
  }
  ctx.strokeStyle = '#383d49';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(cbX, pad.t, cbW, cbH);

  ctx.fillStyle = '#c8ccd4';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(minS.toFixed(3), cbX + cbW + 3, pad.t);
  ctx.fillText(((minS + maxS) / 2).toFixed(3), cbX + cbW + 3, pad.t + cbH / 2);
  ctx.fillText(maxS.toFixed(3), cbX + cbW + 3, pad.t + cbH);

  // Best marker
  if (best) {
    const bx = pad.l + ((best.theta - viewTMin) / viewTRange) * pw;
    const by = pad.t + (1 - (best.phi - viewPMin) / viewPRange) * ph;
    if (bx >= pad.l && bx <= pad.l + pw && by >= pad.t && by <= pad.t + ph) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(best.score.toFixed(3), bx + 9, by - 2);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px sans-serif';
      ctx.fillText('best', bx + 9, by + 10);
    }
  }

  // Worst marker
  if (worst && worst !== best) {
    const wx = pad.l + ((worst.theta - viewTMin) / viewTRange) * pw;
    const wy = pad.t + (1 - (worst.phi - viewPMin) / viewPRange) * ph;
    if (wx >= pad.l && wx <= pad.l + pw && wy >= pad.t && wy <= pad.t + ph) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.5;
      const s = 5;
      ctx.beginPath();
      ctx.moveTo(wx - s, wy - s); ctx.lineTo(wx + s, wy + s);
      ctx.moveTo(wx + s, wy - s); ctx.lineTo(wx - s, wy + s);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('worst', wx + 7, wy - 3);
    }
  }

  // Axis labels
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const numLabels = 4;
  for (let i = 0; i < numLabels; i++) {
    const t = viewTMin + (i / (numLabels - 1)) * viewTRange;
    ctx.fillText(Math.round(t) + '\u00B0', pad.l + (i / (numLabels - 1)) * pw, h - 20);
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < numLabels; i++) {
    const p = viewPMin + (i / (numLabels - 1)) * viewPRange;
    ctx.fillText(Math.round(p) + '\u00B0', pad.l - 5, pad.t + (1 - i / (numLabels - 1)) * ph);
  }

  ctx.fillStyle = '#6b7280';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('\u03B8 (tilt)', w / 2 - (pad.r / 2), h - 3);
  ctx.save();
  ctx.translate(7, pad.t + ph / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('\u03C6 (rotation)', 0, 0);
  ctx.restore();

  // Search boundary
  const plotRange = (result && result.searchRange > 0) ? result.searchRange : 45;
  const isConstrained = result && result.constrainedOptimum;
  ctx.save();
  ctx.strokeStyle = isConstrained ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.12)';
  ctx.lineWidth = isConstrained ? 1.5 : 0.8;
  ctx.setLineDash(isConstrained ? [4, 4] : [3, 5]);
  if (viewTMin <= plotRange && viewTMax >= -plotRange) {
    const xNeg = pad.l + ((-plotRange - viewTMin) / viewTRange) * pw;
    const xPos = pad.l + ((plotRange - viewTMin) / viewTRange) * pw;
    if (xNeg > pad.l) { ctx.beginPath(); ctx.moveTo(xNeg, pad.t); ctx.lineTo(xNeg, pad.t + ph); ctx.stroke(); }
    if (xPos < pad.l + pw) { ctx.beginPath(); ctx.moveTo(xPos, pad.t); ctx.lineTo(xPos, pad.t + ph); ctx.stroke(); }
  }
  if (viewPMin <= plotRange && viewPMax >= -plotRange) {
    const yNeg = pad.t + (1 - (-plotRange - viewPMin) / viewPRange) * ph;
    const yPos = pad.t + (1 - (plotRange - viewPMin) / viewPRange) * ph;
    if (yNeg > pad.t) { ctx.beginPath(); ctx.moveTo(pad.l, yNeg); ctx.lineTo(pad.l + pw, yNeg); ctx.stroke(); }
    if (yPos < pad.t + ph) { ctx.beginPath(); ctx.moveTo(pad.l, yPos); ctx.lineTo(pad.l + pw, yPos); ctx.stroke(); }
  }
  ctx.setLineDash([]);
  ctx.restore();

  if (isPartial) {
    ctx.fillStyle = '#e8a838';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('\u26A0 Partial results', w / 2, 1);
  }

  // Update state and cache
  if (scores && scores.length > 0) {
    _contourState = { scores: scores, best: best, worst: worst, isPartial: isPartial, result: result };
    var cacheThetas = [...new Set(scores.map(function(s) { return s.theta; }))].sort(function(a, b) { return a - b; });
    var cachePhis = [...new Set(scores.map(function(s) { return s.phi; }))].sort(function(a, b) { return a - b; });
    var localLookup = new Map();
    var lMin = Infinity, lMax = -Infinity;
    for (var si = 0; si < scores.length; si++) {
      var s = scores[si];
      localLookup.set(s.theta + ',' + s.phi, s.score);
      if (s.score < lMin) lMin = s.score;
      if (s.score > lMax) lMax = s.score;
    }
    _contourCache = {
      cuThetas: cacheThetas, cuPhis: cachePhis, lookup: localLookup,
      minS: lMin, maxS: lMax,
      tMin: cacheThetas[0], tMax: cacheThetas[cacheThetas.length - 1],
      pMin: cachePhis[0], pMax: cachePhis[cachePhis.length - 1],
    };
  }
}

// ── Penetration Rose ──
function drawPenetrationRose(bestData, worstData, isPartial, targetCanvas, intelliScanAngles, sizeOverride) {
  const { ctx, w, h } = setupCanvas('canvas-rose', 236, 176, targetCanvas, sizeOverride);
  if (!ctx) return;

  ctx.fillStyle = '#131519';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2, cy = h / 2;
  const radius = Math.min(cx, cy) - 24;
  const labelOffset = radius + 10;

  if (!bestData || bestData.length < 2) {
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No penetration data', cx, cy);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText('Run optimization to generate', cx, cy + 16);
    return;
  }

  let maxVal = 0;
  for (const v of bestData) if (v > maxVal) maxVal = v;
  if (worstData) for (const v of worstData) if (v > maxVal) maxVal = v;
  if (maxVal === 0) maxVal = 1;

  // Concentric circles
  ctx.strokeStyle = '#272b35';
  ctx.lineWidth = 0.5;
  ctx.fillStyle = '#6b7280';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let pct = 0.25; pct <= 1; pct += 0.25) {
    const r = radius * pct;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillText((maxVal * pct).toFixed(0) + ' mm', cx + r + 4, cy);
  }

  // Radial lines
  for (let a = 0; a < 360; a += 45) {
    const rad = a * DEG - Math.PI / 2;
    ctx.strokeStyle = '#272b35';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius);
    ctx.stroke();

    const lx = cx + Math.cos(rad) * labelOffset;
    const ly = cy + Math.sin(rad) * labelOffset;
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const shifts = {
      0: { x: 0, y: -2 }, 45: { x: 2, y: -2 }, 90: { x: 4, y: 0 },
      135: { x: 2, y: 2 }, 180: { x: 0, y: 4 }, 225: { x: -2, y: 2 },
      270: { x: -4, y: 0 }, 315: { x: -2, y: -2 },
    };
    const s = shifts[a] || { x: 0, y: 0 };
    ctx.fillText(a + '\u00B0', lx + s.x, ly + s.y);
  }

  // IntelliScan ticks
  if (intelliScanAngles && intelliScanAngles.length > 0) {
    ctx.strokeStyle = 'rgba(251,191,36,0.8)';
    ctx.lineWidth = 1.5;
    for (const angle of intelliScanAngles) {
      const rad = angle * DEG - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * radius * 0.92, cy + Math.sin(rad) * radius * 0.92);
      ctx.lineTo(cx + Math.cos(rad) * radius * 1.04, cy + Math.sin(rad) * radius * 1.04);
      ctx.stroke();
    }
  }

  function drawRose(data, fillStyle, strokeStyle, lineWidth, dash) {
    if (!data || data.length < 2) return;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
      const r = (data[i] / maxVal) * radius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fillStyle) { ctx.fillStyle = fillStyle; ctx.fill(); }
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth || 1.5;
      ctx.setLineDash(dash || []);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  if (worstData && worstData !== bestData) {
    drawRose(worstData, 'rgba(239,68,68,0.06)', 'rgba(239,68,68,0.4)', 1.2, [3, 3]);
  }
  drawRose(bestData, 'rgba(59,130,246,0.12)', '#3b82f6', 1.8, null);

  const bestRes = bestData ? bestData.length : 0;
  const worstRes = worstData ? worstData.length : 0;

  if (bestRes !== worstRes && bestRes > 0 && worstRes > 0) {
    ctx.fillStyle = '#e8a838';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('\u26A0 ' + bestRes + ' vs ' + worstRes + ' projections', cx, h - 48);
  }

  const legY = h - 14;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let legX = 10;

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(legX, legY - 3, 12, 2);
  ctx.fillStyle = '#c8ccd4';
  ctx.font = '10px sans-serif';
  ctx.fillText('Optimal (' + bestRes + ' proj)', legX + 16, legY);
  legX += 75;

  if (worstData && worstData !== bestData) {
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(legX, legY); ctx.lineTo(legX + 12, legY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#c8ccd4';
    ctx.font = '10px sans-serif';
    ctx.fillText('Worst (' + worstRes + ' proj)', legX + 16, legY);
    legX += 75;
  }

  if (intelliScanAngles && intelliScanAngles.length > 0) {
    ctx.strokeStyle = 'rgba(251,191,36,0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(legX, legY); ctx.lineTo(legX + 12, legY);
    ctx.stroke();
    ctx.fillStyle = '#c8ccd4';
    ctx.font = '10px sans-serif';
    ctx.fillText('IntelliScan (' + intelliScanAngles.length + ')', legX + 16, legY);
  }

  if (isPartial) {
    ctx.fillStyle = '#e8a838';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u26A0 Partial result', cx, 12);
  }

  // Update rose state
  _roseState = { bestData: bestData, worstData: worstData, isPartial: isPartial, intelliScanAngles: intelliScanAngles };
}

// ── Preview interaction setup ──
export function setupContourHover() {
  const canvas = document.getElementById('canvas-contour');
  if (!canvas) return;
  if (canvas._contourHoverSetup) return;
  canvas._contourHoverSetup = true;

  canvas.addEventListener('mousemove', function (e) {
    if (!_contourCache) { hideHoverInfo(); return; }
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var canvasW = parseInt(canvas.style.width) || (canvas.width / dpr);
    var canvasH = parseInt(canvas.style.height) || (canvas.height / dpr);
    var padL = 32, padR = 24, padT = 10, padB = 22;
    var pw = canvasW - padL - padR;
    var ph = canvasH - padT - padB;
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    if (mx < padL || mx > padL + pw || my < padT || my > padT + ph) { hideHoverInfo(); return; }

    var cache = _contourCache;
    var cuThetas = cache.cuThetas, cuPhis = cache.cuPhis;
    if (cuThetas.length < 2 || cuPhis.length < 2) { hideHoverInfo(); return; }

    var tMin = cache.tMin, tMax = cache.tMax;
    var pMin = cache.pMin, pMax = cache.pMax;
    var zTRange = tMax - tMin || 1, zPRange = pMax - pMin || 1;
    var theta = tMin + ((mx - padL) / pw) * zTRange;
    var phi = pMin + (1 - (my - padT) / ph) * zPRange;
    var clampedTheta = Math.min(tMax, Math.max(tMin, theta));
    var clampedPhi = Math.min(pMax, Math.max(pMin, phi));

    var lookup = cache.lookup, minS = cache.minS;
    var ti = 0;
    for (var i = 0; i < cuThetas.length - 1; i++) { if (clampedTheta >= cuThetas[i] && clampedTheta <= cuThetas[i + 1]) { ti = i; break; } }
    var pi = 0;
    for (var j = 0; j < cuPhis.length - 1; j++) { if (clampedPhi >= cuPhis[j] && clampedPhi <= cuPhis[j + 1]) { pi = j; break; } }
    var ct0 = cuThetas[ti], ct1 = cuThetas[ti + 1];
    var cp0 = cuPhis[pi], cp1 = cuPhis[pi + 1];
    var f00 = lookup.get(ct0 + ',' + cp0) || minS;
    var f10 = lookup.get(ct1 + ',' + cp0) || minS;
    var f01 = lookup.get(ct0 + ',' + cp1) || minS;
    var f11 = lookup.get(ct1 + ',' + cp1) || minS;
    var tx = (clampedTheta - ct0) / (ct1 - ct0 || 1);
    var px = (clampedPhi - cp0) / (cp1 - cp0 || 1);
    var score = (f00 * (1 - tx) + f10 * tx) * (1 - px) + (f01 * (1 - tx) + f11 * tx) * px;

    showHoverInfo(e.clientX, e.clientY,
      '\u03B8=' + clampedTheta.toFixed(1) + '\u00B0  \u03C6=' + clampedPhi.toFixed(1) + '\u00B0  score=' + score.toFixed(4));
  });

  canvas.addEventListener('mouseleave', hideHoverInfo);

  canvas.addEventListener('click', function () {
    if (_contourState) showExpandedPlot('contour');
  });
}

export function setupRoseHover() {
  const canvas = document.getElementById('canvas-rose');
  if (!canvas) return;
  if (canvas._roseHoverSetup) return;
  canvas._roseHoverSetup = true;

  canvas.addEventListener('mousemove', function (e) {
    if (!_roseState || !_roseState.bestData || _roseState.bestData.length < 2) { hideHoverInfo(); return; }
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var canvasW = parseInt(canvas.style.width) || (canvas.width / dpr);
    var canvasH = parseInt(canvas.style.height) || (canvas.height / dpr);
    var cx = canvasW / 2, cy = canvasH / 2;
    var radius = Math.min(cx, cy) - 24;
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var dx = mx - cx, dy = my - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius + 10 || dist < 6) { hideHoverInfo(); return; }

    var angleRad = Math.atan2(dx, -dy);
    if (angleRad < 0) angleRad += Math.PI * 2;
    var angleDeg = angleRad * 180 / Math.PI;
    var data = _roseState.bestData;
    var numProj = data.length;
    var nearestIdx = Math.round(angleDeg / 360 * numProj) % numProj;
    showHoverInfo(e.clientX, e.clientY,
      '\u03B1=' + (nearestIdx / numProj * 360).toFixed(0) + '\u00B0  max=' + data[nearestIdx].toFixed(2) + ' mm');
  });

  canvas.addEventListener('mouseleave', hideHoverInfo);

  canvas.addEventListener('click', function () {
    if (_roseState) showExpandedPlot('rose');
  });
}

export { drawContourPlot, drawPenetrationRose };
