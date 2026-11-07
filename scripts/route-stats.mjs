// Deterministic engine-only route analysis (not human playtesting).
import { generateRoute, rc } from '../public/engine.mjs';
const N = Number(process.argv[2]) || 10000, len = Number(process.argv[3]) || 8;
const turns = new Map(); let straight = 0, edge = 0;
for (let i = 0; i < N; i++) {
  const r = generateRoute('stat-' + i, len); let t = 0;
  for (let k = 2; k < r.length; k++) {
    const [a, b, c] = [rc(r[k - 2]), rc(r[k - 1]), rc(r[k])];
    if (a[0] - b[0] !== b[0] - c[0] || a[1] - b[1] !== b[1] - c[1]) t++;
  }
  turns.set(t, (turns.get(t) || 0) + 1); if (t === 0) straight++;
  if (r.every((x) => { const [y, z] = rc(x); return y === 0 || y === 4 || z === 0 || z === 4; })) edge++;
}
console.log(JSON.stringify({ seeds: N, length: len, turnsHistogram: Object.fromEntries([...turns].sort((a, b) => a[0] - b[0])), zeroTurn: straight, allEdgeCells: edge }));
