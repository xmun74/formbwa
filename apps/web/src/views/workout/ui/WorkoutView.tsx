"use client";

import { useRouter } from "next/navigation";

import { displayName, useWorkoutStore } from "@/entities/workout";
import { ExitButton } from "@/shared/ui/exit-button";

import { DARK_STRIPE } from "../model/workout";

/**
 * `/workout` 운동 화면 (PRD §4-4) — 좌: 내 웹캠 + 관절 오버레이 + 세트 스탯,
 * 우: 코치 시범 영상 + 음성 캡션. "세트 끝내기" → `/summary`.
 */
export function WorkoutView() {
  const router = useRouter();
  const { exerciseName, setNo, coach, nickname, result } = useWorkoutStore();
  const panel = `border-dark-line relative overflow-hidden rounded-2xl border ${DARK_STRIPE}`;

  return (
    <div className="bg-dark-canvas flex min-h-screen flex-col">
      {/* 상단바 */}
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
        <div className="text-dark-ink flex items-center gap-2 text-base font-bold">
          <span className="bg-live size-2 rounded-full" />
          {exerciseName} · {setNo}세트
        </div>
        <div className="flex items-center gap-3 text-base">
          <span className="text-dark-ink-muted">{coach.name} 코치 중</span>
          <ExitButton />
          <button
            type="button"
            onClick={() => router.push("/summary")}
            className="bg-brand-500 hover:bg-brand-600 rounded-full px-4 py-2 font-bold text-white transition-colors"
          >
            세트 끝내기 →
          </button>
        </div>
      </header>

      {/* 2패널 */}
      <div className="grid min-h-0 flex-1 grid-cols-[38fr_62fr] gap-3 px-3 pb-3">
        {/* 좌: 웹캠 + 스탯 */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className={`${panel} flex-1`}>
            <span className="bg-dark-canvas/70 text-dark-ink-muted absolute top-3 left-3 rounded-md px-2 py-1 text-xs">
              내 웹캠 · 관절 오버레이
            </span>
            <span className="ring-dark-canvas absolute top-[38%] left-[38%] size-3.5 rounded-full bg-[#f4d35e] ring-2" />
            <span className="bg-live ring-dark-canvas absolute top-[56%] left-[46%] size-3.5 rounded-full ring-2" />
            <span className="bg-dark-surface-2/70 absolute bottom-0 left-1/4 h-56 w-[90px] rounded-t-[45px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-surface rounded-xl px-4 py-3">
              <div className="text-dark-ink-muted text-sm">이번 세트</div>
              <div className="text-dark-ink mt-1 text-2xl font-extrabold">
                {result.reps}
                <span className="text-dark-ink-muted ml-1 text-base font-medium">
                  회
                </span>
              </div>
            </div>
            <div className="bg-dark-surface rounded-xl px-4 py-3">
              <div className="text-dark-ink-muted text-sm">자세 품질</div>
              <div className="text-brand-300 mt-1 text-2xl font-extrabold">
                {result.quality}
                <span className="text-dark-ink-muted ml-0.5 text-base font-medium">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 우: 코치 시범 + 음성 캡션 */}
        <div className={panel}>
          <span className="bg-dark-canvas/70 text-dark-ink-muted absolute top-3 left-3 rounded-md px-2 py-1 text-xs">
            코치 시범 영상 · 사전 렌더 루프
          </span>
          <span className="bg-brand-500/20 text-brand-300 absolute top-3 right-3 rounded-full px-3 py-1 text-sm font-bold">
            따라 하기
          </span>
          <span className="bg-dark-surface-2/60 absolute bottom-0 left-1/2 h-72 w-[120px] -translate-x-1/2 rounded-t-[60px]" />

          <div className="border-dark-line bg-dark-surface-2 absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.7)]">
            <span className="bg-brand-600 grid size-9 shrink-0 place-items-center rounded-full text-base">
              🔊
            </span>
            <div>
              <div className="text-dark-ink-muted text-xs">
                {displayName(nickname)}님
              </div>
              <div className="text-dark-ink text-lg font-bold">
                {result.liveCaption}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
