/**
 * 코치 시범 영상 매니페스트 로더. `public/coach-3d/manifest.json`을 읽어
 * characterId×exerciseId → mp4로 매핑한다. 매니페스트/영상이 없으면 null → <CoachDemo>가
 * 플레이스홀더를 유지한다(선구축, audio 폴백과 동형).
 *
 * 캐릭터 정체성(displayName 등 바뀔 수 있는 값)은 id가 아니라 여기 매니페스트에 담는다
 * (spec §4 — characterId는 불투명·고정, 특징은 데이터로).
 */
export interface DemoCharacter {
  displayName: string;
}

export interface CoachDemoManifest {
  /** characterId → 정체성 */
  characters: Record<string, DemoCharacter>;
  /** characterId → (exerciseId → mp4 파일명) */
  videos: Record<string, Record<string, string>>;
}

let cache: CoachDemoManifest | null | undefined;

/** 매니페스트를 1회 fetch 후 캐시. 없거나 실패하면 null(폴백 모드). */
export const loadDemoManifest = async (): Promise<CoachDemoManifest | null> => {
  if (typeof window === "undefined") return null;
  if (cache !== undefined) return cache;
  try {
    const res = await fetch("/coach-3d/manifest.json");
    if (!res.ok) {
      cache = null;
      return null;
    }
    cache = (await res.json()) as CoachDemoManifest;
    return cache;
  } catch {
    cache = null;
    return null;
  }
};

/** characterId×exerciseId → mp4 URL. 없으면 null. */
export const resolveDemoVideo = (
  manifest: CoachDemoManifest,
  characterId: string,
  exerciseId: string,
): string | null => {
  const file = manifest.videos[characterId]?.[exerciseId];
  return file ? `/coach-3d/videos/${file}` : null;
};
