import type { Combo } from "./types";

/** 조합 산출물(mp4) 파일명 규약. */
export const videoName = (characterId: string, exerciseId: string): string =>
  `${characterId}-${exerciseId}.mp4`;

/**
 * rig(캐릭터) × clip(운동)의 데카르트 곱 = 렌더할 모든 조합.
 * 저작은 N+M(리그 N + 클립 M), 조합은 N×M을 파이프라인이 생성 (spec 결정 1).
 */
export const buildCombos = (
  rigs: { id: string; path: string }[],
  clips: { id: string; path: string }[],
): Combo[] =>
  rigs.flatMap((rig) =>
    clips.map((clip) => ({
      characterId: rig.id,
      exerciseId: clip.id,
      rig: rig.path,
      clip: clip.path,
    })),
  );
