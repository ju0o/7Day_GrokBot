import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../public/engine.mjs';
import { loadBest, saveBest } from '../public/store.mjs';
test('compareResults: mistakes then time', () => {
  assert.equal(E.compareResults({ mistakes: 0, ms: 5000 }, { mistakes: 1, ms: 100 }), -1);
  assert.equal(E.compareResults({ mistakes: 0, ms: 3000 }, { mistakes: 0, ms: 2000 }), 1);
  assert.equal(E.compareResults({ mistakes: 0, ms: 2000 }, { mistakes: 0, ms: 2000 }), 0);
});
test('bestUpdate only for scored daily seeds', () => {
  const cur = { mistakes: 0, ms: 2000, steps: 7, scored: true };
  assert.equal(E.bestUpdate('day1-check', null, cur).store, false);
  assert.equal(E.bestUpdate('daily-2026-11-09', null, { ...cur, scored: false }).store, false);
  const first = E.bestUpdate('daily-2026-11-09', null, cur);
  assert.equal(first.store, true); assert.equal(first.isNewBest, true);
  const worse = E.bestUpdate('daily-2026-11-09', first.best, { mistakes: 1, ms: 1000, steps: 7, scored: true });
  assert.equal(worse.store, false); assert.equal(worse.isNewBest, false);
  const better = E.bestUpdate('daily-2026-11-09', first.best, { mistakes: 0, ms: 1000, steps: 7, scored: true });
  assert.equal(better.store, true); assert.equal(better.isNewBest, true);
  const tie = E.bestUpdate('daily-2026-11-09', first.best, cur);
  assert.equal(tie.store, false); assert.equal(tie.isNewBest, true);
});
test('formatResultLine distinguishes practice and today-best', () => {
  const nov10 = new Date('2026-11-10T15:00:00+09:00');
  assert.equal(E.formatResultLine({ seed: 'daily-2026-11-10', steps: 7, mistakes: 0, ms: 2100, scored: true, best: true }, nov10),
    '잔상 항로 · daily-2026-11-10 · 7칸 · 2.1초 · 실수 0회 · 기록 · 오늘 최고');
  assert.equal(E.formatResultLine({ seed: 'daily-2026-11-09', steps: 7, mistakes: 0, ms: 2100, scored: true, best: true }, nov10),
    '잔상 항로 · daily-2026-11-09 · 7칸 · 2.1초 · 실수 0회 · 기록 · 어제 최고');
  assert.match(E.formatResultLine({ seed: 'x', steps: 7, mistakes: 1, ms: 500, scored: false, best: false }), /연습/);
});
test('store load/save with memory storage', () => {
  const mem = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
  assert.equal(loadBest('daily-2026-11-09', mem), null);
  saveBest('daily-2026-11-09', { mistakes: 0, ms: 1500, steps: 7 }, mem);
  assert.deepEqual(loadBest('daily-2026-11-09', mem), { mistakes: 0, ms: 1500, steps: 7 });
  assert.equal(loadBest('daily-2026-11-09', { getItem() { throw new Error('x'); } }), null);
  assert.equal(loadBest('daily-2026-11-09', { getItem: () => 'not-json' }), null);
});
test('formatBestLine and seedShareUrl', () => {
  assert.equal(E.formatBestLine(null), null);
  const nov10 = new Date('2026-11-10T15:00:00+09:00');
  assert.equal(E.formatBestLine({ mistakes: 0, ms: 5900, steps: 7 }, 'daily-2026-11-10', nov10), '오늘 최고 실수 0 · 5.9초');
  assert.equal(E.formatBestLine({ mistakes: 1, ms: 100, steps: 7 }, 'daily-2026-11-10', nov10), '오늘 최고 실수 1 · 0.1초');
  assert.equal(E.formatBestLine({ mistakes: 0, ms: 30200, steps: 7 }, 'daily-2026-11-09', nov10), '어제 최고 실수 0 · 30.2초');
  assert.equal(E.formatBestLine({ mistakes: 0, ms: 30200, steps: 7 }, 'daily-2026-11-08', nov10), '2026-11-08 최고 실수 0 · 30.2초');
  assert.doesNotMatch(E.formatBestLine({ mistakes: 0, ms: 30200, steps: 7 }, 'daily-2026-11-09', nov10), /오늘 최고/);
  assert.equal(E.seedHash('daily-2026-11-09'), '#seed=daily-2026-11-09');
  assert.equal(E.seedHash('bad seed'), null);
  assert.equal(E.seedShareUrl('day1-check', 'https://ju0o.github.io/7Day_GrokBot/public'), 'https://ju0o.github.io/7Day_GrokBot/public/#seed=day1-check');
  assert.equal(E.seedShareUrl('day1-check', 'https://ju0o.github.io/7Day_GrokBot/public/'), 'https://ju0o.github.io/7Day_GrokBot/public/#seed=day1-check');
  assert.equal(E.seedShareUrl('day1-check'), '#seed=day1-check');
});
test('practice and reveal sticky: second hide stays unscored', () => {
  let s = E.startRecall(E.newGame('daily-2026-11-09'), 1000);
  s = E.reveal(s);
  assert.equal(s.revealed, true);
  s = E.startRecall(s, 2000);
  assert.equal(s.revealed, true);
  for (let k = 1; k < s.route.length; k++) s = E.select(s, s.route[k], 2000 + k);
  const r = E.result(s);
  assert.equal(r.scored, false);
  assert.equal(E.bestUpdate('daily-2026-11-09', { mistakes: 0, ms: 5900, steps: 7 }, r).store, false);
});
test('implausible fast scored time does not overwrite a real best', () => {
  const prev = { mistakes: 0, ms: 5900, steps: 7 };
  const fast = { mistakes: 0, ms: 0, steps: 7, scored: true };
  const u = E.bestUpdate('daily-2026-11-09', prev, fast);
  assert.equal(u.store, false);
  assert.equal(u.rejected, 'too-fast');
  assert.deepEqual(u.best, prev);
  assert.equal(E.formatBestLine({ mistakes: 0, ms: 0, steps: 7 }), null);
  assert.equal(E.formatBestLine(prev, 'daily-2026-11-10', new Date('2026-11-10T12:00:00+09:00')), '오늘 최고 실수 0 · 5.9초');
  // old behavior: compareResults alone would prefer 0ms — must not store via bestUpdate
  assert.equal(E.compareResults(fast, prev), -1);
});
test('loadBest drops and removes implausible 0ms records', () => {
  const mem = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
  mem.setItem('afterimage-best:daily-2026-11-09', JSON.stringify({ mistakes: 0, ms: 0, steps: 7 }));
  assert.equal(loadBest('daily-2026-11-09', mem), null);
  assert.equal(mem.getItem('afterimage-best:daily-2026-11-09'), null);
  saveBest('daily-2026-11-09', { mistakes: 0, ms: 0, steps: 7 }, mem);
  assert.equal(mem.getItem('afterimage-best:daily-2026-11-09'), null);
  saveBest('daily-2026-11-09', { mistakes: 0, ms: 5900, steps: 7 }, mem);
  assert.deepEqual(loadBest('daily-2026-11-09', mem), { mistakes: 0, ms: 5900, steps: 7 });
});
test('completionStatusExtra explains too-fast daily runs', () => {
  const scored = { steps: 7, mistakes: 0, ms: 0, scored: true };
  const u = E.bestUpdate('daily-2026-11-09', { mistakes: 0, ms: 30200, steps: 7 }, scored);
  assert.equal(u.rejected, 'too-fast');
  const nov10 = new Date('2026-11-10T15:00:00+09:00');
  assert.equal(E.completionStatusExtra('daily-2026-11-10', scored, u, nov10), ' · 0.1초 미만이라 오늘 최고에 넣지 않았어요');
  assert.equal(E.completionStatusExtra('daily-2026-11-09', scored, u, nov10), ' · 0.1초 미만이라 어제 최고에 넣지 않았어요');
  assert.equal(E.completionStatusExtra('daily-2026-11-09', { ...scored, ms: 30200, scored: true }, { isNewBest: true }, nov10), ' · 어제 최고');
  assert.equal(E.completionStatusExtra('daily-2026-11-10', { ...scored, ms: 30200, scored: true }, { isNewBest: true }, nov10), ' · 오늘 최고');
  assert.equal(E.completionStatusExtra('x', { ...scored, scored: false }, null), ' (다시 보기 사용 · 연습 기록)');
  assert.equal(E.completionStatusExtra('day1-check', scored, { rejected: 'too-fast' }), '');
});
