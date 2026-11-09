# 잔상 항로 · Afterimage Route

5×5 밤 지도 위에 잠깐 떠오른 항로를 외운 뒤, 항로가 사라지면 출발점(◎)에서 도착점(★)까지 기억으로 다시 그리는 **1분 공간 기억 퍼즐**입니다.
ONE WORD LAB 7일 자율 개발 실험(2026-11-08 ~ 11-14, Asia/Seoul)에서 Grok Bot이 만든 프로젝트입니다.

- 계정·서버 저장·광고·분석·외부 폰트/CDN 없음. 브라우저 안에서만 동작합니다.
- 건강·두뇌 훈련 효과를 주장하지 않습니다. 그냥 짧은 퍼즐입니다.

## 플레이 방법
1. 항로(청록 칸, 순서 번호)를 외우고 **기억했어요, 숨기기**를 누릅니다.
2. 현재 위치와 이웃한 칸을 눌러 한 칸씩 잇습니다. 직전 칸을 누르면 한 칸 되돌립니다.
3. 항로가 아닌 칸은 실수로 세고 진행은 유지됩니다(정답 칸은 알려 주지 않습니다).
4. **다시 보기**는 진행을 초기화하고 그 판을 ‘연습’ 기록으로 바꿉니다.
5. 도착하면 칸 수·시간·실수가 표시됩니다. **같은 항로 다시** / **새 항로**.

상태 문구는 `aria-live`로 읽히고, 격자 칸마다 행·열·출발/도착 라벨이 있어요. 키보드: 방향키 이동 · Backspace 되돌리기 · R 새 항로. Enter/Space는 포커스된 버튼을 누르고, 포커스가 없을 때 Enter는 미리보기에서 숨기기·완료 후 같은 항로 다시. 시드는 `#seed=abc123` 주소로 공유됩니다(영문·숫자·`_`·`-` 1~32자만, 그 외 주소는 새 항로로 시작). **오늘의 항로**는 Asia/Seoul 달력의 `daily-YYYY-MM-DD` 시드예요(같은 날이면 같은 항로). 기록 판(다시 보기 없음)을 끝내면 이 브라우저에만 오늘 최고가 남고, **결과 복사**로 한 줄 요약을 복사할 수 있어요.

### 공개 미리보기 (알파)
https://ju0o.github.io/7Day_GrokBot/ — GitHub Pages(main 브랜치 루트). 최종 릴리스가 아닌 검증용 알파입니다. DAY1에 실제 Chrome에서 마우스 완주·실수·다시 보기·키보드(←, Backspace, R)·360px 에뮬레이션을 확인했습니다([증거](docs/evidence/day1-run2/)). DAY1 run3에 Enter 규칙·완주 후 포커스·틀린 칸 문구, run4에 내용 기반 버전 배포 후 완주·루트 주소 이동, run5에 연습 판·공유 주소 시드 처리(잘못된 값 → 새 시드)도 Chrome에서 재확인했습니다. 미확인: 실제 모바일/터치 기기, 다른 브라우저, 스크린리더, 일부 Enter 동작, 로컬 127.0.0.1 접속 문제. 예: https://ju0o.github.io/7Day_GrokBot/#seed=day1-check

## 실행
Node.js 20 이상, 의존성 없음.
```bash
npm start      # http://127.0.0.1:4278/
npm test       # node --test tests/*.test.mjs
npm run check  # 구문 검사
```
`public/` 폴더는 정적 파일이라 아무 정적 호스팅에도 올릴 수 있습니다(ES 모듈이라 `file://` 직접 열기는 브라우저에 따라 막힐 수 있음).

## 배포 시 주의
`public/` 파일을 바꾸면 `npm run version:write`로 `?v=` 버전을 다시 계산하세요. 버전은 파일 내용의 sha256에서 나오고(버전 토큰 자체는 제외), `npm run check`가 불일치하면 실패합니다. 이미 옛 `index.html`을 캐시한 브라우저는 GitHub Pages 캐시(최대 약 10분) 동안 옛 버전을 볼 수 있습니다.

## 구조
- `public/engine.mjs` (일일 시드 `dailySeed` / `seoulYmd` 포함) — 순수·결정적 게임 엔진(시드 PRNG, 자기교차 없는 직교 항로, 불변 상태 전이, 기억 단계에서 항로를 숨기는 `view`)
- `public/app.js`, `index.html`, `style.css` — 접근 가능한 버튼 격자 렌더러
- `scripts/asset-version.mjs` — 내용 기반 자산 버전 계산·검사, `scripts/route-stats.mjs` — 엔진 항로 통계
- `scripts/server.mjs` — 내장 정적 서버(127.0.0.1, GET/HEAD, 경로 이탈 차단)
- `tests/` — 엔진·서버 테스트
- `docs/` — PRD, 계획, 개발일지, 실험 상태

## 문의·기록
문제는 GitHub Issues로 남겨 주세요. 개발 과정: `docs/DEVLOG.md`, 하루 종합: `docs/DAY1_SUMMARY.md`.

## 현재 한계 (DAY 1)
- 로컬 브라우저 접속은 ERR_CONNECTION_REFUSED(셸 curl은 200, 원인 미확인, docs/evidence/day1-run1/). 브라우저 검증은 공개 미리보기에서 수행.
- 스크린리더·실제 모바일 기기·다른 브라우저 엔진 미검증.
- Notion 기록: https://app.notion.com/p/411000b759dc81959f77fccd727a45ae
- 공개 배포 주소 없음. 일일 시드·난이도·오프라인 캐시 미구현.
- 기억 단계에서도 출발점·도착점은 의도적으로 보입니다.
