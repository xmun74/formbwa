import { describe, expect, it } from "vitest";
import { needsRenderFromMtimes } from "./incremental";

describe("needsRenderFromMtimes", () => {
  it("산출물 없으면 렌더 필요", () => {
    expect(needsRenderFromMtimes(100, 100, null)).toBe(true);
  });

  it("산출물이 입력보다 오래되면 렌더 필요", () => {
    expect(needsRenderFromMtimes(200, 100, 150)).toBe(true); // rig 최신
    expect(needsRenderFromMtimes(100, 200, 150)).toBe(true); // clip 최신
  });

  it("산출물이 rig·clip보다 최신이면 스킵", () => {
    expect(needsRenderFromMtimes(100, 100, 200)).toBe(false);
  });
});
