"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Coach,
  DEFAULT_COACH_CONFIG,
  DEFAULT_SQUAT_CONFIG,
  defaultJudgeConfig,
  judgeRep,
  SquatFSM,
  type JudgeEventType,
  type PoseFeatures,
} from "@repo/core";
import { displayName, useWorkoutStore } from "@/entities/workout";
import { ROUTES } from "@/shared/config";
import { track } from "@/shared/lib/analytics";
import { playClip, stopClip } from "@/shared/lib/audio";
import { CoachDemo } from "@/shared/lib/coach-demo";
import { useCameraPose } from "@/shared/lib/pose";
import { ExitGuard } from "@/shared/ui/exit-guard";
import { personalize, pickLine } from "../model/mnemonics";
import { buildSetResult } from "../model/setResult";
import {
  COUNTDOWN_FROM,
  DARK_STRIPE,
  REST_SECONDS,
  SET_END_DELAY_MS,
  SET_TARGET_REPS,
} from "../model/workout";

// /prepare 캘리브레이션 미측정 시 기본값
const DEFAULT_STANDING_KNEE_ANGLE = 170;

// 실사용 튜닝 (fixture 검증과 별개 — 라이브는 더 자주·바로 교정). core 기본값은 보수적이라 여기서 완화.
const LIVE_GRACE_REPS = 0; // 첫 회부터 교정
const LIVE_COACH_CONFIG = {
  ...DEFAULT_COACH_CONFIG,
  cooldownMs: 2500, // 1~2회마다 피드백
  minConfidence: 0.72, // 어느 정도 틀리면 교정
  suppressRepeat: false, // 같은 실수 반복해도 계속 교정 (변형 멘트)
};
const QUIET_REPS_FOR_MOTIVATION = 4; // 연속 이만큼 멘트 없으면 동기부여
const MOTIVATION_COOLDOWN_MS = 8000; // 동기부여 최소 간격(ms) — 결함 교정과 안 겹치게

const STATUS_TEXT = {
  loading: "카메라·모델 준비 중…",
  denied: "카메라 권한이 필요해요",
  error: "카메라를 시작할 수 없어요",
  ready: "",
} as const;

export function WorkoutView() {
  const router = useRouter();
  const {
    exerciseName,
    exerciseId,
    setNo,
    totalSets,
    coach,
    nickname,
    standingKneeAngle,
  } = useWorkoutStore();
  const setResult = useWorkoutStore((s) => s.setResult);
  const nextSet = useWorkoutStore((s) => s.nextSet);
  // 표시 이름(비면 "회원"). 운동 중엔 안 바뀌지만 onFeatures 클로저용으로 ref에도 보관
  const name = displayName(nickname);
  const nameRef = useRef(name);
  nameRef.current = name;
  const panel = `border-dark-line relative overflow-hidden rounded-2xl border ${DARK_STRIPE}`;

  const standing = standingKneeAngle ?? DEFAULT_STANDING_KNEE_ANGLE;
  const standingRef = useRef(standing); // onFeatures(deps []) 클로저용 — [depth-debug]
  standingRef.current = standing;
  const fsmRef = useRef<SquatFSM | null>(null);
  fsmRef.current ??= new SquatFSM({
    standingKneeAngle: standing,
    ...DEFAULT_SQUAT_CONFIG,
  });
  const judgeCfgRef = useRef({
    ...defaultJudgeConfig(standing),
    graceReps: LIVE_GRACE_REPS,
  });
  const coachRef = useRef<Coach | null>(null);
  coachRef.current ??= new Coach(LIVE_COACH_CONFIG);
  const coachIdRef = useRef(coach.id);
  coachIdRef.current = coach.id;
  const exerciseIdRef = useRef(exerciseId);
  exerciseIdRef.current = exerciseId;
  const quietStreakRef = useRef(0); // 연속 멘트 없는 회 수 (동기부여 트리거)
  const lastMotivationMsRef = useRef(0);

  // 세트 종료 요약용 누적치 (리렌더 불필요 → ref)
  const faultCountsRef = useRef<Partial<Record<JudgeEventType, number>>>({});
  const startMsRef = useRef(performance.now());

  const [reps, setReps] = useState(0);
  const [goodReps, setGoodReps] = useState(0);
  const [caption, setCaption] = useState(() =>
    personalize("자세를 잡고 시작해요", name),
  );
  const startAnnouncedRef = useRef(false);
  const lastLineRef = useRef<string | null>(null); // 직전 대사 — 연속 중복 멘트 방지
  const finishedRef = useRef(false); // 세트 종료 1회 보장 (자동·수동 중복 방지)
  const [voiceOn, setVoiceOn] = useState(true);
  const voiceOnRef = useRef(voiceOn);
  voiceOnRef.current = voiceOn;
  // 세트 흐름: 운동 중 vs 세트 간 휴식. resting 중엔 판정을 멈춘다.
  const [phase, setPhase] = useState<"exercising" | "resting">("exercising");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [restLeft, setRestLeft] = useState(0);
  const quality = reps > 0 ? Math.round((goodReps / reps) * 100) : 0;
  const remaining = Math.max(0, SET_TARGET_REPS - reps);
  const countingDown = remaining > 0 && remaining <= COUNTDOWN_FROM;

  const onFeatures = useCallback((features: PoseFeatures, tMs: number) => {
    if (phaseRef.current !== "exercising") return; // 휴식 중엔 판정 안 함
    const rep = fsmRef.current!.update(features, tMs);
    if (!rep) return;
    const events = judgeRep(rep, judgeCfgRef.current);
    // [depth-debug] 임시(dev 전용): 회당 깊이 판정 근거. shallow=true인데 몸으론 정상 깊이면 오탐.
    if (process.env.NODE_ENV !== "production") {
      console.log("[depth-debug] rep", {
        idx: rep.repIndex,
        S: standingRef.current,
        minKnee: Math.round(rep.minKneeAngle),
        target: Math.round(judgeCfgRef.current.depthTargetAngle),
        bend: Math.round(standingRef.current - rep.minKneeAngle),
        shallow: events.some((e) => e.type === "knee_shallow"),
      });
    }
    setReps(rep.repIndex);
    const faults = events.filter(
      (e) => e.type !== "rep_counted" && e.type !== "good_rep",
    );
    if (faults.length === 0) setGoodReps((g) => g + 1);
    for (const f of faults) {
      faultCountsRef.current[f.type] =
        (faultCountsRef.current[f.type] ?? 0) + 1;
    }
    // 멘트: 결함/칭찬 우선 (core Coach 쿨다운·우선순위·침묵)
    const { clipKey } = coachRef.current!.decide(events, tMs);
    let spoke = false;
    if (clipKey) {
      const line = pickLine(
        coachIdRef.current,
        exerciseIdRef.current,
        clipKey,
        lastLineRef.current,
      );
      if (line) {
        lastLineRef.current = line; // 다음 발화에서 이 대사 중복 금지
        // 자막엔 이름을 얹고(§6.1), 실시간 음성엔 이름 없이 원문만 재생
        setCaption(personalize(line, nameRef.current));
        if (voiceOnRef.current) {
          void playClip({ coachId: coachIdRef.current, clipKey, text: line });
        }
        spoke = true;
      }
    }

    // 동기부여: 결함/칭찬이 안 나온 회에만 — 마일스톤(절반·막판) or 조용할 때, 쿨다운 준수
    if (spoke) {
      quietStreakRef.current = 0;
    } else {
      quietStreakRef.current += 1;
      const remaining = SET_TARGET_REPS - rep.repIndex;
      const milestone =
        rep.repIndex === Math.floor(SET_TARGET_REPS / 2) ||
        remaining === 3 ||
        remaining === 1;
      const quiet = quietStreakRef.current >= QUIET_REPS_FOR_MOTIVATION;
      if (
        (milestone || quiet) &&
        tMs - lastMotivationMsRef.current > MOTIVATION_COOLDOWN_MS
      ) {
        const line = pickLine(
          coachIdRef.current,
          exerciseIdRef.current,
          "motivation",
          lastLineRef.current,
        );
        if (line) {
          lastLineRef.current = line;
          lastMotivationMsRef.current = tMs;
          quietStreakRef.current = 0;
          setCaption(personalize(line, nameRef.current));
          if (voiceOnRef.current) {
            void playClip({
              coachId: coachIdRef.current,
              clipKey: "motivation",
              text: line,
            });
          }
        }
      }
    }
  }, []);

  // 화면 떠날 때 남은 재생(mp3·음성) 중단
  useEffect(() => stopClip, []);

  const { videoRef, canvasRef, status } = useCameraPose({ onFeatures });

  // 세트 시작 이름 호명 — 카메라 준비되면 1회. 비-실시간이라 런타임 TTS 허용(§6.1)
  useEffect(() => {
    if (status !== "ready" || startAnnouncedRef.current) return;
    startAnnouncedRef.current = true;
    track("workout_started");
    // 시작 시 올바른 자세 설명 (운동별 form_intro). 없으면 기본 멘트
    const intro =
      pickLine(coachIdRef.current, exerciseIdRef.current, "form_intro") ??
      "시작해볼게요!";
    setCaption(personalize(intro, nameRef.current));
    // mp3 있으면 form_intro mp3, 없으면 playClip 내부에서 Web Speech 폴백
    if (voiceOnRef.current) {
      void playClip({
        coachId: coachIdRef.current,
        clipKey: "form_intro",
        text: intro,
      });
    }
  }, [status]);

  // 다음 세트 시작 — 상태·엔진 리셋 후 다시 운동 (자동 진행)
  const startNextSet = useCallback(() => {
    nextSet();
    fsmRef.current = new SquatFSM({
      standingKneeAngle: standing,
      ...DEFAULT_SQUAT_CONFIG,
    });
    coachRef.current = new Coach(LIVE_COACH_CONFIG);
    faultCountsRef.current = {};
    startMsRef.current = performance.now();
    lastLineRef.current = null;
    quietStreakRef.current = 0;
    lastMotivationMsRef.current = 0;
    finishedRef.current = false;
    setReps(0);
    setGoodReps(0);
    setCaption(personalize("다음 세트 시작!", nameRef.current));
    setPhase("exercising");
  }, [nextSet, standing]);

  // 세트 완료 — 마지막 세트면 요약, 아니면 휴식 후 다음 세트. 멘트 여유 뒤 전환(오디오 안 잘리게).
  const completeSet = useCallback(() => {
    if (finishedRef.current) return; // 자동 완료와 수동 버튼 동시 방지
    finishedRef.current = true;
    const isLast = setNo >= totalSets;
    track("set_completed", { reps, quality });
    setCaption(
      personalize(isLast ? "마지막 세트 완료!" : `${setNo}세트 완료!`, name),
    );
    window.setTimeout(() => {
      if (isLast) {
        setResult(
          buildSetResult({
            reps,
            goodReps,
            targetReps: SET_TARGET_REPS,
            faultCounts: faultCountsRef.current,
            durationMs: performance.now() - startMsRef.current,
          }),
        );
        router.push(ROUTES.SUMMARY);
      } else {
        setRestLeft(REST_SECONDS);
        setPhase("resting");
      }
    }, SET_END_DELAY_MS);
  }, [reps, goodReps, quality, name, setNo, totalSets, setResult, router]);

  // 목표 횟수를 채우면 자동으로 세트 완료
  useEffect(() => {
    if (reps >= SET_TARGET_REPS) completeSet();
  }, [reps, completeSet]);

  // 휴식 카운트다운 → 0이면 다음 세트 자동 시작
  useEffect(() => {
    if (phase !== "resting") return;
    if (restLeft <= 0) {
      startNextSet();
      return;
    }
    const t = window.setTimeout(() => setRestLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, restLeft, startNextSet]);

  return (
    <div className="bg-dark-canvas flex min-h-screen flex-col">
      {/* 상단바 */}
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
        <div className="text-dark-ink flex items-center gap-2 text-base font-bold">
          <span className="bg-live size-2 rounded-full" />
          {exerciseName} · {setNo}/{totalSets}세트
        </div>
        <div className="flex items-center gap-3 text-base">
          <span className="text-dark-ink-muted">{coach.name} 코치 중</span>
          <ExitGuard />
          <button
            type="button"
            onClick={completeSet}
            className="bg-brand-500 hover:bg-brand-600 rounded-full px-4 py-2 font-bold text-white transition-colors"
          >
            세트 끝내기 →
          </button>
        </div>
      </header>

      {/* 세트 간 휴식 — 카운트다운 끝나면 다음 세트 자동 시작 */}
      {phase === "resting" && (
        <div className="bg-dark-canvas/95 fixed inset-0 z-30 grid place-items-center backdrop-blur-sm">
          <div className="text-center">
            <div className="text-dark-ink text-3xl font-extrabold">
              {setNo}세트 완료! 💪
            </div>
            <div className="text-dark-ink-soft mt-3 text-lg">다음 세트까지</div>
            <div className="text-brand-300 mt-1 text-7xl font-extrabold tabular-nums">
              {restLeft}
            </div>
            <button
              type="button"
              onClick={startNextSet}
              className="bg-brand-500 hover:bg-brand-600 mt-6 rounded-full px-8 py-3 font-bold text-white transition-colors"
            >
              바로 시작
            </button>
          </div>
        </div>
      )}

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
                  / {SET_TARGET_REPS}
                </span>
              </div>
              {countingDown && (
                <div className="text-brand-300 text-base font-bold">
                  {remaining}개 남았어요!
                </div>
              )}
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
          {/* mp4 있으면 재생, 없으면 실루엣 플레이스홀더 (선구축) */}
          <CoachDemo
            characterId={coach.characterId}
            exerciseId={exerciseId}
            className="absolute inset-0 size-full object-cover"
          >
            <span className="bg-dark-surface-2/60 absolute bottom-0 left-1/2 h-72 w-30 -translate-x-1/2 rounded-t-[60px]" />
          </CoachDemo>

          <div className="border-dark-line bg-dark-surface-2 absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.7)]">
            <button
              type="button"
              onClick={() => {
                setVoiceOn((v) => !v);
                stopClip();
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
              <div className="text-dark-ink-muted text-xs">{coach.name}</div>
              <div className="text-dark-ink text-lg font-bold">{caption}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
