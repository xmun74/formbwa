import { describe, expect, it } from "vitest";
import { DEFAULT_SQUAT_CONFIG, SquatFSM } from "./squat-fsm";
import type { PoseFeatures } from "./types";

const S = 172; // 기립 무릎 각도
const cfg = { standingKneeAngle: S, ...DEFAULT_SQUAT_CONFIG };

function feat(
  kneeAngle: number,
  extra: Partial<PoseFeatures> = {},
): PoseFeatures {
  return {
    kneeAngle,
    torsoLean: 10,
    kneeOverToe: 0.1,
    side: "left",
    ...extra,
  };
}

/** 무릎 각도 시퀀스를 30ms 간격으로 투입, 완료된 rep들을 모은다 */
function run(fsm: SquatFSM, angles: number[]) {
  const reps = [];
  let t = 0;
  for (const a of angles) {
    const rep = fsm.update(feat(a), t);
    if (rep) reps.push(rep);
    t += 30;
  }
  return reps;
}

describe("SquatFSM", () => {
  it("기립→하강→상승→기립 한 사이클을 1회로 센다", () => {
    const fsm = new SquatFSM(cfg);
    // 172(서있음) → 90(최저) → 172(복귀)
    const reps = run(fsm, [172, 150, 120, 95, 90, 110, 140, 170]);
    expect(fsm.repCount).toBe(1);
    expect(reps).toHaveLength(1);
    expect(reps[0]!.minKneeAngle).toBe(90);
    expect(reps[0]!.repIndex).toBe(1);
  });

  it("두 번 반복하면 2회로 센다", () => {
    const fsm = new SquatFSM(cfg);
    run(fsm, [172, 100, 90, 130, 172, 100, 88, 130, 172]);
    expect(fsm.repCount).toBe(2);
  });

  it("살짝 흔들리기만 하면(깊이 부족 미달) 세지 않는다", () => {
    const fsm = new SquatFSM(cfg);
    // descendDelta(20) 안쪽에서만 흔들림 → 하강 진입 안 함
    run(fsm, [172, 165, 160, 168, 172]);
    expect(fsm.repCount).toBe(0);
  });

  it("하강 시간과 최저점을 기록한다", () => {
    const fsm = new SquatFSM(cfg);
    const reps = run(fsm, [172, 140, 110, 95, 130, 172]);
    const rep = reps[0]!;
    expect(rep.minKneeAngle).toBe(95);
    // 172(t0)에서 하강 시작은 140(t=30)일 때, 최저 95는 t=90 → descent 60ms
    expect(rep.descentMs).toBe(60);
    expect(rep.ascentMs).toBeGreaterThan(0);
  });
});
