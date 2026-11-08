// Afterimage Route — pure deterministic game engine (no DOM, no I/O).
export const SIZE = 5;
export const DEFAULT_LENGTH = 8;
export const MAX_ATTEMPTS = 500;

export function hashSeed(seed) {
  const s = String(seed ?? '').slice(0, 200);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
export function rng(seedNum) {
  let a = seedNum >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const idx = (r, c) => r * SIZE + c;
export const rc = (i) => [Math.floor(i / SIZE), i % SIZE];
export function adjacent(a, b) {
  const [ar, ac] = rc(a), [br, bc] = rc(b);
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}
function neighbors(i) {
  const [r, c] = rc(i); const out = [];
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) { const nr=r+dr, nc=c+dc; if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE) out.push(idx(nr,nc)); }
  return out;
}
/** Seeded self-avoiding orthogonal route. Throws only if bounds exhausted. */
export function generateRoute(seed, length = DEFAULT_LENGTH) {
  const len = Number.isInteger(length) ? Math.min(Math.max(length, 3), 12) : DEFAULT_LENGTH;
  const rand = rng(hashSeed(seed));
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const route = [Math.floor(rand() * SIZE * SIZE)];
    const seen = new Set(route);
    while (route.length < len) {
      const opts = neighbors(route.at(-1)).filter((n) => !seen.has(n));
      if (!opts.length) break;
      const n = opts[Math.floor(rand() * opts.length)];
      route.push(n); seen.add(n);
    }
    if (route.length === len) return route;
  }
  throw new Error('route generation failed');
}
export function newGame(seed, length = DEFAULT_LENGTH) {
  const route = generateRoute(seed, length);
  return Object.freeze({ seed: String(seed), route, phase: 'preview', path: [route[0]], mistakes: 0, revealed: false, last: 'ready', startedAt: null, finishedAt: null });
}
const upd = (s, p) => Object.freeze({ ...s, ...p });
export function startRecall(s, now = 0) {
  if (s.phase !== 'preview') return upd(s, { last: 'ignored' });
  return upd(s, { phase: 'recall', path: [s.route[0]], last: 'recall', startedAt: now });
}
/** Select a cell during recall. Outcomes in .last: ignored | not-adjacent | wrong | step | complete */
export function select(s, cell, now = 0) {
  if (s.phase !== 'recall' || !Number.isInteger(cell) || cell < 0 || cell >= SIZE * SIZE) return upd(s, { last: 'ignored' });
  const end = s.path.at(-1);
  if (cell === end) return upd(s, { last: 'ignored' }); // re-activating current cell is a no-op
  if (!adjacent(end, cell)) return upd(s, { last: 'not-adjacent' });
  if (s.path.length >= 2 && cell === s.path.at(-2)) return undo(s);
  const expected = s.route[s.path.length];
  if (cell !== expected) return upd(s, { mistakes: s.mistakes + 1, last: 'wrong' });
  const path = [...s.path, cell];
  if (path.length === s.route.length) return upd(s, { path, phase: 'done', last: 'complete', finishedAt: now });
  return upd(s, { path, last: 'step' });
}
export function move(s, dir, now = 0) {
  const d = { up: [-1,0], down: [1,0], left: [0,-1], right: [0,1] }[dir];
  if (!d || s.phase !== 'recall') return upd(s, { last: 'ignored' });
  const [r, c] = rc(s.path.at(-1)); const nr = r + d[0], nc = c + d[1];
  if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return upd(s, { last: 'not-adjacent' });
  return select(s, idx(nr, nc), now);
}
export function undo(s) {
  if (s.phase !== 'recall' || s.path.length < 2) return upd(s, { last: 'ignored' });
  return upd(s, { path: s.path.slice(0, -1), last: 'undo' });
}
/** Reveal again: back to preview, progress reset, score permanently ineligible for this seed run. */
export function reveal(s) {
  if (s.phase !== 'recall') return upd(s, { last: 'ignored' });
  return upd(s, { phase: 'preview', path: [s.route[0]], revealed: true, last: 'revealed', startedAt: null });
}
export function result(s) {
  if (s.phase !== 'done') return null;
  return { steps: s.route.length - 1, mistakes: s.mistakes, ms: Math.max(0, (s.finishedAt ?? 0) - (s.startedAt ?? 0)), scored: !s.revealed };
}
/** Public, recall-safe view: never exposes un-walked route cells while hidden. */
export function view(s) {
  const showRoute = s.phase !== 'recall';
  return { phase: s.phase, start: s.route[0], goal: s.route.at(-1), path: [...s.path], route: showRoute ? [...s.route] : null, mistakes: s.mistakes, revealed: s.revealed, last: s.last, total: s.route.length };
}
export function randomSeed(r = Math.random) { return Math.floor(r() * 36 ** 6).toString(36).padStart(6, '0'); }
/** Strict share-link parser: only exactly `#seed=<1-32 of A-Z a-z 0-9 _ ->` is accepted; anything else → null (fresh seed). */
export function parseSeedHash(hash) {
  const m = /^#seed=([A-Za-z0-9_-]{1,32})$/.exec(typeof hash === 'string' ? hash : '');
  return m ? m[1] : null;
}
