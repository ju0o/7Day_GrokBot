// Pure keyboard decision logic (no DOM). Returns an action name or null.
// Convention: Enter/Space on a focused button is left to the browser's native activation
// (no double handling). Global shortcuts only fire when no interactive control would consume the key.
export const ARROWS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
/**
 * @param {{key:string, ctrl?:boolean, meta?:boolean, alt?:boolean, repeat?:boolean}} ev
 * @param {'preview'|'recall'|'done'} phase
 * @param {'none'|'button'|'cell'|'summary'|'text'} target  kind of focused element
 */
export function keyAction(ev, phase, target = 'none') {
  if (ev.ctrl || ev.meta || ev.alt || target === 'text') return null;
  const k = ev.key;
  if (ARROWS[k]) return phase === 'recall' && target !== 'summary' ? 'move:' + ARROWS[k] : null;
  if (k === 'Backspace') return phase === 'recall' ? 'undo' : null;
  if (k === 'Enter') {
    if (target !== 'none' || ev.repeat) return null; // native button activation only
    return phase === 'preview' ? 'hide' : phase === 'done' ? 'replay' : null;
  }
  if ((k === 'r' || k === 'R') && !ev.repeat && target !== 'summary') return 'fresh';
  return null;
}
