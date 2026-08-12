import { videoName } from "./combos";
import type { Combo, CoachDemoManifest, DemoCharacter } from "./types";

/**
 * 조합 목록 + 캐릭터 메타 → 웹 매니페스트.
 * videos[characterId][exerciseId] = 파일명. characters는 정체성 메타(전체 등록, 영상 없어도 유지).
 */
export const generateManifest = (
  combos: Combo[],
  characters: Record<string, DemoCharacter>,
): CoachDemoManifest => {
  const videos: Record<string, Record<string, string>> = {};
  for (const c of combos) {
    const byExercise = (videos[c.characterId] ??= {});
    byExercise[c.exerciseId] = videoName(c.characterId, c.exerciseId);
  }
  return { characters, videos };
};
