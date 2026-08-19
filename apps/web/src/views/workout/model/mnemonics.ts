/**
 * 캐릭터별 멘트 스크립트 (PRD §6·F1-4).
 *
 * 4종 체계:
 *  - motivation : 세트 진행 중 동기부여 (마일스톤·조용할 때). 운동 무관 = 코치 공통.
 *  - good_rep   : 잘한 회 칭찬. 운동 무관 = 코치 공통.
 *  - form_intro : 세트 시작 시 올바른 자세 설명. **운동별**(exerciseId).
 *  - 결함 교정  : knee_shallow·back_bent·knee_over_toe·tempo_too_fast (= judge 이벤트). **운동별**.
 *
 * 멘트 원칙: 한 번에 한 가지, 3초 이내, 캐릭터 톤 유지, 칭찬:지적 최소 1:2.
 *
 * ⚠️ 지금은 자막 텍스트 소스(스타터). 분량 확대는 LLM 생성(카테고리×페르소나) 후 큐레이션.
 *   확정 텍스트로 mp3 일괄 생성 → `public/audio/{coachId}/manifest.json` (사투리 게이트 PRD §12 후).
 */

type CoachId = "pt" | "busan";

/** 운동별 멘트: 시작 자세 설명 + 결함 교정(키 = judge 이벤트) */
interface ExerciseMnemonics {
  form_intro: string[];
  knee_shallow: string[];
  back_bent: string[];
  knee_over_toe: string[];
  tempo_too_fast: string[];
}

/** 코치별 멘트: 공통(동기부여·칭찬) + 운동별(exerciseId → lines) */
interface CoachMnemonics {
  motivation: string[];
  good_rep: string[];
  /** 막판 카운트다운 — index+1 = 남은 회수 (예: [4] = 5개 남음, [0] = 마지막 1개). */
  countdown: string[];
  exercises: Record<string, ExerciseMnemonics>;
}

export const MNEMONICS: Record<CoachId, CoachMnemonics> = {
  pt: {
    motivation: [
      "좋아요, 그 페이스 유지해요!",
      "잘하고 있어요, 조금만 더!",
      "숨 고르고, 할 수 있어요!",
      "이 악물고 딱 버텨요!",
      "폼 아주 좋아요, 그대로!",
      "자, 막판이에요, 힘내요!",
      "거의 다 왔어요, 포기 없기!",
    ],
    good_rep: [
      "좋아요!! 완벽해요!",
      "그거죠! 딱 좋아요!",
      "완벽한 자세예요!",
      "바로 그거예요!",
    ],
    countdown: ["마지막 하나!", "둘!", "셋!", "넷!", "다섯 개 남았어요!"],
    exercises: {
      squat: {
        form_intro: [
          "발은 어깨너비로, 발끝은 살짝 바깥! 가슴 펴고 시선은 정면이에요.",
          "엉덩이를 뒤로 빼면서 앉아요. 무릎은 발끝 방향으로! 준비됐죠?",
          "허리는 곧게, 무게는 발 전체에. 천천히 내려갔다 올라와요!",
        ],
        knee_shallow: [
          "더 깊게! 엉덩이 쭉 내려요!",
          "조금만 더 앉아봐요, 가능해요!",
          "허벅지가 바닥과 평행이 될 때까지!",
          "무릎을 더 굽혀서 깊이 앉아요!",
          "반만 앉지 말고 끝까지 내려가요!",
        ],
        back_bent: [
          "가슴 펴요! 허리 세우고!",
          "등 곧게 세워요, 그렇지!",
          "상체 숙이지 말고 세워요!",
          "시선 정면! 가슴 열고!",
          "허리 곧게, 코어에 힘!",
        ],
        knee_over_toe: [
          "무릎이 발끝 넘지 않게!",
          "무게는 뒤꿈치로!",
          "엉덩이를 더 뒤로 빼요!",
          "무릎 앞으로 쏠리지 않게 조심!",
          "발바닥 전체로 눌러요!",
        ],
        tempo_too_fast: [
          "천천히! 반동 쓰지 말고!",
          "내려갈 때 힘 빼지 말아요!",
          "속도 줄이고 근육으로 버텨요!",
          "급하게 말고 천천히 컨트롤!",
          "내려가는 걸 셋 세면서!",
        ],
      },
    },
  },
  busan: {
    motivation: [
      "그래, 그 페이스로 가자!",
      "잘한다, 쪼매만 더 해보자!",
      "숨 고르고, 할 수 있다카이!",
      "이 악물고 버티라, 다 왔다!",
      "폼 좋다, 고대로 가자!",
      "자, 막판이다, 힘내라!",
      "거의 다 왔다, 여서 포기하면 안 된다!",
    ],
    good_rep: [
      "오~ 잘한다! 그거다~",
      "옳지, 딱 좋다~",
      "그래 그거지, 완벽하다!",
      "마, 자세 좋다!",
    ],
    countdown: ["마지막 하나다!", "둘!", "셋!", "넷!", "다섯 개 남았다!"],
    exercises: {
      squat: {
        form_intro: [
          "발은 어깨너비로 벌리고, 발끝은 살짝 바깥으로 두라. 가슴 쫙 펴고 앞을 봐라!",
          "엉덩이를 뒤로 빼면서 앉는다카이. 무릎은 발끝 방향으로! 준비됐제?",
          "허리 곧게 세우고 발 전체로 딛는다. 천천히 내려갔다 올라온다!",
        ],
        knee_shallow: [
          "무릎 더 굽히라카이~",
          "쪼매만 더 앉아봐라~",
          "허벅지가 바닥이랑 평행 될 때까지 내리라!",
          "반만 앉지 말고 끝까지 내려가라~",
          "더 깊이! 엉덩이 쭉 빼면서 앉아라!",
        ],
        back_bent: [
          "허리 좀 펴라, 굽으면 안 된다카이~",
          "가슴 쫙 펴라~",
          "상체 숙이지 말고 세우라!",
          "시선 앞에 두고 가슴 열어라~",
          "등 곧게! 배에 힘 딱 주고!",
        ],
        knee_over_toe: [
          "무릎이 발끝 넘어가삐면 안 된다~",
          "무게 뒤로 실어라~",
          "엉덩이를 더 뒤로 빼라카이!",
          "무릎 앞으로 쏠린다, 조심해라~",
          "발바닥 전체로 딱 눌러라!",
        ],
        tempo_too_fast: [
          "천천히 내려가라, 반동 쓰지 말고~",
          "급하게 하지 마라~",
          "속도 줄이고 근육으로 버티라!",
          "내려가는 거 셋 세면서 천천히!",
          "휙 떨어지지 말고 컨트롤해라~",
        ],
      },
    },
  },
};

type CommonKey = "motivation" | "good_rep";
const isCommonKey = (k: string): k is CommonKey =>
  k === "motivation" || k === "good_rep";

/**
 * 대사 하나를 고른다 (변형 중 랜덤).
 * 공통 키(motivation·good_rep)는 코치 레벨, 그 외(form_intro·결함)는 운동별에서 찾는다.
 * `exclude`(직전 대사)와 같은 문장은 피한다 — 연속 중복 방지. 변형이 소진되면 null(침묵).
 */
export function pickLine(
  coachId: string,
  exerciseId: string,
  clipKey: string,
  exclude?: string | null,
): string | null {
  const coach = MNEMONICS[coachId as CoachId];
  if (!coach) return null;
  const lines = isCommonKey(clipKey)
    ? coach[clipKey]
    : coach.exercises[exerciseId]?.[clipKey as keyof ExerciseMnemonics];
  if (!lines || lines.length === 0) return null;
  const pool = exclude ? lines.filter((l) => l !== exclude) : lines;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** 남은 회수(1~5)에 해당하는 카운트다운 대사. index+1 = 남은 회수. */
export function countdownLine(
  coachId: string,
  remaining: number,
): string | null {
  const c = MNEMONICS[coachId as CoachId];
  return c?.countdown[remaining - 1] ?? null;
}

/**
 * 자막 개인화 — 대사 앞에 이름을 얹는다 (F1-9, TRD-FE §6.1).
 * 텍스트라 비용/지연 0으로 자막은 항상 개인화. **음성은 이걸 쓰지 않는다** —
 * 실시간 교정 음성엔 이름을 넣지 않고, 이름 호명은 세트 경계에서만(WorkoutView).
 */
export function personalize(line: string, name: string): string {
  return `${name}님, ${line}`;
}
