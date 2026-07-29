/**
 * 의미(semantic) 색 토큰 — **의도 기반**, `primitive`를 참조한다 (2계층의 상위).
 * 생성기가 이 객체를 `--color-*`로 방출한다 (Tailwind `bg-surface`·`text-ink`…).
 * 브랜드 스케일은 코드에서 직접 쓰므로(`text-brand-700`) 스케일째 노출한다.
 * 원시 값은 `primitives.ts`. 여기선 **어떤 의도에 어떤 primitive를 쓰는지**만 정한다.
 * 값은 원본 — 변경 금지.
 */
import { primitive } from "./primitives";

const { brand, neutral, neutralDark } = primitive;

export const colors = {
  brand, // 브랜드 스케일 직접 노출 (액션·강조에 단계별 사용)

  // 뉴트럴 (라이트)
  canvas: neutral[50], // 페이지 배경
  surface: neutral[0], // 카드
  "surface-sunken": neutral[25], // 비활성 카드
  line: neutral[200], // 기본 보더
  "line-soft": neutral[100], // 헤더 구분선
  ink: neutral[900], // 본문
  "ink-soft": neutral[600], // 보조 텍스트
  "ink-muted": neutral[500], // 흐린 텍스트·라벨

  // 다크 (운동 화면)
  "dark-canvas": neutralDark[900],
  "dark-surface": neutralDark[850],
  "dark-surface-2": neutralDark[800],
  "dark-line": neutralDark[700],
  "dark-ink": neutralDark[50],
  "dark-ink-soft": neutralDark[300],
  "dark-ink-muted": neutralDark[400],

  // 액센트·상태 — 스케일 없는 leaf (raw semantic)
  "coach-warm": "#ffe1d6", // 캐릭터 웜
  "coach-cool": "#dcefff", // 캐릭터 쿨
  "point-coral": "#fdeee9", // 지적 포인트 배경
  "point-coral-ink": "#d0724d", // 지적 포인트 텍스트
  "point-amber": "#fdf6e3", // 주의 포인트 배경
  "point-amber-ink": "#b78a1f", // 주의 포인트 텍스트
  live: "#ff6b6b", // 실시간 인디케이터
} as const;
