import { Badge } from "@repo/ui";
import type { Exercise } from "../model/exercises";

interface ExerciseCardProps {
  exercise: Exercise;
  selected: boolean;
  onSelect: (id: string) => void;
}

/**
 * 종목 카드 — 썸네일(현재는 실루엣 플레이스홀더, 실제 이미지는 M4) + 이름 + 상태 배지.
 */
export function ExerciseCard({
  exercise,
  selected,
  onSelect,
}: ExerciseCardProps) {
  const ready = exercise.status === "ready";

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={() => onSelect(exercise.id)}
      aria-pressed={selected}
      className={[
        "rounded-2xl border p-3.5 text-left transition-colors",
        ready
          ? "bg-surface cursor-pointer"
          : "bg-surface-sunken cursor-not-allowed opacity-85",
        selected
          ? "border-brand-500 shadow-[0_12px_30px_-16px] shadow-brand-500/60"
          : ready
            ? "border-line hover:border-brand-300"
            : "border-line",
      ].join(" ")}
    >
      {/* 썸네일 플레이스홀더 */}
      <div
        className={[
          "mb-3 flex h-37.5 items-center justify-center rounded-xl",
          selected ? "bg-brand-50" : "bg-[#eef2f0]",
        ].join(" ")}
      >
        <span
          className={[
            "h-15.5 w-11 rounded-t-3xl",
            selected ? "bg-brand-300" : "bg-[#d4dcd9]",
          ].join(" ")}
        />
      </div>

      {/* 이름 + 상태 배지 */}
      <div className="flex items-center justify-between px-1 pb-0.5">
        <span
          className={[
            "text-base font-bold",
            ready ? "text-ink" : "text-ink-muted",
          ].join(" ")}
        >
          {exercise.name}
        </span>
        {ready ? <></> : <Badge>준비 중</Badge>}
      </div>
    </button>
  );
}
