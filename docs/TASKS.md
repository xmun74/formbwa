# TASKS — 폼봐 (formbwa) 작업 계획

> [PRD.md](./PRD.md)의 기능 요구사항(F-ID)과 [TRD-FE.md](./TRD-FE.md)·[TRD-BE.md](./TRD-BE.md)의 설계(§ 표기)를 실제 작업 단위로 분해한 문서. PRD/TRD와 달리 수시로 갱신한다.
>
> 운영 원칙: 1·2단계는 상세화 완료. 3·4단계는 검증 결과로 바뀔 수 있어 착수 시점에 쪼갠다. 2단계 상세 항목도 1단계 M6 결과에 따라 조정 전제. 요구사항이 바뀌면 PRD/TRD를 먼저 고치고 이 문서를 따라 맞춘다.

## 1단계 — 실시간 코칭 루프 (목표 3주 내외, AI 페어코딩 전제)

### M0. FE 초기 세팅 (~0.5일)

- [x] Turborepo + pnpm workspaces 초기화 (`apps/web`, `packages/core`, 공유 config 골격)
- [x] `apps/web` Next.js 앱 생성 — App Router, TypeScript strict, Tailwind CSS 4
- [x] 기본 라이브러리 설치·프로바이더 구성 — TanStack Query, Zustand, Axios 인스턴스(`shared/api`), Zod
- [x] FSD 레이어 스캐폴딩 (루트 app/ + src의 app·views·shared — Next 라우팅은 루트 app/으로 분리, TRD-FE §3.1. widgets/features/entities는 §3.2 승격 기준 충족 시 생성, 미리 만들지 않음)
- [x] `packages/core` 골격 + Vitest 셋업 (빈 테스트 1개로 파이프라인 확인)
- [x] eslint 경계 규칙 — FSD 레이어 단방향 import + `packages/core`의 react/next/DOM import 금지
  - [x] core의 DOM 차단 — `packages/core/tsconfig.json`의 `lib: ["ES2022"]`로 DOM 타입 자체 제거 (eslint 규칙보다 확실). 검증: `document` 사용 시 TS2584
  - [x] FSD 레이어 단방향 import — `eslint-plugin-boundaries` v7 (`@repo/eslint-config/fsd`). 슬라이스 간 cross-import는 Steiger 담당(0-7)
- [x] DX 셋업 — ESLint+Prettier 공유 설정, Steiger(FSD 린트), Husky+lint-staged(pre-commit), commitlint(Conventional Commits)
  - `@repo/eslint-config`는 base/next-js/core + fsd export. lint-staged는 워크스페이스별 `.lintstagedrc.json` (루트 일괄 실행 시 eslint 설정을 못 찾아 전 커밋이 실패함)
  - Steiger: fsd/segments-by-purpose는 src/app/\*\*만 예외 — app 레이어의 관례 세그먼트명(providers)을 steiger 0.7이 잡음(라우팅은 루트 app/으로 분리돼 스캔 밖). FSD 공식 with-nextjs 분리 구조
- [x] Storybook 셋업 — **`@repo/ui`가 소유**(`packages/ui/.storybook`, **`@storybook/react-vite`**: 디자인 시스템은 순수 React라 Next 프리셋 불필요). 초기엔 apps/web(`@storybook/nextjs-vite`)에 뒀다가 디자인 시스템 구축 때 이전
  - 스토리는 컴포넌트 옆에 배치 (`packages/ui/src/<name>/<Name>.stories.tsx`) — 응집도 유지
  - init 기본 애드온 중 chromatic(유료 SaaS)·onboarding·addon-vitest(브라우저 테스트, TRD 밖) 제거. Playwright E2E는 M11 몫
  - `preview.tsx`+`.storybook/globals.css`로 **Tailwind v4 자립**(tailwindcss + `@repo/design-tokens/theme.css` + `@source ../src`) + Pretendard 로드. `@tailwindcss/vite`를 viteFinal에 추가
- [x] GitHub Actions CI (lint·steiger·test) + Vercel 배포 파이프라인 → **프로덕션 라이브**: 커스텀 도메인 `formbwa.site`(가비아 구입·Vercel 연결, HTTPS 자동, www→apex 308 리다이렉트)
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

### M1.5. 디자인 시스템 — 토큰·컴포넌트 패키지 (UI 1차와 함께 진행)

- [x] **`@repo/design-tokens` 패키지** — 색·간격·타이포(티셔츠 스케일)·radius를 플랫폼 중립 TS로 단일화 (RN 대비 초기 분리). 무빌드(`@repo/core` 패턴)
- [x] **TS → `theme.css` 생성기** (`gen` 스크립트, tsx) — Tailwind v4 `@theme static` 방출, 결과 CSS는 커밋. `globals.css`가 `@import`
- [x] **하드코딩 값 → 스케일 이전** — 컴포넌트의 `text-[..px]`·`rounded-[..px]`를 `text-*`·`rounded-*` 유틸리티로 (히어로 clamp·이모지·실루엣 플레이스홀더는 예외). base=14
- [x] **공용 UI 셸** — `shared/ui`에 `app-shell`(고정 헤더+스크롤 영역)·`header`·`footer`(브랜드+운동 면책+저작권, 라이트 화면 공용)·`exit-button`·`Logo`(브랜드 SVG 마크). 앱 전용 셸(프리미티브 Button 등은 아래 `@repo/ui`로 이관)
- [x] **`@repo/ui` 컴포넌트 라이브러리** — **tailwind-variants(+slots) + `cn`(clsx+tailwind-merge)**. 프리미티브(Button·Input·Badge·Text·Icon) + 표현 합성 Card(named export·RSC-safe) + 몰큘 Field(useId+cloneElement a11y) + 상호작용 합성 Dialog·Tabs(닷 노테이션·Context·네이티브 dialog/ARIA a11y). 아이콘은 라이브러리 무관 SVG 래퍼(소비처가 `lucide-react`). 규약 `packages/ui/CONVENTIONS.md`
  - **자립 Storybook**(`@storybook/react-vite` + Tailwind 자립) — 전 컴포넌트 autodocs + 합성 4종 MDX. **Vercel 배포 완료** (별도 프로젝트, Root=`packages/ui`, Output=`storybook-static`)
  - **Vitest + Testing Library** 컴포넌트 테스트(상호작용·a11y 중심, 7파일 26개). Input·Badge는 순수 표현이라 스킵
- [ ] RN 타깃 시 생성기에 hex 출력(OKLCH→hex) 추가 — 4단계

> 색 토큰은 Claude Design 원본 값 그대로. 타이포/radius는 신규 스케일이라 기본 `text-*`가 소폭 변함(의도).

### M2. 라우트 골격 + 포즈 파이프라인 + 운동 화면 (F1-5, F1-7, F1-8) (~2~3일)

- [x] **6라우트 골격 (UI shell 완료)** — `/`(intro) → `/routine`(exercise-list) → `/start`(workout-setup) → `/prepare`(prepare) → `/workout`(workout) → `/summary`(summary) (TRD-FE §3.1). 6개 화면 UI가 목 데이터로 모두 서 있음
  - 준비/운동/요약을 **별도 라우트로 분리** (밝은 준비·몰입 다크 운동·밝은 결과). `/prepare`는 배치→캘리브 내부 2상태. 카메라·포즈·판정 로직은 아래 항목들
- [x] **`entities/workout` store (Zustand persist)** — 닉네임·선택 코치·선택 종목·세트 결과를 localStorage 통째 영속 → 새로고침에도 단계 유지. /routine 종목·/start 닉네임·코치를 쓰고 /workout·/summary가 읽게 배선 (브라우저 검증 완료). shared/config 목 제거
  - steiger가 `@/` 별칭을 못 풀어 entities를 insignificant로 오탐 → `steiger.config.ts`에서 `insignificant-slice`를 `entities/**`에 한해 예외 (스캔 루트 src 유지)
- [x] **`shared/lib/pose` 모델 로더 = 인메모리** — `PoseLandmarker` 싱글턴(클라이언트 dynamic import, WASM·모델 CDN). 도메인 아닌 리소스라 entity와 분리. 여러 번 불러도 1회만 로드, 실패 시 재시도
  - 오디오 프리로드는 M4(mp3)로 미룸
- [x] `getUserMedia` 카메라 스트림 + `@mediapipe/tasks-vision` 로딩 (`useCameraPose` 훅). 모델 프리로드는 `/` 진입 시 `PosePreload`로 시작
- [x] 렌더(rAF) / 추론(20fps 스로틀) 분리 루프 — 매 추론마다 오버레이 + `extractFeatures` → `onFeatures`
- [x] Canvas 랜드마크 오버레이 (F1-7) — 상체+양다리 골격 선/점 (`useCameraPose` 내부)
- [x] 전신 바운딩 박스 체크 + 배치 가이드 (F1-5) — core `isFullBodyInFrame`, `/prepare` 배치에서 전신 잡히면 "자세 잡았어요" 활성
- [x] 기립 캘리브레이션 3초 → 기준값 저장 (F1-5) — `/prepare` 캘리브에서 무릎각 중앙값을 `entities/workout.standingKneeAngle`에 저장 → `/workout` FSM·판정이 사용(미측정 시 기본 170)
- [x] **이탈 가드 (`ExitGuard`)** — `beforeunload` + 뒤로가기 가로채 확인 모달, [✕ 그만두기] → `/routine` (TRD-FE §4). 다크 화면 공용(`shared/ui/exit-guard`), 브라우저 검증 완료
- [x] **운동 화면 실배선** — 좌: 실제 `<video>` + 오버레이 + **실시간 반복 카운트·자세 품질%·자막**(core FSM·judge). 우: 코치 시범 플레이스홀더(실영상 M4). 입문자 중심 위계
  - ⚠️ **웹캠 실검증은 로컬에서 사용자가** (이 환경엔 카메라 없음). 헤드리스에선 크래시 없이 상태 메시지로 폴백 확인
  - ✅ **세트 자동 진행**(라이브 피드백): 목표 15회(`SET_TARGET_REPS`) 채우면 → `SET_END_DELAY_MS`(멘트 안 잘리게) → 마지막 세트면 요약, 아니면 휴식 오버레이(`REST_SECONDS` 카운트다운, "바로 시작" 스킵) → 다음 세트 자동. 세트 전환 시 FSM·coach·rep·결함 리셋. `entities/workout`에 `nextSet`/`resetSetNo`, 상단바 `setNo/totalSets`. 마지막 5회는 HUD 카운트다운 강조
  - ✅ **WebGL 컨텍스트 누수 수정** — `poseModel.disposePoseModel()`을 `useCameraPose`가 `pagehide`에 배선. 새로고침마다 GPU 컨텍스트가 누적돼 점점 느려지던 것 해결(라우트 전환엔 미발동, 모델 유지 §9.1)
  - 자막은 판정 이벤트 → 텍스트 임시 매핑(`model/caption.ts`), 음성은 M4(coach.ts)
  - GPU delegate 이슈 시 `poseModel.ts`의 `delegate: "GPU"` → `"CPU"`
  - 시범 mp4는 프로그레시브 재생 (전체 프리로드 없이 첫 프레임부터 — §9.1). 판정과 동기화하지 않음

> M2는 코드상 완료. 웹캠 실검증(사용자 로컬)은 M6, **판정 튜닝 1R는 M3에서 실촬영 fixture로 완료**. 코치 시범 실영상은 M4.

### M3. 코어 엔진 (F1-1, F1-2) (~1주 — 병목은 코딩이 아니라 몸으로 하는 오탐 검증)

- [x] `angle.ts` — 3관절 각도(atan2) + `extractFeatures`(가시성 높은 쪽 선택, 미달 프레임 null)
- [x] `squat-fsm.ts` — 상태머신 + 반복 카운트 (F1-1). 무릎각 히스테리시스, 회당 최저각·기울기·타이밍 누적
- [x] `judge.ts` — 판정 규칙 → JudgeEvent (F1-2). **시범 영상과 분리**. confidence(precision 우선) + 우선순위 정렬(back_bent>knee_over_toe>knee_shallow)
- [x] 입문자 그레이스 — `judge.ts`의 `graceReps`로 초반 회차 지적 억제(완주만 칭찬). 임계값은 튜닝 대상
- [x] fixture 수집 — 본인 촬영 정상/불량 스쿼트 영상에서 랜드마크 시퀀스 JSON 추출
  - ✅ **추출 도구** — `views/fixture-extract`(dev 라우트 `/dev/extract`, 프로덕션 404). 로컬 영상 드롭 → 브라우저 MediaPipe로 `PoseFrame[]` 추출 → 미리보기 → 하네스 포맷(`standingKneeAngle` 키) JSON 다운로드
  - ✅ **실촬영본 5종 투입** — 정상 1 + 불량 4(knee_over_toe·knee_shallow·tempo·back_bent), `packages/core/src/__fixtures__/`. **정상 촬영본은 M4 시범 영상 모캡 소스로도 재사용** (TRD-FE §6.2)
- [x] Vitest 스냅샷 회귀 테스트 (fixture → 기대 이벤트) — 합성 유닛 테스트(angle·fsm·judge·배치판정) + 실촬영 회귀
  - ✅ **회귀 하네스** — `checkFixture()`(core 순수 함수) + `fixture.test.ts`. `FIXTURES` 배럴을 전부 돌려 ① 판정 이벤트 **스냅샷 회귀** ② `expect`(repCount·mustInclude·mustExclude) **의도 검증**. 검증 함수는 웹 미리보기 재사용
  - ✅ **판정 튜닝 1R — 실촬영 5종 전부 통과**: 정상 오탐 0 + 결함 4종 각 검출. 핵심: fixture 검증은 `pipeline` `judgeConfig` 오버라이드로 **graceReps 0**(판정력만 봄), 실제 앱은 graceReps 2 유지. back_bent는 무릎 굽히며 상체 숙이는 폼으로 재촬영해야 rep 카운트+검출됨(무릎 미굽힘=스쿼트 아님)
  - ⏳ **남음**: 조명·거리·복장 바꿔가며 fixture 보강(선택). 라이브 오탐/미탐 체감은 M6 본인 검증에서

### M4. 캐릭터·음성·시범 영상 (F1-3, F1-4, F1-8) (~3~4일)

- [~] 멘트 스크립트 작성 — 2캐릭터 × 이벤트별 변형. **4종 체계 완성**(`views/workout/model/mnemonics.ts`: 동기부여·칭찬(코치 공통) + 자세설명(form_intro)·결함 4종(운동별) + 막판 카운트다운, 각 다(多)변형). 자막·음성에 사용 중. **남음**: LLM 분량 확대 후 큐레이션·사투리 게이트 통과 후 최종 확정
- [ ] **[게이트] Typecast 부산 사투리 품질 검증** — 음성 콕스로 확정·생성했으나 사투리 톤 **라이브 평가는 대기**. 미달 시 캐릭터/보이스 교체 (PRD §12). ※ TTS 공급자를 ElevenLabs → **Typecast**로 변경
- [x] mp3 일괄 생성 스크립트 + 매니페스트 JSON + 프리로드
  - ✅ **재생 인프라 완성**: `shared/lib/audio` — 매니페스트 로더(`/audio/{coachId}/manifest.json`, clipKey→파일 후보) + **단일 채널 재생 `playClip`**(재생 중이면 새 음성 **스킵** = 겹침 방지) + `preloadCoachAudio`(/start 코치 선택 시). **매니페스트 없으면 Web Speech 자동 폴백**. 형식은 `public/audio/README.md`
  - ✅ **Typecast 생성 스크립트 완성**: `apps/web/scripts/gen-coach-audio.ts`(멘트→Typecast API→mp3, 증분: 있으면 스킵·`FORCE=1` 강제) + `voices.json`(민정·콕스 voice_id, **API 키는 `.env.local`에만**, 커밋 금지). **pt·busan mp3 + manifest.json 생성 완료**(`public/audio/{pt,busan}/`)
  - ✅ **막판 5회 카운트다운 음성** — 남은 1~5회를 코치가 세어줌(`count1~5` 클립, 교정·동기부여보다 우선)
- [x] `coach.ts` — **멘트 결정 정책 완료**(`packages/core/coach.ts`: 쿨다운·우선순위·`suppressRepeat`(동일 이벤트 억제)·confidence 침묵). `/workout`가 `playClip`으로 재생(mp3 우선·Web Speech 폴백). 이름 호명은 임의 텍스트라 세트 경계 런타임 TTS 유지 (F1-3, §6.1)
  - ✅ **라이브 튜닝**(실사용 피드백): core 기본값은 보수적(그레이스 2·conf 0.8·쿨다운 4초·중복억제)으로 두고 **web(`WorkoutView`)에서 완화 주입** — graceReps 0(첫 회부터)·minConfidence 0.72·cooldown 2.5s·suppressRepeat false(자주 교정). **연속 중복 대사는 `pickLine(exclude)`로 직전 대사 제외**해 막음(변형 소진 시 침묵). fixture 검증(graceReps 0·기본 conf)과 앱 튜닝이 분리됨
- [~] **코치 시범 영상 시스템** (F1-8, TRD-FE §6.2) — **재설계·구현 완료**(오프라인 Blender 렌더, PR #1). 설계: [coach-demo-design.md](./coach-demo-design.md) · 계획: [coach-demo-plan.md](./coach-demo-plan.md)
  - [x] **런타임 플레이어**(Track A): `shared/lib/coach-demo`의 `<CoachDemo characterId exerciseId>` = 매니페스트로 mp4 골라 `<video loop muted playsInline>` 재생, 없으면 실루엣 폴백. WorkoutView 우측 패널 교체. **three.js 0**(네이티브 video)
  - [x] **팩터링 렌더 파이프라인**(Track B): `packages/coach-assets` — 리그(캐릭터 FBX)+클립(모션 FBX)+공용 클레이 셋업 → **N×M mp4+매니페스트 자동 생성**(`render/clay.py`·`split.py`, discover·combos·incremental·manifest **유닛테스트 8개**, turbo `render-demos` 증분). 도구: HF Space image→3D + Mixamo 리깅 + **Blender 5.2 클레이 렌더**(≠ 원안 MakeHuman/모캡)
  - [x] **character1·character2 스쿼트 시범 영상 렌더·연결**(`public/coach-3d/videos/{character1,character2}-squat.mp4`). 팩터링 실증: **동일 스쿼트 클립이 두 리그에 올바르게 렌더**(결정1·2)
  - [x] **캐릭터 품질 업그레이드**(PR #2): character1·2를 **고품질 클레이 메시로 교체**(자체 FBX 저품질 → 상용 생성). 눈 스타일 보정(흰자 제거→클레이 점눈, **텍스처만** 편집·지오메트리 미변경). **Mixamo 스케일 트릭**: 메시를 100배 키워 OBJ 업로드→올바른 뼈 스케일(클립 호환), 사후 스케일 보정은 스킨 메시라 불가
  - [x] **clay.py 렌더 개선**: 카메라 프레이밍을 **전(全) 애니 프레임 bbox 합집합+패딩**으로(동작 중 잘림/공중부양 방지) + `VIEW_ANGLE`(썸네일 각도)·`FILM_TRANSPARENT`(배경 투명 RGBA PNG) env 추가
  - `characterId` 불투명(character1/character2)·`exerciseId` slug(squat) 도입 + persist 마이그레이션. 자산 규약: 원본 rig/clip은 `3d-assets/`(gitignored 로컬), **산출물(mp4·manifest)만 커밋**
  - **남음(게이트 후)**: 캐릭터는 고품질화 완료 → 남은 건 **운동 카탈로그 확장(런지 등)** + Mixamo 네이티브 export 정식화
- [x] **`/` 인트로 + `/routine` 운동 목록 + `/start` 설정 화면 (UI 완료)** (F1-4·F1-10, PRD §4) — `/`는 히어로+"시작하기", `/routine`는 부위별(웜업·상체·하체·전신) 종목 목록(스쿼트만 동작, 나머지 "준비 중"), `/start`(`views/workout-setup`)는 닉네임 입력 + 준비물 안내(2m·측면 45°) + 캐릭터 카드(리치) + "운동 시작"(→ `/prepare`)
  - **UI는 목 데이터로 완성**. 실 캐릭터 에셋(코치 시범 영상)·음성은 M4 본체에서. `/` 피처 카드엔 클레이 캐릭터 일러스트(`views/intro/assets/pose-*.png`, 장식용) 적용, 하단 공용 `footer`에 운동 면책 고지(PRD §10)
  - [x] **운동 카드 썸네일**: `/routine` 스쿼트 카드에 **클레이 캐릭터 스쿼트 자세 이미지**(`public/exercises/squat.png`, Blender `FILM_TRANSPARENT` 투명 배경 렌더·`object-contain`) 표시. 준비 중 종목은 실루엣 플레이스홀더 유지. 데이터에 `image?` 필드 추가 → 종목 늘면 경로만 추가
  - M2에서 라우트 골격·운동 store(entities/workout)는 이미 섬 — 여기선 화면 내용을 채움
  - 운동 목록은 **부위별 구조를 미리** 세워 3단계 종목 추가(F3-3) 때 화면 재작업 없게. 선택 종목은 entities/workout에 저장
  - 프리로드 (TRD-FE §9.1): `/` 진입 시 모델·WASM(store 보관) / `/start` 캐릭터 선택 시 mp3
  - 캐릭터 이름·성격은 매니페스트에서 읽을 것 — 사투리 게이트(PRD §12)에서 교체될 수 있음
- [~] 닉네임 개인화 (F1-9, TRD-FE §6.1) — **선택 입력(필수 아님, 비우면 "회원님")**, 자동 포커스 금지·플레이스홀더 예시. localStorage 저장(재방문 유지), 운동 중 **자막에 이름 상시**. 세트 경계 음성 호명은 비-실시간이라 런타임 TTS 허용(미리 합성·캐싱, 실시간 교정 루프엔 넣지 않음)
  - **자막 개인화**: `mnemonics.personalize(line, name)`로 교정·칭찬 자막 앞에 이름을 얹음(`"민수님, 더 깊게!"`). **실시간 음성엔 이름 없이 원문만**(§6.1: 텍스트만 항상 개인화). 초기 자막·세트 시작 자막도 개인화. 자막 카드의 화자 라벨은 코치명으로(이름 중복 제거)
  - **세트 시작 안내**: 카메라 ready 시 1회 `form_intro`(자세 설명 멘트) 재생 — 자막은 이름 개인화(`"{name}님, …"`), 음성은 mp3 우선·Web Speech 폴백. (초기 "시작해볼게요" 호명 → form_intro로 대체) 입력·persist·폴백 충족
  - [x] **mp3 파이프라인 연결됨**(Typecast): 교정·자세설명·카운트다운은 사전 mp3 재생(없으면 Web Speech 폴백). 세트 시작 이름 호명은 비-실시간이라 런타임 TTS 유지. 세트 끝 호명은 `/summary` 이동이 음성을 끊어 보류(요약 화면은 시각 개인화로 처리)

> M4 코어(멘트 4종 체계·Typecast 캐릭터 음성·오프라인 렌더 시범 시스템·닉네임 개인화)는 **구현 완료**(PR #1). 캐릭터 **고품질화 완료**(PR #2). **남은 게이트**: 사투리 품질(콕스 라이브 평가)·운동 카탈로그 확장(런지 등) — M6/사투리 게이트 후. 라이브 카메라 검증(멘트 트리거·카운트다운·세트 종료 흐름)은 실촬영 대기.

### M5. 세트 요약·마무리 (F1-6) (~1일)

- [x] entities/workout 스토어 + 세트 종료 요약 화면 (F1-6) — 운동 중 회수·품질·결함을 집계(`views/workout/model/setResult.ts`), 세트 완료(자동 또는 "세트 끝내기") → `store.setResult` → `/summary`가 실제값 표시(회수/목표·자세 정확도·상위 지적 포인트·운동 시간). 지적 없으면 포인트 카드 숨김. `/summary` 직접 방문 시엔 기본 목(데모용). 요약은 3세트 자동 진행의 **마지막 세트** 후 표시, "다시 하기"는 1세트부터(`resetSetNo`)
  - [x] **세트 끝내기 버튼 수정**: 자동완료용 지연·휴식 없이 **즉시** 현재 세트 요약으로 전환(`finishNow`). 세트 완료 때마다 결과 저장 → 세트 경계(직전 세트 완주 후 다음 세트 0회 상태)에서 눌러도 **직전 완료 세트 결과가 요약에 남도록** 수정(0회 리셋 버그 해결)
  - 총평은 임시 템플릿 — 2단계 AI 리포트(F2-3)에서 캐릭터 톤 총평으로 교체
- [x] 카메라 처리 방식 고지 + 운동 면책 문구 → **랜딩(`/`)에 배치 완료** (PRD §10 "첫 화면에 명시"). 카메라 고지는 히어로 서브라인+🔒 피처, 운동 면책은 하단 푸터. `/start`엔 권한 요청 직전 재고지(TRD-FE §8) 유지
- [ ] 판정 튜닝 라운드 1 — 지인 ~5명 테스트, fixture 보강 (**촬영·사람 필요**)

### M6. 검증 (~수일 — 본인 단독 검증)

- [ ] **본인 단독 검증** — 배포된 `formbwa.site`를 직접 반복 사용하며 코칭 루프 점검(조명·거리·각도·복장 바꿔가며). **외부 체험자 모집·인터뷰는 하지 않음**(방향 전환)
- [x] **GA4 계측** — 골격 완료: `@next/third-parties`의 `GoogleAnalytics`를 `app/layout`에 배선 + `shared/lib/analytics`(`track()` + `config.ts` 게이트). **활성 조건 = 프로덕션 빌드 + `NEXT_PUBLIC_GA_ID` 존재** → `next dev`에선 ID가 `.env.local`에 있어도 무동작(로컬 트래픽 오염 방지). turbo.json `globalEnv`에 `NODE_ENV` 선언. **측정 ID 주입 완료**(Vercel 프로덕션 env `NEXT_PUBLIC_GA_ID`) → `page_view` 퍼널 수집 중. **1단계 GA4 범위(골격+측정 ID+퍼널 배선)는 완료.** 정식 동의 배너·개인정보처리방침은 2단계 M11 소유(아래).
  - **퍼널 이벤트 배선 완료**(UI/흐름 안정된 시점 = 본인 검증 직전): `workout_started`(`WorkoutView` 카메라 ready effect), `set_completed`(`finishSet`, `{reps, quality}`), `workout_exited`(`ExitGuard.confirmExit` — /prepare·/workout 공용), `camera_permission_denied`(`useCameraPose` 거부 감지 — 카메라 쓰는 곳이 운동 플로우뿐이라 훅 1곳에서 화면 무관 계측, /prepare 선-거부까지 포착)
    - 원천 데이터(랜드마크·프레임)는 파라미터에 안 넣음 — 집계 수치만(`track()` 래퍼 주석 원칙 준수). 로컬(`next dev`)·GA_ID 없으면 무동작
  - ⚠️ 프라이버시: 포즈 랜드마크·프레임·영상 등 카메라 원천 데이터는 GA에 **절대 전송 금지**(집계 수치만). "영상은 기기 안에서만" 약속과 일관
- [x] **검색 등록·메타데이터** — 도메인 `formbwa.site`(가비아·Vercel 연결). **코드**: `app/layout` 메타데이터 실화(title/description/`metadataBase`)·OG/트위터 카드(`app/opengraph-image.png`·`twitter-image.png`, 1200×624)·`app/robots.ts`(플로우 prepare/workout/summary 제외)·`app/sitemap.ts`(`/`·`/routine`·`/start`)·`metadata.verification.other`(네이버, env `NAVER_SITE_VERIFICATION`)·`shared/config/site.ts`(SITE_URL 단일화). 검증기간에도 index 노출.
  - **소유확인·제출 완료**: ✅ Google Search Console(가비아 DNS TXT 도메인 속성) + 사이트맵 제출. ✅ 네이버 서치어드바이저(HTML 태그, env 주입+재배포) + 사이트맵 제출.
  - **도메인 정규화 = apex(`formbwa.site`) 단일** — Vercel에서 apex를 Primary로, `www`→apex 308. 서빙 호스트 = `metadata.canonical`·sitemap·robots `host`·`SITE_URL`이 전부 apex로 일치(검증 완료). ⚠️ 한때 Vercel이 반대(apex→www)로 드리프트해 정규 신호가 모순됐던 걸 재정렬함
  - **파비콘**: `app/favicon.ico`(256² ico) apex에서 200 직접 응답 = 정상. 구글 검색결과에 지구본이 떴던 건 위 정규 호스트 드리프트 + 신규 도메인 반영 지연 탓 — 방향 재정렬 후 Search Console 재크롤 요청, SERP 아이콘 반영은 수일~수주 대기(선택: `app/icon.svg`를 `Logo.svg`로 추가해 탭 아이콘 선명화)
  - **구조화 데이터(JSON-LD)**: `shared/config/jsonLd.ts` + 서버 컴포넌트 `shared/ui/json-ld`(`<script type="application/ld+json">`, `<` 이스케이프). 전역 `Organization`+`WebSite`(layout), 랜딩 `SoftwareApplication`(page, `HealthApplication`/`offers` 무료). **정직 원칙: 리뷰 0이라 aggregateRating(별점) 미포함**(조작=스팸 정책). Product/HowTo/FAQ는 비적합·구글 리치결과 폐지로 제외. 목적은 리치 스니펫이 아니라 **엔티티·AI 검색 인용**. `Organization.logo` = `public/logo.svg`(=`Logo.svg` 복사, 크롤 가능 URL). 빌드 산출 HTML에 3종 서버 렌더 검증. 배포 후 **Rich Results Test/Schema validator**로 확인
  - 참고: 색인 반영은 크롤링 대기(수일). 정식 동의 배너·개인정보처리방침은 M11
- [ ] **검증 지표(단독 기준)** — 판정 정확도(오탐/미탐 체감)·세트 완주 경험·주관적 "봐주는 느낌" 자기평가 중심. GA4는 본인 세션 퍼널(완료율·이탈 지점) 참고용(표본 1이라 통계보다 정성 관찰). (PRD §8도 단독 기준으로 정정 완료 — 판정 신뢰성·완주 경험·주관 만족)
- [ ] **go/no-go 결정(본인 판단)**: 코칭이 실제로 쓸 만한가 → 2단계 착수 / 미흡하면 판정·UX 개선 반복

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

- [~] 도메인 구입 + web/api 서브도메인 DNS 구성 (쿠키 공유 전제조건) — **web은 1단계에서 선행 완료**(가비아 구입 → Vercel 연결, www→apex). **남음**: `api.` 서브도메인 DNS + 쿠키 공유 설정(EC2·인증 붙는 이 마일스톤에서)
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
- [ ] 개인정보처리방침, 이용약관 페이지 (카메라 미전송 + **GA4 분석 사용 고지** 한 줄). **정식 동의 배너는 생략** — 한국어 전용/first-party 집계 GA(광고 개인화/원천 데이터 전송 없음, GA4 기본 IP 미저장)라 GDPR/PIPA 어느 쪽도 블로킹 배너를 강제하지 않음. EU 트래픽/행동 광고/규모 확대 시 재검토
- [ ] 최소 모니터링 — uptime 체크 + 에러 알림 (무료 티어)
- [ ] E2E: 로그인 → 운동 → 저장 → 리포트 플로우 Playwright 1본

## 3단계 — 리텐션 (착수 시 상세화)

개요: 대시보드·스트릭 (F3-1, F3-2) → 종목 추가: core FSM 확장 (F3-3) → 캐릭터 추가 (F3-4) → 모바일 브라우저 최적화 → **오운완 공유 페이지 (F3-5)**: 세트 리포트 공유 링크 `/r/:id`, SSR + 동적 OG 이미지 + 메타태그 (바이럴 루프 + SSR/SEO 경험 확보)

## 4단계 — RN 앱·수익화 (착수 시 상세화)

개요: RN 기술 스파이크 1주 (vision-camera + tflite PoC) → `/auth/google/token` 엔드포인트 추가 (TRD-BE §4 — 인증 재작업 없음) → apps/mobile 구축 → 웹 결제 → 스토어 출시 (F4-1~3)

---

완료 기록: 각 항목 완료 시 체크 + 배운 것(특히 판정 튜닝 관련)은 커밋 메시지나 이 문서 하단에 짧게 남긴다. (`[x]` 완료 · `[~]` 부분 완료 · `[ ]` 미착수)
