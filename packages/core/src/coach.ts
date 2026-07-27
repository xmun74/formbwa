/**
 * 판정 이벤트 → 멘트(클립) 결정 (F1-3, TRD-FE §5.2·§5.3).
 * 순수 로직 — 실제 오디오 재생(단일 채널)은 web 쪽 M4에서. 여긴 "무엇을/침묵을" 정한다.
 *
 * 정책:
 * - precision 우선: confidence < minConfidence면 발화하지 않음(침묵이 오탐보다 낫다)
 * - 쿨다운: 마지막 발화 후 cooldownMs 안에는 침묵
 * - 동일 이벤트 연속 발화 금지: 직전과 같은 종류면 침묵(로봇 같은 반복 방지)
 * - 우선순위: back_bent > knee_over_toe > knee_shallow > tempo_too_fast > good_rep
 */
import type { CoachDecision, JudgeEvent, JudgeEventType } from "./types";

export interface CoachConfig {
  cooldownMs: number;
  minConfidence: number;
}

export const DEFAULT_COACH_CONFIG: CoachConfig = {
  cooldownMs: 4000,
  minConfidence: 0.8,
};

// 발화 우선순위 (앞일수록 먼저). rep_counted는 발화 대상 아님.
const SPEAK_PRIORITY: JudgeEventType[] = [
  "back_bent",
  "knee_over_toe",
  "knee_shallow",
  "tempo_too_fast",
  "good_rep",
];

export class Coach {
  private lastSpokenMs = Number.NEGATIVE_INFINITY;
  private lastType: JudgeEventType | null = null;

  constructor(private readonly cfg: CoachConfig = DEFAULT_COACH_CONFIG) {}

  /** 한 회 판정 이벤트들 → 이번에 재생할 클립 키(또는 침묵). */
  decide(events: JudgeEvent[], nowMs: number): CoachDecision {
    const speakable = events
      .filter((e) => e.type !== "rep_counted")
      .filter((e) => e.confidence >= this.cfg.minConfidence)
      .sort(
        (a, b) =>
          SPEAK_PRIORITY.indexOf(a.type) - SPEAK_PRIORITY.indexOf(b.type),
      );

    const pick = speakable[0];
    if (!pick) return { clipKey: null }; // 발화할 게 없음(침묵)
    if (nowMs - this.lastSpokenMs < this.cfg.cooldownMs) {
      return { clipKey: null }; // 쿨다운
    }
    if (pick.type === this.lastType) {
      return { clipKey: null }; // 동일 이벤트 연속 발화 금지
    }

    this.lastSpokenMs = nowMs;
    this.lastType = pick.type;
    return { clipKey: pick.type };
  }
}
