import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

/**
 * primary: 원색 brand-500(#12b394) 배경 + 흰 글씨 — Claude Design 원본 그대로.
 */
const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-brand-400 text-white shadow-[0_10px_22px_-10px] shadow-brand-500/70 hover:bg-brand-500",
  secondary:
    "bg-surface text-ink border-[1.5px] border-line hover:border-brand-300",
  ghost: "bg-transparent text-ink hover:bg-brand-50",
};

/** 버튼 스타일을 링크(내비게이션)에도 쓰기 위한 헬퍼 — <Link className={buttonClass()}> */
export function buttonClass(variant: Variant = "primary", extra = "") {
  return `inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASS[variant]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
