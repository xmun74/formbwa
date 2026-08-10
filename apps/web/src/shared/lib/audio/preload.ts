/**
 * 코치 음성 프리로드 (M4, TRD-FE §9.1). `/start`에서 코치를 고르는 시점에 해당 코치 mp3를
 * 미리 받아 둔다 — 선택 전엔 무엇을 받을지 모르므로 이때가 프리로드 적기.
 * 매니페스트가 없으면(폴백 모드) no-op.
 */
import { loadManifest, manifestFiles } from "./manifest";

export const preloadCoachAudio = async (coachId: string): Promise<void> => {
  if (typeof window === "undefined") return;
  const manifest = await loadManifest(coachId);
  if (!manifest) return;
  for (const src of manifestFiles(coachId, manifest)) {
    const a = new Audio();
    a.preload = "auto";
    a.src = src; // 브라우저 캐시에 태우기만 (재생 안 함)
  }
};
