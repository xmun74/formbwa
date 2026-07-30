"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isFullBodyInFrame,
  type PoseFeatures,
  type PoseFrame,
} from "@repo/core";
import { useCameraPose } from "@/shared/lib/pose";
import { ExitGuard } from "@/shared/ui/exit-guard";
import { DARK_STRIPE } from "../model/prepare";

const STATUS_TEXT = {
  loading: "카메라 준비 중…",
  denied: "카메라 권한이 필요해요",
  error: "카메라를 시작할 수 없어요",
  ready: "",
} as const;

// 전신이 이만큼 유지되면 자동으로 다음(캘리브)으로. 버튼을 없앤 이유:
// 버튼 누르러 다가오면 전신이 프레임에서 빠져 비활성화되는 딜레마 때문 (사용자 피드백).
const HOLD_MS = 2000;

export function PlacementStage({ onNext }: { onNext: () => void }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  const onFeatures = useCallback(
    (_features: PoseFeatures, _t: number, frame: PoseFrame) => {
      // 같은 값이면 React가 리렌더를 건너뛴다 (매 프레임 setState 비용 없음)
      setReady(isFullBodyInFrame(frame));
    },
    [],
  );
  const { videoRef, canvasRef, status } = useCameraPose({ onFeatures });

  // 전신이 잡힌 동안만 진행바를 채우고, 다 차면 자동 진행. 빠지면 리셋.
  useEffect(() => {
    if (!ready) {
      setProgress(0);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / HOLD_MS);
      setProgress(p);
      if (p >= 1) onNextRef.current();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  return (
    <div className="bg-dark-canvas relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute top-6 right-8">
        <ExitGuard />
      </div>

      <div
        className={`border-dark-line relative flex h-105 w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border ${ready ? "border-brand-400" : "border-dashed"} ${DARK_STRIPE}`}
      >
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
        머리부터 발끝까지 화면에 들어오면{" "}
        <b className="text-brand-300 font-bold">자동으로 시작</b>해요.
      </p>

      {/* 버튼 대신 자동 진행 인디케이터 */}
      <div className="mt-8 flex h-14 flex-col items-center justify-center gap-2">
        {ready ? (
          <>
            <span className="text-brand-300 text-base font-bold">
              전신이 잡혔어요! 곧 시작해요…
            </span>
            <div className="bg-dark-line h-1.5 w-56 overflow-hidden rounded-full">
              <span
                className="bg-brand-500 block h-full rounded-full"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </>
        ) : (
          <span className="text-dark-ink-muted text-base">
            전신이 화면에 들어오면 자동으로 시작해요
          </span>
        )}
      </div>
    </div>
  );
}
