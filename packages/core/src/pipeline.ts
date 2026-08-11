/**
 * 프레임 시퀀스 → 판정 이벤트 로그 (TRD-FE §5.4 회귀 하네스).
 * extractFeatures → SquatFSM → judgeRep를 한 줄로 엮는 재사용 러너.
 * fixture(랜드마크 시퀀스)를 넣어 스냅샷 회귀하거나, 녹화본을 오프라인 분석할 때 쓴다.
 */
import { extractFeatures } from "./angle";
import { defaultJudgeConfig, judgeRep, type JudgeConfig } from "./judge";
import { DEFAULT_SQUAT_CONFIG, SquatFSM } from "./squat-fsm";
import type { JudgeEvent, PoseFrame } from "./types";

/**
 * 기립 무릎각 샘플 → 기준 기립각. 다리를 가장 편 상태가 서있음이라 상위 백분위(p90)를 쓴다.
 * 자세 잡는 초반·미세 흔들림 프레임에 눌리는 중앙값보다 견고 — 저측정되면 깊이 목표(S−65)가
 * 과하게 깊어져 정상 스쿼트가 knee_shallow로 오탐난다. 라이브 캘리브(/prepare)와 fixture 추정이
 * 이 한 함수를 공유해 경로 불일치를 없앤다.
 */
export const standingAngleFromSamples = (angles: number[]): number => {
  if (angles.length === 0) return 170;
  const sorted = [...angles].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.9)] ?? sorted[sorted.length - 1]!;
};

/**
 * 기립 무릎 각도 추정 — 프레임에서 특징을 뽑아 상위 백분위를 쓴다.
 * (캘리브 없이 fixture를 돌릴 때의 기본값. /workout은 캘리브 결과를 직접 넘긴다.)
 */
export const estimateStandingAngle = (frames: PoseFrame[]): number =>
  standingAngleFromSamples(
    frames
      .map((f) => extractFeatures(f)?.kneeAngle)
      .filter((a): a is number => a !== undefined),
  );

export interface PipelineOptions {
  /** 기립 무릎 각도(캘리브 결과). 없으면 프레임에서 추정 */
  standingKneeAngle?: number;
  /** judge 설정 오버라이드. fixture 판정력 검증은 그레이스 없이(graceReps:0) 돌린다 */
  judgeConfig?: Partial<JudgeConfig>;
}

/** 프레임 시퀀스를 파이프라인에 흘려 발생한 판정 이벤트를 순서대로 모은다. */
export function runSquatPipeline(
  frames: PoseFrame[],
  opts: PipelineOptions = {},
): JudgeEvent[] {
  const standing = opts.standingKneeAngle ?? estimateStandingAngle(frames);
  const fsm = new SquatFSM({
    standingKneeAngle: standing,
    ...DEFAULT_SQUAT_CONFIG,
  });
  const judgeCfg = { ...defaultJudgeConfig(standing), ...opts.judgeConfig };

  const events: JudgeEvent[] = [];
  for (const frame of frames) {
    const feat = extractFeatures(frame);
    if (!feat) continue;
    const rep = fsm.update(feat, frame.timestampMs);
    if (rep) events.push(...judgeRep(rep, judgeCfg));
  }
  return events;
}
