import { describe, expect, it } from "vitest";
import { buildCombos, videoName } from "./combos";

describe("videoName", () => {
  it("characterId-exerciseId.mp4", () => {
    expect(videoName("character1", "squat")).toBe("character1-squat.mp4");
  });
});

describe("buildCombos", () => {
  it("rig × clip 데카르트 곱 — N+M 입력 → N×M 조합", () => {
    const combos = buildCombos(
      [
        { id: "character1", path: "a.fbx" },
        { id: "character2", path: "b.fbx" },
      ],
      [
        { id: "squat", path: "s.fbx" },
        { id: "lunge", path: "l.fbx" },
      ],
    );
    expect(combos).toHaveLength(4);
    expect(combos.map((c) => `${c.characterId}-${c.exerciseId}`)).toEqual([
      "character1-squat",
      "character1-lunge",
      "character2-squat",
      "character2-lunge",
    ]);
    expect(combos[0]).toMatchObject({ rig: "a.fbx", clip: "s.fbx" });
  });

  it("한쪽이 비면 조합 0", () => {
    expect(buildCombos([], [{ id: "squat", path: "s" }])).toEqual([]);
    expect(buildCombos([{ id: "c1", path: "a" }], [])).toEqual([]);
  });
});
