export const CORE_VERSION = "0.0.0";

export * from "./types";
export {
  angleABC,
  angleFromVertical,
  extractFeatures,
  isFullBodyInFrame,
} from "./angle";
export { SquatFSM, DEFAULT_SQUAT_CONFIG } from "./squat-fsm";
export type { SquatState, SquatConfig } from "./squat-fsm";
export { judgeRep, defaultJudgeConfig } from "./judge";
export type { JudgeConfig } from "./judge";
export { Coach, DEFAULT_COACH_CONFIG } from "./coach";
export type { CoachConfig } from "./coach";
export { runSquatPipeline, estimateStandingAngle } from "./pipeline";
export type { PipelineOptions } from "./pipeline";
export { checkFixture } from "./fixture";
export type { SquatFixture, FixtureExpectation, FixtureCheck } from "./fixture";
