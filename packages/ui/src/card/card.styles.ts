import { tv } from "../lib/tv";

/**
 * Card 합성 공용 스타일 — **tv slots**. 한 설정으로 root/header/body/footer를 함께 관리.
 * (합성 컴포넌트에 slots가 어울리는 이유: 파트별 스타일을 한 곳에서 variant로 제어.)
 */
export const cardStyles = tv({
  slots: {
    root: "border-line bg-surface rounded-2xl border",
    header: "px-6 pt-6",
    body: "px-6 py-5",
    footer: "px-6 pb-6",
  },
  variants: {
    elevated: {
      true: { root: "shadow-[0_16px_40px_-24px] shadow-brand-900/20" },
    },
  },
  defaultVariants: { elevated: false },
});
