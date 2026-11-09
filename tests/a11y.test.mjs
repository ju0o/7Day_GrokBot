import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newGame, startRecall, select, view } from '../public/engine.mjs';
import { liveStatusText, cellAriaLabel, gridMetrics, focusAfterPhase } from '../public/a11y.mjs';
test('liveStatusText forces change when message repeats', () => {
  assert.equal(liveStatusText('', '항로가 아니에요'), '항로가 아니에요');
  assert.equal(liveStatusText('항로가 아니에요', '항로가 아니에요'), '항로가 아니에요\u200b');
  assert.equal(liveStatusText('a\u200b', '항로가 아니에요'), '항로가 아니에요');
});
test('cellAriaLabel never leaks route order during recall', () => {
  let s = startRecall(newGame('a11y-seed'));
  const v = view(s);
  assert.equal(v.route, null);
  for (let i = 0; i < 25; i++) {
    const lab = cellAriaLabel(i, v);
    assert.doesNotMatch(lab, /항로 \d+번째/);
    if (i === v.start) assert.match(lab, /출발점/);
    if (i === v.goal) assert.match(lab, /도착점/);
  }
  assert.match(cellAriaLabel(v.path.at(-1), v), /현재 위치/);
  // after a step, preview labels still must not appear
  s = select(s, s.route[1]);
  const v2 = view(s);
  for (let i = 0; i < 25; i++) assert.doesNotMatch(cellAriaLabel(i, v2), /항로 \d+번째/);
});
test('preview labels may include route order; grid metrics 5x5', () => {
  const v = view(newGame('a11y-seed'));
  assert.match(cellAriaLabel(v.route[2], v), /항로 3번째/);
  assert.deepEqual(gridMetrics(), { rows: 5, cols: 5, cells: 25 });
});
test('focusAfterPhase: recall→head, done→replay, reveal→primary', () => {
  assert.equal(focusAfterPhase('recall'), 'head');
  assert.equal(focusAfterPhase('done'), 'replay');
  assert.equal(focusAfterPhase('preview', 'reveal'), 'primary');
  assert.equal(focusAfterPhase('preview'), null);
});
test('HTML marks live status atomic and grid dimensions; CSS reduces motion', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(html, /id="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="status"[^>]*aria-atomic="true"/);
  assert.match(html, /role="grid"[^>]*aria-rowcount="5"/);
  assert.match(html, /aria-colcount="5"/);
  const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
});
