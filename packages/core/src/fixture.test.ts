import { describe, expect, it } from "vitest";
import { FIXTURES } from "./__fixtures__";
import { checkFixture } from "./fixture";

/**
 * fixture 회귀 하네스 — `__fixtures__/index.ts`에 등록된 촬영본을 전부 돌린다.
 * ① 스냅샷: 판정 이벤트가 바뀌면(회귀) 잡는다.
 * ② 기대(expect): fixture가 선언한 의도(정상=지적 없음, 결함=해당 이벤트)를 검증한다.
 */
describe("fixture 회귀 하네스", () => {
  it("fixture가 하나 이상 등록돼 있다", () => {
    expect(FIXTURES.length).toBeGreaterThan(0);
  });

  describe.each(FIXTURES)("$file", ({ fixture }) => {
    it("판정 이벤트 스냅샷 (회귀 감지)", () => {
      expect(checkFixture(fixture).events).toMatchSnapshot();
    });

    it("선언된 기대(expect)를 만족한다", () => {
      // expect 미선언 fixture는 failures가 빈 배열이라 통과(스냅샷만 걸림).
      expect(checkFixture(fixture).failures).toEqual([]);
    });
  });
});
