# TASKS — 폼봐 (formbwa) 작업 계획

> [PRD.md](./PRD.md)의 기능 요구사항(F-ID)과 [TRD-FE.md](./TRD-FE.md)·[TRD-BE.md](./TRD-BE.md)의 설계(§ 표기)를 실제 작업 단위로 분해한 문서. PRD/TRD와 달리 수시로 갱신한다.
>
> 운영 원칙: 1·2단계는 상세화 완료. 3·4단계는 검증 결과로 바뀔 수 있어 착수 시점에 쪼갠다. 2단계 상세 항목도 1단계 M6 결과에 따라 조정 전제. 요구사항이 바뀌면 PRD/TRD를 먼저 고치고 이 문서를 따라 맞춘다.

## 1단계 — 실시간 코칭 루프 (목표 3주 내외, AI 페어코딩 전제)

### M0. FE 초기 세팅 (~0.5일)

- [x] Turborepo + pnpm workspaces 초기화 (`apps/web`, `packages/core`, 공유 config 골격)
- [x] `apps/web` Next.js 앱 생성 — App Router, TypeScript strict, Tailwind CSS 4
- [x] 기본 라이브러리 설치·프로바이더 구성 — TanStack Query, Zustand, Axios 인스턴스(`shared/api`), Zod
- [x] FSD 레이어 스캐폴딩 (app/views/shared — TRD-FE §3.1. widgets/features/entities는 §3.2 승격 기준 충족 시 생성, 미리 만들지 않음)
- [x] `packages/core` 골격 + Vitest 셋업 (빈 테스트 1개로 파이프라인 확인)
- [x] eslint 경계 규칙 — FSD 레이어 단방향 import + `packages/core`의 react/next/DOM import 금지
  - [x] core의 DOM 차단 — `packages/core/tsconfig.json`의 `lib: ["ES2022"]`로 DOM 타입 자체 제거 (eslint 규칙보다 확실). 검증: `document` 사용 시 TS2584
  - [x] FSD 레이어 단방향 import — `eslint-plugin-boundaries` v7 (`@repo/eslint-config/fsd`). 슬라이스 간 cross-import는 Steiger 담당(0-7)
- [x] DX 셋업 — ESLint+Prettier 공유 설정, Steiger(FSD 린트), Husky+lint-staged(pre-commit), commitlint(Conventional Commits)
  - `@repo/eslint-config`는 base/next-js/core + fsd export. lint-staged는 워크스페이스별 `.lintstagedrc.json` (루트 일괄 실행 시 eslint 설정을 못 찾아 전 커밋이 실패함)
  - Steiger: `fsd/segments-by-purpose`는 `src/app/**`만 예외 — Next 라우팅 디렉터리를 겸해서 `providers.tsx`가 세그먼트로 오인됨 (TRD-FE §3.1)
- [x] Storybook 셋업 (`@storybook/nextjs-vite`)
  - 스토리는 컴포넌트 옆에 배치 (`shared/ui/button/button.stories.tsx`) — FSD 슬라이스 응집도 유지
  - init 기본 애드온 중 chromatic(유료 SaaS)·onboarding·addon-vitest(브라우저 테스트, TRD 밖) 제거. Playwright E2E는 M11 몫
  - `preview.tsx`에서 `globals.css`+Pretendard 로드 필수 — layout.tsx를 안 거치므로 안 하면 Tailwind·폰트가 스토리에 미적용
- [x] GitHub Actions CI (lint·steiger·test) + Vercel 배포 파이프라인 (빈 페이지 배포 확인)
  - CI는 루트에서 `turbo lint check-types test build` — M1의 `apps/be`가 추가돼도 워크플로 수정 불필요 (turbo가 워크스페이스 그래프로 자동 포함). be 테스트에 Postgres가 필요해지면 그때 `services:` 추가
  - Vercel은 Root Directory=`apps/web`만 지정하면 Ignored Build Step을 자동 설정한다. **`vercel.json`에 `ignoreCommand`를 두지 말 것** — install 이전 단계라 `npx turbo`가 바이너리를 통째로 받다가 배포가 멈춘다
- [x] docs/에 PRD·TRD-FE·TRD-BE·TASKS 커밋

### M1. BE 초기 세팅 (~0.5일)

- [x] `apps/be` NestJS 앱 생성 (TS strict, 공유 eslint/tsconfig 연결)
  - Nest 기본은 strict가 아니다 (`noImplicitAny: false`) — 직접 켤 것. TS 6은 `baseUrl`을 deprecated 처리하므로 제거
  - 공유 설정은 `@repo/eslint-config/nest` (base + node globals). lint에 `--max-warnings 0` 필수 (base의 only-warn 대응)
  - 포트 4000 — web dev 서버가 3000을 하드코딩 점유
- [x] `docker-compose.yml` — 로컬 Postgres 컨테이너 (개발용)
- [x] Prisma init — User/SetRecord 스키마(TRD-BE §5) + 첫 마이그레이션
  - **Prisma 7은 드라이버 어댑터가 필수** (Rust 엔진 내장 폐기) — `@prisma/adapter-pg` 없으면 `PrismaClientInitializationError`. datasource URL은 `prisma.config.ts`, 클라이언트는 `src/generated/prisma`에 생성(`moduleFormat="cjs"`)
  - **`postinstall: prisma generate` 필수** — 생성물이 gitignore라 CI엔 없다. 빼면 CI 전체가 깨지는데, turbo 해시에 안 잡혀 캐시 히트로 통과하는 것처럼 보인다 (`--force`로 재현)
- [x] 헬스체크 엔드포인트 + class-validator 파이프 등록
  - `$queryRaw`로 DB까지 왕복 — 프로세스만 살고 DB가 죽은 상태를 ok로 보고하지 않게 (검증: DB 정지 시 500)
- [x] `turbo prune be --docker` 기반 Dockerfile 골격 (빌드 확인만, 배포는 2단계)
  - `.dockerignore`에 `*.tsbuildinfo` 필수 — 로컬 incremental 캐시가 컨텍스트로 들어가면 컨테이너 안 tsc가 "최신"으로 오판해 `main.js`를 emit하지 않는다
- [x] CI에 be lint·build 추가
  - 실제로 할 일이 없었음 — CI가 루트에서 turbo를 돌려 `be#lint/check-types/test/build`를 자동 포함. be에 스크립트만 있으면 됨

> 배포(EC2)·인증 모듈은 2단계. 여기서는 로컬에서 도는 골격까지만.

### M1.5. 디자인 시스템 — 토큰 패키지 (UI 1차와 함께 진행, 스펙: docs/superpowers/specs/2026-07-23-design-tokens-design.md)

- [x] **`@repo/design-tokens` 패키지** — 색·간격·타이포(티셔츠 스케일)·radius를 플랫폼 중립 TS로 단일화 (RN 대비 초기 분리). 무빌드(`@repo/core` 패턴)
- [x] **TS → `theme.css` 생성기** (`gen` 스크립트, tsx) — Tailwind v4 `@theme static` 방출, 결과 CSS는 커밋. `globals.css`가 `@import`
- [x] **하드코딩 값 → 스케일 이전** — 컴포넌트의 `text-[..px]`·`rounded-[..px]`를 `text-*`·`rounded-*` 유틸리티로 (히어로 clamp·이모지·실루엣 플레이스홀더는 예외). base=14
- [x] **공용 UI 셸** — `shared/ui`에 `app-shell`(고정 헤더+스크롤 영역)·`site-header`·`exit-button`·`Logo`(브랜드 SVG 마크)·`Button`. 아이콘은 `lucide-react`
- [ ] RN 타깃 시 생성기에 hex 출력(OKLCH→hex) 추가 — 4단계

> 색 토큰은 Claude Design 원본 값 그대로. 타이포/radius는 신규 스케일이라 기본 `text-*`가 소폭 변함(의도).

### M2. 라우트 골격 + 포즈 파이프라인 + 운동 화면 (F1-5, F1-7, F1-8) (~2~3일)

- [x] **6라우트 골격 (UI shell 완료)** — `/`(intro) → `/exercises`(exercise-list) → `/start`(workout-setup) → `/prepare`(prepare) → `/workout`(workout) → `/summary`(summary) (TRD-FE §3.1). 6개 화면 UI가 목 데이터로 모두 서 있음
  - 준비/운동/요약을 **별도 라우트로 분리** (밝은 준비·몰입 다크 운동·밝은 결과). `/prepare`는 배치→캘리브 내부 2상태. 카메라·포즈·판정 로직은 아래 항목들
- [x] **`entities/workout` store (Zustand persist)** — 닉네임·선택 코치·선택 종목·세트 결과를 localStorage 통째 영속 → 새로고침에도 단계 유지. /exercises 종목·/start 닉네임·코치를 쓰고 /workout·/summary가 읽게 배선 (브라우저 검증 완료). shared/config 목 제거
  - steiger가 `@/` 별칭을 못 풀어 entities를 insignificant로 오탐 → `steiger.config.ts`에서 `insignificant-slice`를 `entities/**`에 한해 예외 (스캔 루트 src 유지)
- [x] **`shared/lib/pose` 모델 로더 = 인메모리** — `PoseLandmarker` 싱글턴(클라이언트 dynamic import, WASM·모델 CDN). 도메인 아닌 리소스라 entity와 분리. 여러 번 불러도 1회만 로드, 실패 시 재시도
  - 오디오 프리로드는 M4(mp3)로 미룸
- [x] `getUserMedia` 카메라 스트림 + `@mediapipe/tasks-vision` 로딩 (`useCameraPose` 훅). 모델 프리로드는 `/` 진입 시 `PosePreload`로 시작
- [x] 렌더(rAF) / 추론(20fps 스로틀) 분리 루프 — 매 추론마다 오버레이 + `extractFeatures` → `onFeatures`
- [x] Canvas 랜드마크 오버레이 (F1-7) — 상체+양다리 골격 선/점 (`useCameraPose` 내부)
- [x] 전신 바운딩 박스 체크 + 배치 가이드 (F1-5) — core `isFullBodyInFrame`, `/prepare` 배치에서 전신 잡히면 "자세 잡았어요" 활성
- [x] 기립 캘리브레이션 3초 → 기준값 저장 (F1-5) — `/prepare` 캘리브에서 무릎각 중앙값을 `entities/workout.standingKneeAngle`에 저장 → `/workout` FSM·판정이 사용(미측정 시 기본 170)
- [x] **이탈 가드 (`ExitGuard`)** — `beforeunload` + 뒤로가기 가로채 확인 모달, [✕ 그만두기] → `/exercises` (TRD-FE §4). 다크 화면 공용(`shared/ui/exit-guard`), 브라우저 검증 완료
- [x] **운동 화면 실배선** — 좌: 실제 `<video>` + 오버레이 + **실시간 반복 카운트·자세 품질%·자막**(core FSM·judge). 우: 코치 시범 플레이스홀더(실영상 M4). 입문자 중심 위계
  - ⚠️ **웹캠 실검증은 로컬에서 사용자가** (이 환경엔 카메라 없음). 헤드리스에선 크래시 없이 상태 메시지로 폴백 확인
  - 자막은 판정 이벤트 → 텍스트 임시 매핑(`model/caption.ts`), 음성은 M4(coach.ts)
  - GPU delegate 이슈 시 `poseModel.ts`의 `delegate: "GPU"` → `"CPU"`
  - 시범 mp4는 프로그레시브 재생 (전체 프리로드 없이 첫 프레임부터 — §9.1). 판정과 동기화하지 않음

> M2는 코드상 완료. 남은 건 **웹캠 실검증**(사용자 로컬)과 **판정 임계값 튜닝**(M3 fixture 기반). 코치 시범 실영상은 M4.

### M3. 코어 엔진 (F1-1, F1-2) (~1주 — 병목은 코딩이 아니라 몸으로 하는 오탐 검증)

- [x] `angle.ts` — 3관절 각도(atan2) + `extractFeatures`(가시성 높은 쪽 선택, 미달 프레임 null)
- [x] `squat-fsm.ts` — 상태머신 + 반복 카운트 (F1-1). 무릎각 히스테리시스, 회당 최저각·기울기·타이밍 누적
- [x] `judge.ts` — 판정 규칙 → JudgeEvent (F1-2). **시범 영상과 분리**. confidence(precision 우선) + 우선순위 정렬(back_bent>knee_over_toe>knee_shallow)
- [x] 입문자 그레이스 — `judge.ts`의 `graceReps`로 초반 회차 지적 억제(완주만 칭찬). 임계값은 튜닝 대상
- [ ] fixture 수집 — 본인 촬영 정상/불량 스쿼트 영상에서 랜드마크 시퀀스 JSON 추출 (**촬영 필요**)
  - **정상 촬영본은 M4 시범 영상의 모캡 소스로도 재사용** (TRD-FE §5.4·§6.2) — 촬영은 한 번, 폼을 정확히 잡아 찍을 것
- [ ] Vitest 스냅샷 회귀 테스트 (fixture → 기대 이벤트) — 합성 데이터 유닛 테스트 22개는 완료(angle·fsm·judge·배치판정), fixture 회귀는 촬영 후

### M4. 캐릭터·음성·시범 영상 (F1-3, F1-4, F1-8) (~3~4일)

- [ ] 멘트 스크립트 작성 — 2캐릭터 × 이벤트별 변형 ~30개
- [ ] **[게이트] ElevenLabs 부산 사투리 품질 검증** — 미달 시 캐릭터 교체 (PRD §12)
- [ ] mp3 일괄 생성 스크립트 + 매니페스트 JSON + 프리로드
- [ ] `coach.ts` — 쿨다운·우선순위 정책 + 단일 오디오 채널 재생 (F1-3)
- [ ] **[게이트 후] 코치 시범 영상 제작** (F1-8, TRD-FE §6.2) — 캐릭터 확정 뒤 착수(그 전엔 M2 플레이스홀더)
  - 정상 스쿼트 촬영(M3 fixture 겸용) → 마커리스 모캡 → **인체 비율 캐릭터(얼굴=코치)** 리타겟 → 단색/스튜디오 배경 렌더 → mp4 루프
  - 도구: MakeHuman(CC0) + 모캡(무료 티어 **비상업 주의**) + Blender. 투명 영상 금지(호환·깜빡임)
  - 매니페스트에 영상 경로 추가 (mp3와 같은 방식, 하드코딩 금지)
- [x] **`/` 인트로 + `/exercises` 운동 목록 + `/start` 설정 화면 (UI 완료)** (F1-4·F1-10, PRD §4) — `/`는 히어로+"시작하기", `/exercises`는 부위별(웜업·상체·하체·전신) 종목 목록(스쿼트만 동작, 나머지 "준비 중"), `/start`(`views/workout-setup`)는 닉네임 입력 + 준비물 안내(2m·측면 45°) + 캐릭터 카드(리치) + "운동 시작"(→ `/prepare`)
  - **UI는 목 데이터로 완성**. 실 캐릭터 에셋·음성·카메라 고지 위치 조정은 M4 본체에서
  - M2에서 라우트 골격·운동 store(entities/workout)는 이미 섬 — 여기선 화면 내용을 채움
  - 운동 목록은 **부위별 구조를 미리** 세워 3단계 종목 추가(F3-3) 때 화면 재작업 없게. 선택 종목은 entities/workout에 저장
  - 프리로드 (TRD-FE §9.1): `/` 진입 시 모델·WASM(store 보관) / `/start` 캐릭터 선택 시 mp3
  - 캐릭터 이름·성격은 매니페스트에서 읽을 것 — 사투리 게이트(PRD §12)에서 교체될 수 있음
- [ ] 닉네임 개인화 (F1-9, TRD-FE §6.1) — **선택 입력(필수 아님, 비우면 "회원님")**, 자동 포커스 금지·플레이스홀더 예시. localStorage 저장(재방문 유지), 운동 중 **자막에 이름 상시**. 세트 경계 음성 호명은 비-실시간이라 런타임 TTS 허용(미리 합성·캐싱, 실시간 교정 루프엔 넣지 않음)

### M5. 세트 요약·마무리 (F1-6) (~1일)

- [ ] entities/workout 스토어 + 세트 종료 요약 화면 (F1-6)
- [ ] ~~카메라 처리 방식 고지 + 운동 면책 문구~~ → **M4 랜딩으로 이동** (PRD §10이 "첫 화면에 명시"를 요구, TRD-FE §8은 권한 요청 직전을 요구)
- [ ] 판정 튜닝 라운드 1 — 지인 ~5명 테스트, fixture 보강

### M6. 검증 (~1주 — 사람 모집·인터뷰라 AI로 단축 불가)

- [ ] 체험자 10명 확보 (링크 공유) + 인터뷰
- [ ] PRD §8 지표 측정: 세트 완료율 60%+, "봐주는 느낌" 6/10+
- [ ] **go/no-go 결정**: 재방문 신호 확인 → 2단계 착수 / 미달 시 코칭 경험 개선 반복

## 2단계 — 계정·기록·리포트 (목표 2주 내외, NestJS·Prisma 골격은 M1에서 완료)

> 1단계 M6 go/no-go 통과 후 착수. 검증 결과에 따라 항목이 바뀔 수 있음을 전제로 한 사전 상세화.

### M7. 인증 — 구글 OAuth + JWT (F2-1) (~2~3일)

- [ ] `auth` 모듈 — passport-google-oauth20 리다이렉트 플로우 + 콜백 (TRD-BE §4)
- [ ] JWT 발급: access 15분 + refresh 14일, httpOnly·Secure·SameSite 쿠키 (Domain=`.서비스도메인`)
- [ ] refresh 로테이션 + 재사용 감지 시 전체 무효화, 로그아웃(refresh 폐기)
- [ ] JwtAuthGuard + `@CurrentUser()` 데코레이터
- [ ] FE: 로그인 버튼(리다이렉트), Axios 401→`/auth/refresh` 1회 재시도 인터셉터 (TRD-FE §7)
- [ ] FE: 게스트 → 기록 저장 시점 로그인 유도 UI (PRD F2-1)

### M8. 인프라·배포 (~2~3일 — 손작업 많아 AI 단축 제한적)

- [ ] 도메인 구입 + web/api 서브도메인 DNS 구성 (쿠키 공유 전제조건)
- [ ] EC2 프리티어 생성 — 보안그룹 443만 개방(SSH는 키+IP 제한), 스왑 2GB, 자동 보안 패치
- [ ] `docker-compose.prod.yml` — nginx + be + db, Postgres 호스트 바인딩 금지 확인
- [ ] certbot HTTPS 발급·자동 갱신
- [ ] GitHub Actions 배포: GHCR 빌드/푸시 → EC2 `compose pull && up -d` → `prisma migrate deploy`
- [ ] 일일 pg_dump → S3 cron + **복구 리허설 1회** (백업은 복구 성공 전까지 백업이 아님)
- [ ] helmet·@nestjs/throttler·CORS 화이트리스트 적용 — TRD-BE §6.2 체크리스트 전 항목 대조

### M9. 기록 API (F2-2) (~1~2일)

- [ ] `records` 모듈 — POST/GET, class-validator 검증, userId 소유권 강제 (공용 리포지토리 패턴)
- [ ] FE: `save-record` feature — 세트 종료 시 TanStack Query mutation, 실패 시 재시도 UX
- [ ] FE: 기록 목록 화면 (최소 버전 — 대시보드는 3단계)

### M10. AI 리포트 (F2-3) (~1일)

- [ ] `reports` 모듈 — gpt-4o-mini 프록시, 프롬프트에 구조화된 수치만 삽입
- [ ] rate limit: 세트당 1회 + 사용자별 일 상한, OpenAI 대시보드 월 지출 캡($5) 설정
- [ ] reportText 저장 후 재사용 (재생성 금지)
- [ ] FE: 세트 직후 캐릭터 톤 리포트 표시

### M11. 2단계 마무리 (~1일)

- [ ] 회원 탈퇴 (기록 hard delete — TRD-BE §8)
- [ ] 개인정보처리방침·이용약관 페이지 (카메라 미전송 명시)
- [ ] 최소 모니터링 — uptime 체크 + 에러 알림 (무료 티어)
- [ ] E2E: 로그인 → 운동 → 저장 → 리포트 플로우 Playwright 1본

## 3단계 — 리텐션 (착수 시 상세화)

개요: 대시보드·스트릭 (F3-1, F3-2) → 종목 추가: core FSM 확장 (F3-3) → 캐릭터 추가 (F3-4) → 모바일 브라우저 최적화 → **오운완 공유 페이지 (F3-5)**: 세트 리포트 공유 링크 `/r/:id`, SSR + 동적 OG 이미지 + 메타태그 (바이럴 루프 + SSR/SEO 경험 확보 — PRIVATE.md §5.1)

## 4단계 — RN 앱·수익화 (착수 시 상세화)

개요: RN 기술 스파이크 1주 (vision-camera + tflite PoC) → `/auth/google/token` 엔드포인트 추가 (TRD-BE §4 — 인증 재작업 없음) → apps/mobile 구축 → 웹 결제 → 스토어 출시 (F4-1~3)

---

완료 기록: 각 항목 완료 시 체크 + 배운 것(특히 판정 튜닝 관련)은 커밋 메시지나 이 문서 하단에 짧게 남긴다.
