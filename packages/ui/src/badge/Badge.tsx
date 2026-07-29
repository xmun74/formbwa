import { forwardRef, type HTMLAttributes } from "react";

import { tv, type VariantProps } from "../lib/tv";

/** 작은 상태·라벨 뱃지 (tailwind-variants — tone/size 변형). */
export const badgeVariants = tv({
  base: "inline-flex items-center rounded-full font-medium",
  variants: {
    tone: {
      neutral: "bg-line text-ink-muted", // 비활성·"준비 중"
      brand: "bg-brand-100 text-brand-700", // 강조·"지금 가능"
    },
    size: {
      sm: "px-2.5 py-1 text-xs",
      md: "px-3.5 py-1.5 text-sm",
    },
  },
  defaultVariants: { tone: "neutral", size: "sm" },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone, size, className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={badgeVariants({ tone, size, className })}
      {...props}
    />
  );
});
