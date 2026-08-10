/**
 * 단일 오디오 채널 (M4, F1-3). 코치 대사를 재생하되 항상 **하나만** 울린다 —
 * 실시간 교정은 최신 대사만 의미 있으므로, 새 재생 전에 이전 재생(mp3·Web Speech)을 끊는다.
 *
 * 매니페스트에 clip이 있으면 mp3, 없으면 `text`를 Web Speech로 폴백한다(§2·§6.1).
 * 지금은 매니페스트가 없어 폴백만 돌고, mp3를 드롭하면 자동으로 mp3 재생으로 전환된다.
 */
import { cancelSpeech, speak } from "@/shared/lib/speech";
import { loadManifest } from "./manifest";

let audioEl: HTMLAudioElement | null = null;

const getAudio = (): HTMLAudioElement | null => {
  if (typeof window === "undefined") return null;
  audioEl ??= new Audio();
  return audioEl;
};

const pickFile = (files: string[] | undefined): string | null => {
  if (!files || files.length === 0) return null;
  return files[Math.floor(Math.random() * files.length)] ?? null;
};

export interface PlayClipArgs {
  coachId: string;
  /** 판정 이벤트 키 (매니페스트 조회) */
  clipKey: string;
  /** 폴백용 텍스트 — mp3가 없으면 Web Speech로 이걸 읽는다 */
  text: string;
}

/** 코치 대사 재생. mp3 우선, 없으면 Web Speech 폴백. 이전 재생은 항상 중단. */
export const playClip = async ({
  coachId,
  clipKey,
  text,
}: PlayClipArgs): Promise<void> => {
  const manifest = await loadManifest(coachId);
  const file = pickFile(manifest?.clips[clipKey]);

  if (file) {
    const el = getAudio();
    if (!el) return;
    cancelSpeech(); // 폴백 음성이 물려 있으면 끊기
    el.pause();
    el.src = `/audio/${coachId}/${file}`;
    el.currentTime = 0;
    // 재생 실패(파일 없음·코덱 등) 시 텍스트 폴백
    void el.play().catch(() => speak(text));
    return;
  }

  // 매니페스트에 없음 → Web Speech 폴백
  audioEl?.pause();
  speak(text);
};

/** 재생 중단 (음소거 토글·화면 이탈). mp3·Web Speech 둘 다 정리. */
export const stopClip = (): void => {
  audioEl?.pause();
  cancelSpeech();
};
