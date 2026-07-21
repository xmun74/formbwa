import type { Coach } from "../model/coaches";

const ACCENT_BG: Record<Coach["accent"], string> = {
  warm: "bg-coach-warm",
  cool: "bg-coach-cool",
};

interface CoachCardProps {
  coach: Coach;
  selected: boolean;
  onSelect: (id: Coach["id"]) => void;
}

/** 코치 선택 카드 — 아바타 + 이름/톤 + 대표 멘트. 선택 시 브랜드 보더 + 연초록 배경. */
export function CoachCard({ coach, selected, onSelect }: CoachCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(coach.id)}
      aria-pressed={selected}
      className={[
        "rounded-2xl border p-5 text-left transition-colors",
        selected
          ? "border-brand-500 bg-brand-50"
          : "border-line bg-surface hover:border-brand-300",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <span
          className={`${ACCENT_BG[coach.accent]} grid size-11 shrink-0 place-items-center rounded-full text-[19px]`}
        >
          {coach.emoji}
        </span>
        <div>
          <div className="text-ink text-[16px] font-bold">{coach.name}</div>
          <div className="text-ink-muted text-[13px]">{coach.tone}</div>
        </div>
      </div>
      <p className="text-ink-soft mt-3.5 text-[14px] italic">“{coach.quote}”</p>
    </button>
  );
}
