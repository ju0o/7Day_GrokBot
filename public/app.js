import * as E from './engine.mjs';
const $ = (id) => document.getElementById(id);
const board = $('board');
let state;
const cells = [];
for (let i = 0; i < 25; i++) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'cell'; b.setAttribute('role', 'gridcell');
  b.addEventListener('click', () => act(E.select(state, i, performance.now())));
  board.append(b); cells.push(b);
}
function seedFromHash() { const m = location.hash.match(/seed=([A-Za-z0-9_-]{1,32})/); return m ? m[1] : null; }
function start(seed) {
  state = E.newGame(seed); history.replaceState(null, '', '#seed=' + encodeURIComponent(state.seed)); render();
}
function act(next) {
  const prev = state; state = next;
  if (next.last === 'wrong' || next.last === 'not-adjacent') { board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake'); }
  render(prev);
}
const label = (i) => { const [r, c] = E.rc(i); return `${r + 1}행 ${c + 1}열`; };
const msgs = {
  ready: ['항로를 외우세요. 준비되면 숨기기를 누르세요.', ''],
  recall: ['항로가 사라졌어요. ◎ 출발점에서 이어 가세요.', ''],
  step: ['좋아요, 계속 이어 가세요.', ''],
  undo: ['한 칸 되돌렸어요.', ''],
  wrong: ['그 칸은 항로가 아니에요.', 'bad'],
  'not-adjacent': ['현재 위치와 이웃한 칸만 이동할 수 있어요.', 'bad'],
  revealed: ['항로를 다시 보여 드려요. 이번 판은 연습 기록으로 남아요.', ''],
  ignored: [null, ''],
};
function render() {
  const v = E.view(state);
  const walked = new Set(v.path); const route = v.route ? new Set(v.route) : null;
  const head = v.path.at(-1);
  cells.forEach((b, i) => {
    b.className = 'cell';
    let sym = '', desc = label(i);
    if (i === v.start) { b.classList.add('start'); sym = '◎'; desc += ', 출발점'; }
    if (i === v.goal) { b.classList.add('goal'); sym = '★'; desc += ', 도착점'; }
    if (route && route.has(i)) { b.classList.add('route'); if (v.phase === 'preview') desc += `, 항로 ${v.route.indexOf(i) + 1}번째`; }
    if (v.phase !== 'preview' && walked.has(i)) { b.classList.add('walked'); desc += ', 지나온 칸'; }
    if (v.phase === 'recall' && i === head) { b.classList.add('head'); desc += ', 현재 위치'; }
    b.textContent = sym;
    if (v.phase === 'preview' && route && route.has(i) && !sym) { const n = document.createElement('span'); n.className = 'n'; n.textContent = v.route.indexOf(i) + 1; b.append(n); }
    b.setAttribute('aria-label', desc);
    b.disabled = v.phase !== 'recall';
  });
  $('seed').textContent = state.seed;
  $('progress').textContent = `진행 ${v.path.length - 1}/${v.total - 1}칸`;
  $('mistakes').textContent = `실수 ${v.mistakes}${v.revealed ? ' · 연습' : ''}`;
  const st = $('status');
  if (v.phase === 'done') {
    const r = E.result(state);
    st.textContent = `도착! ${r.steps}칸 · ${(r.ms / 1000).toFixed(1)}초 · 실수 ${r.mistakes}회${r.scored ? '' : ' (다시 보기 사용 · 연습 기록)'}`;
    st.className = 'status ok';
  } else {
    const [m, cls] = msgs[v.last] || msgs.ready; if (m) { st.textContent = m; st.className = 'status ' + cls; }
  }
  $('primary').hidden = v.phase !== 'preview';
  $('undo').hidden = $('reveal').hidden = v.phase !== 'recall';
  $('undo').disabled = v.path.length < 2;
}
$('primary').onclick = () => { act(E.startRecall(state, performance.now())); cells[E.view(state).path.at(-1)].focus(); };
$('undo').onclick = () => act(E.undo(state));
$('reveal').onclick = () => act(E.reveal(state));
$('replay').onclick = () => start(state.seed);
$('fresh').onclick = () => start(E.randomSeed());
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'SUMMARY') return;
  const dir = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
  if (dir && state.phase === 'recall') { e.preventDefault(); act(E.move(state, dir, performance.now())); const h = E.view(state).path.at(-1); if (state.phase === 'recall') cells[h].focus(); }
  else if (e.key === 'Backspace' && state.phase === 'recall') { e.preventDefault(); act(E.undo(state)); }
  else if (e.key === 'Enter' && state.phase === 'preview' && e.target === document.body) { $('primary').click(); }
  else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) { start(E.randomSeed()); }
});
window.addEventListener('hashchange', () => { const s = seedFromHash(); if (s && s !== state.seed) start(s); });
start(seedFromHash() || E.randomSeed());
