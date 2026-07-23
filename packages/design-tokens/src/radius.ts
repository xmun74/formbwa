/**
 * 모서리 반경 토큰 — 기존 사용(rounded-lg=8, xl=12, 2xl=16, full)과 충돌 없는 값.
 * 패키지를 단일 소스로 삼아 이후 변경을 한 곳에서. 생성기가 `--radius-<name>`으로 방출.
 */
export const radius = {
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;
