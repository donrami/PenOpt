// Materials — material picker, filter picker, beam energy
import { S, $, qs, qsa, invalidateResults } from './state.js';
import { CalcBeamParams, GetMaterials, GetFilters, GetScannerPresets } from '../wailsjs/go/main/App';

let _matFilter = 'all', _matSearch = '';

export function renderMatGrid() {
  const grid = $('mat-grid'); grid.innerHTML = '';
  const filtered = S.mats.filter(m => {
    if (_matFilter !== 'all' && m.cat !== _matFilter) return false;
    if (_matSearch) return m.name.toLowerCase().includes(_matSearch.toLowerCase()) || m.id.toLowerCase().includes(_matSearch);
    return true;
  });
  for (const m of filtered) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'mat-item'; el.dataset.id = m.id;
    if (S.materialID === m.id) el.classList.add('active');
    el.innerHTML = `<span class="mat-swatch" style="background:${m.color}"></span><span class="mat-name">${m.name}</span>`;
    el.addEventListener('click', () => selectMaterial(m.id));
    grid.appendChild(el);
  }
}

export function selectMaterial(id) {
  S.materialID = id;
  qsa('.mat-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
  // Update material subtitle in card header
  const subtitleEl = document.getElementById('mat-subtitle');
  const mat = S.mats.find(m => m.id === id);
  if (subtitleEl && mat) subtitleEl.textContent = '— ' + mat.name;
  recalcBeam();
  invalidateResults();
}

export function setMatFilter(cat) { _matFilter = cat; renderMatGrid(); }
export function setMatSearch(search) { _matSearch = search; renderMatGrid(); }

export function recalcBeam() {
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

export function renderFilters() {
  const grid = $('filter-grid'); grid.innerHTML = '';
  for (const f of S.filters) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'filter-btn' + (S.filterID === f.id ? ' active' : '');
    el.innerHTML = `<span class="fb-icon">${f.icon}</span><span class="fb-name">${f.name}</span>`;
    el.addEventListener('click', () => selectFilter(f.id));
    grid.appendChild(el);
  }
}

export function selectFilter(id) {
  S.filterID = id;
  qsa('.filter-btn').forEach(el => el.classList.toggle('active', el.textContent.includes(id)));
  const f = S.filters.find(f => f.id === id);
  $('acc-filter-val').textContent = f ? f.name : 'None';
  recalcBeam();
  invalidateResults();
}

function _debounce(fn, ms) {
  var timer = null;
  return function() {
    var args = arguments;
    var ctx = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() { timer = null; fn.apply(ctx, args); }, ms);
  };
}

export function setupSliders() {
  const eSl = $('sl-energy');
  var onEnergyChange = _debounce(function() { recalcBeam(); invalidateResults(); }, 80);
  eSl.addEventListener('input', () => { S.energy = parseFloat(eSl.value); onEnergyChange(); });
  [30, 50, 76, 100, 150, 200, 300].forEach(v => {
    const btn = document.createElement('button');
    btn.textContent = v; btn.addEventListener('click', () => { eSl.value = v; S.energy = v; recalcBeam(); });
    $('presets-energy').appendChild(btn);
  });
  const tSl = $('sl-tmin');
  var onTminChange = _debounce(function() { recalcBeam(); invalidateResults(); }, 80);
  tSl.addEventListener('input', () => { S.tPct = parseFloat(tSl.value); onTminChange(); });
  [0.01, 0.05, 0.10, 0.20, 0.50, 1.0, 2.0].forEach(v => {
    const btn = document.createElement('button');
    btn.textContent = v.toFixed(2); btn.addEventListener('click', () => { tSl.value = v; S.tPct = v; recalcBeam(); });
    $('presets-tmin').appendChild(btn);
  });

  // T2.1: Ray Sampling slider
  const rgSl = $('sl-raygrid');
  function updateGridInfo(rayGrid) {
    const coarse = rayGrid === 0 ? 8 : rayGrid;
    const fine = Math.min(coarse * 2, 32);
    const timeLabel = rayGrid <= 8 ? '~10s-1m' : rayGrid <= 16 ? '~20s-2m' : '~1-5m';
    $('grid-info').textContent = coarse + '×' + coarse + ' coarse / ' + fine + '×' + fine + ' fine · ' + timeLabel;
    $('grid-info').classList.remove('hidden');
  }
  if (rgSl) {
    rgSl.addEventListener('input', () => {
      const val = parseInt(rgSl.value);
      S.rayGridXY = val;
      if (val === 0) {
        $('disp-raygrid').textContent = 'default';
        $('disp-raygrid-hint').textContent = '8×8 coarse / 16×16 fine (default)';
      } else {
        $('disp-raygrid').textContent = val + '×' + val;
        const fineVal = Math.min(val * 2, 32);
        $('disp-raygrid-hint').textContent = val + '×' + val + ' coarse / ' + fineVal + '×' + fineVal + ' fine';
      }
      updateGridInfo(val);
      invalidateResults();
    });
  }

  // Search Range slider
  const srSl = $('cfg-searchrange');
  if (srSl) {
    srSl.addEventListener('input', () => {
      const val = parseInt(srSl.value, 10) || 45;
      S.searchRange = val;
      $('disp-searchrange').textContent = val + '°';
      try { localStorage.setItem('penopt-search-range', String(val)); } catch (_) {}
      invalidateResults();
    });
    // Sync display in case S.searchRange was restored from localStorage before slider
    $('disp-searchrange').textContent = S.searchRange + '°';
    srSl.value = S.searchRange;
  }
}

function setupScannerInputListeners() {
  // Individual scanner geometry inputs — change events only fire on user edits,
  // not on programmatic value changes (e.g. preset selection).
  ['cfg-sdd', 'cfg-sod', 'cfg-detw', 'cfg-deth', 'cfg-px', 'cfg-py'].forEach(function(id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('change', invalidateResults);
  });
}

export function setupScannerPresets() {
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
    const accVal = $('acc-scanner-val');
    if (accVal) {
      if (p.id !== 'custom') {
        accVal.textContent = p.name;
      } else {
        accVal.textContent = p.sdd + '/' + p.sod;
      }
    }
    // Preset selection changes geometry — invalidate results
    invalidateResults();
  });
  setupScannerInputListeners();
}
