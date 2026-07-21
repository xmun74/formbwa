/**
 * 캐릭터 정의 — PRD §6.
 *
 * ⚠️ 목(mock) 데이터다. M4에서 `public/audio/{coachId}/manifest.json`을 읽는 것으로 교체한다.
 * PRD §12의 사투리 게이트에서 캐릭터가 교체될 수 있으므로 화면은 이 배열만 보고 그린다 —
 * 이름·멘트를 컴포넌트에 하드코딩하지 말 것 (TRD-FE §6).
 */

export interface Coach {
  id: string;
  name: string;
  /** 이름 옆 배지 — PRD §6 "톤"의 핵심어 */
  badge: string;
  /** 이 코치가 어떻게 봐주는지 한 줄 */
  tone: string;
  /** 카드에 띄울 대표 멘트. 이 한 마디가 캐릭터 소개를 대신한다 */
  sampleLine: string;
  /** 말풍선 성격을 형태로: 열정은 조이고, 사투리는 늘어진다 */
  bubble: "tight" | "drawl";
  accent: "warm" | "clay";
  image: { src: string; width: number; height: number };
}

export const COACHES: Coach[] = [
  {
    id: "pt",
    name: "열정 PT쌤",
    badge: "응원",
    tone: "하이텐션으로 밀어줘요. 잘하고 있으면 확실히 알려줍니다.",
    sampleLine: "좋아요!! 딱 하나만 더!!",
    bubble: "tight",
    accent: "warm",
    image: { src: "/coaches/pt.webp", width: 303, height: 640 },
  },
  {
    id: "busan",
    name: "부산 사투리 쌤",
    badge: "잔소리",
    tone: "구수하게 참견해요. 틀린 자세는 그냥 안 넘어갑니다.",
    sampleLine: "무릎 그래 펴면 안 된다카이~",
    bubble: "drawl",
    accent: "clay",
    image: { src: "/coaches/busan.webp", width: 269, height: 640 },
  },
];
