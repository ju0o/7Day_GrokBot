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
