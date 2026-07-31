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

FSD × Next App Router — **Next 라우팅은 루트 `app/`(얇은 re-export), FSD 레이어는 `src/`** (공식 with-nextjs 분리 구조). FSD `pages` 레이어는 Next `pages/`와 충돌하므로 `views`로 둔다.

```
apps/web/
├── app/                      # Next 라우팅 (라우트 파일만 — src/app FSD 레이어와 분리)
│   ├── (home)/page.tsx       #  /
│   ├── routine/page.tsx      #  /routine   (운동 목록 → 추후 루틴 빌더)
│   ├── start/page.tsx        #  /start
│   ├── (exercise)/           #  다크 몰입 플로우 route group (URL 미반영)
│   │   ├── prepare/page.tsx  #   /prepare
│   │   └── workout/page.tsx  #   /workout
│   ├── summary/page.tsx      #  /summary
│   ├── dev/extract/          #  fixture 추출 (dev 전용, 프로덕션 404)
│   └── layout.tsx, globals.css, robots.ts, sitemap.ts, opengraph-image.png
└── src/
    ├── app/                  # FSD app 레이어 (providers 세그먼트 + index 배럴)
    ├── views/                # FSD pages 레이어 (화면 조립 + 화면 전용 로직)
    │   ├── intro, exercise-list, workout-setup
    │   └── prepare, workout, summary, fixture-extract
    ├── entities/             # 도메인 모델 (workout — Zustand persist)
    └── shared/               # ui(셸), lib(pose·speech·analytics), api, config(routes·site)
```

- **라우트**: `/`(intro) → `/routine`(운동 목록) → `/start` → `/prepare` → `/workout` → `/summary` — 경로는 `shared/config`의 **`ROUTES` 상수**로 단일 관리
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
