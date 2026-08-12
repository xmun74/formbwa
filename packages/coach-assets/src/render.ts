import { spawnSync } from "node:child_process";
import type { Combo } from "./types";

export interface RenderOpts {
  blender: string; // Blender 실행 파일 경로
  script: string; // clay.py 경로
}

/** Blender 헤드리스로 clay.py 실행 — rig + clip → mp4. */
export const renderCombo = (
  combo: Combo,
  outPath: string,
  opts: RenderOpts,
): void => {
  const r = spawnSync(
    opts.blender,
    [
      "--background",
      "--python",
      opts.script,
      "--",
      combo.rig,
      combo.clip,
      outPath,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) {
    throw new Error(
      `렌더 실패(${combo.characterId}-${combo.exerciseId}): status ${r.status}`,
    );
  }
};
