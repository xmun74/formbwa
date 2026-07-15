import { config as baseConfig } from "./base.js";

/**
 * 프레임워크 무관 순수 TS 패키지용 (`packages/core`).
 *
 * 웹·RN 양쪽에서 재사용되므로 프레임워크·플랫폼 의존이 들어오면 안 된다 (TRD-FE §5.1).
 * DOM 차단은 각 패키지 tsconfig의 `lib: ["ES2022"]`가 담당한다 — 타입 자체를 제거하는
 * 쪽이 lint 규칙보다 확실하다. 여기서는 런타임 import를 막는다.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const coreConfig = [
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["react", "react-dom", "next"],
          patterns: ["react/*", "react-dom/*", "next/*", "@/*"],
        },
      ],
    },
  },
];
