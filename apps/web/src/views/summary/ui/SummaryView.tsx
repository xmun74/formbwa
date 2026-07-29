"use client";

import { Clock, RotateCcw, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { displayName, useWorkoutStore } from "@/entities/workout";
import { Button, Card } from "@repo/ui";
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
  const { nickname, coach, setNo, totalSets, result } = useWorkoutStore();

  const ringLength = 2 * Math.PI * 81; // r=81
  const ringOffset = ringLength * (1 - result.quality / 100);

  const items = [
    {
      icon: <RotateCcw className="size-5" />,
      label: "완료 횟수",
      value: `${result.reps} / ${result.targetReps}회`,
    },
    {
      icon: <Trophy className="size-5" />,
      label: "세트 진행",
      value: `${setNo} / ${totalSets}세트`,
    },
    {
      icon: <Clock className="size-5" />,
      label: "운동 시간",
      value: result.durationLabel,
    },
  ];

  return (
    <AppShell>
      <div className="px-gutter mx-auto max-w-3xl py-16">
        <div className="flex flex-col items-center text-center">
          <span className="bg-brand-500 grid size-16 place-items-center rounded-full text-3xl text-white">
            ✓
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight">
            {setNo}세트 완료!
          </h1>
          <p className="text-ink-soft mt-2 text-base">
            {displayName(nickname)}님, 오늘도 잘 해냈어요 👏
          </p>
        </div>

        {/* 스탯 — 좌: 자세 정확도 원형 로딩바 / 우: 나머지 지표 */}
        <div className="mt-9 grid grid-cols-[auto_1fr] items-center gap-8">
          {/* 자세 정확도 링 */}
          <div className="flex flex-col items-center">
            <div className="relative grid size-44 place-items-center">
              <svg viewBox="0 0 176 176" className="size-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="81"
                  fill="none"
                  strokeWidth="14"
                  className="stroke-brand-100"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="81"
                  fill="none"
                  strokeWidth="14"
                  strokeLinecap="round"
                  className="stroke-brand-400"
                  style={{
                    strokeDasharray: ringLength,
                    strokeDashoffset: ringOffset,
                  }}
                />
              </svg>
              <div className="absolute flex items-baseline">
                <span className="text-ink text-4xl font-extrabold">
                  {result.quality}
                </span>
                <span className="text-ink text-lg font-bold">%</span>
              </div>
            </div>
            <span className="text-ink-muted mt-3 text-base">자세 정확도</span>
          </div>

          {/* 나머지 지표 */}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="bg-brand-50 flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
              >
                <span className="bg-surface text-brand-500 grid size-11 shrink-0 place-items-center rounded-xl">
                  {item.icon}
                </span>
                <div>
                  <div className="text-ink-muted text-sm">{item.label}</div>
                  <div className="text-ink text-lg font-bold">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {result.points.length > 0 && (
          <Card className="mt-4 p-6">
            <div className="text-brand-700 text-base font-bold">
              가장 많이 나온 포인트
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.points.map((p) => (
                <span
                  key={p.label}
                  className={`${POINT_CLASS[p.tone]} rounded-full px-3 py-1.5 text-sm font-semibold`}
                >
                  {p.label} ({p.count}회)
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* 코치 총평 */}
        <div className="bg-brand-50 mt-4 flex gap-4 rounded-2xl p-6">
          <span className="bg-coach-warm grid size-10 shrink-0 place-items-center rounded-full text-xl">
            {coach.emoji}
          </span>
          <div>
            <div className="text-ink text-base font-bold">
              {coach.name}의 총평
            </div>
            <p className="text-ink-soft mt-1.5 text-base leading-relaxed">
              {result.coachComment}
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
