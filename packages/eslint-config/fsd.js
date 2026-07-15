import boundaries from "eslint-plugin-boundaries";

/** FSD 레이어 (상위 → 하위 단방향, TRD-FE §3.3) */
const LAYERS = ["app", "views", "widgets", "features", "entities", "shared"];

/** 자기 자신 + 아래 전부를 허용. 같은 레이어를 허용하는 건 슬라이스 내부 파일끼리의
 *  import를 막지 않기 위함 — 슬라이스 간 cross-import 검사는 Steiger가 담당한다. */
const policies = LAYERS.map((layer, i) => ({
  from: { element: { types: layer } },
  allow: { to: { element: { types: { anyOf: LAYERS.slice(i) } } } },
}));

/**
 * FSD 레이어 단방향 import 강제.
 *
 * 레이어 체인은 전체를 미리 등록한다 — widgets/features/entities는 아직 없지만
 * §3.2 승격 시점에 규칙이 이미 걸려 있어야 한다. 없는 레이어의 정의는 비용이 0이다.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const fsdConfig = [
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      // boundaries는 eslint-import-resolver-node를 쓰는데 기본값이 .js뿐이라
      // 확장자 없는 TS import(`../../views/probe` → `views/probe/index.ts`)를 못 찾는다.
      // 해석 실패 시 대상이 unknown이 되어 규칙이 조용히 통과한다.
      "import/resolver": {
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": LAYERS.map((type) => ({
        type,
        pattern: `src/${type}/**/*`,
      })),
    },
    rules: {
      "boundaries/dependencies": ["error", { default: "disallow", policies }],
    },
  },
];
