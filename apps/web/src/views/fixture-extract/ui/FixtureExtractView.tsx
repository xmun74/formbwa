"use client";

import {
  estimateStandingAngle,
  LM,
  runSquatPipeline,
  type JudgeEvent,
  type JudgeEventType,
  type PoseFrame,
} from "@repo/core";
import { useRef, useState } from "react";

import { preloadPoseModel } from "@/shared/lib/pose";

/**
 * fixture 추출 도구 (dev 전용, TRD-FE §5.4) — 로컬 스쿼트 영상 → 랜드마크 시퀀스 JSON.
 * 브라우저에서 MediaPipe로 프레임별 관절을 뽑아 `PoseFrame[]`로 저장하고,
 * 바로 `runSquatPipeline`을 돌려 감지 결과(회수·결함)를 미리 보여준다.
 * 영상은 업로드/전송 없이 브라우저 안에서만 처리된다. 사용법: docs/fixture-extraction.md
 */

// 오버레이용 골격 연결 (추적 확인용)
const CONNECTIONS: [number, number][] = [
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER, LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.LEFT_KNEE],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],
  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
];
const KEY_JOINTS = Object.values(LM);

type Phase = "idle" | "extracting" | "done";

interface Result {
  frames: PoseFrame[];
  events: JudgeEvent[];
  standing: number;
}

function drawOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  lm: PoseFrame["landmarks"],
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx || !video.videoWidth) return;
  const w = (canvas.width = video.videoWidth);
  const h = (canvas.height = video.videoHeight);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(60,202,169,0.85)";
  ctx.lineWidth = Math.max(3, w / 160);
  for (const [a, b] of CONNECTIONS) {
    const p = lm[a];
    const q = lm[b];
    if (!p || !q || p.visibility < 0.4 || q.visibility < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(p.x * w, p.y * h);
    ctx.lineTo(q.x * w, q.y * h);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(129,226,199,0.95)";
  for (const i of KEY_JOINTS) {
    const p = lm[i];
    if (!p || p.visibility < 0.4) continue;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, Math.max(4, w / 110), 0, Math.PI * 2);
    ctx.fill();
  }
}

function countEvents(events: JudgeEvent[]): Record<JudgeEventType, number> {
  const acc = {} as Record<JudgeEventType, number>;
  for (const e of events) acc[e.type] = (acc[e.type] ?? 0) + 1;
  return acc;
}

export function FixtureExtractView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [fps, setFps] = useState(20);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState({ t: 0, frames: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const onPickFile = (file: File) => {
    const video = videoRef.current;
    if (!video) return;
    setFileName(file.name);
    setName(file.name.replace(/\.[^.]+$/, ""));
    setPhase("idle");
    setResult(null);
    setError("");
    video.srcObject = null;
    video.src = URL.createObjectURL(file);
  };

  const extract = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.src) return;
    setError("");
    setResult(null);
    setPhase("extracting");
    setProgress({ t: 0, frames: 0 });

    let landmarker;
    try {
      landmarker = await preloadPoseModel();
    } catch {
      setError("포즈 모델 로드 실패 — 새로고침 후 다시 시도하세요.");
      setPhase("idle");
      return;
    }

    const frames: PoseFrame[] = [];
    const minGap = 1 / fps; // 샘플 간 mediaTime 간격(초)
    let lastSampled = -Infinity;

    video.currentTime = 0;
    try {
      await video.play();
    } catch {
      setError("영상 재생 실패 — 다른 파일로 시도하세요.");
      setPhase("idle");
      return;
    }

    const onFrame = (_now: number, meta: { mediaTime: number }) => {
      const mt = meta.mediaTime;
      if (mt - lastSampled >= minGap) {
        lastSampled = mt;
        try {
          // detectForVideo의 타임스탬프는 monotonic이면 되므로 실시간 시계를 쓰고,
          // fixture에 저장하는 timestampMs는 영상 타임라인(mediaTime)을 쓴다.
          const res = landmarker.detectForVideo(video, performance.now());
          const raw = res.landmarks?.[0];
          if (raw) {
            const landmarks = raw.map((p) => ({
              x: p.x,
              y: p.y,
              z: p.z,
              visibility: p.visibility ?? 1,
            }));
            frames.push({ landmarks, timestampMs: Math.round(mt * 1000) });
            drawOverlay(canvas, video, landmarks);
          }
        } catch {
          // 프레임 하나 실패는 무시하고 진행
        }
        setProgress({ t: mt, frames: frames.length });
      }
      if (!video.ended) video.requestVideoFrameCallback(onFrame);
    };

    video.requestVideoFrameCallback(onFrame);

    video.onended = () => {
      if (frames.length === 0) {
        setError(
          "추출된 프레임이 없습니다 — 영상에 사람이 보이는지 확인하세요.",
        );
        setPhase("idle");
        return;
      }
      const standing = estimateStandingAngle(frames);
      const events = runSquatPipeline(frames);
      setResult({ frames, events, standing });
      setPhase("done");
    };
  };

  const download = () => {
    if (!result) return;
    const payload = {
      name: name || "fixture",
      note,
      sourceFile: fileName,
      capturedFps: fps,
      frameCount: result.frames.length,
      estimatedStandingKneeAngle: Math.round(result.standing),
      extractedAt: new Date().toISOString(),
      frames: result.frames,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name || "fixture"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const counts = result ? countEvents(result.events) : null;
  const reps = counts?.rep_counted ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">
        fixture 추출 도구{" "}
        <span className="text-ink-muted text-sm font-normal">(dev 전용)</span>
      </h1>
      <p className="text-ink-soft mt-2 text-base leading-relaxed">
        스쿼트 영상 → 랜드마크 시퀀스 JSON. 영상은 브라우저 안에서만 처리되며
        업로드되지 않습니다. 사용법은 <code>docs/fixture-extraction.md</code>.
      </p>

      <div className="border-line bg-surface mt-6 grid gap-4 rounded-2xl border p-5">
        <label className="text-base font-bold">
          1. 영상 파일 선택
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
            }}
            className="mt-2 block w-full text-sm"
          />
        </label>

        <div className="relative overflow-hidden rounded-xl bg-black/90">
          {/* 미러 없이 원본 그대로 (녹화본이라 반전 불필요) */}
          <video
            ref={videoRef}
            muted
            playsInline
            controls
            className="max-h-[50vh] w-full object-contain"
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 size-full object-contain"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm">
            이름(파일명)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="squat-good"
              className="border-line bg-canvas mt-1 w-full rounded-lg border px-3 py-2 text-base"
            />
          </label>
          <label className="text-sm">
            메모
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="정상 스쿼트 8회 (측면 45°)"
              className="border-line bg-canvas mt-1 w-full rounded-lg border px-3 py-2 text-base"
            />
          </label>
          <label className="text-sm">
            추출 fps
            <input
              type="number"
              min={5}
              max={30}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value) || 20)}
              className="border-line bg-canvas mt-1 w-24 rounded-lg border px-3 py-2 text-base"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={extract}
          disabled={!fileName || phase === "extracting"}
          className="bg-brand-500 hover:bg-brand-600 rounded-full px-6 py-3 font-bold text-white transition-colors disabled:opacity-40"
        >
          {phase === "extracting"
            ? `추출 중… (${progress.frames}프레임, ${progress.t.toFixed(1)}s)`
            : "2. 추출 시작 (영상이 끝까지 재생됩니다)"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {phase === "done" && result && counts && (
        <div className="border-line bg-surface mt-5 rounded-2xl border p-5">
          <h2 className="text-lg font-bold">3. 파이프라인 미리보기</h2>
          <p className="text-ink-soft mt-1 text-sm">
            프레임 {result.frames.length}개 · 추정 기립 무릎각{" "}
            {Math.round(result.standing)}° · 반복{" "}
            <b className="text-ink">{reps}회</b>
          </p>
          <table className="mt-3 w-full max-w-sm text-sm">
            <tbody>
              {(
                [
                  ["rep_counted", "반복 카운트"],
                  ["good_rep", "좋은 자세"],
                  ["knee_shallow", "깊이 부족"],
                  ["back_bent", "상체 숙임"],
                  ["knee_over_toe", "무릎 전방 이탈"],
                  ["tempo_too_fast", "너무 빠름"],
                ] as [JudgeEventType, string][]
              ).map(([k, label]) => (
                <tr key={k} className="border-line border-b">
                  <td className="text-ink-soft py-1.5">{label}</td>
                  <td className="py-1.5 text-right font-bold">
                    {counts[k] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={download}
            className="border-line hover:bg-canvas mt-4 rounded-full border px-6 py-3 font-bold transition-colors"
          >
            4. JSON 다운로드 → {name || "fixture"}.json
          </button>
          <p className="text-ink-muted mt-3 text-sm leading-relaxed">
            받은 파일을 <code>packages/core/src/__fixtures__/</code>에 넣고 회귀
            테스트를 배선하면 됩니다. 반복 수·결함이 실제 영상과 맞는지 눈으로
            먼저 검수하세요.
          </p>
        </div>
      )}
    </main>
  );
}
