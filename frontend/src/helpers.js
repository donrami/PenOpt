// ── Shared Utility Helpers ──

/**
 * Debounce a function — delays invocation until `ms` ms after the last call.
 */
export function debounce(fn, ms) {
  var timer = null;
  return function() {
    var args = arguments;
    var ctx = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() { timer = null; fn.apply(ctx, args); }, ms);
  };
}

/**
 * Clamp a number between min and max.
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Format milliseconds into a human-readable time string.
 */
export function formatTime(ms) {
  if (ms < 1000) return '<1s>';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return sec + 's';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + 'm ' + s + 's';
}
