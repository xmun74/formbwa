/** 렌더할 조합: 캐릭터 리그 × 운동 클립. */
export interface Combo {
  characterId: string;
  exerciseId: string;
  rig: string; // rig fbx 경로
  clip: string; // clip fbx 경로
}

/** 캐릭터 정체성 메타 (바뀔 수 있는 값은 id가 아니라 여기 — spec §4). */
export interface DemoCharacter {
  displayName: string;
}

/** 웹이 읽는 매니페스트 (apps/web `shared/lib/coach-demo`와 동일 포맷). */
export interface CoachDemoManifest {
  characters: Record<string, DemoCharacter>;
  videos: Record<string, Record<string, string>>;
}
