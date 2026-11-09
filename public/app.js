import * as E from './engine.mjs?v=e678c1c8373c';
import { keyAction, focusAfterMove } from './keys.mjs?v=e678c1c8373c';
import { loadBest, saveBest } from './store.mjs?v=e678c1c8373c';
import { liveStatusText, cellAriaLabel, focusAfterPhase, statusMessage, statusClass } from './a11y.mjs?v=e678c1c8373c';
const $ = (id) => document.getElementById(id);
const board = $('board');
let state;
let lastStatus = '';
const cells = [];
for (let i = 0; i < 25; i++) {
  const b = document.createElement('button');
  const [rr, cc] = E.rc(i);
  b.type = 'button'; b.className = 'cell'; b.setAttribute('role', 'gridcell');
  b.setAttribute('aria-rowindex', String(rr + 1));
  b.setAttribute('aria-colindex', String(cc + 1));
  b.addEventListener('click', () => { act(E.select(state, i, performance.now())); const f = focusAfterPhase(state.phase); if (f === 'head') cells[E.view(state).path.at(-1)].focus(); else if (f === 'replay') $('replay').focus(); });
  board.append(b); cells.push(b);
}
function start(seed) {
  state = E.newGame(seed); history.replaceState(null, '', '#seed=' + encodeURIComponent(state.seed)); render();
}
function act(next) {
  const prev = state; state = next;
  if (next.last === 'wrong' || next.last === 'not-adjacent') { board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake'); }
  render(prev);
}
const label = (i) => { const [r, c] = E.rc(i); return `${r + 1}행 ${c + 1}열`; };
function render() {
  const v = E.view(state);
  const walked = new Set(v.path); const route = v.route ? new Set(v.route) : null;
  const head = v.path.at(-1);
  cells.forEach((b, i) => {
    b.className = 'cell';
    let sym = '';
    if (i === v.start) { b.classList.add('start'); sym = '◎'; }
    if (i === v.goal) { b.classList.add('goal'); sym = '★'; }
    if (route && route.has(i)) b.classList.add('route');
    if (v.phase !== 'preview' && walked.has(i)) b.classList.add('walked');
    if (v.phase === 'recall' && i === head) b.classList.add('head');
    b.textContent = sym;
    if (v.phase === 'preview' && route && route.has(i) && !sym) { const n = document.createElement('span'); n.className = 'n'; n.textContent = v.route.indexOf(i) + 1; b.append(n); }
    b.setAttribute('aria-label', cellAriaLabel(i, v));
    b.disabled = v.phase !== 'recall';
  });
  $('seed').textContent = state.seed;
  const daily = E.isDailySeed(state.seed);
  const badge = $('daily-badge');
  if (badge) badge.hidden = !daily;
  $('progress').textContent = `진행 ${v.path.length - 1}/${v.total - 1}칸`;
  $('mistakes').textContent = `실수 ${v.mistakes}${v.revealed ? ' · 연습' : ''}`;
  const st = $('status');
  if (v.phase === 'done') {
    const r = E.result(state);
    let bestNote = '';
    if (r.scored && E.isDailySeed(state.seed)) {
      const prev = loadBest(state.seed);
      const u = E.bestUpdate(state.seed, prev, r);
      if (u.store) saveBest(state.seed, u.best);
      if (u.isNewBest) bestNote = ' · 오늘 최고';
    }
    const doneMsg = `도착! ${r.steps}칸 · ${(r.ms / 1000).toFixed(1)}초 · 실수 ${r.mistakes}회${r.scored ? bestNote : ' (다시 보기 사용 · 연습 기록)'}`;
    st.textContent = lastStatus = liveStatusText(lastStatus, doneMsg);
    st.className = 'status ok';
    const share = $('share');
    if (share) {
      share.hidden = false;
      share.dataset.line = E.formatResultLine({ seed: state.seed, ...r, best: !!bestNote });
    }
  } else {
    const share = $('share'); if (share) share.hidden = true;
    const m = statusMessage(v.last, v.mistakes); if (m) { st.textContent = lastStatus = liveStatusText(lastStatus, m); st.className = 'status ' + statusClass(v.last); }
  }
  $('primary').hidden = v.phase !== 'preview';
  $('undo').hidden = $('reveal').hidden = v.phase !== 'recall';
  $('undo').disabled = v.path.length < 2;
}
$('primary').onclick = () => { act(E.startRecall(state, performance.now())); const f = focusAfterPhase(state.phase); if (f === 'head') cells[E.view(state).path.at(-1)].focus(); };
$('undo').onclick = () => act(E.undo(state));
$('reveal').onclick = () => act(E.reveal(state));
$('replay').onclick = () => start(state.seed);
$('fresh').onclick = () => start(E.randomSeed());
$('daily').onclick = () => start(E.dailySeed());
$('share').onclick = async () => {
  const line = $('share').dataset.line || '';
  try { await navigator.clipboard.writeText(line); lastStatus = liveStatusText(lastStatus, '결과 문구를 복사했어요.'); $('status').textContent = lastStatus; $('status').className = 'status ok'; }
  catch { lastStatus = liveStatusText(lastStatus, line); $('status').textContent = lastStatus; $('status').className = 'status'; }
};
function targetKind(el) {
  if (!el || el === document.body) return 'none';
  if (el.classList?.contains('cell')) return 'cell';
  if (el.tagName === 'SUMMARY') return 'summary';
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return 'text';
  return 'button';
}
document.addEventListener('keydown', (e) => {
  const a = keyAction({ key: e.key, ctrl: e.ctrlKey, meta: e.metaKey, alt: e.altKey, repeat: e.repeat }, state.phase, targetKind(e.target));
  if (!a) return;
  e.preventDefault();
  if (a.startsWith('move:')) { act(E.move(state, a.slice(5), performance.now())); const f = focusAfterMove(state.phase); if (f === 'head') cells[E.view(state).path.at(-1)].focus(); else if (f === 'replay') $('replay').focus(); }
  else if (a === 'undo') act(E.undo(state));
  else if (a === 'hide') $('primary').click();
  else if (a === 'replay') start(state.seed);
  else if (a === 'fresh') start(E.randomSeed());
});
function syncFromHash() { const r = E.resolveSeed(location.hash, state ? state.seed : null); if (r.restart) start(r.seed); }
window.addEventListener('hashchange', syncFromHash);
syncFromHash();
