import type { JudgeEventType } from "@repo/core";
import type { SetResult } from "@/entities/workout";

/**
 * 라이브 집계값 → 세트 요약(SetResult) 조립 (F1-6).
 * 지적 포인트는 세트 중 누적된 결함 횟수에서 상위 2개.
 * coachComment는 임시 템플릿 — 2단계 AI 리포트(F2-3)에서 캐릭터 톤 총평으로 교체.
 */
const FAULT_META: Partial<
  Record<JudgeEventType, { label: string; tone: "coral" | "amber" }>
> = {
  back_bent: { label: "허리 굽음", tone: "coral" },
  knee_over_toe: { label: "무릎 전방 이탈", tone: "coral" },
  knee_shallow: { label: "깊이 부족", tone: "amber" },
  tempo_too_fast: { label: "너무 빠름", tone: "amber" },
};

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface BuildArgs {
  reps: number;
  goodReps: number;
  faultCounts: Partial<Record<JudgeEventType, number>>;
  durationMs: number;
}

export function buildSetResult({
  reps,
  goodReps,
  faultCounts,
  durationMs,
}: BuildArgs): SetResult {
  const quality = reps > 0 ? Math.round((goodReps / reps) * 100) : 0;

  const points = Object.entries(faultCounts)
    .filter(([type, count]) => count > 0 && FAULT_META[type as JudgeEventType])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type, count]) => {
      const meta = FAULT_META[type as JudgeEventType]!;
      return { label: meta.label, count, tone: meta.tone };
    });

  const coachComment =
    reps === 0
      ? "이번엔 한 개도 못 셌네요. 카메라 배치를 확인하고 다시 해봐요!"
      : `${reps}개 완주! ${
          quality >= 80
            ? "폼이 아주 좋았어요."
            : "다음 세트엔 지적 포인트만 조금 더 신경 써봐요."
        } 오늘도 잘 해냈어요 💪`;

  return {
    reps,
    targetReps: reps,
    quality,
    durationLabel: formatDuration(durationMs),
    liveCaption: "",
    points,
    coachComment,
  };
}
