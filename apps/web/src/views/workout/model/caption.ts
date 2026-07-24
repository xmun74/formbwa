import type { JudgeEvent, JudgeEventType } from "@repo/core";

/**
 * 판정 이벤트 → 자막 텍스트 (임시). M4에서 캐릭터별 멘트 + 음성(coach.ts)으로 교체.
 * 자막은 운동 중 이름과 함께 상시 노출 (PRD §4-5).
 */
const CAPTION: Partial<Record<JudgeEventType, string>> = {
  knee_shallow: "조금 더 깊게 앉아요",
  back_bent: "허리를 펴요",
  knee_over_toe: "무릎이 발끝을 넘지 않게",
  tempo_too_fast: "천천히 내려가요",
  good_rep: "좋아요, 그 자세!",
};

/** 우선순위 정렬된 이벤트 배열에서 보여줄 한 줄을 고른다. */
export function captionForEvents(events: JudgeEvent[]): string | null {
  const fault = events.find(
    (e) => e.type !== "rep_counted" && e.type !== "good_rep",
  );
  if (fault) return CAPTION[fault.type] ?? null;
  if (events.some((e) => e.type === "good_rep")) return CAPTION.good_rep!;
  return null;
}
