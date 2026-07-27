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
