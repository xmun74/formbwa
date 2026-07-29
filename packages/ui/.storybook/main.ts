import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

/** 모노레포에서 애드온 경로를 절대경로로 해석 (pnpm strict node_modules 대응) */
function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  // 디자인 시스템 컴포넌트 옆 스토리 (framework-agnostic: react-vite. @repo/ui는 Next 미사용)
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: { name: getAbsolutePath("@storybook/react-vite"), options: {} },
  viteFinal: async (cfg) => {
    // Tailwind v4를 Storybook vite에 자립적으로 붙인다 (앱 globals.css에 의존하지 않음)
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    return cfg;
  },
};

export default config;
