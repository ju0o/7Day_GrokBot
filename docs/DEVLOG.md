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
