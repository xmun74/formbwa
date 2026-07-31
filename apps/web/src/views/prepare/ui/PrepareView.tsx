"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/shared/config";
import { CalibrationStage } from "./CalibrationStage";
import { PlacementStage } from "./PlacementStage";

type Step = "placement" | "calibration";

/**
 * `/prepare` — 운동 직전 준비 (PRD §4-4). 카메라 앞 배치 → 기준 자세 캘리브레이션.
 * 캘리브레이션이 끝나면 `/workout`(운동)으로 넘어간다.
 */
export function PrepareView() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("placement");

  if (step === "placement") {
    return <PlacementStage onNext={() => setStep("calibration")} />;
  }
  return <CalibrationStage onNext={() => router.push(ROUTES.WORKOUT)} />;
}
