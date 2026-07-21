// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { nextJsConfig } from "@repo/eslint-config/next-js";
import { fsdConfig } from "@repo/eslint-config/fsd";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  ...fsdConfig,
  ...storybook.configs["flat/recommended"],
];
