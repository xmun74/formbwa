/**
 * 스쿼트 상태머신 + 반복 카운트 (F1-1, TRD-FE §5.1).
 * STANDING → DESCENDING → (최저점) → ASCENDING → 1회 완료(count++) → STANDING.
 * 무릎 각도의 히스테리시스로 한 회를 스스로 잡는다 (시범 영상과 무관 — §5.3).
 *
 * "BOTTOM"은 별도 상태가 아니라 DESCENDING 중 무릎 각도의 최저점으로 잡는다
 * (min을 추적하다 reboundDelta만큼 다시 펴지면 최저점을 지난 것 → ASCENDING).
 */
import type { PoseFeatures, RepMetric } from "./types";

export type SquatState = "standing" | "descending" | "ascending";

export interface SquatConfig {
  /** 캘리브레이션에서 잡은 기립 시 무릎 각도 (예: ~172) */
  standingKneeAngle: number;
  /** 기립 대비 이만큼 굽으면 하강 시작 (기본 20) */
  descendDelta: number;
  /** 최저점에서 이만큼 다시 펴지면 상승으로 판정 (기본 8) */
  reboundDelta: number;
  /** 기립각 근처(−이 값)로 돌아오면 1회 완료 (기본 15) */
  standReturnDelta: number;
}

export const DEFAULT_SQUAT_CONFIG: Omit<SquatConfig, "standingKneeAngle"> = {
  descendDelta: 20,
  reboundDelta: 8,
  standReturnDelta: 15,
};

export class SquatFSM {
  private state: SquatState = "standing";
  private count = 0;

  // 진행 중인 회의 누적치
  private minKnee = Infinity;
  private maxLean = 0;
  private maxKneeOverToe = 0;
  private tStart = 0;
  private tBottom = 0;

  constructor(private readonly cfg: SquatConfig) {}

  get repCount(): number {
    return this.count;
  }

  get currentState(): SquatState {
    return this.state;
  }

  /**
   * 한 프레임 특징값 투입. 이 프레임에서 1회가 완료되면 RepMetric을, 아니면 null을 반환.
   */
  update(f: PoseFeatures, timestampMs: number): RepMetric | null {
    const {
      standingKneeAngle: S,
      descendDelta,
      reboundDelta,
      standReturnDelta,
    } = this.cfg;

    if (this.state !== "standing") {
      this.maxLean = Math.max(this.maxLean, f.torsoLean);
      this.maxKneeOverToe = Math.max(this.maxKneeOverToe, f.kneeOverToe);
    }

    switch (this.state) {
      case "standing":
        if (f.kneeAngle < S - descendDelta) {
          this.state = "descending";
          this.tStart = timestampMs;
          this.tBottom = timestampMs;
          this.minKnee = f.kneeAngle;
          this.maxLean = f.torsoLean;
          this.maxKneeOverToe = f.kneeOverToe;
        }
        break;

      case "descending":
        if (f.kneeAngle <= this.minKnee) {
          this.minKnee = f.kneeAngle;
          this.tBottom = timestampMs;
        } else if (f.kneeAngle > this.minKnee + reboundDelta) {
          this.state = "ascending";
        }
        break;

      case "ascending":
        if (f.kneeAngle > S - standReturnDelta) {
          this.count += 1;
          const rep: RepMetric = {
            repIndex: this.count,
            minKneeAngle: this.minKnee,
            maxTorsoLean: this.maxLean,
            maxKneeOverToe: this.maxKneeOverToe,
            descentMs: this.tBottom - this.tStart,
            ascentMs: timestampMs - this.tBottom,
          };
          this.resetRep();
          this.state = "standing";
          return rep;
        }
        break;
    }

    return null;
  }

  private resetRep(): void {
    this.minKnee = Infinity;
    this.maxLean = 0;
    this.maxKneeOverToe = 0;
  }
}
