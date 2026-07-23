/**
 * 코어 엔진 공용 타입 (TRD-FE §5.2). BE와 공유되는 타입의 원본.
 * react/next/DOM 금지 — 순수 TS.
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFrame {
  /** MediaPipe Pose 33개 랜드마크 */
  landmarks: Landmark[];
  timestampMs: number;
}

/** MediaPipe Pose(BlazePose 33) 랜드마크 인덱스 — 스쿼트에 쓰는 것만 */
export const LM = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

/** 한 프레임에서 뽑은 스쿼트 판정용 특징값 */
export interface PoseFeatures {
  /** 무릎 각도(엉덩이–무릎–발목), 도. 펴짐 ~180, 깊은 스쿼트 ~90 이하 */
  kneeAngle: number;
  /** 상체 기울기(수직 대비), 도. 곧게 서면 ~0, 앞으로 굽을수록 커짐 */
  torsoLean: number;
  /** 무릎이 발끝을 넘는 정도 — |무릎.x − 발목.x| / 정강이 길이 (정규화) */
  kneeOverToe: number;
  /** 판정에 쓴 쪽 (가시성 높은 쪽) */
  side: "left" | "right";
}

/** 한 회(rep) 동안 누적된 지표 — 판정 입력 */
export interface RepMetric {
  repIndex: number;
  /** 최저점 무릎 각도 (깊이) */
  minKneeAngle: number;
  /** 회 중 최대 상체 기울기 */
  maxTorsoLean: number;
  /** 회 중 최대 무릎-발끝 이탈 */
  maxKneeOverToe: number;
  descentMs: number;
  ascentMs: number;
}

export type JudgeEventType =
  | "rep_counted"
  | "knee_shallow" // 깊이 부족
  | "back_bent" // 허리 굽음
  | "knee_over_toe" // 무릎 전방 이탈
  | "good_rep"
  | "tempo_too_fast";

export interface JudgeEvent {
  type: JudgeEventType;
  /** 0~1. 임계값 미만이면 coach가 무시 (침묵 정책, §5.3) */
  confidence: number;
  repIndex: number;
}

export interface CoachDecision {
  /** 재생할 mp3 키. null = 침묵 */
  clipKey: string | null;
}
