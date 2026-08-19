import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { buildCombos } from "./combos";
import type { Combo } from "./types";

/** `characters/{id}/{id}.fbx` → rig 목록. */
export const discoverRigs = (
  charactersDir: string,
): { id: string; path: string }[] => {
  if (!existsSync(charactersDir)) return [];
  return readdirSync(charactersDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({
      id: d.name,
      path: path.join(charactersDir, d.name, `${d.name}.fbx`),
    }))
    .filter((r) => existsSync(r.path));
};

/** `motions/{exerciseId}.fbx` → clip 목록. */
export const discoverClips = (
  motionsDir: string,
): { id: string; path: string }[] => {
  if (!existsSync(motionsDir)) return [];
  return readdirSync(motionsDir)
    .filter((f) => f.endsWith(".fbx"))
    .map((f) => ({ id: path.basename(f, ".fbx"), path: path.join(motionsDir, f) }));
};

/** 자산 폴더 스캔 → 전체 조합(rig × clip). */
export const discoverCombos = (
  charactersDir: string,
  motionsDir: string,
): Combo[] =>
  buildCombos(discoverRigs(charactersDir), discoverClips(motionsDir));
