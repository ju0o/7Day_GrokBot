// Thin localStorage adapter for daily bests. Keyed by seed; no network.
const PREFIX = 'afterimage-best:';
export function loadBest(seed, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(PREFIX + seed);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!Number.isInteger(o?.mistakes) || !Number.isFinite(o?.ms) || !Number.isInteger(o?.steps)) return null;
    return { mistakes: o.mistakes, ms: o.ms, steps: o.steps };
  } catch { return null; }
}
export function saveBest(seed, best, storage = globalThis.localStorage) {
  if (!best) return;
  try { storage?.setItem?.(PREFIX + seed, JSON.stringify(best)); } catch { /* private mode */ }
}
