import test from 'node:test';
import assert from 'node:assert/strict';
import { keyAction } from '../public/keys.mjs';
import * as E from '../public/engine.mjs';
const k = (key, extra = {}) => ({ key, ...extra });
test('Enter on any focused control is left to native activation (no double fire)', () => {
  for (const t of ['button', 'cell', 'summary', 'text']) for (const p of ['preview', 'recall', 'done']) assert.equal(keyAction(k('Enter'), p, t), null, `${p}/${t}`);
  assert.equal(keyAction(k(' '), 'preview', 'button'), null);
});
test('Enter with nothing focused: hide in preview, replay when done, nothing in recall', () => {
  assert.equal(keyAction(k('Enter'), 'preview', 'none'), 'hide');
  assert.equal(keyAction(k('Enter'), 'done', 'none'), 'replay');
  assert.equal(keyAction(k('Enter'), 'recall', 'none'), null);
  assert.equal(keyAction(k('Enter', { repeat: true }), 'preview', 'none'), null);
});
test('arrows/backspace only during recall and not on summary', () => {
  assert.equal(keyAction(k('ArrowLeft'), 'recall', 'cell'), 'move:left');
  assert.equal(keyAction(k('ArrowUp'), 'recall', 'button'), 'move:up');
  assert.equal(keyAction(k('ArrowUp'), 'preview', 'none'), null);
  assert.equal(keyAction(k('ArrowDown'), 'recall', 'summary'), null);
  assert.equal(keyAction(k('Backspace'), 'recall', 'cell'), 'undo');
  assert.equal(keyAction(k('Backspace'), 'done', 'none'), null);
});
test('R fresh; modifiers/text/repeat ignored', () => {
  assert.equal(keyAction(k('r'), 'recall', 'cell'), 'fresh');
  assert.equal(keyAction(k('R'), 'done', 'button'), 'fresh');
  assert.equal(keyAction(k('r', { ctrl: true }), 'preview', 'none'), null);
  assert.equal(keyAction(k('r', { meta: true }), 'preview', 'none'), null);
  assert.equal(keyAction(k('r', { repeat: true }), 'preview', 'none'), null);
  assert.equal(keyAction(k('r'), 'preview', 'text'), null);
  assert.equal(keyAction(k('x'), 'recall', 'none'), null);
});
test('activating the current head cell (native Enter on focused cell) is a silent no-op', () => {
  let s = E.startRecall(E.newGame('head'));
  const same = E.select(s, s.route[0]);
  assert.equal(same.last, 'ignored'); assert.equal(same.mistakes, 0); assert.deepEqual(same.path, s.path);
  s = E.select(s, s.route[1]);
  assert.equal(E.select(s, s.route[1]).last, 'ignored');
});
test('keyboard-only full round via keyAction + engine', () => {
  let s = E.startRecall(E.newGame(keyAction(k('Enter'), 'preview', 'none') === 'hide' ? 'kb' : 'x'));
  for (let i = 1; i < s.route.length; i++) {
    const [r0, c0] = E.rc(s.route[i - 1]), [r1, c1] = E.rc(s.route[i]);
    const key = r1 < r0 ? 'ArrowUp' : r1 > r0 ? 'ArrowDown' : c1 < c0 ? 'ArrowLeft' : 'ArrowRight';
    s = E.move(s, keyAction(k(key), s.phase, 'cell').slice(5));
  }
  assert.equal(s.phase, 'done');
  assert.equal(keyAction(k('Enter'), s.phase, 'none'), 'replay');
});
