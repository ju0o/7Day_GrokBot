# 개발일지

## DAY 1 · 회차 1/5 (누적 1/35) — 2026-11-08 05:10~ KST
**결정:** 빈 저장소 확인 후 ‘잔상 항로’ 선정(후보 비교는 PRD). 첫 회차는 기능 확장보다 실제 플레이 가능한 루프와 결정적 엔진 테스트에 집중.

**실제 구현**
- `public/engine.mjs`: FNV 해시+mulberry32 시드 PRNG, 길이 8(3~12로 제한) 자기교차 없는 직교 항로, 시도 500회 상한, 불변 상태 전이(startRecall/select/move/undo/reveal/result/view).
- `public/app.js`·`index.html`·`style.css`: 25개 버튼 격자, aria-label·aria-live 상태, 방향키·Backspace·Enter·R, 360px 대응, reduced-motion, 다크 잉크/청록/호박색.
- `scripts/server.mjs`: 127.0.0.1:4278, GET/HEAD만, 경로 이탈 403, 잘못된 인코딩 400.
- 테스트: `tests/engine.test.mjs`(9개), `tests/server.test.mjs`(3개).

**테스트 (실측)**
- `npm test` → tests 12, pass 12, fail 0 (Node v24.22.1)
- `npm run check` → 통과
- `npm start` 후 `curl http://127.0.0.1:4278/` → 200

**예상 밖/실패:** 처음 엔진을 `src/`와 `public/`에 복제했다가 중복 원본 위험 때문에 `public/engine.mjs` 단일 원본으로 정리. 그 외 테스트 실패 없음.

**미완료:** 실제 브라우저 화면 확인·스크린샷 없음, 공개 배포 없음, Notion 페이지 미작성.

**커밋:** 구현 `c18a5516e4223c5885ad5b57be80dad87da38aed` (이 SHA 기록은 후속 문서 커밋)

**다음 우선순위:** 실제 브라우저(모바일 폭 포함) 검증 → 발견된 UX 문제 수정 → 난이도 감각 조정.

### DAY 1 · 회차 1 추가 기록 (같은 회차, 신규 실행 아님) — 05:14~05:16 KST
- 이전 문서 커밋: `efc16a32d492ae303267457f6812ddb1eca97269` (구현 `c18a5516e4223c5885ad5b57be80dad87da38aed`)
- Notion: [ONE WORD LAB | GROK BOT | 잔상 항로](https://app.notion.com/p/411000b759dc81959f77fccd727a45ae)
- **브라우저 QA 실패:** `http://127.0.0.1:4278/#seed=day1-check` → ERR_CONNECTION_REFUSED, 재시도 `http://localhost:4278/#seed=day1-check` → 동일. 게임 UI·키보드·모바일·스크린리더 상호작용은 하나도 확인되지 않았고, 게임 화면 스크린샷 없음.
- 같은 시각 셸 진단: 박스 점검 11개 모두 PASS, `ss`에서 PID 13691이 127.0.0.1:4278 LISTEN, `curl` 200. **브라우저 실패와 셸 성공의 차이는 원인 미확인**(추측하지 않음, 환경 복구 주장 없음).
- 실패 증거(제품 화면 아님): [127.0.0.1 연결 거부](evidence/day1-run1/browser-connection-refused-127.0.0.1.webp), [localhost 재시도 연결 거부](evidence/day1-run1/browser-connection-refused-localhost-retry.webp)
- 테스트: `npm test` 12/12 통과, `npm run check` 통과 (게임 코드 변경 없음)
- **다음 우선순위:** 기능 추가 전에 브라우저에서 접근 가능한 검증 경로 확보 → 실제 화면 QA.

## DAY 1 · 회차 2/5 (누적 2/35) — 2026-11-08 05:20 KST~
**결정:** 로컬 브라우저 접속이 연결 거부(원인 미확인)라 신규 기능 대신 무료 공개 미리보기로 브라우저 검증 경로 확보.

**구현:** 루트 `index.html`(→ `public/`로 이동, `#seed=` 유지, 외부 리소스 없음), `.nojekyll`, `tests/entry.test.mjs`(2개). 게임 코드 변경 없음. 커밋 `d2a33785f9e06d012b1d247ce94d70ca632214c3`.

**테스트(실측):** `npm test` 14/14 통과, `npm run check` 통과.

**배포:** `POST /repos/ju0o/7Day_GrokBot/pages` (source main `/`, build_type legacy) → 성공. 빌드 `built` (커밋 d2a3378, 2026-11-08 05:21:50 KST 생성). 저장소에 워크플로 파일은 추가하지 않았지만 Pages 빌드는 GitHub 플랫폼이 수행함. HTTP: `/`, `public/`, `public/engine.mjs`, `public/app.js` 모두 200 (curl).
- 미리보기: https://ju0o.github.io/7Day_GrokBot/ (QA용 `https://ju0o.github.io/7Day_GrokBot/#seed=day1-check`)

**예상 밖:** 첫 문서 커밋(507c7f9)에서 sed 구분자 오류로 README·DEVLOG 갱신이 빠짐 → 후속 커밋으로 보완.

**미완료:** 실제 브라우저 게임 QA·스크린샷 아직 없음. 로컬 연결 거부 원인 미확인(해결 주장 없음).

**다음 우선순위:** 공개 주소에서 실제 브라우저 QA(플레이·키보드·360px) → 발견 문제 수정.

### DAY 1 · 회차 2 추가 기록 (같은 회차, 신규 실행 아님) — 브라우저 QA 결과 (05:24~05:28 KST)
배포 구현 `d2a33785f9e06d012b1d247ce94d70ca632214c3`, 이전 문서 `b7d8d8b970817d5309356058dd7df7d008aad41b`. 공개 주소 `https://ju0o.github.io/7Day_GrokBot/public/#seed=day1-check`에서 실제 Chrome으로 확인.

**확인됨 (실측)**
- 마우스 완주: 7/7칸, 48.1초, 실수 1회. 항로(위→아래 행, 왼→오 열): R4C3(◎)→R4C2→R4C1→R5C1→R5C2→R5C3→R5C4→R4C4(★).
- 이웃 아닌 R1C1 클릭 → 진행 없음, 이웃 안내 문구. 이웃이지만 틀린 R3C3 → 실수 1, 진행 0/7 유지.
- 같은 항로 다시 → 같은 미리보기. 다시 보기 → ‘연습’ 표시와 안내 문구. 새로고침 후 day1-check 같은 항로.
- 키보드: ← 진행, Backspace 되돌리기, R → 새 시드 `2ttwta`(새로고침 없이). 포커스된 숨기기 버튼에서 Return 동작.
- Chrome 기기 툴바 360px 에뮬레이션: 격자·버튼 표시, 줄바꿈 정상, 눈에 띄는 넘침 없음.

**미확인/제한**
- 별도 Enter 키 동작은 화면 변화가 없었음 → 모든 Enter 조건 통과로 주장하지 않음.
- 360px는 에뮬레이션일 뿐 실제 모바일·터치 기기 아님. 다른 브라우저 엔진 미확인. 스크린리더 미테스트.
- 로컬 127.0.0.1 연결 거부 원인은 여전히 미확인. 공개 주소는 검증 경로를 확보한 것이지 로컬 문제 해결이 아님.

**스크린샷:** [미리보기](evidence/day1-run2/preview.webp) · [완주](evidence/day1-run2/completed.webp) · [연습(다시 보기)](evidence/day1-run2/practice.webp)

**다음 우선순위:** 첫 사용 이해도 다듬기(안내 문구·Enter 동작 명확화)와 브라우저 조작 동작 회귀 테스트 확대. 일일 모드 등 신규 기능은 아직 보류.

## DAY 1 · 회차 3/5 (누적 3/35) — 2026-11-08 05:30 KST~
**결정:** 신규 기능 대신 첫 사용 안내와 키보드(Enter) 동작 정리. run2 보고의 "따로 누른 Enter 무변화"는 앱 버그로 입증되지 않았으므로 의도한 동작을 먼저 정의.

**분석:** 기존 핸들러는 포커스가 body일 때·미리보기에서만 Enter를 처리했고, 그 외에는 브라우저 기본 동작(포커스된 버튼 활성화)에 맡김. 복원 중 Enter는 아무 동작 없음 → "무변화"는 설계상 가능한 결과. 다만 복원 중 현재 위치 칸(포커스됨)에서 Enter를 누르면 그 칸이 클릭되어 '이웃 칸만' 경고가 뜨는 혼란이 있었음.

**의도한 동작(확정):** Enter/Space가 포커스된 버튼·칸·요약을 누르는 것은 브라우저 기본 동작에 맡겨 이중 실행 없음. 아무것도 포커스되지 않았을 때만 Enter = 미리보기 숨기기 / 완료 후 같은 항로 다시, 복원 중엔 없음. 키 반복·Ctrl/Meta/Alt는 무시.

**구현 (`3912436922e771b5a680410da294812dd1a103c0`):** `public/keys.mjs`(DOM 없는 키 판단 함수), `app.js`가 이를 사용, 엔진 `select`에서 현재 칸 재선택은 조용히 무시, 안내 문구(◎→★ 번호 순서·상하좌우·실수 시 위치 유지·연습 의미·키 규칙) 보강, `tests/keys.test.mjs` 6개 추가.

**테스트(실측):** `npm test` 20/20 통과, `npm run check` 통과. 키 테스트는 순수 함수·엔진 수준이며 실제 DOM 이벤트 테스트가 아님.

**미확인:** 공개 주소에서 실제 브라우저 확인 대기(배포 후 부모가 확인). 스크린리더·실기기 여전히 미검증.

**다음 우선순위:** 브라우저 결과 반영 → 문제 없으면 난이도/길이 감각 검토.

### DAY 1 · 회차 3 추가 기록 (같은 회차) — 공개 브라우저 QA에서 발견한 문제와 수정 (05:35 KST~)
**QA 결과(수정 전, 부모 실측):** Enter(본문)로 숨기기·◎ 포커스 PASS, 현재 칸 Enter 무변화 PASS, ←/Backspace PASS, 새 항로 버튼 Enter·r·Ctrl+r PASS, 360px 안내 줄바꿈 PASS. **실패:** (1) 키보드로 7/7 완주 후 포커스가 R5C4 칸에 남아 '같은 항로 다시'로 가지 않음, (2) 틀린 칸 문구가 '그 칸은 항로가 아니에요.'만 표시(새 문구 아님).

**원인(코드·배포 확인):** 배포된 `app.js`(Pages)에는 새 문구와 `replay` 포커스 코드가 있음(curl 확인). 두 실패 증상은 정확히 **run2 버전 app.js**의 동작과 일치(완주 시 포커스 이동 없음, 옛 문구). Pages 응답은 `cache-control: max-age=600`이고 run2 QA(05:24)에서 같은 브라우저가 `app.js`를 받아 둔 상태 → 옛 `app.js`와 새 `engine.mjs`가 섞여 실행된 것으로 판단(현재 칸 Enter 무변화 PASS는 새 엔진 쪽 동작). 브라우저 캐시 내부를 직접 확인한 것은 아니므로 **가장 유력한 원인**으로 기록.

**수정 (`7dace57cf2034cb7691798d2c4b33b43190bf6c4`):** `index.html`의 CSS·JS와 `app.js`의 모듈 import에 같은 버전 쿼리(`?v=20261108r3b`)를 붙여 배포마다 새 파일을 받도록 함. 완주 후 포커스 결정을 `keys.mjs`의 `focusAfterMove`로 분리. 테스트 2개 추가(버전 일관성 정적 검사, 포커스 결정 함수). 실제 DOM 포커스 테스트는 아님.

**테스트(실측):** 첫 실행에서 기존 테스트가 `src="app.js"` 고정 문자열을 기대해 1개 실패 → 버전 쿼리 허용으로 수정 후 `npm test` 22/22 통과, `npm run check` 통과.

**증거(수정 전 화면, 수정 증명 아님):** [완주 후 포커스가 칸에 남음](evidence/day1-run3/prefix-completed-focus-stays-on-cell.png) · [360px 안내](evidence/day1-run3/prefix-instructions-360px.webp)

**미확인:** 수정 후 브라우저 재확인 대기(부모 확인). 이번에도 첫 접속 시 캐시된 옛 `index.html`(최대 10분)이 보일 수 있음.

### DAY 1 · 회차 3 수정 후 브라우저 재확인 (같은 회차, 05:38 KST 기록)
주소: `https://ju0o.github.io/7Day_GrokBot/public/?qa=20261108r3b#seed=day1-check` (강력 새로고침 없이 별도 QA 주소로 로드). 수정 커밋 `7dace57`, 문서 `510f2d6`.

**PASS (실측, Chrome 360×985 에뮬레이션):**
- 본문 Enter → 숨기기, ◎ 포커스.
- ↑로 틀린 칸 → "그 칸은 항로가 아니에요. 실수 1회, 위치는 그대로예요." 전체 문구, 0/7, 포커스 ◎.
- ← ← ↓ → → → ↑ 로 7/7 완주 → '같은 항로 다시'에 포커스(포커스 링 + 접근성 스냅샷 active 확인).
- 바로 Enter → 같은 시드 미리보기 한 번, 0/7.
- 이전 QA에서 이미 PASS: 현재 칸 Enter 무변화, ←/Backspace, 새 항로 버튼 Enter 1회, r 1회, Ctrl+r 시드 유지, 360px 안내.

**스크린샷(수정 후):** [완주·replay 포커스](evidence/day1-run3/postfix-completed-replay-focused-360.png) · [Enter 후 같은 시드 미리보기](evidence/day1-run3/postfix-after-enter-same-seed-preview-360.png). 수정 전 실패 증거(`prefix-*`)는 그대로 보존.

**주의:** 브라우저 캐시 내용은 확인하지 않았으므로 '옛 app.js 캐시' 원인은 여전히 **가설**. 버전 표시(`?v=`)는 수동이라 배포마다 직접 바꿔야 하며, 일반 루트 주소가 즉시 갱신된다고 보장하지 않음. 360px는 에뮬레이션(실기기 아님), 스크린리더·다른 브라우저 미테스트.

**다음 우선순위(계획):** 버전 표시 갱신 절차를 문서화/점검 테스트로 고정하고, 난이도·길이 감각 검토.

## DAY 1 · 회차 4/5 (누적 4/35) — 2026-11-08 07:36 KST~
**결정:** run3의 수동 버전 표시(`?v=20261108r3b`)는 코드가 바뀌어도 값을 안 바꾸면 테스트가 통과해 다시 옛 캐시와 섞일 위험이 있음 → 내용에서 계산되는 버전과 불일치 시 실패하는 검사로 교체. 두 번째로 항로 난이도를 엔진 표본으로 점검.

**구현 (`3fbe528ba21849413548f678c22a4420eded6dde`):**
- `scripts/asset-version.mjs`: `public/`의 실행 파일 5개(index.html, app.js, engine.mjs, keys.mjs, style.css)를 sha256으로 해시. 해시 전에 모든 `?v=…`를 `?v=`로 지워 버전 값 자체가 해시에 들어가지 않음(순환 없음). `--check`는 불일치 시 exit 1, `--write`는 index.html·app.js의 토큰을 갱신.
- 현재 버전 `288c1c66b2da`로 갱신(첫 `--check`는 옛 토큰 4개를 stale로 정확히 잡아 실패 → `--write` 후 통과).
- `npm run check`에 버전 검사 포함, `npm run version:write` 추가.
- `tests/asset-version.test.mjs` 5개: 커밋된 파일 일치, 각 파일 내용 변경 시 stale 검출, 토큰만 바꿔도 해시 불변(비순환), 섞인/누락 토큰 검출, `public/` 파일 전체가 해시 대상이고 engine·keys는 import 없는 말단 모듈.
- `scripts/route-stats.mjs`: 엔진만 쓰는 결정적 통계(사람 플레이 테스트 아님).

**난이도 분석(실측, 시드 10,000개, 길이 8):** 꺾임 수 분포 1:103, 2:945, 3:2472, 4:3420, 5:2539, 6:521. 직선(0꺾임) 0, 모든 칸이 가장자리인 항로 231(2.3%). 꺾임 1~2인 쉬운 항로가 약 10.5%, 대부분 3~5꺾임. **판단:** 엔진만으로는 난이도를 바꿀 근거가 부족(사람 플레이 데이터 없음) → UI/난이도 변경 안 함.

**테스트(실측):** `npm test` 27/27 통과, `npm run check`(버전 OK 288c1c66b2da) 통과.

**한계(정직하게):** 버전 쿼리는 새로 받은 `index.html`에서만 효과. Pages는 `max-age=600`이라 이미 옛 index.html을 캐시한 브라우저는 최대 약 10분간 옛 버전을 볼 수 있음. 루트 `/index.html`(리다이렉트)은 해시 대상 밖이며 변경 없음.

**미확인:** 공개 주소 브라우저 재확인(버전 갱신 후 정상 로드) 대기. 스크린리더·실기기 미확인.

**다음 우선순위:** 브라우저로 새 버전 로드 확인 → DAY1 종합 기록(run5).

### DAY 1 · 회차 4 브라우저 확인 (같은 회차, 07:40 KST)
주소: `https://ju0o.github.io/7Day_GrokBot/public/?qa=288c1c66b2da#seed=day1-check` (Chrome, 360×985 에뮬레이션). 구현 `3fbe528`, 문서 `517b6ac`.

**PASS (실측):** 스타일 적용된 미리보기·올바른 시드 · 본문 Enter → 숨기기, R4C3(◎) 포커스 · ← ← ↓ → → → ↑ 로 7/7 완주, 실수 0 · '같은 항로 다시' 주황 포커스 링 · Enter 한 번 → 같은 시드 미리보기 · 루트 `/#seed=day1-check` → `/public/#seed=day1-check` 이동하며 같은 항로 유지.

**스크린샷:** [완주·replay 포커스](evidence/day1-run4/completed-replay-focused-360.png) · [루트 이동 후 미리보기](evidence/day1-run4/root-redirect-preview-360.png)

**주의:** 브라우저에서 실제로 불러온 CSS 버전은 확인하지 않음(화면 스타일이 정상인 것은 버전 증거가 아님). 360px는 에뮬레이션, 실기기·스크린리더·다른 브라우저 미확인. 이전 캐시 문제 원인은 여전히 가설.

**다음 우선순위:** 다섯 번째 '더'(run5)에서 DAY1 마무리 안정화와 하루 종합 기록.

## DAY 1 · 회차 5/5 (누적 5/35) — 2026-11-08 12:01 KST~
**결정:** 신규 기능 없이 안정화 점검. 상태·다시하기·연습·공유 주소·서버·버전 검사를 검토. 구체적 결함: 공유 주소 시드 파서가 앵커 없는 정규식이라 `#seed=abc<script>` → `abc`, `#xseed=abc` → `abc`처럼 **잘못된 주소의 앞부분을 조용히 받아들였고**, 33자 이상은 32자로 잘라 다른 항로를 만들었음(화면 출력은 textContent라 스크립트 실행 위험은 없었음).

**구현 (`b9cbeba80d4bb379f43ffecb52f81e0d42112c42`):** `engine.mjs`에 `parseSeedHash`(정확히 `#seed=<1~32자 A-Za-z0-9_->`만 허용, 그 외 null → 새 시드), `app.js`가 사용. `tests/seed-hash.test.mjs` 4개. 자산 버전 `288c1c66b2da` → `5072a56fa3de`.

**테스트(실측):** 코드 변경 직후 `npm test` 31개 중 1개 실패(버전 불일치 검사 — 의도대로 검출) → `npm run version:write` 후 `npm run check` 통과, `npm test` 31/31 통과. 서버·상태 전이는 기존 테스트로 재확인, 별도 결함 없음.

**미확인:** run5 변경의 공개 브라우저 확인 대기.

**하루 종합:** [DAY1_SUMMARY.md](DAY1_SUMMARY.md). 다음 회차는 2026-11-09 DAY2 run1(누적 6).

### DAY 1 · 회차 5 추가 기록 (같은 회차) — 12:08 KST 브라우저 QA와 수정
**QA(부모 실측, 버전 5072a56fa3de):** PASS — 마우스로 숨기기→다시 보기(연습)→숨기기→7/7 실수 0 완주, 연습 표시, 같은 항로 다시. `#seed=qa_run5-B` 그대로 유지, Ctrl+R 후 같은 항로(R1C1→R1C2→R2C2→R2C1→R3C1→R3C2→R4C2→R4C1). **FAIL** — 같은 탭에서 `#seed=abc<script>`(주소창엔 `abc%3Cscript%3E`)와 `#seed=`로 바꿨을 때 주소는 잘못된 값 그대로, 게임은 이전 `day1-check` 유지. 부분 `abc`로 읽히지는 않음(엄격 파서는 동작). QA 중 클릭 실수로 잠깐 새 시드 `pamc66`가 생겼다가 QA 주소로 되돌아감 — 앱 버그로 보지 않음.

**원인(소스 확인):** 앞선 보고에서 "잘못된 주소는 새 무작위 시드로 시작"이라 했지만 그건 **첫 로드** 경로(`start(seedFromHash() || randomSeed())`)만 해당. 같은 문서에서 해시만 바뀌면 `hashchange` 처리기가 `if (s && s !== state.seed)`로 잘못된 값을 **무시**해 현재 게임과 잘못된 주소가 그대로 남음. 캐시 문제가 아님. 이전 보고의 가정이 틀렸음을 기록.

**결정·수정 (`cb52be047c231e70a00363130987442f160f03f0`):** README대로 잘못된/빈 주소는 첫 로드든 해시 변경이든 **새 무작위 시드로 시작하고 주소를 `#seed=<새 시드>`로 정규화**. 순수 함수 `resolveSeed(hash, currentSeed)`(engine.mjs)로 두 경로를 통합(`syncFromHash`). 같은 시드로의 정규화 주소는 재시작하지 않아 반복 없음. 테스트 3개 추가(잘못된/빈 값 → 새 시드, 유효 시드, 정규화 주소 재해석 시 무재시작). 버전 `5072a56fa3de` → `b78c5e1d395f`.

**테스트(실측):** `npm test` 34/34 통과, `npm run check` 통과(버전 OK). 실제 브라우저 이벤트 테스트는 아님.

**증거:** [연습 완주](evidence/day1-run5/practice-completed.webp) · [유효 시드 qa_run5-B 미리보기](evidence/day1-run5/valid-seed-qa_run5-B-preview.png). 수정 후 브라우저 재확인 대기.

### DAY 1 · 회차 5 수정 후 재확인 (같은 회차, 12:12 KST)
주소 `…/public/?qa=b78c5e1d395f#seed=day1-check` (Chrome). 수정 `cb52be0`, 문서 `a3b5082`.

**PASS (실측):** 스타일 적용 미리보기 · 같은 탭 `#seed=abc%3Cscript%3E` → 주소 `#seed=05y5ry`로 정규화, 시드 05y5ry 표시 · 같은 탭 `#seed=` → `#seed=wyjmsu`, 시드 wyjmsu 표시 · `#seed=qa_run5-B` 정확한 항로(R1C1→R1C2→R2C2→R2C1→R3C1→R3C2→R4C2→R4C1), Ctrl+R 후 항로·주소 유지. 첫 QA 실패가 캐시가 아니라 hashchange 코드 결함이었음이 수정 후 동작으로 확인됨. 연습 완주 PASS는 앞선 12:08 QA 결과.

**스크린샷(수정 후):** [잘못된 해시 → 새 시드](evidence/day1-run5/postfix-malformed-hash-new-seed-05y5ry.png) · [유효 시드 새로고침 후](evidence/day1-run5/postfix-valid-seed-after-reload.png)

**미확인:** 스크린리더·실제 모바일/터치·다른 브라우저, 로컬 127.0.0.1 연결 거부 원인.

DAY 1 종료. 다음 회차: 2026-11-09 DAY2 run1(누적 6).

## DAY 2 · 회차 1/5 (누적 6/35) — 2026-11-09 21:28 KST~
**결정:** DAY1 요약의 DAY2 계획 중 1순위인 일일 항로(Asia/Seoul) vs 연습을 구현. 이미 PASS한 흐름은 재점검하지 않음. 사람 플레이 근거가 없는 난이도 변경은 보류.

**구현 (`f67f632cbfe197e35152379adbe12945f95465a1`):**
- `engine.mjs`: `seoulYmd`(Intl Asia/Seoul), `dailySeed` → `daily-YYYY-MM-DD`, `isDailySeed`. 공유 해시 문자 집합과 호환.
- UI: **오늘의 항로** 버튼, 시드 옆 배지, 조작 방법에 일일·연습 설명. 기존 `다시 보기`→연습 기록은 그대로.
- `tests/daily.test.mjs` 3개: UTC 자정 경계(KST), 형식·파싱·공유 왕복, 같은 날 동일 시드.
- 자산 버전 `b78c5e1d395f` → `fb7c1600bd50`.

**테스트(실측):** 첫 실행에서 `isDailySeed('daily-2026-13-40')` 기대값 오류(형식만 검사하는데 false를 기대) → 테스트 수정 후 `npm test` 37/37 통과, `npm run check` 통과.

**미확인:** 공개 주소 브라우저 QA(오늘의 항로 버튼·배지·시드 공유) 대기. 스크린리더·실기기 미확인.

**다음 우선순위:** 브라우저 QA 결과 반영 → (근거 생기면) 난이도·길이.

### DAY 2 · 회차 1 추가 기록 (같은 회차) — 브라우저 QA와 배지 수정 (21:33 KST~)
**QA (Chrome, `?qa=fb7c1600bd50`):** PASS — 오늘의 항로 → 시드 `daily-2026-11-09`·배지·해시, F5 동일 항로, 다시 보기 → 「실수 0 · 연습」·완주 연습 기록. **FAIL** — 배지가 비일일 시드에도 보임(`#seed=day1-check` 첫 로드, 「새 항로」 후 `83mgep`).

**원인(소스 확인):** `app.js`의 `badge.hidden = !daily`는 정상. CSS `.badge{display:inline-block}`이 UA의 `[hidden]{display:none}`보다 이겨 숨김이 무시됨. 버튼은 이미 `.btn[hidden]{display:none}`이 있었으나 배지에는 없음.

**수정 (`dc1daf2ed47125dfb6b482df72cf075e83a08612`):** `.badge[hidden]{display:none}` 추가. 회귀 테스트 2개(CSS 규칙 존재, `isDailySeed`로 배지 판단). 버전 `fb7c1600bd50` → `6ade98ed4b8b`.

**테스트:** `npm test` 39/39 통과, `npm run check` 통과. **브라우저 재확인 대기.**

### DAY 2 · 회차 1 수정 후 재확인 (같은 회차, 21:35 KST)
주소 `…/public/?qa=6ade98ed4b8b` (Chrome). 수정 `dc1daf2`, 문서 `8be4403`.

**PASS (실측):**
1. `#seed=day1-check` 첫 로드 — 헤더 「시드 day1-check | 진행 0/7칸 | 실수 0」, 배지 없음.
2. 「오늘의 항로」 — 시드 `daily-2026-11-09`, 배지 표시, 해시 `#seed=daily-2026-11-09`.
3. 「새 항로」 — 시드 `86gz2w`, 배지 숨김, 해시 갱신.

앞선 QA(`fb7c1600bd50`)에서 이미 PASS: F5 동일 항로, 다시 보기 「연습」·7/7 실수 0 완주. 재확인 중 DevTools 360px 에뮬레이션을 켠 채면 클릭이 먹통이었고, 끄고 재확인함(앱 버그로 보지 않음).

**스크린샷:** [1 배지 없음](evidence/day2-run1/postfix-day1-check-no-badge.png) · [2 일일 배지](evidence/day2-run1/postfix-daily-badge-visible.png) · [3 새 항로 배지 숨김](evidence/day2-run1/postfix-fresh-seed-badge-hidden.png)

DAY2 run1 완료. 다음: DAY2 run2(누적 7).

## DAY 2 · 회차 2/5 (누적 7/35) — 2026-11-09 21:37 KST~
**결정:** 난이도 변경은 사람 플레이 근거가 없어 보류. PLAN의 결과 공유 텍스트를 앞당겨, 일일 항로에 붙는 **로컬 최고 기록**과 **결과 복사**를 구현.

**구현 (`b212cb26e37c2fe57b8b9a1ec5489f6ee0160fb8`):**
- `engine.mjs`: `compareResults`, `formatResultLine`, `bestUpdate`(연습·비일일 시드는 저장 안 함; 실수↑시간 순 비교).
- `store.mjs`: `localStorage` 키 `afterimage-best:<seed>` 로드/저장(주입 가능, 예외 무시).
- UI: 완주 시 일일·기록 판이면 「오늘 최고」 표시·저장, **결과 복사** 버튼(클립보드 실패 시 상태란에 문구 표시).
- 자산 버전 `6ade98ed4b8b` → `17a339ffa0bf`. 해시 대상에 `store.mjs` 포함(토큰 5개).

**테스트(실측):** 토큰 개수 기대값(4→5, missing found 2→3, imports 2→3) 불일치로 2개 실패 → 수정 후 `npm test` 43/43 통과, `npm run check` 통과.

**미확인:** 공개 브라우저 QA 대기.

**다음:** QA 결과 반영. run3는 다음 더.

### DAY 2 · 회차 2 브라우저 확인 (같은 회차, 21:41 KST)
주소 `…/public/?qa=17a339ffa0bf` (Chrome). 구현 `b212cb2`, 문서 `7e9aa05`.

**PASS (실측):**
1. `daily-2026-11-09` 배지 표시.
2. 완주 `도착! 7칸 · 5.9초 · 실수 0회 · 오늘 최고`, 결과 복사 보임.
3. 복사 후 상태 `결과 문구를 복사했어요.`, 클립보드 `잔상 항로 · daily-2026-11-09 · 7칸 · 5.9초 · 실수 0회 · 기록 · 오늘 최고`.
4. 같은 항로 다시 → 다시 보기 완주 `도착! 7칸 · 0.0초 · 실수 0회 (다시 보기 사용 · 연습 기록)`, 「오늘 최고」 없음.
5. `#seed=day1-check` 완주 `도착! 7칸 · 0.0초 · 실수 0회`, 「오늘 최고」 없음.

**관찰(결함으로 확정하지 않음):** 4·5의 `0.0초`는 자동 빠른 키 입력으로 생김. 코드 확인: 타이머는 **숨기기(`startRecall`) 시점**에 `startedAt`이 잡히고, 표시는 `(ms/1000).toFixed(1)`이라 50ms 미만이면 `0.0초`. 사람 플레이에서 외운 뒤 바로 끝내면 드물게 가능하나, 이번 `0.0`은 자동화 속도로 설명됨 → **코드 변경 없음**.

**스크린샷:** [오늘 최고 완주](evidence/day2-run2/daily-best-completion.png) · [복사 상태](evidence/day2-run2/share-copy-status.png) · [비일일](evidence/day2-run2/non-daily-no-best.png)

run2 완료. 다음: DAY2 run3(누적 8).

## DAY 2 · 회차 3/5 (누적 8/35) — 2026-11-09 21:59 KST~
**결정:** PLAN의 접근성 항목을 앞당김. 이미 PASS한 플레이 흐름은 재점검하지 않고, **자동 검증 가능한** aria-live·격자 라벨·reduced-motion·포커스 규칙을 보강.

**구현 (`03cf820caf6e073c8d067bc3a0ceacb6da400a92`):**
- `a11y.mjs`: `liveStatusText`(같은 문구 재낭독용 ZWSP), `cellAriaLabel`(복원 중 항로 순서 미포함), `gridMetrics`, `focusAfterPhase`.
- HTML: status `aria-atomic="true"`, board `aria-rowcount/colcount`, `aria-describedby="status"`.
- 칸 `aria-rowindex/colindex`, 라벨을 `cellAriaLabel`로 통일. 마우스 완주 후에도 replay로 포커스. 조작 방법에 움직임 줄이기 안내.
- 버전 `17a339ffa0bf` → `5369910a32a3`.

**테스트:** `npm test` 48/48 통과, `npm run check` 통과.

**미확인:** 실제 스크린리더·실기기 브라우저 QA 대기(자동 테스트는 DOM 이벤트/스크린리더 엔진이 아님).

**다음:** QA 결과 반영. run4는 다음 더.

### DAY 2 · 회차 3 추가 기록 (같은 회차) — 브라우저 QA와 실수 횟수 문구 수정 (22:03 KST~)
**QA (Chrome, `?qa=5369910a32a3`):** PASS — 초기 상태 문구, 숨기기 후 출발점 aria-label·상태, 복원 중 칸 라벨에 항로 순서 없음(미리보기는 「항로 2번째」 정상), 마우스 완주 `도착! 7칸 · 10.5초 · 실수 2회`·`#replay` 포커스, DOM aria 속성. **FAIL** — 같은 틀린 칸(3행 3열)을 두 번 누르면 `#mistakes`는 「실수 2」인데 상태란은 두 번 모두 「실수 1회」(두 번째는 ZWSP만 붙음).

**원인:** `app.js`의 고정 문구 `msgs.wrong`이 「실수 1회」로 하드코딩됨. `liveStatusText`는 같은 문자열 재낭독만 처리하고 횟수를 갱신하지 않음.

**수정 (`93a31183daac807fc8a02b980a3b0b12e64edb06`):** `statusMessage(last, mistakes)`로 현재 횟수 반영. 회귀 테스트(1회→2회, 하드코딩 1회 금지). 버전 `5369910a32a3` → `e678c1c8373c`.

**테스트:** 50/50 통과. **스크린샷:** step2 저장 실패(ENOENT)로 미보관. [완주·replay 포커스](evidence/day2-run3/completion-focus-replay.png)만 있음.

**재확인 대기.**

### DAY 2 · 회차 3 수정 후 재확인 (같은 회차, 22:07 KST)
주소 `…/public/?qa=e678c1c8373c` (Chrome). 수정 `93a3118`, 문서 `cf5fb7e`.

**PASS (실측):** 같은 틀린 칸(3행 3열) 1회 → 상태 「실수 1회」·`#mistakes` 「실수 1」; 2회 → 「실수 2회」·「실수 2」.

**증거 메모:** 첫 QA 캡처 중 일부는 타이밍 때문에 헤더 「실수 0」으로 보인 적이 있음(잘못된 상태 스냅샷). 이후 실제 데스크톱 스크린샷은 헤더 「시드 day1-check 진행 0/7칸 실수 2」와 상태 「실수 2회」를 확인함 → [실수 2회](evidence/day2-run3/postfix-wrong-cell-mistake-2.webp).

run3 완료. 다음: DAY2 run4(누적 9).

## DAY 2 · 회차 4/5 (누적 9/35) — 2026-11-09 23:17 KST~
**결정:** run5는 안정화·DAY2 종합 예정이라 마지막 기능성 회차로 범위를 작게 유지. 난이도 변경은 사람 플레이 근거 없어 보류. 일일 항로에 **저장된 오늘 최고 표시**와 **시드 주소 복사**를 추가.

**구현 (`a54712cd32ae1d9a4bd218a608ff90fe9fa32f5e`):**
- `formatBestLine`, `seedHash`, `seedShareUrl`
- 메타 `#daily-best`(일일 시드 + 저장 기록일 때만), 버튼 **시드 주소 복사**
- 완주 후 새 최고 저장 시 메타 즉시 갱신
- 버전 `e678c1c8373c` → `50ac4e6ad2a5`

**테스트:** 51/51 통과, check 통과. (중간 커밋 메시지에 옛 버전 적었다가 soft-reset 후 올바른 버전으로 재커밋 — 아직 push 전)

**미확인:** 브라우저 QA 대기.

**다음:** run5 안정화·DAY2 종합.

### DAY 2 · 회차 4 추가 기록 (같은 회차) — 오늘 최고 0.0초 QA (23:23 KST~)
**QA PASS:** 시드 주소 복사(daily·day1-check), day1-check에서 최고 숨김, 완주 `도착! 7칸 · 6.4초 · 실수 0회`(더 나은 최고로 대체하지 않음).

**UNEXPECTED:** 로드 시 헤더 `오늘 최고 실수 0 · 0.0초`(run2의 5.9초가 아님).

**원인 조사 (소스):**
1. **연습 판이 조용히 저장된다?** → **아님(확인).** `reveal` 후 `startRecall`은 `revealed`를 유지하고 `result.scored === false`라 `bestUpdate`가 저장하지 않음. 회귀 테스트로 고정.
2. **메시지와 저장 불일치?** → **아님(확인).** 저장과 「오늘 최고」 문구 모두 `r.scored` 가드.
3. **유력(코드로 재현 가능):** `같은 항로 다시`는 `newGame`이라 `revealed`가 리셋됨. 그 뒤 **다시 보기 없이** 숨기기→초고속 완주(자동화 0ms)하면 **기록 판**으로 저장되고, `compareResults`가 같은 실수·더 짧은 시간을 우위로 둬 **5.9초를 0ms로 덮어씀**. run2 QA 직후 자동 키 입력이 이 경로였을 가능성 큼. 연습 경로 자체 버그는 아님.

**결정·수정 (`e470d8b632e41c318c25e9850608818728a73b59`):** `MIN_BEST_MS = 100`(0.1초 미만 거부). 저장·표시·`loadBest` 모두 거부; 기존 0ms 키는 로드 시 `removeItem`. 사람 플레이 0.1초+는 허용. 버전 `50ac4e6ad2a5` → `412258477c14`.

**테스트:** 54/54. **재확인 대기.**
