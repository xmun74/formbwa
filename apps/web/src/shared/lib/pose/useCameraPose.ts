"use client";

import type {
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { extractFeatures, LM, type PoseFeatures } from "@repo/core";
import { preloadPoseModel } from "./poseModel";

export type CameraStatus = "loading" | "ready" | "denied" | "error";

interface UseCameraPoseOptions {
  /** 특징값이 나온 프레임마다 호출 (판정 파이프라인에 투입). 렌더 루프라 setState 남발 금지 */
  onFeatures?: (features: PoseFeatures, timestampMs: number) => void;
  /** 추론 스로틀 (기본 20fps — 렌더 rAF와 분리, TRD-FE §4) */
  fps?: number;
}

// 오버레이용 골격 연결 (상체 + 양다리)
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

function drawOverlay(
  canvas: HTMLCanvasElement | null,
  lm: NormalizedLandmark[],
): void {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = (canvas.width = canvas.clientWidth);
  const h = (canvas.height = canvas.clientHeight);
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(60,202,169,0.85)"; // brand-400
  ctx.lineWidth = 3;
  for (const [a, b] of CONNECTIONS) {
    const p = lm[a];
    const q = lm[b];
    if (!p || !q || (p.visibility ?? 0) < 0.4 || (q.visibility ?? 0) < 0.4)
      continue;
    ctx.beginPath();
    ctx.moveTo(p.x * w, p.y * h);
    ctx.lineTo(q.x * w, q.y * h);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(129,226,199,0.95)"; // brand-300
  for (const i of KEY_JOINTS) {
    const p = lm[i];
    if (!p || (p.visibility ?? 0) < 0.4) continue;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 웹캠 스트림 + MediaPipe 추론 루프. rAF로 돌되 추론은 fps로 스로틀,
 * 매 추론마다 오버레이를 그리고 특징값을 `onFeatures`로 넘긴다.
 * 실제 검증은 웹캠 있는 환경에서.
 */
export function useCameraPose({ onFeatures, fps = 20 }: UseCameraPoseOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<CameraStatus>("loading");

  const onFeaturesRef = useRef(onFeatures);
  onFeaturesRef.current = onFeatures;
  const minInterval = 1000 / fps;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let landmarker: PoseLandmarker | null = null;
    let lastInfer = 0;
    let cancelled = false;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const video = videoRef.current;
      if (!video || !landmarker || video.readyState < 2) return;
      const now = performance.now();
      if (now - lastInfer < minInterval) return;
      lastInfer = now;

      const result = landmarker.detectForVideo(video, now);
      const lm = result.landmarks?.[0];
      if (!lm) return;

      drawOverlay(canvasRef.current, lm);

      const features = extractFeatures({
        landmarks: lm.map((p) => ({
          x: p.x,
          y: p.y,
          z: p.z,
          visibility: p.visibility ?? 1,
        })),
        timestampMs: now,
      });
      if (features) onFeaturesRef.current?.(features, now);
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        landmarker = await preloadPoseModel();
        if (cancelled) return;
        setStatus("ready");
        loop();
      } catch (e) {
        if (cancelled) return;
        const denied =
          e instanceof DOMException && e.name === "NotAllowedError";
        setStatus(denied ? "denied" : "error");
      }
    };

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [minInterval]);

  return { videoRef, canvasRef, status };
}
