import { describe, expect, it } from "vitest";
import {
  angleABC,
  angleFromVertical,
  extractFeatures,
  isFullBodyInFrame,
} from "./angle";
import { LM, type Landmark, type PoseFrame } from "./types";

describe("angleABC", () => {
  it("직각을 90도로 계산한다", () => {
    // b 원점, a는 위, c는 오른쪽 → 90도
    expect(
      angleABC({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }),
    ).toBeCloseTo(90);
  });

  it("일직선을 180도로 계산한다", () => {
    expect(
      angleABC({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }),
    ).toBeCloseTo(180);
  });
});

describe("angleFromVertical", () => {
  it("수직으로 선 상체는 0도에 가깝다 (이미지 좌표: 위는 y 감소)", () => {
    // hip 아래, shoulder 위 → 수직
    expect(angleFromVertical({ x: 0, y: 1 }, { x: 0, y: 0 })).toBeCloseTo(0);
  });

  it("앞으로 45도 기울면 45도", () => {
    expect(angleFromVertical({ x: 0, y: 1 }, { x: 1, y: 0 })).toBeCloseTo(45);
  });
});

/** 33개 랜드마크 프레임 생성 헬퍼 (기본 가시성 0, 지정 인덱스만 세팅) */
function makeFrame(
  set: Record<number, Partial<Landmark>>,
  timestampMs = 0,
): PoseFrame {
  const landmarks: Landmark[] = Array.from({ length: 33 }, () => ({
    x: 0,
    y: 0,
    z: 0,
    visibility: 0,
  }));
  for (const [i, v] of Object.entries(set)) {
    landmarks[Number(i)] = {
      x: 0,
      y: 0,
      z: 0,
      visibility: 1,
      ...v,
    };
  }
  return { landmarks, timestampMs };
}

describe("extractFeatures", () => {
  it("가시성 높은 쪽을 골라 무릎 각도를 뽑는다", () => {
    // 왼쪽만 보이게: 엉덩이 위, 무릎 중간, 발목 아래 = 곧게 편 다리 ~180
    const frame = makeFrame({
      [LM.LEFT_SHOULDER]: { x: 0, y: 0 },
      [LM.LEFT_HIP]: { x: 0, y: 1 },
      [LM.LEFT_KNEE]: { x: 0, y: 2 },
      [LM.LEFT_ANKLE]: { x: 0, y: 3 },
    });
    const f = extractFeatures(frame);
    expect(f).not.toBeNull();
    expect(f!.side).toBe("left");
    expect(f!.kneeAngle).toBeCloseTo(180);
  });

  it("핵심 관절 가시성이 낮으면 null (판정 제외)", () => {
    const frame = makeFrame({
      [LM.LEFT_HIP]: { x: 0, y: 1, visibility: 0.2 },
      [LM.LEFT_KNEE]: { x: 0, y: 2, visibility: 0.2 },
      [LM.LEFT_ANKLE]: { x: 0, y: 3, visibility: 0.2 },
      [LM.LEFT_SHOULDER]: { x: 0, y: 0, visibility: 0.2 },
    });
    expect(extractFeatures(frame)).toBeNull();
  });
});

describe("isFullBodyInFrame", () => {
  const inFrame = () =>
    makeFrame({
      [LM.LEFT_SHOULDER]: { x: 0.5, y: 0.2 },
      [LM.LEFT_HIP]: { x: 0.5, y: 0.5 },
      [LM.LEFT_KNEE]: { x: 0.5, y: 0.7 },
      [LM.LEFT_ANKLE]: { x: 0.5, y: 0.9 },
    });

  it("어깨~발목이 여백 안쪽에 다 보이면 true", () => {
    expect(isFullBodyInFrame(inFrame())).toBe(true);
  });

  it("발목이 화면 밖(가장자리)이면 false", () => {
    const frame = inFrame();
    frame.landmarks[LM.LEFT_ANKLE]!.y = 0.99; // margin(0.05) 밖
    expect(isFullBodyInFrame(frame)).toBe(false);
  });

  it("관절 가시성이 낮으면 false", () => {
    const frame = inFrame();
    frame.landmarks[LM.LEFT_KNEE]!.visibility = 0.3;
    expect(isFullBodyInFrame(frame)).toBe(false);
  });
});
