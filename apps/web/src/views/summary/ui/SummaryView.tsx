"use client";

import { useRouter } from "next/navigation";

import { SESSION, SET_RESULT } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { AppShell } from "@/shared/ui/app-shell";

const POINT_CLASS: Record<string, string> = {
  coral: "bg-point-coral text-point-coral-ink",
  amber: "bg-point-amber text-point-amber-ink",
};

/**
 * `/summary` 요약 (PRD §4-4) — 라이트 테마. 세트 결과 + 코치 총평.
 * "한 세트 더" → /workout, "다른 운동" → /exercises.
 */
export function SummaryView() {
  const router = useRouter();

  const stats = [
    { value: String(SET_RESULT.reps), label: "총 횟수", accent: false },
    { value: `${SET_RESULT.quality}%`, label: "좋은 자세 비율", accent: true },
    { value: SET_RESULT.durationLabel, label: "운동 시간", accent: false },
  ];

  return (
    <AppShell>
      <div className="px-gutter mx-auto max-w-3xl py-16">
        <div className="flex flex-col items-center text-center">
          <span className="bg-brand-500 grid size-16 place-items-center rounded-full text-[28px] text-white">
            ✓
          </span>
          <h1 className="mt-5 text-[30px] font-extrabold tracking-tight">
            {SESSION.setNo}세트 완료!
          </h1>
          <p className="text-ink-soft mt-2 text-[15px]">
            {SESSION.nickname}님, 오늘도 잘 해냈어요 👏
          </p>
        </div>

        {/* 스탯 3개 */}
        <div className="mt-9 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="border-line bg-surface rounded-2xl border p-6 text-center"
            >
              <div
                className={`text-[28px] font-extrabold ${s.accent ? "text-brand-600" : "text-ink"}`}
              >
                {s.value}
              </div>
              <div className="text-ink-muted mt-1.5 text-[14px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 가장 많이 나온 포인트 */}
        <div className="border-line bg-surface mt-4 rounded-2xl border p-6">
          <div className="text-brand-700 text-[14px] font-bold">
            가장 많이 나온 포인트
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SET_RESULT.points.map((p) => (
              <span
                key={p.label}
                className={`${POINT_CLASS[p.tone]} rounded-full px-3 py-1.5 text-[13px] font-semibold`}
              >
                {p.label} ({p.count}회)
              </span>
            ))}
          </div>
        </div>

        {/* 코치 총평 */}
        <div className="bg-brand-50 mt-4 flex gap-4 rounded-2xl p-6">
          <span className="bg-coach-warm grid size-10 shrink-0 place-items-center rounded-full text-[19px]">
            {SESSION.coach.emoji}
          </span>
          <div>
            <div className="text-ink text-[15px] font-bold">
              {SESSION.coach.name}의 총평
            </div>
            <p className="text-ink-soft mt-1.5 text-[14.5px] leading-relaxed">
              {SET_RESULT.coachComment}
            </p>
          </div>
        </div>

        {/* 액션 */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="primary"
            className="px-10 py-3.5"
            onClick={() => router.push("/workout")}
          >
            한 세트 더
          </Button>
          <Button
            variant="secondary"
            className="px-10 py-3.5"
            onClick={() => router.push("/exercises")}
          >
            다른 운동
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
