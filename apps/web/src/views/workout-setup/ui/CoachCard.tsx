import Image from "next/image";
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

/**
 * 코치 선택 카드 (리치) — 상단 이미지 + 이름/태그라인/설명 + 3지표 + 선택 상태.
 * 카드 전체가 선택 버튼. 선택 시 브랜드 링 + 그림자 강조.
 * (이미지·지표는 목 데이터 → M4에서 실제 코치 에셋으로 교체)
 */
export function CoachCard({ coach, selected, onSelect }: CoachCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(coach.id)}
      aria-pressed={selected}
      className={[
        "bg-surface flex flex-col overflow-hidden rounded-2xl border text-left transition-colors",
        selected
          ? "border-brand-500 shadow-[0_12px_30px_-16px] shadow-brand-500/60"
          : "border-line hover:border-brand-300",
      ].join(" ")}
    >
      {/* 코치 전신 클레이 포즈 (characterId로 경로 유도) */}
      <div
        className={`${ACCENT_BG[coach.accent]} relative h-42 overflow-hidden`}
      >
        <Image
          src={`/coaches/${coach.characterId}-pose.png`}
          alt={coach.name}
          fill
          sizes="280px"
          className="object-contain object-bottom"
        />
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-ink text-xl font-extrabold tracking-tight">
          {coach.name}
        </h3>

        {/* 3지표 */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {coach.stats.map((s) => (
            <div
              key={s.label}
              className="bg-line-soft rounded-xl px-1.5 py-2.5 text-center"
            >
              <div className="text-ink-muted text-xs">{s.label}</div>
              <div className="text-ink mt-0.5 text-sm font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* 하단: 선택 상태 + 화살표 */}
        <div className="mt-5 flex items-center justify-between">
          <span
            className={`text-base font-bold ${selected ? "text-brand-700" : "text-ink-muted"}`}
          >
            {selected ? "선택됨" : "이 코치 선택"}
          </span>
          <span
            className={[
              "grid size-9 place-items-center rounded-full text-lg transition-colors",
              selected
                ? "bg-brand-400 text-white"
                : "border-line text-ink-muted border",
            ].join(" ")}
          >
            →
          </span>
        </div>
      </div>
    </button>
  );
}
