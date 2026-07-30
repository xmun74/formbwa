"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PoseFeatures } from "@repo/core";
import { useWorkoutStore } from "@/entities/workout";
import { useCameraPose } from "@/shared/lib/pose";
import { ExitGuard } from "@/shared/ui/exit-guard";

const CALIB_MS = 3000;
const MIN_SAMPLES = 5;

/**
 * 캘리브레이션 (F1-5) — 3초간 기립 무릎 각도를 모아 중앙값을 기준값으로 저장.
 * 카메라는 돌지만 화면엔 링만 보인다(비디오는 숨김, 판독용). 완료/건너뛰기 → /workout.
 * 측정이 충분치 않으면(카메라 거부 등) 저장하지 않고 넘어간다 → /workout이 기본값 사용.
 */
export function CalibrationStage({ onNext }: { onNext: () => void }) {
  const setStanding = useWorkoutStore((s) => s.setStandingKneeAngle);
  const samplesRef = useRef<number[]>([]);
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0);

  const onFeatures = useCallback((f: PoseFeatures) => {
    samplesRef.current.push(f.kneeAngle);
  }, []);
  const { videoRef } = useCameraPose({ onFeatures });

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const s = samplesRef.current;
    if (s.length >= MIN_SAMPLES) {
      const sorted = [...s].sort((a, b) => a - b);
      setStanding(sorted[Math.floor(sorted.length / 2)]!); // 중앙값
    }
    onNext();
  }, [setStanding, onNext]);

  // 3초 진행 + 자동 완료
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / CALIB_MS);
      setProgress(p);
      if (p >= 1) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finish]);

  return (
    <div className="bg-dark-canvas relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute top-6 right-8">
        <ExitGuard />
      </div>

      {/* 판독용 숨김 비디오 (화면엔 안 보이되 디코딩은 됨) */}
      <video
        ref={videoRef}
        muted
        playsInline
        className="pointer-events-none absolute size-1 opacity-0"
      />

      {/* 동심원 + 실루엣 */}
      <div className="relative grid size-52 place-items-center">
        <span className="border-dark-line absolute inset-0 rounded-full border" />
        <span className="border-brand-700/40 absolute inset-5 rounded-full border" />
        <span className="bg-brand-600/30 grid size-32 place-items-center rounded-full text-2xl">
          🧍
        </span>
      </div>

      <h2 className="text-dark-ink mt-8 text-2xl font-extrabold">
        가만히 서 계세요
      </h2>
      <p className="text-dark-ink-soft mt-3 text-base">
        기준 자세를 잡고 있어요... 약 3초
      </p>

      <div className="bg-dark-line mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full">
        <span
          className="bg-brand-500 block h-full rounded-full transition-[width] duration-100"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <button
        type="button"
        onClick={finish}
        className="border-dark-line text-dark-ink-soft hover:text-dark-ink mt-8 rounded-full border px-5 py-2.5 text-base transition-colors"
      >
        건너뛰기 →
      </button>
    </div>
  );
}
