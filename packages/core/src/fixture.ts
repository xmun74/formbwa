/**
 * fixture 회귀 하네스 (TRD-FE §5.4). 촬영본(랜드마크 시퀀스)을 파이프라인에 돌리고,
 * fixture가 선언한 기대(expect)를 자동 검증한다.
 *
 * 스냅샷은 "변했나(회귀)"만 잡지만, expect는 "옳은가(의도)"까지 잡는다 —
 * 촬영자가 "이건 정상 3회" / "이건 무릎 안쪽 결함"을 알고 찍으니, 그 의도를 fixture에 적으면
 * 판정 튜닝 때 자동으로 검증된다. 순수 함수라 웹 `/dev/extract` 미리보기에서도 재사용.
 */
import { runSquatPipeline } from "./pipeline";
import type { JudgeEvent, JudgeEventType, PoseFrame } from "./types";

export interface FixtureExpectation {
  /** 세어야 할 rep 수 (rep_counted 이벤트 수) */
  repCount?: number;
  /** 반드시 나와야 하는 판정 이벤트 (결함 fixture — 예: 무릎 안쪽 → knee_over_toe) */
  mustInclude?: JudgeEventType[];
  /** 절대 나오면 안 되는 판정 이벤트 (정상 fixture — 예: 오탐 없어야) */
  mustExclude?: JudgeEventType[];
}

export interface SquatFixture {
  name: string;
  /** (선택) 캘리브 기립각. 없으면 프레임에서 추정 */
  standingKneeAngle?: number;
  frames: PoseFrame[];
  /** (선택) 이 fixture가 만족해야 할 판정 기대 */
  expect?: FixtureExpectation;
}

export interface FixtureCheck {
  ok: boolean;
  /** 기대를 어긴 항목들 (사람이 읽는 메시지). ok면 빈 배열 */
  failures: string[];
  /** 파이프라인이 낸 판정 이벤트 (스냅샷·디버깅용) */
  events: JudgeEvent[];
}

/** fixture를 파이프라인에 돌리고 expect(있으면)를 검증한다. expect 없으면 항상 ok(스냅샷만). */
export const checkFixture = (fixture: SquatFixture): FixtureCheck => {
  const events = runSquatPipeline(fixture.frames, {
    standingKneeAngle: fixture.standingKneeAngle,
  });
  const failures: string[] = [];
  const exp = fixture.expect;

  if (exp) {
    const present = new Set(events.map((e) => e.type));

    if (exp.repCount !== undefined) {
      const reps = events.filter((e) => e.type === "rep_counted").length;
      if (reps !== exp.repCount) {
        failures.push(`rep 수: ${exp.repCount} 기대, 실제 ${reps}`);
      }
    }
    for (const t of exp.mustInclude ?? []) {
      if (!present.has(t)) failures.push(`이벤트 '${t}' 기대했으나 없음`);
    }
    for (const t of exp.mustExclude ?? []) {
      if (present.has(t)) failures.push(`이벤트 '${t}' 없어야 하나 발생`);
    }
  }

  return { ok: failures.length === 0, failures, events };
};
