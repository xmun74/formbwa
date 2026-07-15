import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

// 슬라이스 단위 FSD 규칙 담당 (레이어 단방향 import는 eslint-plugin-boundaries — TRD-FE §3.3).
// insignificant-slice 규칙이 §3.2 승격 기준(2곳 이상 재사용)의 자동 집행자다.
export default defineConfig([
  ...fsd.configs.recommended,
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
