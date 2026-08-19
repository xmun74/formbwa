/**
 * 코치 멘트(mnemonics.ts) → Typecast API → public/audio/{coachId}/*.mp3 + manifest.json.
 * 앱은 mp3가 있으면 자동 재생, 없으면 Web Speech 폴백(shared/lib/audio) — 코드 변경 0으로 전환.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MNEMONICS } from "../src/views/workout/model/mnemonics";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, "..");
const AUDIO_DIR = path.join(WEB, "public/audio");
const API_URL = "https://api.typecast.ai/v1/text-to-speech";
const API_KEY = process.env.TYPECAST_API_KEY;

interface VoiceCfg {
  voiceId: string;
  model?: string;
}

const voices = JSON.parse(
  readFileSync(path.join(HERE, "voices.json"), "utf8"),
) as Record<string, VoiceCfg>;

/**
 * clipKey → 텍스트 목록 (공통 motivation·good_rep + squat 운동 플랫).
 * 운동이 늘면 audio 키를 exercise별로 스코프해야 함(지금은 squat만이라 플랫 OK).
 */
const clipLines = (
  coachId: keyof typeof MNEMONICS,
): Record<string, string[]> => {
  const c = MNEMONICS[coachId];
  const sq = c.exercises.squat;
  return {
    motivation: c.motivation,
    good_rep: c.good_rep,
    form_intro: sq.form_intro,
    knee_shallow: sq.knee_shallow,
    back_bent: sq.back_bent,
    knee_over_toe: sq.knee_over_toe,
    tempo_too_fast: sq.tempo_too_fast,
  };
};

const synth = async (text: string, cfg: VoiceCfg): Promise<Buffer> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY as string,
    },
    body: JSON.stringify({
      voice_id: cfg.voiceId,
      text,
      model: cfg.model ?? "ssfm-v30",
      language: "kor",
      output: { audio_format: "mp3" },
    }),
  });
  if (!res.ok) {
    throw new Error(`Typecast ${res.status}: ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
};

const main = async (): Promise<void> => {
  if (!API_KEY) throw new Error("TYPECAST_API_KEY 환경변수가 필요합니다");
  const only = process.env.COACH; // COACH=pt 처럼 지정하면 그 코치만 재생성
  for (const coachId of Object.keys(MNEMONICS) as (keyof typeof MNEMONICS)[]) {
    if (only && coachId !== only) continue;
    const cfg = voices[coachId];
    if (!cfg?.voiceId) {
      console.log(`[skip] ${coachId}: voices.json의 voiceId가 비어있음`);
      continue;
    }
    const dir = path.join(AUDIO_DIR, coachId);
    mkdirSync(dir, { recursive: true });
    const clips: Record<string, string[]> = {};
    for (const [clipKey, lines] of Object.entries(clipLines(coachId))) {
      const files: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const file = `${clipKey}-${i + 1}.mp3`;
        console.log(`[gen] ${coachId}/${file}  "${line}"`);
        writeFileSync(path.join(dir, file), await synth(line, cfg));
        files.push(file);
      }
      clips[clipKey] = files;
    }
    writeFileSync(
      path.join(dir, "manifest.json"),
      JSON.stringify({ clips }, null, 2) + "\n",
    );
    console.log(
      `[done] ${coachId} — clipKey ${Object.keys(clips).length}개 ✅`,
    );
  }
};

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
