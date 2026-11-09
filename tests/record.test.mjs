import test from 'node:test';
import assert from 'node:assert/strict';
import { compareResults, formatResultLine, bestUpdate, isDailySeed } from '../public/engine.mjs';
import { loadBest, saveBest } from '../public/store.mjs';
test('compareResults: mistakes then time', () => {
  assert.equal(compareResults({ mistakes: 0, ms: 5000 }, { mistakes: 1, ms: 100 }), -1);
  assert.equal(compareResults({ mistakes: 0, ms: 3000 }, { mistakes: 0, ms: 2000 }), 1);
  assert.equal(compareResults({ mistakes: 0, ms: 2000 }, { mistakes: 0, ms: 2000 }), 0);
});
test('bestUpdate only for scored daily seeds', () => {
  const cur = { mistakes: 0, ms: 2000, steps: 7, scored: true };
  assert.equal(bestUpdate('day1-check', null, cur).store, false);
  assert.equal(bestUpdate('daily-2026-11-09', null, { ...cur, scored: false }).store, false);
  const first = bestUpdate('daily-2026-11-09', null, cur);
  assert.equal(first.store, true); assert.equal(first.isNewBest, true);
  const worse = bestUpdate('daily-2026-11-09', first.best, { mistakes: 1, ms: 1000, steps: 7, scored: true });
  assert.equal(worse.store, false); assert.equal(worse.isNewBest, false);
  const better = bestUpdate('daily-2026-11-09', first.best, { mistakes: 0, ms: 1000, steps: 7, scored: true });
  assert.equal(better.store, true); assert.equal(better.isNewBest, true);
  const tie = bestUpdate('daily-2026-11-09', first.best, cur);
  assert.equal(tie.store, false); assert.equal(tie.isNewBest, true);
});
test('formatResultLine distinguishes practice and today-best', () => {
  assert.equal(formatResultLine({ seed: 'daily-2026-11-09', steps: 7, mistakes: 0, ms: 2100, scored: true, best: true }),
    '잔상 항로 · daily-2026-11-09 · 7칸 · 2.1초 · 실수 0회 · 기록 · 오늘 최고');
  assert.match(formatResultLine({ seed: 'x', steps: 7, mistakes: 1, ms: 500, scored: false, best: false }), /연습/);
});
test('store load/save with memory storage', () => {
  const mem = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); } };
  assert.equal(loadBest('daily-2026-11-09', mem), null);
  saveBest('daily-2026-11-09', { mistakes: 0, ms: 1500, steps: 7 }, mem);
  assert.deepEqual(loadBest('daily-2026-11-09', mem), { mistakes: 0, ms: 1500, steps: 7 });
  assert.equal(loadBest('daily-2026-11-09', { getItem() { throw new Error('x'); } }), null);
  assert.equal(loadBest('daily-2026-11-09', { getItem: () => 'not-json' }), null);
});
import { formatBestLine, seedHash, seedShareUrl } from '../public/engine.mjs';
test('formatBestLine and seedShareUrl', () => {
  assert.equal(formatBestLine(null), null);
  assert.equal(formatBestLine({ mistakes: 0, ms: 5900, steps: 7 }), '오늘 최고 실수 0 · 5.9초');
  assert.equal(formatBestLine({ mistakes: 1, ms: 100, steps: 7 }), '오늘 최고 실수 1 · 0.1초');
  assert.equal(seedHash('daily-2026-11-09'), '#seed=daily-2026-11-09');
  assert.equal(seedHash('bad seed'), null);
  assert.equal(seedShareUrl('day1-check', 'https://ju0o.github.io/7Day_GrokBot/public'), 'https://ju0o.github.io/7Day_GrokBot/public/#seed=day1-check');
  assert.equal(seedShareUrl('day1-check', 'https://ju0o.github.io/7Day_GrokBot/public/'), 'https://ju0o.github.io/7Day_GrokBot/public/#seed=day1-check');
  assert.equal(seedShareUrl('day1-check'), '#seed=day1-check');
});
