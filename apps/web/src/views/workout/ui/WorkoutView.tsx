"use client";

import {
  DEFAULT_SQUAT_CONFIG,
  defaultJudgeConfig,
  judgeRep,
  SquatFSM,
  type PoseFeatures,
} from "@repo/core";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { displayName, useWorkoutStore } from "@/entities/workout";
import { useCameraPose } from "@/shared/lib/pose";
import { ExitGuard } from "@/shared/ui/exit-guard";
import { DARK_STRIPE } from "../model/workout";
import { captionForEvents } from "../model/caption";

// /prepare 캘리브레이션 미측정 시 기본값
const DEFAULT_STANDING_KNEE_ANGLE = 170;

const STATUS_TEXT = {
  loading: "카메라·모델 준비 중…",
  denied: "카메라 권한이 필요해요",
  error: "카메라를 시작할 수 없어요",
  ready: "",
} as const;

export function WorkoutView() {
  const router = useRouter();
  const { exerciseName, setNo, coach, nickname, standingKneeAngle } =
    useWorkoutStore();
  const panel = `border-dark-line relative overflow-hidden rounded-2xl border ${DARK_STRIPE}`;

  const standing = standingKneeAngle ?? DEFAULT_STANDING_KNEE_ANGLE;
  const fsmRef = useRef<SquatFSM | null>(null);
  fsmRef.current ??= new SquatFSM({
    standingKneeAngle: standing,
    ...DEFAULT_SQUAT_CONFIG,
  });
  const judgeCfgRef = useRef(defaultJudgeConfig(standing));

  const [reps, setReps] = useState(0);
  const [goodReps, setGoodReps] = useState(0);
  const [caption, setCaption] = useState("자세를 잡고 시작해요");
  const quality = reps > 0 ? Math.round((goodReps / reps) * 100) : 0;

  const onFeatures = useCallback((features: PoseFeatures, tMs: number) => {
    const rep = fsmRef.current!.update(features, tMs);
    if (!rep) return;
    const events = judgeRep(rep, judgeCfgRef.current);
    setReps(rep.repIndex);
    const hasFault = events.some(
      (e) => e.type !== "rep_counted" && e.type !== "good_rep",
    );
    if (!hasFault) setGoodReps((g) => g + 1);
    const text = captionForEvents(events);
    if (text) setCaption(text);
  }, []);

  const { videoRef, canvasRef, status } = useCameraPose({ onFeatures });

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
          <ExitGuard />
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
        {/* 좌: 웹캠 + 오버레이 + 스탯 */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className={`${panel} flex-1`}>
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 size-full object-cover"
            />
            <canvas ref={canvasRef} className="absolute inset-0 size-full" />
            <span className="bg-dark-canvas/70 text-dark-ink-muted absolute top-3 left-3 z-10 rounded-md px-2 py-1 text-xs">
              내 웹캠 · 관절 오버레이
            </span>
            {status !== "ready" && (
              <div className="text-dark-ink-soft absolute inset-0 grid place-items-center text-base">
                {STATUS_TEXT[status]}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-surface rounded-xl px-4 py-3">
              <div className="text-dark-ink-muted text-sm">이번 세트</div>
              <div className="text-dark-ink mt-1 text-2xl font-extrabold">
                {reps}
                <span className="text-dark-ink-muted ml-1 text-base font-medium">
                  회
                </span>
              </div>
            </div>
            <div className="bg-dark-surface rounded-xl px-4 py-3">
              <div className="text-dark-ink-muted text-sm">자세 품질</div>
              <div className="text-brand-300 mt-1 text-2xl font-extrabold">
                {quality}
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
          <span className="bg-dark-surface-2/60 absolute bottom-0 left-1/2 h-72 w-30 -translate-x-1/2 rounded-t-[60px]" />

          <div className="border-dark-line bg-dark-surface-2 absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.7)]">
            <span className="bg-brand-600 grid size-9 shrink-0 place-items-center rounded-full text-base">
              🔊
            </span>
            <div>
              <div className="text-dark-ink-muted text-xs">
                {displayName(nickname)}님
              </div>
              <div className="text-dark-ink text-lg font-bold">{caption}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
