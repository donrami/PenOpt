// ── Export Module ──
// JSON export and PNG screenshot with summary overlay.
// Ported from the old project's export.js.

/**
 * Export optimization results as a JSON file download.
 */
export function exportJSON(result) {
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

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orientation-results.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export a visual summary PNG: viewport screenshot + text overlay.
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {Object} result - optimization result
 * @param {string} energyText - energy recommendation text (e.g. "120 kV")
 */
export function exportPNG(renderer, result, energyText) {
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
  ctx.fillText('PenOpt — CT Scan Orientation Optimizer', 14, barY + 14);

  const best = result?.bestOrientation;
  if (best) {
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`\u03B8 = ${best.theta}\u00B0   \u03C6 = ${best.phi}\u00B0`, 14, barY + 40);

    ctx.fillStyle = '#cdd5e0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Score: ${best.score.toFixed(3)}  |  Energy: ${energyText || '--'}${result?.constrainedOptimum ? '  |  \u26A0 constrained optimum' : ''}`, 14, barY + 68);

    ctx.fillStyle = '#8b95a8';
    ctx.font = '11px monospace';
    ctx.fillText(
      new Date().toLocaleString() + '  |  ' + (result?.allScores?.length || 0) + ' orientations evaluated',
      14, barY + 92
    );
  }

  // Download
  composite.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orientation-results.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}
