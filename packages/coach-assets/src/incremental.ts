import { statSync } from "node:fs";

/**
 * 산출물(mp4)이 없거나 입력(rig/clip)보다 오래됐으면 재렌더 필요 — 증분 렌더.
 * (순수: mtime 숫자 비교라 테스트 가능)
 */
export const needsRenderFromMtimes = (
  rigMs: number,
  clipMs: number,
  videoMs: number | null,
): boolean => videoMs === null || videoMs < rigMs || videoMs < clipMs;

const mtime = (p: string): number | null => {
  try {
    return statSync(p).mtimeMs;
  } catch {
    return null;
  }
};

/** 파일시스템 버전 — 존재/mtime을 읽어 판단. */
export const needsRender = (
  rigPath: string,
  clipPath: string,
  videoPath: string,
): boolean =>
  needsRenderFromMtimes(mtime(rigPath) ?? 0, mtime(clipPath) ?? 0, mtime(videoPath));
