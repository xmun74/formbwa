/** 다크 패널 대각 스트라이프 — 웹캠·시범 영상 플레이스홀더 (실제 미디어는 M4). */
export const DARK_STRIPE =
  "bg-[repeating-linear-gradient(135deg,var(--color-dark-surface)_0_16px,var(--color-dark-canvas)_16px_32px)]";

/** 한 세트 목표 횟수. HUD 카운트다운·요약 목표치가 공유하는 단일 소스. */
export const SET_TARGET_REPS = 15;

/** 남은 횟수가 이 값 이하면 HUD에서 카운트다운을 강조한다. */
export const COUNTDOWN_FROM = 5;

/** 세트 간 휴식 시간(초). 끝나면 다음 세트 자동 시작. */
export const REST_SECONDS = 20;

/** 세트 완료 후 화면 전환까지의 여유(ms) — 마지막 멘트 오디오가 잘리지 않게. */
export const SET_END_DELAY_MS = 2000;
