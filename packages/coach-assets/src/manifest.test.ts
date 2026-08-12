import { describe, expect, it } from "vitest";
import { generateManifest } from "./manifest";
import type { Combo } from "./types";

const combo = (characterId: string, exerciseId: string): Combo => ({
  characterId,
  exerciseId,
  rig: "",
  clip: "",
});

describe("generateManifest", () => {
  it("조합 → videos 매핑 + 캐릭터 메타 유지", () => {
    const m = generateManifest(
      [combo("character1", "squat"), combo("character1", "lunge")],
      {
        character1: { displayName: "열정 PT쌤" },
        character2: { displayName: "부산 코치" },
      },
    );
    expect(m.videos).toEqual({
      character1: {
        squat: "character1-squat.mp4",
        lunge: "character1-lunge.mp4",
      },
    });
    // 영상 없는 character2도 정체성 메타는 유지
    expect(m.characters.character2?.displayName).toBe("부산 코치");
  });

  it("조합 없으면 videos 비고 characters만", () => {
    const m = generateManifest([], { character1: { displayName: "PT" } });
    expect(m.videos).toEqual({});
    expect(m.characters.character1?.displayName).toBe("PT");
  });
});
