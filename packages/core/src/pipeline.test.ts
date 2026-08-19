import { describe, expect, it } from "vitest";
import {
  estimateStandingAngle,
  runSquatPipeline,
  standingAngleFromSamples,
} from "./pipeline";
import { LM, type Landmark, type PoseFrame } from "./types";

/** 무릎각(θ) → 왼쪽 다리 프레임. extractFeatures가 그 각도를 뽑도록 관절을 배치한다. */
function buildFrame(kneeAngleDeg: number, timestampMs: number): PoseFrame {
  const th = (kneeAngleDeg * Math.PI) / 180;
  const knee = { x: 0.5, y: 0.6 };
  const ankle = { x: 0.5, y: 0.85 };
  const L = 0.25;
  const hip = { x: knee.x - Math.sin(th) * L, y: knee.y + Math.cos(th) * L };
  const shoulder = { x: hip.x, y: hip.y - 0.2 };

  const lm: Landmark[] = Array.from({ length: 33 }, () => ({
    x: 0,
    y: 0,
    z: 0,
    visibility: 0,
  }));
  const put = (i: number, p: { x: number; y: number }) => {
    lm[i] = { x: p.x, y: p.y, z: 0, visibility: 1 };
  };
  put(LM.LEFT_SHOULDER, shoulder);
  put(LM.LEFT_HIP, hip);
  put(LM.LEFT_KNEE, knee);
  put(LM.LEFT_ANKLE, ankle);
  return { landmarks: lm, timestampMs };
}

function sequence(kneeAngles: number[]): PoseFrame[] {
  return kneeAngles.map((a, i) => buildFrame(a, i * 30));
}

describe("runSquatPipeline", () => {
  it("합성 스쿼트 3회를 3회로 센다", () => {
    const deep = [172, 150, 120, 95, 90, 110, 140, 172];
    const events = runSquatPipeline(sequence([...deep, ...deep, ...deep]));
    expect(events.filter((e) => e.type === "rep_counted")).toHaveLength(3);
  });

  it("기립각을 프레임에서 추정한다 (상위 백분위 ≈ 서있을 때)", () => {
    const deep = [172, 150, 120, 95, 90, 110, 140, 172];
    expect(estimateStandingAngle(sequence([...deep, ...deep]))).toBeGreaterThan(
      160,
    );
  });
});

describe("standingAngleFromSamples", () => {
  it("빈 입력이면 기본값 170", () => {
    expect(standingAngleFromSamples([])).toBe(170);
  });

  it("초반 자세 잡던 저각 프레임에 눌리지 않고 참 기립각(p90)을 잡는다", () => {
    // 서있음 ~177 다수 + 자세 잡던/흔들린 저각 12프레임. 중앙값이면 ~167로 저측정되어
    // 깊이 목표(S−65)가 과해져 정상 스쿼트를 knee_shallow로 오탐(회귀 방지).
    const settling = [
      150, 152, 154, 156, 158, 160, 162, 164, 165, 166, 167, 168,
    ];
    const standing = [177, 177, 177, 177, 177, 177, 177, 178];
    const s = standingAngleFromSamples([...settling, ...standing]);
    expect(s).toBeGreaterThanOrEqual(177); // 중앙값 방식(~167)이면 실패
  });
});

// fixture JSON 스냅샷 회귀는 fixture.test.ts(하네스)가 담당한다.
