"use client";

import {
  Coach,
  DEFAULT_SQUAT_CONFIG,
  defaultJudgeConfig,
  judgeRep,
  SquatFSM,
  type JudgeEventType,
  type PoseFeatures,
} from "@repo/core";
import { Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { displayName, useWorkoutStore } from "@/entities/workout";
import { useCameraPose } from "@/shared/lib/pose";
import { cancelSpeech, speak } from "@/shared/lib/speech";
import { ExitGuard } from "@/shared/ui/exit-guard";
import { DARK_STRIPE } from "../model/workout";
import { pickLine } from "../model/mnemonics";
import { buildSetResult } from "../model/setResult";

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
  const setResult = useWorkoutStore((s) => s.setResult);
  const panel = `border-dark-line relative overflow-hidden rounded-2xl border ${DARK_STRIPE}`;

  const standing = standingKneeAngle ?? DEFAULT_STANDING_KNEE_ANGLE;
  const fsmRef = useRef<SquatFSM | null>(null);
  fsmRef.current ??= new SquatFSM({
    standingKneeAngle: standing,
    ...DEFAULT_SQUAT_CONFIG,
  });
  const judgeCfgRef = useRef(defaultJudgeConfig(standing));
  const coachRef = useRef<Coach | null>(null);
  coachRef.current ??= new Coach();
  const coachIdRef = useRef(coach.id);
  coachIdRef.current = coach.id;

  // 세트 종료 요약용 누적치 (리렌더 불필요 → ref)
  const faultCountsRef = useRef<Partial<Record<JudgeEventType, number>>>({});
  const startMsRef = useRef(performance.now());

  const [reps, setReps] = useState(0);
  const [goodReps, setGoodReps] = useState(0);
  const [caption, setCaption] = useState("자세를 잡고 시작해요");
  const [voiceOn, setVoiceOn] = useState(true);
  const voiceOnRef = useRef(voiceOn);
  voiceOnRef.current = voiceOn;
  const quality = reps > 0 ? Math.round((goodReps / reps) * 100) : 0;

  const onFeatures = useCallback((features: PoseFeatures, tMs: number) => {
    const rep = fsmRef.current!.update(features, tMs);
    if (!rep) return;
    const events = judgeRep(rep, judgeCfgRef.current);
    setReps(rep.repIndex);
    const faults = events.filter(
      (e) => e.type !== "rep_counted" && e.type !== "good_rep",
    );
    if (faults.length === 0) setGoodReps((g) => g + 1);
    for (const f of faults) {
      faultCountsRef.current[f.type] =
        (faultCountsRef.current[f.type] ?? 0) + 1;
    }
    // 멘트 결정(쿨다운·우선순위·침묵) → 캐릭터 대사로 자막 + 임시 음성(Web Speech, M4에 mp3)
    const { clipKey } = coachRef.current!.decide(events, tMs);
    if (clipKey) {
      const line = pickLine(coachIdRef.current, clipKey);
      if (line) {
        setCaption(line);
        if (voiceOnRef.current) speak(line);
      }
    }
  }, []);

  // 화면 떠날 때 남은 음성 중단
  useEffect(() => cancelSpeech, []);

  const { videoRef, canvasRef, status } = useCameraPose({ onFeatures });

  const finishSet = () => {
    setResult(
      buildSetResult({
        reps,
        goodReps,
        faultCounts: faultCountsRef.current,
        durationMs: performance.now() - startMsRef.current,
      }),
    );
    router.push("/summary");
  };

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
            onClick={finishSet}
            className="bg-brand-500 hover:bg-brand-600 rounded-full px-4 py-2 font-bold text-white transition-colors"
          >
            세트 끝내기 →
          </button>
        </div>
      </header>

      {/* 2패널 */}
      <div className="grid min-h-0 flex-1 grid-cols-[38fr_62fr] gap-3 px-3 pb-3">
        {/* 좌: 웹캠·오버레이 (스탯은 위에 absolute HUD로) */}
        <div className={`${panel} min-h-0`}>
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 size-full -scale-x-100 object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 size-full -scale-x-100 object-cover"
          />
          <span className="bg-dark-canvas/70 text-dark-ink-muted absolute top-3 left-3 z-10 rounded-md px-2 py-1 text-xs">
            내 웹캠 · 관절 오버레이
          </span>
          {status !== "ready" && (
            <div className="text-dark-ink-soft absolute inset-0 grid place-items-center text-base">
              {STATUS_TEXT[status]}
            </div>
          )}

          {/* 스탯 HUD — 화면 위에 겹쳐 출력 */}
          <div className="absolute top-4 right-4 z-10 flex gap-3">
            <div className="w-35 bg-dark-surface/85 rounded-2xl px-4.5 py-3 backdrop-blur-sm flex flex-col gap-1">
              <div className="text-dark-ink-muted text-base">이번 세트</div>
              <div className="text-dark-ink mt-1 text-5xl font-extrabold">
                {reps}
                <span className="text-dark-ink-muted ml-1 text-xl font-medium">
                  회
                </span>
              </div>
            </div>
            <div className="w-35 bg-dark-surface/85 rounded-2xl px-4.5 py-3 backdrop-blur-sm flex flex-col gap-1">
              <div className="text-dark-ink-muted text-base">자세 품질</div>
              <div className="text-brand-300 mt-1 text-5xl font-extrabold">
                {quality}
                <span className="text-dark-ink-muted ml-0.5 text-xl font-medium">
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
            <button
              type="button"
              onClick={() => {
                setVoiceOn((v) => !v);
                cancelSpeech();
              }}
              aria-label={voiceOn ? "음성 끄기" : "음성 켜기"}
              className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors ${
                voiceOn
                  ? "bg-brand-600 text-white"
                  : "bg-dark-line text-dark-ink-muted"
              }`}
            >
              {voiceOn ? (
                <Volume2 className="size-5" />
              ) : (
                <VolumeX className="size-5" />
              )}
            </button>
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
