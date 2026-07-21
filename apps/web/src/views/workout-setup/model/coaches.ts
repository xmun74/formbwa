/**
 * 캐릭터 코치 정의 — PRD §6.
 *
 * ⚠️ 목(mock) 데이터. M4에서 실제 음성/이미지 매니페스트로 교체한다.
 * 화면은 이 배열만 보고 그린다 — 이름·멘트를 컴포넌트에 하드코딩하지 말 것 (TRD-FE §6).
 */
export interface Coach {
  id: "pt" | "busan";
  name: string;
  /** 아바타 이모지 (실제 이미지는 M4) */
  emoji: string;
  /** 아바타 배경 액센트 토큰 (coach-warm / coach-cool) */
  accent: "warm" | "cool";
  /** 이름 아래 짧은 성격 라벨 */
  tone: string;
  /** 카드에 띄우는 대표 멘트 — 이 한 마디가 캐릭터 소개를 대신한다 */
  quote: string;
}

export const COACHES: Coach[] = [
  {
    id: "pt",
    name: "열정 PT쌤",
    emoji: "🔥",
    accent: "warm",
    tone: "하이텐션·응원 위주",
    quote: "좋아요!! 딱 하나만 더!!",
  },
  {
    id: "busan",
    name: "부산 사투리 쌤",
    emoji: "🧢",
    accent: "cool",
    tone: "구수한 잔소리",
    quote: "무릎 그래 펴면 안 된다카이~",
  },
];

export const DEFAULT_COACH = COACHES[0]!;
