/**
 * 타이포그래피 토큰 — 폰트패밀리 + 티셔츠 스케일 (크기 + 라인하이트).
 * 생성기가 `--font-sans`, `--text-<k>`, `--text-<k>--line-height`로 방출.
 * weight는 별도(font-bold 등).
 *
 * ⚠️ Tailwind v4 기본 --text-* 를 덮어쓴다 (base 16→14, lg 18→17 등) — 의도된 정렬.
 */
export const fontFamily = {
  sans: '"Pretendard Variable", system-ui, sans-serif',
} as const;

export const fontSize = {
  xs: { size: "12px", lineHeight: "16px" },
  sm: { size: "13px", lineHeight: "18px" },
  base: { size: "14px", lineHeight: "20px" },
  lg: { size: "17px", lineHeight: "26px" },
  xl: { size: "20px", lineHeight: "28px" },
  "2xl": { size: "24px", lineHeight: "32px" },
  "3xl": { size: "30px", lineHeight: "38px" },
  "4xl": { size: "36px", lineHeight: "44px" },
} as const;
