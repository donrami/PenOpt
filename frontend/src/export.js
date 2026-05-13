// ── Export Module ──
// JSON export and PNG screenshot with summary overlay.
// Uses native Save File dialog for user-selected paths.
// Ported from the old project's export.js.

import { SaveFile } from '../wailsjs/go/main/App';
import { S } from './state.js';

/**
 * Build a safe, traceable default filename.
 * @param {'results'|'screenshot'|'intelliscan'} kind - what kind of export
 * @param {string} ext - file extension including dot (e.g. '.json', '.png')
 * @returns {string} safe filename
 */
function defaultExportName(kind, ext) {
  const result = S.result;
  const best = result?.bestOrientation;
  const material = (S.materialID || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  let name = 'penopt-' + kind + '_' + material;
  if (best && kind !== 'intelliscan') {
    const tStr = best.theta.toFixed(0).replace('-', 'neg');
    const pStr = best.phi.toFixed(0).replace('-', 'neg');
    name += '_t' + tStr + 'deg_p' + pStr + 'deg';
  }
  name += '_' + date + ext;
  return name;
}

/**
 * Export optimization results as a JSON file via native Save dialog.
 */
export async function exportJSON(result, btn) {
  const json = JSON.stringify({
    bestOrientation: result.bestOrientation,
    worstOrientation: result.worstOrientation,
    allScores: result.allScores,
    numEvaluations: result.allScores.length,
    isPartial: result.isPartial || false,
    constrainedOptimum: result.constrainedOptimum || false,
    boundaryWarning: result.boundaryWarning || null,
    coarseFineMismatch: result.coarseFineMismatch || false,
    mismatchNote: result.mismatchNote || null,
    referenceOrientation: result.referenceOrientation || null,
    intelliScan: result.intelliScan || null,
    timestamp: new Date().toISOString(),
  }, null, 2);

  const name = defaultExportName('results', '.json');
  const bytes = new TextEncoder().encode(json);

  try {
    const path = await SaveFile(name, bytes);
    if (!path) return; // user cancelled
    if (btn) {
      btn.textContent = '\u2713 Saved!';
      setTimeout(function () { btn.textContent = '\u2913 JSON'; }, 1500);
    }
  } catch (err) {
    console.warn('JSON export failed:', err);
  }
}

/**
 * Export a visual summary PNG: viewport screenshot + text overlay.
 * Uses native Save dialog.
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {Object} result - optimization result
 * @param {string} energyText - energy recommendation text (e.g. "120 kV")
 */
export async function exportPNG(renderer, result, energyText, btn) {
  if (!renderer) return;

  const vpCanvas = renderer.domElement;
  const w = vpCanvas.width;
  const h = vpCanvas.height;

  const composite = document.createElement('canvas');
  composite.width = w;
  composite.height = h + 120;
  const ctx = composite.getContext('2d');

  // Draw viewport
  ctx.drawImage(vpCanvas, 0, 0);

  // Draw summary bar at bottom
  const barY = h;
  ctx.fillStyle = '#111419';
  ctx.fillRect(0, barY, w, 120);

  ctx.fillStyle = '#cdd5e0';
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('PenOpt \u2014 CT Scan Orientation Optimizer', 14, barY + 14);

  const best = result?.bestOrientation;
  if (best) {
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('\u03B8 = ' + best.theta + '\u00B0   \u03C6 = ' + best.phi + '\u00B0', 14, barY + 40);

    ctx.fillStyle = '#cdd5e0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(
      'Score: ' + best.score.toFixed(3) + '  |  Energy: ' + (energyText || '--')
      + (result?.constrainedOptimum ? '  |  \u26A0 constrained optimum' : ''),
      14, barY + 68
    );

    ctx.fillStyle = '#8b95a8';
    ctx.font = '11px monospace';
    ctx.fillText(
      new Date().toLocaleString() + '  |  ' + (result?.allScores?.length || 0) + ' orientations evaluated',
      14, barY + 92
    );
  }

  // Convert to bytes and save via native dialog
  const blob = await new Promise(function (resolve) { composite.toBlob(resolve, 'image/png'); });
  if (!blob) return;
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const name = defaultExportName('screenshot', '.png');

  try {
    const path = await SaveFile(name, bytes);
    if (!path) return; // user cancelled
    if (btn) {
      btn.textContent = '\u2713 Saved!';
      setTimeout(function () { btn.textContent = '\u2913 PNG'; }, 1500);
    }
  } catch (err) {
    console.warn('PNG export failed:', err);
  }
}
