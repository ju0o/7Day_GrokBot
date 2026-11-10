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
import { previousDailySeed, dailyBadgeLabel, shiftYmd } from '../public/engine.mjs';
test('previousDailySeed is the Seoul calendar day before now', () => {
  assert.equal(shiftYmd('2026-11-10', -1), '2026-11-09');
  assert.equal(shiftYmd('2026-01-01', -1), '2025-12-31');
  assert.equal(shiftYmd('2026-03-01', -1), '2026-02-28');
  assert.equal(previousDailySeed(new Date('2026-11-10T23:59:59+09:00')), 'daily-2026-11-09');
  assert.equal(previousDailySeed(new Date('2026-11-11T00:00:00+09:00')), 'daily-2026-11-10');
  assert.equal(previousDailySeed(new Date('2026-11-10T14:59:59.000Z')), 'daily-2026-11-09'); // 23:59 KST
  assert.equal(previousDailySeed(new Date('2026-11-10T15:00:00.000Z')), 'daily-2026-11-10'); // 00:00 KST 11th
  assert.equal(parseSeedHash('#seed=daily-2026-11-10'), 'daily-2026-11-10');
});
test('dailyBadgeLabel distinguishes today, yesterday, and older daily seeds', () => {
  const now = new Date('2026-11-11T00:10:00+09:00');
  assert.equal(dailyBadgeLabel('daily-2026-11-11', now), '오늘의 항로');
  assert.equal(dailyBadgeLabel('daily-2026-11-10', now), '어제의 항로');
  assert.equal(dailyBadgeLabel('daily-2026-11-09', now), '일일 항로');
  assert.equal(dailyBadgeLabel('day1-check', now), null);
  assert.equal(dailyBadgeLabel('83mgep', now), null);
});
test('MIN_BEST_MS unchanged', async () => {
  const { MIN_BEST_MS } = await import('../public/engine.mjs');
  assert.equal(MIN_BEST_MS, 100);
});

import { nextSeoulMidnight, msUntilNextSeoulMidnight, dayChangeAction, bestTitle, formatBestLine } from '../public/engine.mjs';
test('next Seoul midnight is the following 00:00 Asia/Seoul', () => {
  const justBefore = new Date('2026-11-10T23:59:59.000+09:00');
  const atMidnight = new Date('2026-11-11T00:00:00.000+09:00');
  const after = new Date('2026-11-11T00:00:00.500+09:00');
  assert.equal(nextSeoulMidnight(justBefore).toISOString(), '2026-11-10T15:00:00.000Z');
  assert.equal(msUntilNextSeoulMidnight(justBefore), 1000);
  assert.equal(msUntilNextSeoulMidnight(new Date('2026-11-10T14:59:59.000Z')), 1000);
  assert.equal(msUntilNextSeoulMidnight(atMidnight), 24 * 60 * 60 * 1000);
  assert.equal(nextSeoulMidnight(after).toISOString(), '2026-11-11T15:00:00.000Z');
});
test('dayChangeAction refreshes labels only and never restarts the board', () => {
  const before = new Date('2026-11-10T23:59:59+09:00');
  const after = new Date('2026-11-11T00:00:00+09:00');
  assert.deepEqual(dayChangeAction('2026-11-10', before), { ymd: '2026-11-10', refreshLabels: false, restartGame: false });
  assert.deepEqual(dayChangeAction('2026-11-10', after), { ymd: '2026-11-11', refreshLabels: true, restartGame: false });
  assert.deepEqual(dayChangeAction(null, after), { ymd: '2026-11-11', refreshLabels: false, restartGame: false });
  assert.deepEqual(dayChangeAction('2026-11-11', after), { ymd: '2026-11-11', refreshLabels: false, restartGame: false });
  assert.equal(dayChangeAction('2026-11-10', after).restartGame, false);
});
test('same open seed: badge and best title retarget after Seoul midnight', () => {
  const seed = 'daily-2026-11-10';
  const older = 'daily-2026-11-09';
  const before = new Date('2026-11-10T23:59:59+09:00');
  const after = new Date('2026-11-11T00:00:00+09:00');
  assert.equal(dailyBadgeLabel(seed, before), '오늘의 항로');
  assert.equal(dailyBadgeLabel(seed, after), '어제의 항로');
  assert.equal(bestTitle(seed, before), '오늘 최고');
  assert.equal(bestTitle(seed, after), '어제 최고');
  assert.equal(dailyBadgeLabel(older, before), '어제의 항로');
  assert.equal(dailyBadgeLabel(older, after), '일일 항로');
  assert.equal(bestTitle(older, before), '어제 최고');
  assert.equal(bestTitle(older, after), '2026-11-09 최고');
  const best = { mistakes: 0, ms: 30200, steps: 7 };
  assert.equal(formatBestLine(best, seed, before), '오늘 최고 실수 0 · 30.2초');
  assert.equal(formatBestLine(best, seed, after), '어제 최고 실수 0 · 30.2초');
  assert.equal(formatBestLine(best, older, after), '2026-11-09 최고 실수 0 · 30.2초');
  assert.equal(previousDailySeed(before), 'daily-2026-11-09');
  assert.equal(previousDailySeed(after), 'daily-2026-11-10');
  assert.equal(dailySeed(after), 'daily-2026-11-11');
});
