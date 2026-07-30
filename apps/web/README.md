# apps/web — 프론트엔드

Next.js(App Router) 웹 클라이언트.

- **카메라, 포즈 추론, 판정, 화면**을 담당한다.
- 포즈 인식, 판정, 음성은 전부 브라우저에서 실행되고(온디바이스), 영상 프레임은 기기 밖으로 나가지 않는다.
- 상세 설계는 [docs/TRD-FE.md](../../docs/TRD-FE.md).

## 스택

- **Next.js (App Router)**, React 19, TypeScript
- **Tailwind CSS 4** — `@repo/design-tokens/theme.css`를 `@import`
- **디자인 시스템** — `@repo/ui` (컴포넌트) / **판정 엔진** — `@repo/core`
- **상태** — Zustand(클라이언트), TanStack Query(서버), Axios, Zod
- **포즈 추론** — `@mediapipe/tasks-vision` (WASM/WebGL, `'use client'` + dynamic import)
- **분석** — GA4 (`@next/third-parties`, 프로덕션에서만)
- **구조** — FSD(Feature-Sliced Design) + Steiger 린트

## 폴더 구조 (FSD)

```
apps/web/src/
├── app/        # Next 라우팅 + FSD app 레이어
│   ├── page.tsx, exercises, start, prepare, workout, summary
│   ├── opengraph-image.png, robots.ts, sitemap.ts, layout.tsx
│   └── dev/extract/       # fixture 추출 도구 (dev 전용, 프로덕션 404)
├── views/      # FSD pages 레이어 (화면 조립 + 화면 전용 로직)
│   ├── intro, exercise-list, workout-setup
│   ├── prepare, workout, summary, fixture-extract
├── entities/   # 도메인 모델 (workout — Zustand persist)
└── shared/     # 앱 전용 ui(셸), lib(pose, speech, analytics), api, config
```

- **라우트**: `/`(intro) → `/exercises` → `/start` → `/prepare` → `/workout` → `/summary`
- 재사용 컴포넌트는 `@repo/ui` 패키지, 앱 셸(header/footer/app-shell)만 `shared/ui`

## Quick Start

```sh
# 레포 루트에서 의존성 설치
pnpm install

# 개발 서버 (http://localhost:3000)
pnpm --filter web dev
```

- 웹캠, 포즈 기능은 **HTTPS 또는 localhost + 카메라 권한** 필요.
- GA4는 프로덕션 빌드 + `NEXT_PUBLIC_GA_ID` 있을 때만 동작(로컬 무동작).

## 명령어

| 명령                            | 설명                             |
| ------------------------------- | -------------------------------- |
| `pnpm --filter web dev`         | 개발 서버 (port 3000)            |
| `pnpm --filter web build`       | 프로덕션 빌드                    |
| `pnpm --filter web start`       | 빌드 결과 서빙                   |
| `pnpm --filter web lint`        | ESLint                           |
| `pnpm --filter web check-types` | 타입 체크 (`next typegen` + tsc) |
| `pnpm steiger` (루트)           | FSD 아키텍처 린트                |
