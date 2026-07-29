import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import { config as baseConfig } from "./base.js";

/**
 * React 컴포넌트 라이브러리용 (Next 아님) — `@repo/ui`.
 * base + react + react-hooks. Next 플러그인은 제외(Next 앱이 아니라 순수 컴포넌트 패키지).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const reactConfig = [
  ...baseConfig,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser },
    },
    settings: { react: { version: "detect" } },
  },
  {
    plugins: { "react-hooks": pluginReactHooks },
    rules: { ...pluginReactHooks.configs.recommended.rules },
  },
  {
    rules: {
      // 새 JSX 트랜스폼(React 19) + 타입으로 prop 검증 → 아래 두 규칙 불필요
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  eslintConfigPrettier,
];
