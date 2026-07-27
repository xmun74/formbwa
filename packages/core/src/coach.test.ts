import { describe, expect, it } from "vitest";
import { Coach, DEFAULT_COACH_CONFIG } from "./coach";
import type { JudgeEvent, JudgeEventType } from "./types";

function ev(type: JudgeEventType, confidence = 1, repIndex = 1): JudgeEvent {
  return { type, confidence, repIndex };
}

const REP = ev("rep_counted", 1);

describe("Coach.decide", () => {
  it("결함이 뚜렷하면(confidence≥0.8) 그 클립을 고른다", () => {
    const coach = new Coach();
    expect(coach.decide([REP, ev("knee_shallow", 0.9)], 0).clipKey).toBe(
      "knee_shallow",
    );
  });

  it("confidence가 낮으면 침묵한다 (오탐 방지)", () => {
    const coach = new Coach();
    expect(coach.decide([REP, ev("knee_shallow", 0.5)], 0).clipKey).toBeNull();
  });

  it("우선순위: back_bent가 knee_shallow보다 먼저", () => {
    const coach = new Coach();
    const events = [REP, ev("knee_shallow", 0.9), ev("back_bent", 0.9)];
    expect(coach.decide(events, 0).clipKey).toBe("back_bent");
  });

  it("쿨다운 안에서는 침묵한다", () => {
    const coach = new Coach();
    coach.decide([REP, ev("back_bent", 0.9)], 0); // 발화
    // 다른 종류라도 쿨다운(4s) 안이면 침묵
    expect(
      coach.decide([REP, ev("knee_shallow", 0.9)], 2000).clipKey,
    ).toBeNull();
  });

  it("쿨다운이 지나면 다시 발화한다", () => {
    const coach = new Coach();
    coach.decide([REP, ev("back_bent", 0.9)], 0);
    expect(coach.decide([REP, ev("knee_shallow", 0.9)], 4001).clipKey).toBe(
      "knee_shallow",
    );
  });

  it("동일 이벤트 연속은 발화하지 않는다 (반복 방지)", () => {
    const coach = new Coach();
    coach.decide([REP, ev("knee_shallow", 0.9)], 0); // 발화
    // 쿨다운은 지났지만 같은 종류 → 침묵
    expect(
      coach.decide([REP, ev("knee_shallow", 0.9)], 5000).clipKey,
    ).toBeNull();
  });

  it("결함이 없으면 good_rep을 칭찬으로 발화", () => {
    const coach = new Coach();
    expect(coach.decide([REP, ev("good_rep", 1)], 0).clipKey).toBe("good_rep");
  });

  it("발화할 게 없으면(카운트만) 침묵", () => {
    const coach = new Coach();
    expect(coach.decide([REP], 0).clipKey).toBeNull();
  });

  it("설정을 주입할 수 있다", () => {
    const coach = new Coach({ ...DEFAULT_COACH_CONFIG, cooldownMs: 1000 });
    coach.decide([REP, ev("back_bent", 0.9)], 0);
    // 1s 쿨다운이라 1500ms엔 (다른 종류) 발화
    expect(coach.decide([REP, ev("knee_shallow", 0.9)], 1500).clipKey).toBe(
      "knee_shallow",
    );
  });
});
