import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 이번 운동 도메인 상태 — 라우트를 건너 유지 (TRD-FE §3.2).
 * 선택값(닉네임·코치·종목)+세트 결과를 localStorage에 영속(persist)해 새로고침에도 단계 유지.
 * (모델·오디오 같은 리소스는 도메인이 아니라 shared/lib 인프라 — 여기 두지 않는다.)
 */
export interface WorkoutCoach {
  id: "pt" | "busan";
  /** 불투명·고정 id — 특징(이름·사투리·외형)이 바뀌어도 불변. 정체성은 시범 매니페스트에 (spec §4) */
  characterId: "character1" | "character2";
  name: string;
  emoji: string;
}

export interface SetPoint {
  label: string;
  count: number;
  tone: "coral" | "amber";
}

export interface SetResult {
  reps: number;
  targetReps: number;
  quality: number; // 자세 정확도 %
  durationLabel: string;
  liveCaption: string;
  points: SetPoint[];
  coachComment: string;
}

interface WorkoutState {
  nickname: string;
  coach: WorkoutCoach;
  exerciseName: string;
  /** 운동 식별 slug — 루틴·core(판정)·시범이 공유 (spec §4). exerciseName은 표시용 */
  exerciseId: string;
  setNo: number;
  totalSets: number;
  /** TODO(M3): 판정 파이프라인 결과로 채운다. 지금은 목 기본값. */
  result: SetResult;
  /** /prepare 캘리브레이션에서 잡은 기립 무릎 각도. 미측정이면 null → /workout이 기본값 사용 */
  standingKneeAngle: number | null;

  setNickname: (v: string) => void;
  setCoach: (c: WorkoutCoach) => void;
  setExercise: (name: string) => void;
  setStandingKneeAngle: (deg: number) => void;
  setResult: (r: SetResult) => void;
  /** 다음 세트로 (setNo 증가). 세트 자동 진행에서 호출 */
  nextSet: () => void;
  /** 세트 번호를 1로 (새 운동 세션 시작 시) */
  resetSetNo: () => void;
  reset: () => void;
}

const DEFAULT_COACH: WorkoutCoach = {
  id: "pt",
  characterId: "character1",
  name: "열정 PT쌤",
  emoji: "🔥",
};

const DEFAULT_RESULT: SetResult = {
  reps: 12,
  targetReps: 15,
  quality: 82,
  durationLabel: "3:20",
  liveCaption: "무릎 조금만 더 굽혀요 — 좋아요!",
  points: [
    { label: "무릎이 안쪽으로", count: 5, tone: "coral" },
    { label: "깊이 부족", count: 3, tone: "amber" },
  ],
  coachComment:
    "12개 완주 진짜 멋져요!! 후반부에 무릎이 살짝 안으로 모이는 것만 잡으면 완벽해요. 다음 세트엔 발끝 방향으로 무릎 밀어낸다 생각하고 딱 하나만 더!! 오늘 폼 아주 좋았습니다 💪",
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      nickname: "",
      coach: DEFAULT_COACH,
      exerciseName: "스쿼트",
      exerciseId: "squat",
      setNo: 1,
      totalSets: 3,
      result: DEFAULT_RESULT,
      standingKneeAngle: null,

      setNickname: (v) => set({ nickname: v }),
      setCoach: (c) => set({ coach: c }),
      setExercise: (name) => set({ exerciseName: name }),
      setStandingKneeAngle: (deg) => set({ standingKneeAngle: deg }),
      setResult: (r) => set({ result: r }),
      nextSet: () => set((s) => ({ setNo: s.setNo + 1 })),
      resetSetNo: () => set({ setNo: 1 }),
      reset: () =>
        set({
          nickname: "",
          coach: DEFAULT_COACH,
          exerciseName: "스쿼트",
          exerciseId: "squat",
          setNo: 1,
        }),
    }),
    {
      name: "formbwa-workout",
      version: 1,
      // 구버전 persist엔 coach.characterId가 없어 시범 영상이 안 뜸 → id로 매핑 (spec §4)
      migrate: (persisted, version) => {
        const s = persisted as Partial<WorkoutState> & {
          coach?: Partial<WorkoutCoach>;
        };
        if (version < 1 && s.coach && !s.coach.characterId) {
          s.coach.characterId =
            s.coach.id === "busan" ? "character2" : "character1";
        }
        return s as WorkoutState;
      },
    },
  ),
);

/** 닉네임 표시용 — 비어 있으면 "회원" */
export function displayName(nickname: string): string {
  return nickname.trim() || "회원";
}
