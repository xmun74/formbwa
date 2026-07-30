import { sendGAEvent } from "@next/third-parties/google";
import { GA_ID } from "./config";

/**
 * GA4 이벤트 전송 래퍼 (인프라, 비즈니스 로직 없음).
 * 포즈 랜드마크/프레임/영상 등 카메라 원천 데이터는 **절대** 파라미터에 넣지 말 것.
 * 화면 이동/횟수/품질 같은 집계 수치만 보낸다.
 * 정식 동의 배너, 개인정보처리방침은 M11(2단계)에서. 지금은 체험자 소수 전제.
 */

/** 계측 대상 커스텀 이벤트 — M6 퍼널 지표(PRD §8). page_view는 GA4가 자동 수집. */
export type AnalyticsEvent =
  | "workout_started" // /workout 진입 + 카메라 준비 완료
  | "set_completed" // 세트 종료 → /summary ({ reps, quality })
  | "workout_exited" // ExitGuard로 중도 이탈
  | "camera_permission_denied"; // 카메라 권한 거부

export function track(
  event: AnalyticsEvent,
  params?: Record<string, string | number>,
): void {
  if (!GA_ID || typeof window === "undefined") return;
  sendGAEvent("event", event, params ?? {});
}
