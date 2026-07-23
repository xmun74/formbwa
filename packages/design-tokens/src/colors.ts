/**
 * 색 토큰 — 플랫폼 중립 값 (단일 진실).
 * 브랜드는 OKLCH(웹 authoring), 뉴트럴·다크·액센트는 hex.
 * 값은 apps/web globals.css에서 1:1 이관. 생성기가 `--color-<name>`으로 방출.
 *
 * ⚠️ RN은 oklch 미지원 → RN 타깃이 생기면 생성기에 hex 변환 출력을 추가한다.
 */
export const colors = {
  // 브랜드 그린 (#12b394 = brand-500), hue 174 고정. 흰 글씨는 brand-600부터.
  brand: {
    50: "oklch(0.982 0.016 174)", // #effdf8
    100: "oklch(0.955 0.034 174)", // #daf8ee
    200: "oklch(0.912 0.062 174)", // #b8f0df
    300: "oklch(0.845 0.1 174)", // #81e2c7
    400: "oklch(0.755 0.128 174)", // #3ccaa9
    500: "oklch(0.685 0.128 174)", // #11b394 — 원색
    600: "oklch(0.549 0.108 174)", // #00856d — 버튼(흰 글씨 4.6)
    700: "oklch(0.485 0.088 174)", // #106f5b — 강조 텍스트
    800: "oklch(0.4 0.072 174)", // #0b5445
    900: "oklch(0.315 0.055 174)", // #083a2f
    950: "oklch(0.235 0.04 174)", // #04241d
  },

  // 뉴트럴 (라이트)
  canvas: "#f7fbfa", // 페이지 배경
  surface: "#ffffff", // 카드
  "surface-sunken": "#fbfdfc", // 비활성 카드
  line: "#e8f0ed", // 기본 보더
  "line-soft": "#eef4f2", // 헤더 구분선
  ink: "#16302a", // 본문
  "ink-soft": "#5f746e", // 보조 텍스트
  "ink-muted": "#7b8f89", // 흐린 텍스트·라벨

  // 다크 (운동 화면)
  "dark-canvas": "#0e2420",
  "dark-surface": "#12302a",
  "dark-surface-2": "#16362f",
  "dark-line": "#24463d",
  "dark-ink": "#eaf5f1",
  "dark-ink-soft": "#a7c4bc",
  "dark-ink-muted": "#7fa89c",

  // 액센트 — 캐릭터·상태
  "coach-warm": "#ffe1d6",
  "coach-cool": "#dcefff",
  "point-coral": "#fdeee9",
  "point-coral-ink": "#d0724d",
  "point-amber": "#fdf6e3",
  "point-amber-ink": "#b78a1f",
  live: "#ff6b6b",
} as const;
