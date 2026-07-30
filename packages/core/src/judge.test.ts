import { describe, expect, it } from "vitest";
import { defaultJudgeConfig, judgeRep } from "./judge";
import type { JudgeEventType, RepMetric } from "./types";

const cfg = defaultJudgeConfig(172); // depthTarget 107, lean 45, kot 0.5, fast 350, grace 2

function makeRep(over: Partial<RepMetric> = {}): RepMetric {
  return {
    repIndex: 3, // 그레이스(2) 이후
    minKneeAngle: 95, // 충분히 깊음
    maxTorsoLean: 20,
    maxKneeOverToe: 0.2,
    descentMs: 800,
    ascentMs: 700,
    ...over,
  };
}

function types(rep: RepMetric): JudgeEventType[] {
  return judgeRep(rep, cfg).map((e) => e.type);
}

describe("judgeRep", () => {
  it("완벽한 회는 rep_counted + good_rep", () => {
    expect(types(makeRep())).toEqual(["rep_counted", "good_rep"]);
  });

  it("깊이 부족을 잡는다", () => {
    expect(types(makeRep({ minKneeAngle: 135 }))).toContain("knee_shallow");
  });

  it("허리 굽음을 잡는다", () => {
    expect(types(makeRep({ maxTorsoLean: 60 }))).toContain("back_bent");
  });

  it("무릎 전방 이탈을 잡는다", () => {
    expect(types(makeRep({ maxKneeOverToe: 0.9 }))).toContain("knee_over_toe");
  });

  it("반동 급강하(빠른 템포)를 잡는다", () => {
    expect(types(makeRep({ descentMs: 200 }))).toContain("tempo_too_fast");
  });

  it("그레이스 구간(초반 회차)은 지적을 억제하고 완주만 칭찬한다", () => {
    // repIndex 1인데 결함 여러 개여도 good_rep만
    const rep = makeRep({ repIndex: 1, minKneeAngle: 140, maxTorsoLean: 70 });
    expect(types(rep)).toEqual(["rep_counted", "good_rep"]);
  });

  it("결함이 여러 개면 우선순위순(back_bent > knee_over_toe > knee_shallow)", () => {
    const rep = makeRep({
      minKneeAngle: 140, // shallow
      maxKneeOverToe: 0.9, // knee_over_toe
      maxTorsoLean: 70, // back_bent
    });
    const faults = types(rep).filter((t) => t !== "rep_counted");
    expect(faults).toEqual(["back_bent", "knee_over_toe", "knee_shallow"]);
  });

  it("결함이 뚜렷할수록 confidence가 0.8을 넘는다 (coach 발화 조건)", () => {
    const events = judgeRep(makeRep({ maxTorsoLean: 75 }), cfg);
    const backBent = events.find((e) => e.type === "back_bent");
    expect(backBent!.confidence).toBeGreaterThan(0.8);
  });
});
