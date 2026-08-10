import type { SquatFixture } from "../fixture";
import squatBackBent from "./squat-back_bent.json";
import squatGood from "./squat-good.json";
import squatKneeOverToe from "./squat-knee_over_toe.json";
import squatKneeShallow from "./squat-knee_shallow.json";
import squatTempoTooFast from "./squat-tempo_too_fast.json";

/**
 * 회귀 하네스가 도는 fixture 목록.
 * 촬영본을 추가할 때: JSON을 이 폴더에 저장 → 여기에 import + 배열 한 줄만 추가하면
 * `fixture.test.ts`의 스냅샷·기대 검증에 자동 포함된다.
 *
 * 5종 전부 판정 기대를 충족(expect 선언) — 정상은 오탐 없음, 결함 4종은 각 이벤트 검출.
 * (sample-squat.json은 형식 예시 파일)
 */
export const FIXTURES: { file: string; fixture: SquatFixture }[] = [
  { file: "squat-good.json", fixture: squatGood as unknown as SquatFixture },
  {
    file: "squat-knee_over_toe.json",
    fixture: squatKneeOverToe as unknown as SquatFixture,
  },
  {
    file: "squat-knee_shallow.json",
    fixture: squatKneeShallow as unknown as SquatFixture,
  },
  {
    file: "squat-back_bent.json",
    fixture: squatBackBent as unknown as SquatFixture,
  },
  {
    file: "squat-tempo_too_fast.json",
    fixture: squatTempoTooFast as unknown as SquatFixture,
  },
];
