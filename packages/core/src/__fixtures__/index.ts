import type { SquatFixture } from "../fixture";
import sampleSquat from "./sample-squat.json";

/**
 * 회귀 하네스가 도는 fixture 목록.
 * 촬영본을 추가할 때: JSON을 이 폴더에 저장 → 여기에 import + 배열 한 줄만 추가하면
 * `fixture.test.ts`의 스냅샷·기대 검증에 자동 포함된다.
 */
export const FIXTURES: { file: string; fixture: SquatFixture }[] = [
  {
    file: "sample-squat.json",
    fixture: sampleSquat as unknown as SquatFixture,
  },
];
