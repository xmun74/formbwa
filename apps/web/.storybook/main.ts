import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";

/** 모노레포에서 애드온 경로를 절대경로로 해석 (pnpm strict node_modules 대응) */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  // 스토리는 컴포넌트 옆에 둔다 — FSD 슬라이스 응집도 유지 (TRD-FE §3)
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: getAbsolutePath("@storybook/nextjs-vite"),
  staticDirs: ["../public"],
};

export default config;
