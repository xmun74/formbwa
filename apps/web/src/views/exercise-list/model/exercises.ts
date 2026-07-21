/**
 * 운동 목록 데이터 (PRD §4-2). 부위(카테고리)별 종목.
 * 지금은 스쿼트만 "가능"(ready), 나머지는 "준비 중"(soon).
 * 실제 종목이 늘면 status: "ready"만 추가하면 카드·시작버튼이 따라온다.
 */
export type ExerciseStatus = "ready" | "soon";

export interface Exercise {
  id: string;
  name: string;
  status: ExerciseStatus;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  /** 카테고리 옆 회색 라벨 ("몸풀기", "지금 가능") */
  note?: string;
  exercises: Exercise[];
}

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  {
    id: "warmup",
    name: "웜업",
    note: "몸풀기",
    exercises: [
      { id: "neck-shoulder", name: "목·어깨 풀기", status: "soon" },
      { id: "cat-pose", name: "고양이 자세", status: "soon" },
    ],
  },
  {
    id: "upper",
    name: "상체",
    exercises: [
      { id: "pushup", name: "푸시업", status: "soon" },
      { id: "plank", name: "플랭크", status: "soon" },
    ],
  },
  {
    id: "lower",
    name: "하체",
    note: "지금 가능",
    exercises: [
      { id: "squat", name: "스쿼트", status: "ready" },
      { id: "lunge", name: "런지", status: "soon" },
    ],
  },
  {
    id: "full",
    name: "전신",
    exercises: [
      { id: "burpee", name: "버피", status: "soon" },
      { id: "mountain-climber", name: "마운틴클라이머", status: "soon" },
    ],
  },
];

export const ALL_EXERCISES = EXERCISE_CATEGORIES.flatMap((c) => c.exercises);

/** 기본 선택 종목 — 첫 번째 "가능" 종목 (스쿼트). 목록은 항상 비어있지 않다. */
export const DEFAULT_EXERCISE: Exercise =
  ALL_EXERCISES.find((e) => e.status === "ready") ?? ALL_EXERCISES[0]!;
