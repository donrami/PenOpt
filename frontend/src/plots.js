// ── Canvas Plotting Utilities ──
// Ported from the old project: contour.js, rose.js, display.js

// setupCanvas configures a canvas element for HiDPI rendering.
export function setupCanvas(canvasId, defaultWidth, defaultHeight, targetCanvas) {
  const cv = targetCanvas || document.getElementById(canvasId);
  if (!cv) return { cv: null, ctx: null, w: 0, h: 0 };
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.parentElement.getBoundingClientRect();
  const w = Math.max(rect.width - 4, defaultWidth);
  const h = Math.max(defaultHeight, 100);
  cv.width = w * dpr;
  cv.height = h * dpr;
  cv.style.width = w + 'px';
  cv.style.height = h + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  return { cv, ctx, w, h };
}

// ── Contour Plot ──
// 2D heatmap of optimization scores over (θ, φ) with bilinear interpolation.

const DEG = Math.PI / 180;

// T1.1: drawContourPlot accepts result to detect constrained optimum
export function drawContourPlot(scores, best, worst, isPartial, targetCanvas, result) {
  const { ctx, w, h } = setupCanvas('canvas-contour', 236, 176, targetCanvas);
  if (!ctx) return;

  const bgColor = '#131519';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const pad = { l: 32, r: 24, t: 10, b: 22 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  // Sort unique θ and φ values
  const thetasAll = [...new Set(scores.map(s => s.theta))].sort((a, b) => a - b);
  const phisAll = [...new Set(scores.map(s => s.phi))].sort((a, b) => a - b);
  if (thetasAll.length < 2 || phisAll.length < 2) {
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not enough data', w / 2, h / 2);
    return;
  }

  // Use ALL evaluated angles as the interpolation grid (no hardcoded template)
  // Build lookup map from all score points
  const lookup = new Map();
  for (const s of scores) lookup.set(s.theta + ',' + s.phi, s.score);
  
  const cuThetas = [...new Set(scores.map(s => s.theta))].sort((a, b) => a - b);
  const cuPhis = [...new Set(scores.map(s => s.phi))].sort((a, b) => a - b);
  
  if (cuThetas.length < 2 || cuPhis.length < 2) {
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not enough evaluated angles', w / 2, h / 2);
    return;
  }

  // Score range
  let minS = Infinity, maxS = -Infinity;
  for (const s of scores) { if (s.score < minS) minS = s.score; if (s.score > maxS) maxS = s.score; }
  const range = maxS - minS || 1;

  // Blue(0) → Yellow(0.5) → Red(1) color mapping
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

  const tMin = Math.min(...thetasAll), tMax = Math.max(...thetasAll);
  const pMin = Math.min(...phisAll), pMax = Math.max(...phisAll);
  const tRange = tMax - tMin || 1, pRange = pMax - pMin || 1;

  function interpScore(theta, phi) {
    const tc = Math.min(tMax, Math.max(tMin, theta));
    const pc = Math.min(pMax, Math.max(pMin, phi));
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

  // Draw heatmap cells (4×4 sub-division per coarse cell)
  const subDiv = 4;
  for (let i = 0; i < cuThetas.length - 1; i++) {
    for (let j = 0; j < cuPhis.length - 1; j++) {
      const t0 = cuThetas[i], t1 = cuThetas[i + 1];
      const p0 = cuPhis[j], p1 = cuPhis[j + 1];
      for (let si = 0; si < subDiv; si++) {
        for (let sj = 0; sj < subDiv; sj++) {
          const theta = t0 + (t1 - t0) * (si + 0.5) / subDiv;
          const phi = p0 + (p1 - p0) * (sj + 0.5) / subDiv;
          const score = interpScore(theta, phi);
          const norm = (score - minS) / range;
          const px = pad.l + ((theta - tMin) / tRange) * pw;
          const py = pad.t + (1 - (phi - pMin) / pRange) * ph;
          const cw = ((t1 - t0) / tRange) * pw / subDiv + 0.5;
          const ch = ((p1 - p0) / pRange) * ph / subDiv + 0.5;
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

  // Best marker (white circle)
  if (best) {
    const bx = pad.l + ((best.theta - tMin) / tRange) * pw;
    const by = pad.t + (1 - (best.phi - pMin) / pRange) * ph;
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
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('best', bx + 9, by + 10);
  }

  // Worst marker (white X)
  if (worst && worst !== best) {
    const wx = pad.l + ((worst.theta - tMin) / tRange) * pw;
    const wy = pad.t + (1 - (worst.phi - pMin) / pRange) * ph;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.5;
    const s = 5;
    ctx.beginPath();
    ctx.moveTo(wx - s, wy - s); ctx.lineTo(wx + s, wy + s);
    ctx.moveTo(wx + s, wy - s); ctx.lineTo(wx - s, wy + s);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('worst', wx + 7, wy - 3);
  }

  // Axis labels (use actual evaluated angles)
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const thetas4labels = cuThetas.filter((v, i, a) => i === 0 || i === a.length - 1 || Math.abs(v - a[i-1]) > 8);
  for (const t of thetas4labels) {
    const x = pad.l + ((t - tMin) / tRange) * pw;
    ctx.fillText(t + '\u00B0', x, h - 20);
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const phis4labels = cuPhis.filter((v, i, a) => i === 0 || i === a.length - 1 || Math.abs(v - a[i-1]) > 8);
  for (const p of phis4labels) {
    const y = pad.t + (1 - (p - pMin) / pRange) * ph;
    ctx.fillText(p + '\u00B0', pad.l - 5, y);
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

  // T1.1: draw search space boundary overlay
  // Use the actual configured range from the result; fall back to 45° for pre-T5 results
  const plotRange = (result && result.searchRange > 0) ? result.searchRange : 45;
  const isConstrained = result && result.constrainedOptimum;
  ctx.save();
  ctx.strokeStyle = isConstrained ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.12)';
  ctx.lineWidth = isConstrained ? 1.5 : 0.8;
  ctx.setLineDash(isConstrained ? [4, 4] : [3, 5]);
  // Vertical boundary lines (θ = -range and θ = +range)
  // Always draw at the configured boundary position; clip to visible plot area
  if (tMin <= plotRange && tMax >= -plotRange) {
    const xNeg = pad.l + ((-plotRange - tMin) / tRange) * pw;
    const xPos = pad.l + ((plotRange - tMin) / tRange) * pw;
    if (xNeg > pad.l) {
      ctx.beginPath(); ctx.moveTo(xNeg, pad.t); ctx.lineTo(xNeg, pad.t + ph); ctx.stroke();
    }
    if (xPos < pad.l + pw) {
      ctx.beginPath(); ctx.moveTo(xPos, pad.t); ctx.lineTo(xPos, pad.t + ph); ctx.stroke();
    }
  }
  // Horizontal boundary lines (φ = -range and φ = +range)
  if (pMin <= plotRange && pMax >= -plotRange) {
    const yNeg = pad.t + (1 - (-plotRange - pMin) / pRange) * ph;
    const yPos = pad.t + (1 - (plotRange - pMin) / pRange) * ph;
    if (yNeg > pad.t) {
      ctx.beginPath(); ctx.moveTo(pad.l, yNeg); ctx.lineTo(pad.l + pw, yNeg); ctx.stroke();
    }
    if (yPos < pad.t + ph) {
      ctx.beginPath(); ctx.moveTo(pad.l, yPos); ctx.lineTo(pad.l + pw, yPos); ctx.stroke();
    }
  }
  ctx.setLineDash([]);
  ctx.restore();

  if (isPartial) {
    ctx.fillStyle = '#e8a838';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('\u26A0 Partial results', w / 2, 1);
  }
}

// ── Penetration Rose ──
// Polar plot of max penetration per projection angle.

export function drawPenetrationRose(bestData, worstData, isPartial, targetCanvas, intelliScanAngles) {
  const { ctx, w, h } = setupCanvas('canvas-rose', 236, 176, targetCanvas);
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
    ctx.font = '9px sans-serif';
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
  ctx.font = '7px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let pct = 0.25; pct <= 1; pct += 0.25) {
    const r = radius * pct;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillText((maxVal * pct).toFixed(0) + ' mm', cx + r + 4, cy);
  }

  // Radial lines every 45°
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
    ctx.font = '7px sans-serif';
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
      const innerR = radius * 0.92, outerR = radius * 1.04;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * innerR, cy + Math.sin(rad) * innerR);
      ctx.lineTo(cx + Math.cos(rad) * outerR, cy + Math.sin(rad) * outerR);
      ctx.stroke();
    }
  }

  // Draw rose data as filled polygon
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

  // Draw worst (dashed red) first
  if (worstData && worstData !== bestData) {
    drawRose(worstData, 'rgba(239,68,68,0.06)', 'rgba(239,68,68,0.4)', 1.2, [3, 3]);
  }
  // Draw best (solid blue) on top
  drawRose(bestData, 'rgba(59,130,246,0.12)', '#3b82f6', 1.8, null);

  // Resolution labels
  const bestRes = bestData ? bestData.length : 0;
  const worstRes = worstData ? worstData.length : 0;
  
  // Warn if resolutions differ
  if (bestRes !== worstRes && bestRes > 0 && worstRes > 0) {
    ctx.fillStyle = '#e8a838';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('\u26A0 ' + bestRes + ' vs ' + worstRes + ' projections', cx, h - 48);
  }

  // Legend
  const legY = h - 14;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let legX = 10;

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(legX, legY - 3, 12, 2);
  ctx.fillStyle = '#c8ccd4';
  ctx.font = '7px sans-serif';
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
    ctx.font = '7px sans-serif';
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
    ctx.font = '7px sans-serif';
    ctx.fillText('IntelliScan (' + intelliScanAngles.length + ')', legX + 16, legY);
  }

  if (isPartial) {
    ctx.fillStyle = '#e8a838';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u26A0 Partial result', cx, 12);
  }
}
