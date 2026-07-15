import { config } from "@repo/eslint-config/base";

/**
 * core는 프레임워크 무관 순수 TS — 웹/RN 양쪽에서 재사용 (TRD-FE §5.1).
 *
 * DOM 차단은 tsconfig의 `lib: ["ES2022"]`가 담당한다 (타입 자체를 제거하는 쪽이 확실).
 * 여기서는 react/next 런타임 import를 막는다.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  ...config,
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
