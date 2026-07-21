"use client";

import Image from "next/image";

import type { Coach } from "../model/coaches";

/**
 * 캐릭터 + 대표 멘트 말풍선.
 *
 * 성격은 멘트(카피)와 말풍선 형태로 낸다 — 유아용 캐릭터가 되지 않도록.
 */

/** 말풍선 성격을 border-radius로: 열정은 조이고, 사투리는 늘어진다 */
const BUBBLE_SHAPE: Record<Coach["bubble"], string> = {
  tight: "rounded-[1.25rem_1.25rem_1.25rem_0.375rem]",
  drawl: "rounded-[1.75rem_1.5rem_2rem_0.5rem]",
};

const ACCENT: Record<
  Coach["accent"],
  { bubble: string; badge: string; stage: string }
> = {
  warm: {
    bubble: "bg-coach-warm-deep",
    badge: "bg-coach-warm/25 text-coach-warm-deep",
    stage: "from-coach-warm/12",
  },
  clay: {
    bubble: "bg-coach-clay-deep",
    badge: "bg-coach-clay/22 text-coach-clay-deep",
    stage: "from-coach-clay/12",
  },
};

interface CoachCardProps {
  coach: Coach;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function CoachCard({ coach, selected, onSelect }: CoachCardProps) {
  const accent = ACCENT[coach.accent];

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(coach.id)}
      className={`group bg-surface relative flex flex-col rounded-3xl border-2 p-4 text-left transition-[border-color,box-shadow,transform] duration-300 ease-out ${
        selected
          ? "border-mint-500 shadow-[0_0_0_6px_var(--color-mint-300)]/40 -translate-y-0.5"
          : "border-line/70 hover:border-line hover:-translate-y-0.5"
      }`}
    >
      {/* 선택 표시 — 목업의 우상단 원 */}
      <span
        aria-hidden
        className={`absolute top-6 right-6 z-10 grid size-6 place-items-center rounded-full border-2 transition-colors duration-300 ${
          selected ? "border-mint-600 bg-mint-600" : "border-line bg-surface"
        }`}
      >
        {selected && (
          <svg
            viewBox="0 0 12 10"
            className="w-3 fill-none stroke-white stroke-[2.5]"
          >
            <path
              d="M1 5l3.2 3.2L11 1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      {/* 캐릭터 무대 — 배경을 제거했으므로 여기서 바닥을 만들어준다 */}
      <div
        className={`relative flex h-56 items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b to-transparent ${accent.stage}`}
      >
        <div
          className="bg-mint-900/15 absolute bottom-5 h-1.5 w-16 rounded-[50%] blur-[3px]"
          aria-hidden
        />
        <Image
          src={coach.image.src}
          alt=""
          width={coach.image.width}
          height={coach.image.height}
          priority
          className="relative h-[88%] w-auto object-contain"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <h3 className="text-ink text-lg font-bold">{coach.name}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-bold ${accent.badge}`}
        >
          {coach.badge}
        </span>
      </div>
      <p className="text-ink-soft mt-1.5 text-sm leading-relaxed">
        {coach.tone}
      </p>

      {/* 멘트 한 마디가 캐릭터 소개를 대신한다 */}
      <div
        className={`mt-4 px-4 py-3.5 ${BUBBLE_SHAPE[coach.bubble]} ${accent.bubble}`}
      >
        <p className="text-sm leading-relaxed font-semibold text-balance text-white">
          {coach.sampleLine}
        </p>
      </div>

      {/* M4에서 샘플 mp3 재생으로 교체 (PRD §12 게이트 통과 후) */}
      <span className="text-ink-soft group-hover:text-ink mt-3 text-xs transition-colors">
        들어보기
      </span>
    </button>
  );
}
