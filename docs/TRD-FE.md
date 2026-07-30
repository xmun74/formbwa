# TRD-FE — 폼봐 (formbwa)

> FE 기술명세서. 웹 클라이언트(apps/web)와 코어 엔진(packages/core)의 구현을 정의한다.
>
> 관련 문서: 제품 요구사항(F-ID)은 [PRD.md](./PRD.md), 서버·인증·DB·배포는 [TRD-BE.md](./TRD-BE.md), 작업 분해는 [TASKS.md](./TASKS.md) 참조.

## 1. 원칙

1. **온디바이스 추론**: 포즈 인식·판정·음성 재생은 전부 브라우저에서 실행. 영상 프레임은 기기 밖으로 나가지 않는다
2. **코어 엔진 격리**: 판정 로직은 프레임워크 무관 순수 TS(`packages/core`). 웹 → RN 전환 시 그대로 재사용
3. **실시간 교정은 사전 mp3, 가변 요소만 런타임 TTS**: 교정·칭찬 멘트는 사전 생성 mp3 정적 서빙 — 판정→재생 지연 300ms(§9), 사투리 품질 게이트(PRD §12), 오프라인 때문. **이름 등 사전 녹음이 불가능한 임의 문자열만** 런타임 TTS 허용하되, 비-실시간 시점(세트 경계)에서 미리 합성·캐싱해 실시간 루프에는 넣지 않는다. (T맵도 동일 — 고정 문구=성우 녹음, 지명=온디바이스 TTS)
4. **런타임 3D 렌더 없음**: 코치 시범(PRD F1-8)은 **사전 렌더된 영상(mp4)** 정적 서빙. 라이브로 리깅 3D를 돌리면 추론 프레임 예산을 잠식한다(§9). 영상 디코드는 하드웨어 가속이라 추론과 병렬로 돌아도 안전하다
5. **주 타깃 환경**: 데스크톱/노트북 브라우저 (1단계). 모바일 브라우저 최적화는 3단계

```
카메라(getUserMedia)
 → MediaPipe tasks-vision (WASM/WebGL 추론)
 → @repo/core: 각도 계산 → FSM → 판정 이벤트 → 멘트 선택
 → mp3 재생 + Canvas 오버레이
 → [병렬·독립] 코치 시범 mp4 루프 재생 (판정과 동기화하지 않음)
 → 세트 종료 시 수치 JSON만 API로 전송 (TRD-BE §6)
```

## 2. 기술 스택

| 레이어            | 선택                                                                               | 비고                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core              | React 19, TypeScript 6.x (strict)                                                  | 모노레포 전 워크스페이스 동일 버전 유지. TS 7(네이티브 포트)은 `typescript-eslint` 미지원(peer `<6.1.0`)이라 보류                                       |
| 프레임워크        | Next.js (App Router)                                                               | 서버 기능 최소 사용 — 라우팅·정적 서빙·OG 중심                                                                                                          |
| 폴더 구조         | FSD (Feature-Sliced Design)                                                        | §3                                                                                                                                                      |
| 스타일            | Tailwind CSS 4                                                                     | CSS-first config. `globals.css`는 `@repo/design-tokens/theme.css`를 `@import`                                                                           |
| 디자인 토큰       | `@repo/design-tokens` (패키지)                                                     | 색·간격·타이포(티셔츠)·radius를 플랫폼 중립 TS로 단일화(primitive→semantic 2계층) → 생성기가 Tailwind `@theme` CSS 방출. RN 대비 초기 분리              |
| 디자인 시스템     | `@repo/ui` (패키지)                                                                | **tailwind-variants(+slots) + `cn`(clsx+tailwind-merge)**. named-export 합성(RSC-safe), 상호작용 합성(닷 노테이션). 규약은 `packages/ui/CONVENTIONS.md` |
| 서버 상태         | TanStack Query v5                                                                  | 기록/리포트 fetch·mutation                                                                                                                              |
| 클라이언트 상태   | Zustand                                                                            | 운동 상태머신 미러링. RN에서도 동일 사용                                                                                                                |
| HTTP              | Axios                                                                              | 401 → refresh 재시도 인터셉터 (§7)                                                                                                                      |
| 스키마 검증       | Zod                                                                                | API 응답 검증. 폼 도입 시 React Hook Form과 병행                                                                                                        |
| 포즈 추론         | `@mediapipe/tasks-vision`                                                          | `'use client'` + dynamic import (SSR 제외)                                                                                                              |
| 오버레이          | Canvas 2D                                                                          |                                                                                                                                                         |
| 음성 재생         | 사전 생성 mp3 프리로드                                                             | 제작 파이프라인은 §6.1, 폴백: Web Speech API                                                                                                            |
| 시범 영상         | HTML5 `<video loop muted playsinline>` (사전 렌더 mp4)                             | 라이브 3D 아님 — §1·§6.2. 프로그레시브 재생                                                                                                             |
| UI 문서화         | Storybook (`@repo/ui` 소유)                                                        | `@storybook/react-vite`(DS는 순수 React) + Tailwind 자립. 전 컴포넌트 autodocs + 합성 4종 MDX. 디자인시스템 배포: https://ds.formbwa.site               |
| 차트              | recharts                                                                           | 3단계                                                                                                                                                   |
| 테스트            | Vitest — core(fixture 회귀) + `@repo/ui`(Testing Library, jsdom) + Playwright(E2E) | `@repo/ui`는 상호작용·a11y 컴포넌트 테스트. E2E는 `--use-fake-device-for-media-stream`으로 카메라 대체                                                  |
| Lint/Format       | ESLint + Prettier                                                                  | 공유 설정은 `packages/eslint-config`                                                                                                                    |
| FSD 아키텍처 린트 | Steiger                                                                            | FSD 레이어·슬라이스 규칙 자동 검사 (§3)                                                                                                                 |
| Git hooks         | Husky + lint-staged                                                                | pre-commit: 변경 파일만 lint+format                                                                                                                     |
| 커밋 규칙         | commitlint (Conventional Commits)                                                  | commit-msg 훅. `feat(core): ...` 형식                                                                                                                   |
| 모노레포          | Turborepo + pnpm workspaces                                                        |                                                                                                                                                         |
| CI/CD             | GitHub Actions + Vercel                                                            | CI에서 lint·steiger·test 재검증 (훅 우회 대비)                                                                                                          |

## 3. 폴더 구조 — FSD

FSD 공식 v2.1의 **"Start simple, extract when needed"** 원칙을 따른다. 공식 문서는 `app` + `pages` + `shared` 최소 구성을 **완전한 FSD로 인정**하며, `widgets`·`features`·`entities`는 "명확한 가치가 있을 때만" 추가하고 *"just in case"로 빈 레이어 폴더를 만들지 말 것*을 명시한다. 레이어를 미리 파놓는 것은 근거 없는 추상화이므로 하지 않는다.

### 3.1 현재 구성 (1단계)

```
apps/web/src/
├── app/          # Next.js 라우팅 + FSD app 레이어 (얇게 유지, 로직 금지)
│   ├── page.tsx             # /          → views/intro
│   ├── exercises/page.tsx   # /exercises → views/exercise-list (운동 목록)
│   ├── start/page.tsx       # /start     → views/workout-setup (닉네임+코치)
│   ├── prepare/page.tsx     # /prepare   → views/prepare (배치·캘리브)
│   ├── workout/page.tsx     # /workout   → views/workout (운동)
│   └── summary/page.tsx     # /summary   → views/summary (요약)
├── views/        # FSD pages 레이어 (Next 예약어 충돌로 views 명명)
└── shared/       # 앱 전용 ui/lib/api/config (토큰=@repo/design-tokens, 컴포넌트=@repo/ui 패키지)
```

| 레이어    | 역할                                           | 슬라이스 예시                                                                                         |
| --------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `app/`    | 라우팅, 전역 프로바이더(TanStack Query 등)     | 6라우트 `/`·`/exercises`·`/start`·`/prepare`·`/workout`·`/summary` → 각 view 위임                     |
| `views/`  | 화면 조립 + **그 화면 전용** 로직·상태·UI 블록 | `intro`, `exercise-list`, `workout-setup`, `prepare`, `workout`, `summary`                            |
| `shared/` | 앱 전용 ui/lib/api/config (비즈니스 로직 금지) | `shared/api`(Axios), `shared/ui`(앱 셸: header/footer/app-shell). 재사용 컴포넌트는 `@repo/ui` 패키지 |

### 3.2 하위 레이어 승격 기준

`widgets`·`features`·`entities`는 **2곳 이상에서 실제로 재사용이 확인될 때만** 만든다. 그 전까지는 사용처 view 안에 둔다 (공식 Golden Rule: _"When in doubt, keep it in pages"_).

| 레이어      | 승격 조건                                 | 1단계 판정                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `widgets/`  | 2개 이상 view에서 재사용되는 대형 UI 블록 | **없음** — `camera-stage`·`demo-video`는 `views/prepare`·`views/workout` 전용. 공용 셸(`app-shell`·`site-header`·`exit-button`)은 `shared/ui`                                                                                                                                                                                                                                                              |
| `features/` | 2개 이상에서 재사용되는 사용자 행동       | **없음** — `pose-tracking`·`calibration`·`voice-feedback`은 `views/prepare`·`views/workout` 전용                                                                                                                                                                                                                                                                                                           |
| `entities/` | 2개 이상에서 공유되는 도메인 모델         | **`workout` 후보** — 이번 운동의 도메인 값(닉네임·선택 코치·선택 종목·세트 결과)을 `/workout`·`/summary`가 공유하며 **localStorage 영속**. 모델·오디오는 도메인이 아니라 인프라라 **`shared/lib`로 분리**(§9.1). **현재는 목 상수를 `shared/config/workout.ts`에 두었고**(steiger가 `@/` 별칭 참조를 못 세 insignificant-slice 오탐), 상태를 갖는 순간 `entities/workout`(Zustand persist)로 승격한다 (M2) |

- **라우트 걸친 상태는 view 밖에 — 성격이 다른 둘을 슬라이스로도 나눈다.**
  - **`entities/workout` (도메인·선택값) = localStorage 영속.** 닉네임·선택 코치·선택 종목·세트 결과. 전부 직렬화 가능하니 `persist`로 통째 저장 — **인메모리 store는 새로고침에 사라져 "새로고침해도 단계 유지"를 못 한다.** (닉네임은 개인정보라 URL 금지 — localStorage만)
  - **`shared/lib` (인프라·리소스) = 인메모리.** MediaPipe 모델·오디오 매니페스트는 도메인이 아니라 무거운 런타임 리소스라 entities에 섞지 않는다. 프리로드 훅/스토어로 라우트 전환엔 유지, **새로고침 시엔 재프리로드**(재다운로드 캐시 성격이라 잃어도 됨). 모델을 entity와 분리했으므로 `partialize`로 골라낼 필요가 없다
  - view 안에 두면 라우트 이동 시 잃는다
- 승격은 파일 이동이라 비용이 낮다. 반대로 미리 만든 레이어는 되돌릴 계기가 없어 그대로 굳는다
- Steiger의 `insignificant-slice` 규칙이 단일 사용처 슬라이스를 지적한다 — 이 기준의 자동 집행자
- 2단계 이후(`record`, `save-record`, `dashboard`) 항목도 같은 기준으로 착수 시점에 판정한다

### 3.3 규칙

- import 방향: **상위 → 하위 단방향** (app → views → widgets → features → entities → shared). **Steiger**(FSD 공식 린터)로 레이어·슬라이스 규칙 검사, eslint boundaries 병행 — pre-commit(lint-staged)과 CI 양쪽에서 강제
- `packages/core`는 FSD 외부 패키지 — 실사용처는 포즈 파이프라인(§4)과 운동 상태로 한정
- RN 앱(4단계)도 동일 원칙 적용 — 재사용하는 것은 레이어 목록이 아니라 **"필요할 때 승격"이라는 기준** 자체

## 4. 포즈 파이프라인 (`views/prepare`·`views/workout` — 재사용 확인 시 `features/pose-tracking`으로 승격, §3.2)

- 모델: `pose_landmarker_lite.task`, `runningMode: 'VIDEO'`
- 렌더링 rAF(60fps)와 추론(15~24fps 스로틀) 분리
- 랜드마크 visibility 임계값 미달 프레임은 판정 제외
- 캘리브레이션: 시작 시 기립 자세 3초 → 사용자별 기준 각도·비율 저장 (원근 보정)
- 카메라 가이드: 노트북 웹캠 기준 측면 45° 배치 안내, 전신 바운딩 박스 확인 후 시작 허용
- **라우트 분리 + 준비 단계 내부 상태**: 준비(`/prepare`) → 운동(`/workout`) → 요약(`/summary`)을 **별도 라우트**로 둔다(밝은 준비·몰입 다크 운동·밝은 결과는 성격이 달라). 단 `/prepare` 안에서는 `placement`(배치) → `calibration`(3초)를 **내부 2상태 전환**으로 하고, 완료 시 `/workout`으로 이동한다. 라우트 간 상태(선택 코치·세트 결과)는 `entities/workout` store(§3.2)로 유지
- **이탈 가드**: 다크 화면(`/prepare`·`/workout`)에서 운동 중단은 화면 내 [✕ 그만두기] 버튼으로 (→ `/exercises`). 뒤로가기·새로고침·탭 닫기 방어(`beforeunload` + 뒤로가기 가로채 "그만두시겠어요?")는 M2에서 추가

## 5. 코어 엔진 (packages/core)

### 5.1 모듈 구성

```
core/
├── angle.ts       # 3관절 각도 계산 (atan2), 좌표 정규화
├── squat-fsm.ts   # 상태머신: STANDING → DESCENDING → BOTTOM → ASCENDING → (count++)
├── judge.ts       # 프레임별 판정 → JudgeEvent 발행
├── coach.ts       # JudgeEvent → 캐릭터별 멘트 키 선택 (쿨다운·우선순위)
└── types.ts       # RepMetric 등 — BE와 공유되는 타입의 원본
```

규칙: `react`, `next`, DOM API import 금지 (`no-restricted-imports`로 CI 강제).

### 5.2 핵심 인터페이스

```ts
interface PoseFrame {
  landmarks: { x: number; y: number; z: number; visibility: number }[]; // 33개
  timestampMs: number;
}

type JudgeEventType =
  | "rep_counted"
  | "knee_shallow" // 깊이 부족
  | "back_bent" // 허리 굽음
  | "knee_over_toe" // 무릎 전방 이탈
  | "good_rep"
  | "tempo_too_fast";

interface JudgeEvent {
  type: JudgeEventType;
  confidence: number; // 임계값 미만이면 coach가 무시 (침묵 정책)
  repIndex: number;
}

interface CoachDecision {
  clipKey: string | null; // 재생할 mp3 키. null = 침묵
}
```

### 5.3 판정 정책 (기본값 — 튜닝 대상)

- **precision 우선**: `confidence < 0.8`이면 발화하지 않음 (오탐 교정은 침묵보다 나쁨 — 근거는 PRD)
- 판정은 절대 각도가 아닌 **캘리브레이션 대비 상대값**
- **시범 영상과 완전 분리**: 판정은 코치 시범과 프레임 비교를 하지 않는다. FSM이 **내 스쿼트 1회**를 스스로 잡아(STANDING→…→count) 그 1회를 규칙으로 판정한다. 따라서 **선생님과 템포가 달라도 정확**하다 — "동기화"라는 어려운 문제를 설계로 회피 (PRD §4-4)
- 템포도 선생님 대비가 아니라 **내 절대 속도** 기준: `tempo_too_fast`는 "선생님보다 빠르다"가 아니라 "반동으로 튕기듯 급강하"를 잡는다 (부상 위험)
- 멘트 정책: 쿨다운 4초, 동일 이벤트 연속 발화 금지, 우선순위 back_bent > knee_over_toe > knee_shallow
- **입문자 그레이스**: 세트 초반(첫 1~2회)은 판정을 유예하거나 느슨하게 — 동작을 익히기 전에 지적이 쏟아지면 이탈한다 (PRD §8 "거슬리는 오작동 0" 완주 경험과 직결). 튜닝 대상

### 5.4 회귀 테스트

- 스쿼트 영상(정상/불량)에서 추출한 랜드마크 시퀀스를 JSON fixture로 저장
- fixture 입력 → 기대 이벤트 출력 스냅샷 테스트 (Vitest). 판정 튜닝 시 회귀 방지
- fixture 세트가 핵심 자산 — 튜닝 노하우가 코드+fixture로 축적
- **시너지**: 정상 스쿼트 촬영본은 (1) 이 fixture의 "정상" 기준 + (2) 코치 시범 영상의 모캡 소스로 **이중 사용** (§6.2). 촬영은 한 번

## 6. 코치 에셋 파이프라인 (음성 · 시범 영상)

음성과 시범 영상 모두 **오프라인 사전 제작 → 정적 서빙**이다. 런타임에 TTS도 3D 렌더도 하지 않는다(§1). 둘 다 캐릭터당·종목당 에셋이라 "1개월 구독 → 일괄 제작 → 해지" 패턴을 공유한다.

### 6.1 음성 (mp3)

- 빌드 타임: 멘트 스크립트(캐릭터 2종 × 이벤트별 변형 ~30개, 한국어) → **ElevenLabs Starter($5) 1개월 구독**으로 mp3 일괄 생성 → `public/audio/{coachId}/{clipKey}.mp3` → 해지
- **선행 검증**: 부산 사투리 품질을 1단계 초기에 테스트. 미달 시 캐릭터 교체 (PRD §12)
- 매니페스트 JSON으로 clipKey ↔ 파일 매핑, 전체 프리로드 (캐릭터당 2MB 이내). **캐릭터 선택 시점에 시작** — 그 전엔 무엇을 받을지 모른다 (§9.1)
- 캐릭터 이름·성격·clipKey는 매니페스트에서 읽는다. **하드코딩 금지** — PRD §12의 사투리 게이트에서 캐릭터가 교체될 수 있다
- 재생: 단일 Audio 채널. 우선순위 높은 이벤트만 교체 재생, 나머지 폐기
- 무료 티어 사용 금지 (상업적 이용 불가 약관)

**닉네임 호명 (PRD F1-9)** — 이름은 임의 문자열이라 사전 mp3로 못 만든다. 두 층으로 나눈다:

- **자막**: 운동 중 교정·칭찬 자막에 이름을 얹는다 (`"민수님, 무릎 굽혀요"`). 텍스트라 비용·지연 0 — 눈으로는 항상 개인화됨
- **음성 호명**: 세트 시작/끝 등 **비-실시간 시점에만** 런타임 TTS (`"민수님, 시작할게요"`). 타이밍이 급하지 않으므로 300ms 예산과 무관. **세트 시작 전에 미리 합성해 캐싱** → 재생 시점엔 지연 0. 실시간 교정 루프(§5)에는 절대 넣지 않는다
- 이름 음성은 캐릭터 목소리와 억양이 어긋날 수 있다 — 1단계는 단순 호명만. 품질 개선(음절 유닛 조합 등)은 후순위

### 6.2 시범 영상 (PRD F1-8)

따라 하기용 종목별 루프 영상. **사람과 같은 관절 비율의 인체 + 캐릭터 얼굴** — 비율이 왜곡되면(치비형 등) 따라 하는 사용자가 잘못된 각도를 학습하므로, 인체 비율은 미적 취향이 아니라 **기능 요구사항**이다.

- 제작 (오프라인, mp3와 같은 구독→일괄→해지):
  1. 올바른 스쿼트 촬영 (본인/지인) — **§5.4 fixture 촬영과 겸용**
  2. 마커리스 모캡: 영상 → 3D 관절 애니메이션 (동작이 사람에게서 나오므로 비율·각도가 자연히 정확)
  3. 인체 비율 캐릭터 리그에 리타겟 (얼굴 = 선택한 코치)
  4. 배경 포함 렌더 → mp4 루프
- 도구 조합 (전부 무료·상업 가능하게): 인체 베이스 **MakeHuman(CC0)**, 동작 모캡(무료 티어 **비상업 주의** — Meshy·ElevenLabs와 같은 함정), 조립·렌더 **Blender**
- **투명 영상을 쓰지 않는다** — WebM/HEVC alpha는 브라우저 호환(Safari VP9 alpha 미지원)과 깜빡임 문제가 있다. 카메라 옆 나란히 배치라 **단색/스튜디오 배경**으로 충분
- 동기화 안 함: 시범은 기준 템포로 루프, 판정은 사용자 자세로 독립 (§5는 시범과 무관하게 동작)
- 캐릭터 확정(PRD §12) 전엔 **플레이스홀더** — 매니페스트에서 경로를 읽어 교체 비용 0

## 7. 인증 — 클라이언트 측

인증 소유자는 BE (TRD-BE 인증 설계 참조). FE가 하는 일:

- 로그인 버튼 → `api.도메인/auth/google`로 이동 (리다이렉트 플로우)
- 토큰은 httpOnly 쿠키(Domain=`.서비스도메인`)라 JS에서 접근하지 않음 — XSS 노출면 없음
- Axios 인터셉터: 401 응답 시 `/auth/refresh` 1회 재시도 → 실패 시 로그인 화면
- 게스트: 운동 전 기능 비로그인 사용. **기록 저장 시점에만** 로그인 유도

## 8. 개인정보 구현 원칙 (FE)

- 영상 프레임의 네트워크 전송 코드를 만들지 않음 (코드 리뷰 체크리스트)
- 얼굴 인식·식별 기능 미구현 — 랜드마크는 익명 좌표로만 사용
- 카메라 권한 요청 직전 처리 방식 고지 UI
- 에러 리포팅에 프레임 데이터 포함 금지
- 코치 시범 영상은 앱 포함 에셋 — 사용자 영상과 별개다 (송신 코드 없음 원칙에 영향 없음)

## 9. 성능 예산 (데스크톱/노트북 기준)

| 항목                         | 목표                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 추론                         | 20fps 이상 (미들급 노트북)                                                                                        |
| 판정→음성 재생 지연          | 300ms 이내                                                                                                        |
| 초기 로드 (모델+WASM+오디오) | 5초 이내, 랜딩에서 은폐 (§9.1)                                                                                    |
| 오디오 총량                  | 캐릭터당 2MB 이내                                                                                                 |
| 시범 영상                    | 하드웨어 디코드라 추론과 병렬 가능 — **라이브 3D 렌더는 금지**(§1). mp4는 프로그레시브 재생, 전체 프리로드 불필요 |

모바일 브라우저는 1단계 "동작 보장"만. 3단계에서 15fps 목표로 격상.

### 9.1 프리로드 전략 — 라우트에 걸쳐 은폐

라우트 체인(`/` → `/exercises` → `/start` → `/prepare` → `/workout` → `/summary`)이 로딩을 은폐하는 장치다. 사용자가 인트로를 읽고 운동·코치를 고르는 시간이 곧 다운로드 시간이 된다. **핵심 전제: 프리로드한 모델은 라우트가 바뀌어도 유지돼야 한다** — `shared/lib`의 **인메모리** 프리로드 훅/스토어에 인스턴스를 두면 Next SPA 특성상 라우트 전환에도 메모리에 남는다(모델은 도메인이 아니라 인프라라 entity와 분리 — §3.2). view 안에 두면 `/prepare`·`/workout` 진입 시 다시 받게 된다.

- **모델은 새로고침 시 재프리로드**(인메모리라 사라짐 — 재다운로드 캐시 성격이라 무방). 반면 **닉네임·종목·코치 선택값은 `entities/workout`의 localStorage 영속**(§3.2)이라 새로고침에도 단계가 유지된다. 즉 "새로고침 유지"의 주체는 인메모리가 아니라 **localStorage**다

| 시점                        | 대상                  | 이유                                                                                                 |
| --------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| **`/` 인트로 진입 즉시**    | MediaPipe 모델 + WASM | 종목·캐릭터와 무관하므로 기다릴 이유가 없다. 인트로·운동 목록 보는 동안 받는다                       |
| **`/start` 캐릭터 선택 시** | 해당 캐릭터 mp3 (2MB) | 선택 전엔 무엇을 받을지 모른다 (§6.1)                                                                |
| **`/workout` 진입 시**      | 코치 시범 mp4         | 프로그레시브 스트리밍 — 전체 프리로드 없이 첫 프레임부터 재생. mp3보다 커서 미리 다 받을 이유가 없다 |

- 카메라 권한은 **`/start`의 "운동 시작" → `/prepare` 진입 시점에** 받는다 — 배치 화면(`/prepare`)이 첫 카메라 화면이다. 권한은 오리진 단위로 브라우저가 기억하므로 이후 `/workout`의 `getUserMedia`는 프롬프트 없이 통과한다
- 고지 UI는 권한 요청 **직전**(§8) — `/start`의 "운동 시작" 버튼 바로 위. 푸터에 두면 요건 미충족

## 10. RN 앱 계획 (4단계)

- `apps/mobile`: React Native (Expo dev build). Capacitor 생략, 직행
- 카메라/추론: `react-native-vision-camera` Frame Processor + `react-native-fast-tflite` (BlazePose/MoveNet .tflite)
- `@repo/core` 재사용 + FSD 레이어 원칙(§3.2 승격 기준) 동일 적용 — 재구축 범위는 카메라·추론·렌더·UI
- 착수 전 **기술 스파이크 1주**: 파이프라인 PoC로 성능·안정성 확인 (커뮤니티 라이브러리 성숙도 리스크)
- 개시 조건: 웹 리텐션 지표 달성 (PRD §8)
- 인증: BE의 `/auth/google/token` 사용 — FE 재작업 없음 (TRD-BE 참조)

## 11. 배포

- Vercel
- 커스텀 도메인의 web 서브도메인 사용 (쿠키 공유 요건 — TRD-BE 참조)
