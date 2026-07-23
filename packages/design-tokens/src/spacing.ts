/**
 * 간격 토큰 — Tailwind 기본 spacing 배수는 유지하고 커스텀 값만 정의.
 * 생성기가 `--spacing-<name>`으로 방출.
 */
export const spacing = {
  gutter: "clamp(1.5rem, 4vw, 4rem)", // 페이지 좌우 여백 (유동)
} as const;
