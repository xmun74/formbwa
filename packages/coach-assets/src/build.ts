import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { videoName } from "./combos";
import { discoverCombos } from "./discover";
import { needsRender } from "./incremental";
import { generateManifest } from "./manifest";
import { renderCombo } from "./render";
import type { DemoCharacter } from "./types";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(HERE, "..");
const REPO = path.resolve(PKG, "../..");

// 원본(로컬 gitignored)
const CHARACTERS_DIR = path.join(REPO, "3d-assets/characters");
const MOTIONS_DIR = path.join(REPO, "3d-assets/motions");
// 산출물(커밋)
const OUT_DIR = path.join(REPO, "apps/web/public/coach-3d");
const VIDEOS_DIR = path.join(OUT_DIR, "videos");
// 도구
const RENDER_SCRIPT = path.join(PKG, "render/clay.py");
const CHARACTERS_META = path.join(PKG, "characters.json");
const BLENDER =
  process.env.BLENDER ?? "/Applications/Blender.app/Contents/MacOS/Blender";

const log = (m: string): void => console.log(`[coach-assets] ${m}`);

const main = (): void => {
  mkdirSync(VIDEOS_DIR, { recursive: true });
  const combos = discoverCombos(CHARACTERS_DIR, MOTIONS_DIR);
  log(`조합 ${combos.length}개 발견`);

  let rendered = 0;
  for (const c of combos) {
    const out = path.join(VIDEOS_DIR, videoName(c.characterId, c.exerciseId));
    if (needsRender(c.rig, c.clip, out)) {
      log(`렌더 ${c.characterId}-${c.exerciseId} …`);
      renderCombo(c, out, { blender: BLENDER, script: RENDER_SCRIPT });
      rendered += 1;
    } else {
      log(`스킵(최신) ${c.characterId}-${c.exerciseId}`);
    }
  }

  const characters = JSON.parse(readFileSync(CHARACTERS_META, "utf8")) as Record<
    string,
    DemoCharacter
  >;
  const manifest = generateManifest(combos, characters);
  writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  log(`매니페스트 갱신 ✅ (렌더 ${rendered} / 스킵 ${combos.length - rendered})`);
};

main();
