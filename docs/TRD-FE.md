# TRD-FE — 폼봐 (formbwa)

> FE 기술명세서. 웹 클라이언트(apps/web)와 코어 엔진(packages/core)의 구현을 정의한다.
>
> 관련 문서: 제품 요구사항(F-ID)은 [PRD.md](./PRD.md), 서버·인증·DB·배포는 [TRD-BE.md](./TRD-BE.md), 작업 분해는 [TASKS.md](./TASKS.md) 참조.

## 1. 원칙

1. **온디바이스 추론**: 포즈 인식·판정·음성 재생은 전부 브라우저에서 실행. 영상 프레임은 기기 밖으로 나가지 않는다
2. **코어 엔진 격리**: 판정 로직은 프레임워크 무관 순수 TS(`packages/core`). 웹 → RN 전환 시 그대로 재사용
3. **런타임 TTS 호출 없음**: 실시간 멘트는 사전 생성된 mp3 정적 서빙
4. **주 타깃 환경**: 데스크톱/노트북 브라우저 (1단계). 모바일 브라우저 최적화는 3단계

```
카메라(getUserMedia)
 → MediaPipe tasks-vision (WASM/WebGL 추론)
 → @repo/core: 각도 계산 → FSM → 판정 이벤트 → 멘트 선택
 → mp3 재생 + Canvas 오버레이
 → 세트 종료 시 수치 JSON만 API로 전송 (TRD-BE §6)
```

## 2. 기술 스택

| 레이어 | 선택 | 비고 |
|---|---|---|
| Core | React 19, TypeScript 5.x (strict) | |
| 프레임워크 | Next.js (App Router) | 서버 기능 최소 사용 — 라우팅·정적 서빙·OG 중심 |
| 폴더 구조 | FSD (Feature-Sliced Design) | §3 |
| 스타일 | Tailwind CSS 4 | CSS-first config, apps/web 내부에만 |
| 서버 상태 | TanStack Query v5 | 기록/리포트 fetch·mutation |
| 클라이언트 상태 | Zustand | 세션 상태머신 미러링. RN에서도 동일 사용 |
| HTTP | Axios | 401 → refresh 재시도 인터셉터 (§7) |
| 스키마 검증 | Zod | API 응답 검증. 폼 도입 시 React Hook Form과 병행 |
| 포즈 추론 | `@mediapipe/tasks-vision` | `'use client'` + dynamic import (SSR 제외) |
| 오버레이 | Canvas 2D | |
| 음성 재생 | 사전 생성 mp3 프리로드 | 제작 파이프라인은 §6, 폴백: Web Speech API |
| UI 문서화 | Storybook | widgets/shared 컴포넌트 대상 |
| 차트 | recharts | 3단계 |
| 테스트 | Vitest (core fixture 회귀) + Playwright (E2E) | E2E는 `--use-fake-device-for-media-stream` 플래그로 카메라 대체 |
| Lint/Format | ESLint + Prettier | 공유 설정은 `packages/eslint-config` |
| FSD 아키텍처 린트 | Steiger | FSD 레이어·슬라이스 규칙 자동 검사 (§3) |
| Git hooks | Husky + lint-staged | pre-commit: 변경 파일만 lint+format |
| 커밋 규칙 | commitlint (Conventional Commits) | commit-msg 훅. `feat(core): ...` 형식 |
| 모노레포 | Turborepo + pnpm workspaces | |
| CI/CD | GitHub Actions + Vercel | CI에서 lint·steiger·test 재검증 (훅 우회 대비) |

## 3. 폴더 구조 — FSD

```
apps/web/src/
├── app/          # Next.js 라우팅 + FSD app 레이어 (얇게 유지, 로직 금지)
├── views/        # FSD pages 레이어 (Next 예약어 충돌로 views 명명)
├── widgets/
├── features/
├── entities/
└── shared/
```

| 레이어 | 역할 | 슬라이스 예시 |
|---|---|---|
| `app/` | 라우팅, 전역 프로바이더(TanStack Query 등) | `app/workout/page.tsx` → views 위임 |
| `views/` | 화면 조립 | `workout`, `coach-select`, `dashboard`, `report` |
| `widgets/` | 독립 UI 블록 | `camera-stage`, `set-summary`, `streak-calendar` |
| `features/` | 사용자 행동 단위 | `calibration`, `pose-tracking`, `voice-feedback`, `save-record` |
| `entities/` | 도메인 모델·상태 | `session`(Zustand), `coach`(캐릭터·멘트 매니페스트), `record` |
| `shared/` | 공용 ui/lib/api/config | `shared/api`(Axios 인스턴스), `shared/ui` |

- import 방향: **상위 → 하위 단방향** (app → views → widgets → features → entities → shared). **Steiger**(FSD 공식 린터)로 레이어·슬라이스 규칙 검사, eslint boundaries 병행 — pre-commit(lint-staged)과 CI 양쪽에서 강제
- `packages/core`는 FSD 외부 패키지 — 실사용처는 `features/pose-tracking`·`entities/session`으로 한정
- RN 앱(4단계)도 동일 FSD 레이어 구조 사용

## 4. 포즈 파이프라인 (`features/pose-tracking`)

- 모델: `pose_landmarker_lite.task`, `runningMode: 'VIDEO'`
- 렌더링 rAF(60fps)와 추론(15~24fps 스로틀) 분리
- 랜드마크 visibility 임계값 미달 프레임은 판정 제외
- 캘리브레이션: 시작 시 기립 자세 3초 → 사용자별 기준 각도·비율 저장 (원근 보정)
- 카메라 가이드: 노트북 웹캠 기준 측면 45° 배치 안내, 전신 바운딩 박스 확인 후 시작 허용

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
  | 'rep_counted'
  | 'knee_shallow'      // 깊이 부족
  | 'back_bent'         // 허리 굽음
  | 'knee_over_toe'     // 무릎 전방 이탈
  | 'good_rep'
  | 'tempo_too_fast';

interface JudgeEvent {
  type: JudgeEventType;
  confidence: number;   // 임계값 미만이면 coach가 무시 (침묵 정책)
  repIndex: number;
}

interface CoachDecision {
  clipKey: string | null;  // 재생할 mp3 키. null = 침묵
}
```

### 5.3 판정 정책 (기본값 — 튜닝 대상)

- **precision 우선**: `confidence < 0.8`이면 발화하지 않음 (오탐 교정은 침묵보다 나쁨 — 근거는 PRD)
- 판정은 절대 각도가 아닌 **캘리브레이션 대비 상대값**
- 멘트 정책: 쿨다운 4초, 동일 이벤트 연속 발화 금지, 우선순위 back_bent > knee_over_toe > knee_shallow

### 5.4 회귀 테스트

- 스쿼트 영상(정상/불량)에서 추출한 랜드마크 시퀀스를 JSON fixture로 저장
- fixture 입력 → 기대 이벤트 출력 스냅샷 테스트 (Vitest). 판정 튜닝 시 회귀 방지
- fixture 세트가 핵심 자산 — 튜닝 노하우가 코드+fixture로 축적

## 6. 음성 파이프라인

- 빌드 타임: 멘트 스크립트(캐릭터 2종 × 이벤트별 변형 ~30개, 한국어) → **ElevenLabs Starter($5) 1개월 구독**으로 mp3 일괄 생성 → `public/audio/{coachId}/{clipKey}.mp3` → 해지
- **선행 검증**: 부산 사투리 품질을 1단계 초기에 테스트. 미달 시 캐릭터 교체 (PRD §12)
- 매니페스트 JSON으로 clipKey ↔ 파일 매핑, 세션 시작 시 전체 프리로드 (캐릭터당 2MB 이내)
- 재생: 단일 Audio 채널. 우선순위 높은 이벤트만 교체 재생, 나머지 폐기
- 무료 티어 사용 금지 (상업적 이용 불가 약관)

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

## 9. 성능 예산 (데스크톱/노트북 기준)

| 항목 | 목표 |
|---|---|
| 추론 | 20fps 이상 (미들급 노트북) |
| 판정→음성 재생 지연 | 300ms 이내 |
| 초기 로드 (모델+WASM+오디오) | 5초 이내, 로딩 중 카메라 가이드 화면으로 체감 최소화 |
| 오디오 총량 | 캐릭터당 2MB 이내 |

모바일 브라우저는 1단계 "동작 보장"만. 3단계에서 15fps 목표로 격상.

## 10. RN 앱 계획 (4단계)

- `apps/mobile`: React Native (Expo dev build). Capacitor 생략, 직행
- 카메라/추론: `react-native-vision-camera` Frame Processor + `react-native-fast-tflite` (BlazePose/MoveNet .tflite)
- `@repo/core`·FSD entities/features 설계 재사용 — 재구축 범위는 카메라·추론·렌더·UI
- 착수 전 **기술 스파이크 1주**: 파이프라인 PoC로 성능·안정성 확인 (커뮤니티 라이브러리 성숙도 리스크)
- 개시 조건: 웹 리텐션 지표 달성 (PRD §8)
- 인증: BE의 `/auth/google/token` 사용 — FE 재작업 없음 (TRD-BE 참조)

## 11. 배포

- Vercel (1~2단계 Hobby — 비상업 한정, 상업화 시 Pro 또는 Cloudflare Pages 재검토)
- 커스텀 도메인의 web 서브도메인 사용 (쿠키 공유 요건 — TRD-BE 참조)
