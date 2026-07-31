import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

// FSD 권장 규칙 전체 + 오탐 2건만 폴더별로 끔 (레이어 단방향 import는 eslint-plugin-boundaries 담당 — TRD-FE §3.3).
export default defineConfig([
  ...fsd.configs.recommended,
  // entities: steiger 한계 — 모노레포 tsconfig paths(`@/`)를 못 집어들어 참조 0으로 오인 → insignificant-slice 오탐.
  {
    files: ["./apps/web/src/entities/**"],
    rules: { "fsd/insignificant-slice": "off" },
  },
  // app: `providers`는 FSD 공식 app 레이어 표준 세그먼트인데 segments-by-purpose가 오탐(라우팅은 루트 app/으로 분리됨).
  {
    files: ["./apps/web/src/app/**"],
    rules: { "fsd/segments-by-purpose": "off" },
  },
]);
