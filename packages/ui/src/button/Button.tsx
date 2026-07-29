import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { tv, type VariantProps } from "../lib/tv";

/**
 * 버튼 스타일 (tailwind-variants). 클래스 헬퍼로도 쓸 수 있게 export.
 * 색·padding은 토큰 유틸(brand·surface·ink). 값은 기존 `buttonClass`와 동일.
 */
export const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
  variants: {
    variant: {
      primary:
        "bg-brand-400 text-white shadow-[0_10px_22px_-10px] shadow-brand-500/70 hover:bg-brand-500",
      secondary:
        "bg-surface text-ink border-[1.5px] border-line hover:border-brand-300",
      ghost: "bg-transparent text-ink hover:bg-brand-50",
    },
    size: {
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** true면 자식 요소에 버튼 스타일을 위임 (Slot) — `<Button asChild><Link/></Button>` */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant, size, asChild = false, className, ...props }, ref) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  },
);
