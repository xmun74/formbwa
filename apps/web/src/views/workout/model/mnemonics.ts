import type { JudgeEventType } from "@repo/core";

/**
 * 캐릭터별 멘트 스크립트 (PRD §6·F1-4). clipKey(=판정 이벤트) → 캐릭터 톤의 짧은 대사.
 * 멘트 원칙: 한 번에 한 가지, 3초 이내, 칭찬:지적 최소 1:2, 캐릭터 톤 유지.
 *
 * ⚠️ 지금은 자막 텍스트 소스. M4에서 이 텍스트로 mp3 일괄 생성 + `public/audio/{coachId}/manifest.json`.
 *   사투리 캐릭터는 게이트(PRD §12) 통과 후 확정.
 */
type CoachId = "pt" | "busan";
type SpeakEvent = Exclude<JudgeEventType, "rep_counted">;

export const MNEMONICS: Record<
  CoachId,
  Partial<Record<SpeakEvent, string[]>>
> = {
  pt: {
    knee_shallow: [
      "더 깊게! 엉덩이 쭉 내려요!",
      "조금만 더 앉아봐요, 가능해요!",
    ],
    back_bent: ["가슴 펴요! 허리 세우고!", "등 곧게 세워요, 그렇지!"],
    knee_over_toe: ["무릎이 발끝 넘지 않게!", "무게는 뒤꿈치로!"],
    tempo_too_fast: ["천천히! 반동 쓰지 말고!", "내려갈 때 힘 빼지 말아요!"],
    good_rep: ["좋아요!! 완벽해요!", "그거죠! 딱 좋아요!"],
  },
  busan: {
    knee_shallow: ["무릎 더 굽히라카이~", "쪼매만 더 앉아봐라~"],
    back_bent: ["허리 좀 펴라, 굽으면 안 된다카이~", "가슴 쫙 펴라~"],
    knee_over_toe: ["무릎이 발끝 넘어가삐면 안 된다~", "무게 뒤로 실어라~"],
    tempo_too_fast: ["천천히 내려가라, 반동 쓰지 말고~", "급하게 하지 마라~"],
    good_rep: ["오~ 잘한다! 그거다~", "옳지, 딱 좋다~"],
  },
};

/** clipKey에 해당하는 캐릭터 대사 하나를 고른다 (변형 중 랜덤). 없으면 null. */
export function pickLine(coachId: string, clipKey: string): string | null {
  const lines = MNEMONICS[coachId as CoachId]?.[clipKey as SpeakEvent];
  if (!lines || lines.length === 0) return null;
  return lines[Math.floor(Math.random() * lines.length)]!;
}

/**
 * 자막 개인화 — 대사 앞에 이름을 얹는다 (F1-9, TRD-FE §6.1).
 * 텍스트라 비용/지연 0으로 자막은 항상 개인화. **음성은 이걸 쓰지 않는다** —
 * 실시간 교정 음성엔 이름을 넣지 않고, 이름 호명은 세트 경계에서만(WorkoutView).
 */
export function personalize(line: string, name: string): string {
  return `${name}님, ${line}`;
}
