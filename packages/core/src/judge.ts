/**
 * 한 회(RepMetric) → 판정 이벤트 (F1-2, TRD-FE §5.2·§5.3).
 * 내 스쿼트 1회를 독립 규칙으로 판정 — 시범 영상과 비교하지 않는다.
 * precision 우선: confidence는 여기서 계산하고, 침묵 여부(< 0.8)는 coach가 거른다.
 */
import type { JudgeEvent, JudgeEventType, RepMetric } from "./types";

export interface JudgeConfig {
  /** 충분한 깊이 기준 무릎 각도. 최저점이 이보다 크면(덜 굽음) knee_shallow */
  depthTargetAngle: number;
  /** 상체 기울기 한계(도). 초과 시 back_bent */
  torsoLeanLimit: number;
  /** 무릎-발끝 이탈 한계(정규화). 초과 시 knee_over_toe */
  kneeOverToeLimit: number;
  /** 하강이 이보다 빠르면(ms) tempo_too_fast (반동 낙하 = 부상 위험) */
  fastDescentMs: number;
  /** 입문자 그레이스: 이 회차까지는 지적을 억제(good만) — 배우는 시간 확보 (§5.3) */
  graceReps: number;
}

/** 캘리브 기립각 기준 기본 판정 설정 (튜닝 대상 — §5.3) */
export function defaultJudgeConfig(standingKneeAngle: number): JudgeConfig {
  return {
    depthTargetAngle: standingKneeAngle - 65, // 이만큼은 굽어야 "충분한 깊이"
    torsoLeanLimit: 45,
    kneeOverToeLimit: 0.5,
    fastDescentMs: 350,
    graceReps: 2,
  };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** 우선순위: back_bent > knee_over_toe > knee_shallow (§5.3), 템포는 그다음 */
const FAULT_PRIORITY: JudgeEventType[] = [
  "back_bent",
  "knee_over_toe",
  "knee_shallow",
  "tempo_too_fast",
];

/**
 * 한 회를 판정한다. 항상 `rep_counted`를 포함하고, 결함이 없으면 `good_rep`,
 * 있으면 우선순위순 결함 이벤트를 붙인다. 그레이스 구간에선 지적을 생략한다.
 */
export function judgeRep(rep: RepMetric, cfg: JudgeConfig): JudgeEvent[] {
  const events: JudgeEvent[] = [
    { type: "rep_counted", confidence: 1, repIndex: rep.repIndex },
  ];

  const faults: JudgeEvent[] = [];

  // 깊이 부족: 최저점이 목표보다 얕을수록 confidence 상승
  if (rep.minKneeAngle > cfg.depthTargetAngle) {
    faults.push({
      type: "knee_shallow",
      confidence: clamp01(0.5 + (rep.minKneeAngle - cfg.depthTargetAngle) / 40),
      repIndex: rep.repIndex,
    });
  }

  // 허리 굽음
  if (rep.maxTorsoLean > cfg.torsoLeanLimit) {
    faults.push({
      type: "back_bent",
      confidence: clamp01(0.5 + (rep.maxTorsoLean - cfg.torsoLeanLimit) / 30),
      repIndex: rep.repIndex,
    });
  }

  // 무릎 전방 이탈
  if (rep.maxKneeOverToe > cfg.kneeOverToeLimit) {
    faults.push({
      type: "knee_over_toe",
      confidence: clamp01(
        0.5 + (rep.maxKneeOverToe - cfg.kneeOverToeLimit) / 0.5,
      ),
      repIndex: rep.repIndex,
    });
  }

  // 템포: 반동으로 급강하 (내 절대 속도 기준 — §5.3)
  if (rep.descentMs > 0 && rep.descentMs < cfg.fastDescentMs) {
    faults.push({
      type: "tempo_too_fast",
      confidence: clamp01(0.5 + (cfg.fastDescentMs - rep.descentMs) / 300),
      repIndex: rep.repIndex,
    });
  }

  // 입문자 그레이스: 초반엔 지적 생략, 완주만 칭찬
  if (rep.repIndex <= cfg.graceReps) {
    events.push({ type: "good_rep", confidence: 1, repIndex: rep.repIndex });
    return events;
  }

  if (faults.length === 0) {
    events.push({ type: "good_rep", confidence: 1, repIndex: rep.repIndex });
    return events;
  }

  faults.sort(
    (a, b) => FAULT_PRIORITY.indexOf(a.type) - FAULT_PRIORITY.indexOf(b.type),
  );
  return [...events, ...faults];
}
