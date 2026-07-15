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
- [ ] DX 셋업 — ESLint+Prettier 공유 설정, Steiger(FSD 린트), Husky+lint-staged(pre-commit), commitlint(Conventional Commits)
- [ ] Storybook 셋업 (`@storybook/nextjs-vite`)
- [ ] GitHub Actions CI (lint·steiger·test) + Vercel 배포 파이프라인 (빈 페이지 배포 확인)
- [x] docs/에 PRD·TRD-FE·TRD-BE·TASKS 커밋

### M1. BE 초기 세팅 (~0.5일)

- [ ] `apps/api` NestJS 앱 생성 (TS strict, 공유 eslint/tsconfig 연결)
- [ ] `docker-compose.yml` — 로컬 Postgres 컨테이너 (개발용)
- [ ] Prisma init — User/SetRecord 스키마(TRD-BE §5) + 첫 마이그레이션
- [ ] 헬스체크 엔드포인트 + class-validator 파이프 등록
- [ ] `turbo prune api --docker` 기반 Dockerfile 골격 (빌드 확인만, 배포는 2단계)
- [ ] CI에 api lint·build 추가

> 배포(EC2)·인증 모듈은 2단계. 여기서는 로컬에서 도는 골격까지만.

### M2. 포즈 파이프라인 (F1-5, F1-7) (~2~3일)

- [ ] `getUserMedia` 카메라 스트림 + `@mediapipe/tasks-vision` 로딩 (`'use client'` + dynamic import)
- [ ] 렌더링(rAF) / 추론(15~24fps 스로틀) 분리 루프
- [ ] Canvas 랜드마크 오버레이 (F1-7)
- [ ] 전신 바운딩 박스 체크 + 카메라 배치 가이드 UI, 측면 45° 안내 (F1-5)
- [ ] 기립 캘리브레이션 3초 → 기준값 저장 (F1-5)

### M3. 코어 엔진 (F1-1, F1-2) (~1주 — 병목은 코딩이 아니라 몸으로 하는 오탐 검증)

- [ ] `angle.ts` — 3관절 각도 계산, 좌표 정규화
- [ ] `squat-fsm.ts` — 상태머신 + 반복 카운트 (F1-1)
- [ ] `judge.ts` — 판정 규칙 → JudgeEvent (F1-2)
- [ ] fixture 수집 — 본인 촬영 정상/불량 스쿼트 영상에서 랜드마크 시퀀스 JSON 추출
- [ ] Vitest 스냅샷 회귀 테스트 (fixture → 기대 이벤트)

### M4. 캐릭터·음성 (F1-3, F1-4) (~2~3일)

- [ ] 멘트 스크립트 작성 — 2캐릭터 × 이벤트별 변형 ~30개
- [ ] **[게이트] ElevenLabs 부산 사투리 품질 검증** — 미달 시 캐릭터 교체 (PRD §12)
- [ ] mp3 일괄 생성 스크립트 + 매니페스트 JSON + 프리로드
- [ ] `coach.ts` — 쿨다운·우선순위 정책 + 단일 오디오 채널 재생 (F1-3)
- [ ] 캐릭터 선택 화면 (F1-4)

### M5. 세트 요약·마무리 (F1-6) (~1일)

- [ ] 세션 Zustand 스토어 + 세트 종료 요약 화면 (F1-6)
- [ ] 카메라 처리 방식 고지 + 운동 면책 문구 (PRD §10)
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
- [ ] `docker-compose.prod.yml` — nginx + api + db, Postgres 호스트 바인딩 금지 확인
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
