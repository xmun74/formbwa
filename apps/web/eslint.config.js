import { nextJsConfig } from "@repo/eslint-config/next-js";
import { fsdConfig } from "@repo/eslint-config/fsd";

/** @type {import("eslint").Linter.Config[]} */
export default [...nextJsConfig, ...fsdConfig];
