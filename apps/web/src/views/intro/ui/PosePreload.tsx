"use client";

import { useEffect } from "react";
import { preloadPoseModel } from "@/shared/lib/pose";

/**
 * 인트로에 머무는 동안 MediaPipe 모델을 백그라운드로 받는다 (TRD-FE §9.1).
 * 읽고 고르는 시간이 곧 다운로드 시간. 실패는 조용히 무시(운동 진입 때 재시도).
 */
export function PosePreload() {
  useEffect(() => {
    void preloadPoseModel().catch(() => {});
  }, []);
  return null;
}
