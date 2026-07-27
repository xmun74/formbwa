"use client";

import {
  isFullBodyInFrame,
  type PoseFeatures,
  type PoseFrame,
} from "@repo/core";
import { useCallback, useState } from "react";
import { useCameraPose } from "@/shared/lib/pose";
import { buttonClass } from "@/shared/ui/button";
import { ExitGuard } from "@/shared/ui/exit-guard";
import { DARK_STRIPE } from "../model/prepare";

const STATUS_TEXT = {
  loading: "카메라 준비 중…",
  denied: "카메라 권한이 필요해요",
  error: "카메라를 시작할 수 없어요",
  ready: "",
} as const;

/**
 * 배치 (F1-5) — 웹캠에 전신이 들어오면 "자세 잡았어요"가 활성화된다.
 * 전신 판정은 core `isFullBodyInFrame` (측면 45° 촬영 전제).
 */
export function PlacementStage({ onNext }: { onNext: () => void }) {
  const [ready, setReady] = useState(false);

  const onFeatures = useCallback(
    (_features: PoseFeatures, _t: number, frame: PoseFrame) => {
      // 같은 값이면 React가 리렌더를 건너뛴다 (매 프레임 setState 비용 없음)
      setReady(isFullBodyInFrame(frame));
    },
    [],
  );
  const { videoRef, canvasRef, status } = useCameraPose({ onFeatures });

  return (
    <div className="bg-dark-canvas relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute top-6 right-8">
        <ExitGuard />
      </div>

      <div
        className={`border-dark-line relative flex h-105 w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border border-dashed ${DARK_STRIPE}`}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        <span className="text-dark-ink-muted absolute bottom-4 left-5 z-10 text-sm">
          내 웹캠 · 실시간
        </span>
        {status !== "ready" && (
          <span className="text-dark-ink-soft z-10 text-base">
            {STATUS_TEXT[status]}
          </span>
        )}
      </div>

      <h2 className="text-dark-ink mt-9 text-2xl font-extrabold">
        몸 전체가 보이게 서주세요
      </h2>
      <p className="text-dark-ink-soft mt-3 text-center text-base leading-relaxed">
        화면에서 <b className="text-brand-300 font-bold">약 2m</b> 떨어져,
        옆으로 <b className="text-brand-300 font-bold">45°</b> 돌아 서주세요.
        <br />
        {ready
          ? "전신이 잡혔어요 — 준비되면 눌러요."
          : "머리부터 발끝까지 화면에 들어와야 정확히 봐줄 수 있어요."}
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={!ready}
        className={buttonClass("primary", "mt-8 px-8 py-3.5")}
      >
        자세 잡았어요
      </button>
    </div>
  );
}
