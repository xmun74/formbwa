/**
 * 임시 음성 — 브라우저 내장 TTS(Web Speech API)로 코치 대사를 읽어준다 (TRD-FE §2 폴백).
 * mp3(M4, ElevenLabs) 전까지의 임시.
 *
 * 크롬 함정 방어:
 *  1) utterance가 재생 전 GC되면 묵음 → 발화 중인 객체를 모듈 변수로 붙잡음
 *  2) cancel() 직후 speak()하면 새 발화까지 삼킴 → 발화 중일 때만 끊고 살짝 뒤에 말함
 *  3) 자동재생 잠금 → `primeSpeech()`를 사용자 제스처에서 호출
 *  4) **OS에 한국어 음성이 없으면 ko-KR은 무음** → 한국어 음성이 없으면 기본 음성으로라도 재생
 */
function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let held: SpeechSynthesisUtterance | null = null;
let voices: SpeechSynthesisVoice[] = [];

function refreshVoices(): void {
  if (speechAvailable()) voices = window.speechSynthesis.getVoices();
}
if (speechAvailable()) {
  refreshVoices();
  // 음성은 비동기로 로드되기도 함
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

/** 한국어 음성 우선, 없으면 기본/첫 음성으로 폴백 (없으면 undefined → 브라우저 기본) */
function pickVoice(): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) refreshVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("ko")) ??
    voices.find((v) => v.default) ??
    voices[0]
  );
}

export function speak(text: string): void {
  if (!speechAvailable() || !text) return;
  const synth = window.speechSynthesis;

  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  utter.lang = voice?.lang ?? "ko-KR"; // 폴백 음성과 lang을 맞춰 재생 실패 방지
  utter.rate = 1.1;
  utter.onend = () => {
    if (held === utter) held = null;
  };
  utter.onerror = () => {
    if (held === utter) held = null;
  };

  const start = () => {
    held = utter; // GC 방지
    synth.resume();
    synth.speak(utter);
  };

  if (synth.speaking || synth.pending) {
    synth.cancel();
    window.setTimeout(start, 80);
  } else {
    start();
  }
}

/** 사용자 제스처(클릭 등) 안에서 호출해 자동재생 잠금을 미리 푼다. */
export function primeSpeech(): void {
  if (!speechAvailable()) return;
  refreshVoices();
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  window.speechSynthesis.speak(u);
}

export function cancelSpeech(): void {
  if (!speechAvailable()) return;
  const synth = window.speechSynthesis;
  // ⚠️ macOS 크롬: 재생 중이 아닐 때 cancel()하면 이후 speak()가 전부 무반응(jam)이 된다.
  //    (dev StrictMode의 언마운트 cleanup이 이걸 유발하던 것) → 실제 재생 중일 때만 취소.
  if (synth.speaking || synth.pending) synth.cancel();
  held = null;
}
