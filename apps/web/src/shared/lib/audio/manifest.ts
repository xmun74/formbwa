/**
 * 코치 음성 매니페스트 로더 (M4). `public/audio/{coachId}/manifest.json`을 읽어
 * clipKey(판정 이벤트) → mp3 파일 후보로 매핑한다.
 *
 * 매니페스트가 없으면(=아직 mp3 미제작) null → 재생 계층이 Web Speech로 폴백한다.
 * 그래서 지금은 폴백만 돌고, ElevenLabs mp3 + 매니페스트를 드롭하면 자동으로 mp3 재생으로 바뀐다.
 * (캐릭터 이름·성격도 매니페스트에서 읽을 수 있게 확장 여지를 둔다 — 하드코딩 금지, TRD-FE §6.1)
 */
export interface AudioManifest {
  /** clipKey → mp3 파일명 후보(같은 이벤트의 변형). 재생 시 랜덤 1개 */
  clips: Record<string, string[]>;
}

const cache = new Map<string, AudioManifest | null>();

/** 코치 매니페스트를 1회 fetch 후 캐시. 없거나 실패하면 null(폴백 모드). */
export const loadManifest = async (
  coachId: string,
): Promise<AudioManifest | null> => {
  if (typeof window === "undefined") return null;
  if (cache.has(coachId)) return cache.get(coachId) ?? null;
  try {
    const res = await fetch(`/audio/${coachId}/manifest.json`);
    if (!res.ok) {
      cache.set(coachId, null);
      return null;
    }
    const manifest = (await res.json()) as AudioManifest;
    cache.set(coachId, manifest);
    return manifest;
  } catch {
    cache.set(coachId, null);
    return null;
  }
};

/** 매니페스트의 모든 파일 경로(프리로드용). 중복 제거. */
export const manifestFiles = (
  coachId: string,
  manifest: AudioManifest,
): string[] => {
  const files = new Set<string>();
  for (const candidates of Object.values(manifest.clips)) {
    for (const f of candidates) files.add(`/audio/${coachId}/${f}`);
  }
  return [...files];
};
