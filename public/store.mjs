// Thin localStorage adapter for daily bests. Keyed by seed; no network.
// Plausibility threshold mirrors engine.MIN_BEST_MS (keep in sync; no import to stay a leaf module).
const PREFIX = 'afterimage-best:';
const MIN_BEST_MS = 100;
function plausible(best) {
  return !!best && Number.isInteger(best.mistakes) && Number.isFinite(best.ms) && best.ms >= MIN_BEST_MS && Number.isInteger(best.steps);
}
export function loadBest(seed, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(PREFIX + seed);
    if (!raw) return null;
    const o = JSON.parse(raw);
    const best = { mistakes: o.mistakes, ms: o.ms, steps: o.steps };
    if (!plausible(best)) {
      try { storage?.removeItem?.(PREFIX + seed); } catch { /* ignore */ }
      return null;
    }
    return best;
  } catch { return null; }
}
export function saveBest(seed, best, storage = globalThis.localStorage) {
  if (!plausible(best)) return;
  try { storage?.setItem?.(PREFIX + seed, JSON.stringify(best)); } catch { /* private mode */ }
}
