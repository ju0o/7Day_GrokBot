import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSeedHash, randomSeed, newGame } from '../public/engine.mjs';
test('valid share hashes parse exactly', () => {
  assert.equal(parseSeedHash('#seed=day1-check'), 'day1-check');
  assert.equal(parseSeedHash('#seed=A_z-9'), 'A_z-9');
  assert.equal(parseSeedHash('#seed=' + 'a'.repeat(32)), 'a'.repeat(32));
});
test('malformed, empty, partial or hostile hashes are rejected (no silent prefix)', () => {
  for (const h of ['', '#', '#seed=', '#seed=%20', '#seed=abc<script>', '#seed=abc&x=1', '#xseed=abc', '#seed=abc def',
    '#seed=' + 'a'.repeat(33), '#seed=한글', 'seed=abc', '#SEED=abc', '#seed=abc\n', null, undefined, 42, {}]) {
    assert.equal(parseSeedHash(h), null, JSON.stringify(h));
  }
});
test('random seeds always round-trip through the share hash', () => {
  let x = 0; const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 1000; i++) { const s = randomSeed(r); assert.equal(parseSeedHash('#seed=' + encodeURIComponent(s)), s); }
  assert.equal(parseSeedHash('#seed=' + randomSeed(() => 0)), '000000');
  assert.equal(parseSeedHash('#seed=' + randomSeed(() => 0.999999999)).length, 6);
});
test('same parsed seed reproduces the same route', () => {
  assert.deepEqual(newGame(parseSeedHash('#seed=day1-check')).route, newGame('day1-check').route);
});
