/**
 * 3관절 각도 계산(atan2)과 프레임 → 특징값 추출 (TRD-FE §5.1).
 * 각도는 스케일 무관이라 정규화 없이 x,y로 계산. (원근 보정은 캘리브 대비 상대값으로 §5.3)
 */
import { LM, type Landmark, type PoseFeatures, type PoseFrame } from "./types";

interface Pt {
  x: number;
  y: number;
}

/** 꼭짓점 b에서 a–b–c가 이루는 내각 (0~180도). atan2로 안정적. */
export function angleABC(a: Pt, b: Pt, c: Pt): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const cross = abx * cby - aby * cbx;
  return (Math.atan2(Math.abs(cross), dot) * 180) / Math.PI;
}

/** 벡터 a→b가 수직(위)에서 벌어진 각 (0~180도). 이미지 좌표라 위는 y 감소 방향. */
export function angleFromVertical(a: Pt, b: Pt): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  // up = (0, -1): dot = -vy, cross = -vx
  return (Math.atan2(Math.abs(vx), -vy) * 180) / Math.PI;
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function visSum(lms: Landmark[], idxs: number[]): number {
  return idxs.reduce((s, i) => s + (lms[i]?.visibility ?? 0), 0);
}

/**
 * 전신이 프레임 안에 제대로 들어왔는지 (배치 게이트, F1-5).
 * 가시성 높은 쪽의 어깨~발목이 모두 보이고, 화면 여백(margin) 안쪽에 있으면 true.
 */
export function isFullBodyInFrame(
  frame: PoseFrame,
  margin = 0.05,
  minVisibility = 0.6,
): boolean {
  const lm = frame.landmarks;
  const left = [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE];
  const right = [
    LM.RIGHT_SHOULDER,
    LM.RIGHT_HIP,
    LM.RIGHT_KNEE,
    LM.RIGHT_ANKLE,
  ];
  const chain = visSum(lm, left) >= visSum(lm, right) ? left : right;

  return chain.every((i) => {
    const p = lm[i];
    if (!p || p.visibility < minVisibility) return false;
    return (
      p.x >= margin && p.x <= 1 - margin && p.y >= margin && p.y <= 1 - margin
    );
  });
}

/**
 * 프레임 → 특징값. 가시성 높은 쪽(측면 45° 촬영이라 한쪽이 잘 보임)을 고른다.
 * 핵심 관절이 `minVisibility` 미만이면 null (그 프레임은 판정 제외 — TRD-FE §4).
 */
export function extractFeatures(
  frame: PoseFrame,
  minVisibility = 0.5,
): PoseFeatures | null {
  const lm = frame.landmarks;

  const leftIdx = [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE];
  const rightIdx = [
    LM.RIGHT_SHOULDER,
    LM.RIGHT_HIP,
    LM.RIGHT_KNEE,
    LM.RIGHT_ANKLE,
  ];

  const useLeft = visSum(lm, leftIdx) >= visSum(lm, rightIdx);
  const [sIdx, hIdx, kIdx, aIdx] = useLeft ? leftIdx : rightIdx;

  const shoulder = lm[sIdx!];
  const hip = lm[hIdx!];
  const knee = lm[kIdx!];
  const ankle = lm[aIdx!];
  if (!shoulder || !hip || !knee || !ankle) return null;

  if (
    Math.min(
      shoulder.visibility,
      hip.visibility,
      knee.visibility,
      ankle.visibility,
    ) < minVisibility
  ) {
    return null;
  }

  const shinLen = dist(knee, ankle);

  return {
    kneeAngle: angleABC(hip, knee, ankle),
    torsoLean: angleFromVertical(hip, shoulder),
    kneeOverToe: shinLen > 0 ? Math.abs(knee.x - ankle.x) / shinLen : 0,
    side: useLeft ? "left" : "right",
  };
}
