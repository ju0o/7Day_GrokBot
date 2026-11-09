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

/** Status line for a game view.last code. Uses live mistake count (not a hardcoded 1). */
export function statusMessage(last, mistakes = 0) {
  switch (last) {
    case 'ready': return '◎에서 ★까지 번호 순서로 이어진 항로를 외우세요. 준비되면 숨기기를 누르세요.';
    case 'recall': return '◎에서 시작해 상하좌우로 한 칸씩 이어 가세요. 방향키도 돼요.';
    case 'step': return '좋아요, 계속 이어 가세요.';
    case 'undo': return '한 칸 되돌렸어요.';
    case 'wrong': return `그 칸은 항로가 아니에요. 실수 ${mistakes}회, 위치는 그대로예요.`;
    case 'not-adjacent': return '현재 위치와 이웃한 칸만 이동할 수 있어요.';
    case 'revealed': return '항로를 다시 보여 드려요. 이번 판은 연습 기록으로 남아요.';
    default: return null;
  }
}
export function statusClass(last) {
  return last === 'wrong' || last === 'not-adjacent' ? 'bad' : '';
}
