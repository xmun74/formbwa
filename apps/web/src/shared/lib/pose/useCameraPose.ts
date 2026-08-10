"use client";

import type {
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import {
  extractFeatures,
  LM,
  type PoseFeatures,
  type PoseFrame,
} from "@repo/core";
import { track } from "@/shared/lib/analytics";
import { disposePoseModel, preloadPoseModel } from "./poseModel";

export type CameraStatus = "loading" | "ready" | "denied" | "error";

interface UseCameraPoseOptions {
  /** 특징값이 나온 프레임마다 호출 (판정 파이프라인에 투입). 렌더 루프라 setState 남발 금지.
   *  원본 프레임도 함께 넘겨 배치 게이트(전신 여부) 등에 쓴다. */
  onFeatures?: (
    features: PoseFeatures,
    timestampMs: number,
    frame: PoseFrame,
  ) => void;
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
  video: HTMLVideoElement,
  lm: NormalizedLandmark[],
): void {
  if (!canvas || !video.videoWidth) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // 캔버스 비트맵을 비디오 실제 프레임 크기로 → 캔버스에도 object-cover를 줘
  // 비디오와 똑같이 잘리게 하면 랜드마크가 정확히 겹친다.
  const w = (canvas.width = video.videoWidth);
  const h = (canvas.height = video.videoHeight);
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(60,202,169,0.85)"; // brand-400
  ctx.lineWidth = Math.max(4, w / 140);
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
    ctx.arc(p.x * w, p.y * h, Math.max(6, w / 90), 0, Math.PI * 2);
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

  // 새로고침·페이지 이탈 시 WebGL 컨텍스트 반환 — 누적 누수로 점점 느려지는 것 방지.
  // (라우트 전환은 pagehide가 아니라 모델이 유지됨 — §9.1)
  useEffect(() => {
    const onPageHide = () => disposePoseModel();
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

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

      drawOverlay(canvasRef.current, video, lm);

      const frame: PoseFrame = {
        landmarks: lm.map((p) => ({
          x: p.x,
          y: p.y,
          z: p.z,
          visibility: p.visibility ?? 1,
        })),
        timestampMs: now,
      };
      const features = extractFeatures(frame);
      if (features) onFeaturesRef.current?.(features, now, frame);
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
        if (denied) track("camera_permission_denied");
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
