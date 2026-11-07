import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../public/engine.mjs';
const recall = (seed) => E.startRecall(E.newGame(seed), 1000);
test('route is deterministic, adjacent, unique, in bounds', () => {
  for (let i = 0; i < 2000; i++) {
    const r = E.generateRoute('s' + i);
    assert.deepEqual(r, E.generateRoute('s' + i));
    assert.equal(r.length, E.DEFAULT_LENGTH);
    assert.equal(new Set(r).size, r.length);
    r.forEach((c, k) => { assert.ok(c >= 0 && c < 25); if (k) assert.ok(E.adjacent(r[k - 1], c)); });
    assert.notEqual(r[0], r.at(-1));
  }
});
test('different seeds usually give different routes', () => {
  const set = new Set(Array.from({ length: 200 }, (_, i) => E.generateRoute('x' + i).join(',')));
  assert.ok(set.size > 150);
});
test('hostile seeds and lengths stay bounded', () => {
  for (const s of [undefined, null, '', '💥'.repeat(5000), {}, 'a\0b', -1, NaN]) assert.equal(E.generateRoute(s).length, 8);
  assert.equal(E.generateRoute('a', 999).length, 12);
  assert.equal(E.generateRoute('a', 1).length, 3);
  assert.equal(E.generateRoute('a', 'x').length, 8);
});
test('preview ignores selection; recall hides route in view', () => {
  const g = E.newGame('p');
  assert.equal(E.select(g, g.route[1]).last, 'ignored');
  assert.deepEqual(E.view(g).route, g.route);
  const r = E.startRecall(g, 5);
  assert.equal(E.view(r).route, null);
  assert.equal(r.startedAt, 5);
  assert.equal(E.startRecall(r).last, 'ignored');
});
test('non-adjacent, wrong, invalid input', () => {
  let s = recall('q');
  const far = [...Array(25).keys()].find((c) => !E.adjacent(s.route[0], c) && c !== s.route[0]);
  assert.equal(E.select(s, far).last, 'not-adjacent');
  const wrong = [...Array(25).keys()].find((c) => E.adjacent(s.route[0], c) && c !== s.route[1]);
  if (wrong !== undefined) { const w = E.select(s, wrong); assert.equal(w.last, 'wrong'); assert.equal(w.mistakes, 1); assert.equal(w.path.length, 1); }
  for (const bad of [-1, 25, 1.5, '3', null]) assert.equal(E.select(s, bad).last, 'ignored');
});
test('complete route, undo, result timing', () => {
  let s = recall('c');
  s = E.select(s, s.route[1]); s = E.select(s, s.route[2]);
  assert.equal(E.select(s, s.route[1]).path.length, 2); // tap previous = undo
  assert.equal(E.undo(s).path.length, 2);
  for (let k = 3; k < s.route.length; k++) s = E.select(s, s.route[k], 4000);
  assert.equal(s.phase, 'done'); assert.equal(s.last, 'complete');
  assert.deepEqual(E.result(s), { steps: 7, mistakes: 0, ms: 3000, scored: true });
  assert.equal(E.select(s, 0).last, 'ignored');
});
test('keyboard move maps to directions and edges', () => {
  let s = recall('k');
  for (let k = 1; k < s.route.length; k++) {
    const [r0, c0] = E.rc(s.route[k - 1]), [r1, c1] = E.rc(s.route[k]);
    const dir = r1 < r0 ? 'up' : r1 > r0 ? 'down' : c1 < c0 ? 'left' : 'right';
    s = E.move(s, dir);
  }
  assert.equal(s.phase, 'done');
  assert.equal(E.move(recall('k'), 'diag').last, 'ignored');
});
test('reveal resets progress and disqualifies score', () => {
  let s = recall('r'); s = E.select(s, s.route[1]);
  s = E.reveal(s);
  assert.equal(s.phase, 'preview'); assert.equal(s.path.length, 1); assert.equal(s.revealed, true);
  s = E.startRecall(s, 0);
  for (let k = 1; k < s.route.length; k++) s = E.select(s, s.route[k], 10);
  assert.equal(E.result(s).scored, false);
  assert.equal(E.result(E.newGame('z')), null);
});
test('state objects are immutable', () => { assert.ok(Object.isFrozen(E.newGame('f'))); });
