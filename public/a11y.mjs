// Pure accessibility helpers (no DOM).
import { rc, SIZE } from './engine.mjs';

/** Force polite live regions to re-speak when the same string is set again. */
export function liveStatusText(previous, next) {
  if (next == null || next === '') return next ?? '';
  return next === previous ? next + '\u200b' : next;
}

/**
 * Cell name for screen readers. Must not include unrevealed route order during recall.
 * @param {number} i cell index
 * @param {{phase:string,start:number,goal:number,path:number[],route:number[]|null}} v from engine.view
 */
export function cellAriaLabel(i, v) {
  const [r, c] = rc(i);
  const parts = [`${r + 1}행 ${c + 1}열`];
  if (i === v.start) parts.push('출발점');
  if (i === v.goal) parts.push('도착점');
  if (v.phase === 'preview' && v.route) {
    const n = v.route.indexOf(i);
    if (n >= 0) parts.push(`항로 ${n + 1}번째`);
  }
  if (v.phase !== 'preview' && v.path.includes(i)) parts.push('지나온 칸');
  if (v.phase === 'recall' && i === v.path.at(-1)) parts.push('현재 위치');
  if (v.phase === 'done' && v.path.includes(i)) parts.push('완주한 항로');
  return parts.join(', ');
}

export function gridMetrics() { return { rows: SIZE, cols: SIZE, cells: SIZE * SIZE }; }

/** Where to move focus after a phase change from user action (mouse or keyboard). */
export function focusAfterPhase(phase, how = 'any') {
  if (phase === 'recall') return 'head';
  if (phase === 'done') return 'replay';
  if (phase === 'preview' && how === 'reveal') return 'primary';
  return null;
}
