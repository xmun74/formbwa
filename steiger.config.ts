import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

// 슬라이스 단위 FSD 규칙 담당 (레이어 단방향 import는 eslint-plugin-boundaries — TRD-FE §3.3).
// insignificant-slice 규칙이 §3.2 승격 기준(2곳 이상 재사용)의 자동 집행자다.
export default defineConfig([
  ...fsd.configs.recommended,
  {
    // entities는 뷰가 `@/entities/*` 별칭으로 import하는데, steiger가 이 모노레포에서
    // `@/` 별칭을 해석하지 못해(스캔 루트 src 밖의 tsconfig를 못 찾음) 참조를 0으로 오인 →
    // insignificant-slice가 오탐한다. entities에 한해 이 규칙만 끈다. (승격 판단은 리뷰로)
    // 나머지 슬라이스 규칙(public-api·segments 등)과 다른 레이어의 insignificant는 유지.
    files: ["./apps/web/src/entities/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
  {
    // src/app은 Next.js 라우팅 디렉터리를 겸한다 (TRD-FE §3.1). layout/page/providers는
    // 프레임워크 관례이지 FSD 세그먼트가 아니므로 세그먼트 명명 규칙 대상에서 제외한다.
    // pages → views 개명과 같은 부류의 Next/FSD 충돌.
    files: ["./apps/web/src/app/**"],
    rules: {
      "fsd/segments-by-purpose": "off",
    },
  },
]);
