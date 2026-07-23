/**
 * 캐릭터 코치 정의 — PRD §6.
 *
 * ⚠️ 목(mock) 데이터. M4에서 실제 음성/이미지 매니페스트로 교체한다.
 * 화면은 이 배열만 보고 그린다 — 이름·멘트를 컴포넌트에 하드코딩하지 말 것 (TRD-FE §6).
 */
export interface CoachStat {
  /** 지표 이름 (난이도·집중·템포) */
  label: string;
  value: string;
}

export interface Coach {
  id: "pt" | "busan";
  name: string;
  /** 아바타 이모지 (실제 이미지는 M4) */
  emoji: string;
  accent: "warm" | "cool";
  quote: string;
  stats: CoachStat[];
}

export const COACHES: Coach[] = [
  {
    id: "pt",
    name: "열정 PT쌤",
    emoji: "🔥",
    accent: "warm",
    quote: "좋아요!! 딱 하나만 더!!",
    stats: [
      { label: "난이도", value: "고강도" },
      { label: "집중", value: "근지구력" },
      { label: "템포", value: "빠르게" },
    ],
  },
  {
    id: "busan",
    name: "부산 사투리 쌤",
    emoji: "🧢",
    accent: "cool",
    quote: "무릎 그래 펴면 안 된다카이~",
    stats: [
      { label: "난이도", value: "중강도" },
      { label: "집중", value: "자세교정" },
      { label: "템포", value: "차분히" },
    ],
  },
];

export const DEFAULT_COACH = COACHES[0]!;
