/**
 * 세션 컨텍스트 목 데이터 — /workout(운동)·/summary(요약)가 공유한다.
 *
 * 지금은 mock 상수라 shared/config에 둔다. 실제로는 /start에서 입력받은
 * 닉네임·코치·선택 종목이 흘러들어오고, 운동 중 판정 결과가 쌓인다.
 *
 * TODO(M2): 상태를 갖는 순간 entities/session (Zustand store)로 승격한다.
 *   (steiger가 이 레포에서 `@/` 별칭을 못 풀어 엔티티 참조를 0으로 오인 →
 *    지금은 shared에 두어 insignificant-slice 오탐을 피한다.)
 */
export const SESSION = {
  nickname: "민수",
  coach: { name: "열정 PT쌤", emoji: "🔥" },
  exerciseName: "스쿼트",
  setNo: 1,
} as const;

/**
 * 한 세트 판정 결과 — 운동 중 쌓여서 요약에 표시된다.
 * TODO(M3): 판정 파이프라인 결과로 교체. 지금은 목.
 */
export const SET_RESULT = {
  reps: 12,
  quality: 82, // %
  durationLabel: "3:20",
  liveCaption: "무릎 조금만 더 굽혀요 — 좋아요!",
  points: [
    { label: "무릎이 안쪽으로", count: 5, tone: "coral" },
    { label: "깊이 부족", count: 3, tone: "amber" },
  ],
  coachComment:
    "민수님, 12개 완주 진짜 멋져요!! 후반부에 무릎이 살짝 안으로 모이는 것만 잡으면 완벽해요. 다음 세트엔 발끝 방향으로 무릎 밀어낸다 생각하고 딱 하나만 더!! 오늘 폼 아주 좋았습니다 💪",
} as const;
