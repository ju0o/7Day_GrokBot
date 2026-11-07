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
