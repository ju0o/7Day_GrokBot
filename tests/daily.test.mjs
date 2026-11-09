import test from 'node:test';
import assert from 'node:assert/strict';
import { seoulYmd, dailySeed, isDailySeed, parseSeedHash, newGame, resolveSeed } from '../public/engine.mjs';
test('Seoul calendar date around UTC midnight boundary', () => {
  // 2026-11-08 15:00:00Z = 2026-11-09 00:00 KST
  assert.equal(seoulYmd(new Date('2026-11-08T15:00:00.000Z')), '2026-11-09');
  // 2026-11-08 14:59:59Z = 2026-11-08 23:59:59 KST
  assert.equal(seoulYmd(new Date('2026-11-08T14:59:59.000Z')), '2026-11-08');
  assert.equal(seoulYmd(new Date('2026-11-09T14:59:59.000Z')), '2026-11-09');
  assert.equal(seoulYmd(new Date('2026-11-09T15:00:00.000Z')), '2026-11-10');
});
test('daily seed format, parse, share round-trip', () => {
  const s = dailySeed(new Date('2026-11-09T12:00:00+09:00'));
  assert.equal(s, 'daily-2026-11-09');
  assert.equal(isDailySeed(s), true);
  assert.equal(isDailySeed('day1-check'), false);
  assert.equal(isDailySeed('daily-2026-13-40'), true); // format-only badge; calendar validity not enforced
  assert.equal(parseSeedHash('#seed=' + s), s);
  assert.deepEqual(newGame(s).route, newGame('daily-2026-11-09').route);
  assert.deepEqual(resolveSeed('#seed=' + s, null, () => 'x'), { seed: s, restart: true });
});
test('same Seoul day yields same daily seed across hours', () => {
  assert.equal(dailySeed(new Date('2026-11-09T00:00:00+09:00')), dailySeed(new Date('2026-11-09T23:59:59+09:00')));
  assert.notEqual(dailySeed(new Date('2026-11-09T23:59:59+09:00')), dailySeed(new Date('2026-11-10T00:00:00+09:00')));
});
import { readFile } from 'node:fs/promises';
test('CSS must hide .badge[hidden] (class display:inline-block otherwise overrides HTML hidden)', async () => {
  const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.badge\[hidden\]\s*\{\s*display\s*:\s*none\s*;?\s*\}/);
  // without that rule, .badge{display:inline-block} wins over UA [hidden]{display:none}
  assert.match(css, /\.badge\{[^}]*display\s*:\s*inline-block/);
});
test('daily badge visibility follows isDailySeed only', () => {
  assert.equal(isDailySeed('daily-2026-11-09'), true);
  assert.equal(isDailySeed('day1-check'), false);
  assert.equal(isDailySeed('83mgep'), false);
});
