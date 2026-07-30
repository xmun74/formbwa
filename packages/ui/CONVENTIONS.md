# 디자인 시스템 컨벤션 (사람·에이전트 공통 표면)

> **범위:** 디자인 시스템(`@repo/design-tokens` 토큰 · `@repo/ui` 컴포넌트 · 그 소비)의 규약이다. git·커밋·FSD 등 프로젝트 전반 규약이 아니다.
>
> 디자인 시스템 컴포넌트를 **작성/수정하기 전에 이 문서를 먼저 읽는다.** 사람과 AI 에이전트가 같은 규약에서 작동하도록 유지한다. 강한 컨벤션 = 예측 가능성: 규약을 따르면 새 컴포넌트도 결정론적으로 예측된다.
>
> _현재 컴포넌트: Button · Input · Badge · Card(합성) · Dialog·Tabs(상호작용 합성) · Field(몰큘) · Text/Heading·Icon(프리미티브). 토큰은 `@repo/design-tokens`._

## 계층

- **Foundations** — `@repo/design-tokens`: 색·간격·타이포·radius, primitive → semantic 토큰.
- **Components** — `@repo/ui`: 프리미티브(Button, Input, Badge…).
- **Patterns** — 합성(Card, Field, Tabs…) 및 앱 화면 조합.

## 위치 · 구조

- 컴포넌트: `packages/ui/src/<name>/<Name>.tsx`, 슬라이스 배럴 `index.ts`에서 **named export**.
- slots 스타일: `<name>/<name>.styles.ts` (tailwind-variants 설정 분리).
- **공개 API**: `@repo/ui` 배럴로만 import. 내부 파일 직접 import 금지.
- 스토리: 컴포넌트 옆(`<Name>.stories.tsx`), import는 `@storybook/react-vite`.
- **Storybook은 이 패키지가 소유** — `packages/ui/.storybook`(react-vite + Tailwind v4 자립). `pnpm --filter @repo/ui storybook`으로 실행, `build-storybook`으로 정적 빌드.
- **문서**: 전 컴포넌트 **autodocs**(설명은 JSDoc, props 표는 타입에서 자동). 합성(Field/Card/Dialog/Tabs)은 `<Name>.mdx`로 **조립 예시 + do/don't** 추가(Astryx bestPractices 정신).

## 컴포넌트 API

- **named export가 기본** — `import { Card, CardHeader } from "@repo/ui"` → `<Card><CardHeader/></Card>`.
  - 서버 컴포넌트에서도 안전(닷 노테이션은 서버에서 client reference 프로퍼티 접근 불가로 깨짐).
- **닷 노테이션은 상호작용 합성에만** — Context로 상태 공유가 필요한 것(Tabs/Dialog/Accordion). 이들은 `"use client"`라 클라이언트 트리에서만 소비.
- **props 일관성** (컴포넌트 간 같은 의미로 통일):
  - `variant` · `size` · 불리언은 `is*`(`isDisabled`) · `className`(항상 병합 허용) · `asChild`(래핑 없이 자식에 위임).
- **`forwardRef` 필수**.
- **RSC 경계**: 표현용은 `"use client"` 없이(서버 렌더 가능), 상태·이벤트가 있는 것만 클라이언트.

## 스타일링

- **tailwind-variants**로 variant/slots 작성. 하드코딩 클래스 대신 **토큰 유틸**(`bg-surface`·`text-ink`·`border-line`…).
- tv 밖 조건부/`className` override 병합은 **`cn = (...i) => twMerge(clsx(i))`**.
- **cva 사용 금지**(tv가 대체). **색 임의 변경 금지**(Claude Design 원본 유지).

## 명명

- 컴포넌트 `PascalCase`, 파일명 = 컴포넌트명.
- variant 값은 의미 기반(`primary`/`ghost`, `md`/`lg`) — 스타일 이름(파랑/큰) 금지.
- 같은 의미의 prop은 컴포넌트 전체에서 같은 이름.

## 접근성 (베이스라인)

- 포커스 링 유지, 상호작용은 키보드로 가능, 상태는 `aria-*`로 노출.

## 에이전트·기여 가이드

1. 새 컴포넌트 전에 **기존 컴포넌트의 variant로 되는지 먼저 확인**.
2. 위 규약을 따르면 새 컴포넌트도 예측 가능해야 한다 — 벗어나면 규약을 먼저 고친다.
3. **규약이 바뀌면 이 문서를 먼저 고치고 코드를 맞춘다** (문서가 단일 소스).

## 승격·버저닝

- **컴포넌트 승격**: 뷰에 인라인으로 있던 패턴이 **2곳 이상에서 반복**되면 `@repo/ui`로 승격. 1회성은 뷰에 둔다(YAGNI).
- **패키지 승격**: `@repo/ui`는 지금 `apps/web` 단일 소비자라 `private`. **2번째 소비자(다른 웹 앱 등)가 생기면** 정식 버저닝(semver)·`exports`·배포를 고려한다. RN은 컴포넌트가 아니라 **토큰(`@repo/design-tokens`)만 공유**.
- **파괴적 변경**: 공개 API(배럴 export) 시그니처 변경은 소비처를 함께 수정. 배럴에 없는 내부 변경은 자유.
