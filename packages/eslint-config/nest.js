import globals from "globals";

import { config as baseConfig } from "./base.js";

/**
 * NestJS 앱용 (`apps/be`).
 *
 * base는 프레임워크 무관이라 Node 전역(process, console 등)을 모른다.
 * 데코레이터는 typescript-eslint가 처리하므로 별도 설정 불필요.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestConfig = [
  ...baseConfig,
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    ignores: ["dist/**", "eslint.config.mjs"],
  },
];
