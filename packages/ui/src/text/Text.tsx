import { type ElementType, type HTMLAttributes } from "react";
import { tv, type VariantProps } from "../lib/tv";

/**
 * 타이포 프리미티브 — 티셔츠 스케일(size)·톤·굵기를 variant로. 하드코딩 `text-*` 대신 사용.
 * **폴리모픽**(`as`)이라 ref 포워딩은 생략(폴리모픽 ref는 타입 부담이 크고 텍스트엔 드묾).
 * 상태 없어 **RSC-safe**.
 */
export const textVariants = tv({
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
    tone: {
      default: "text-ink",
      soft: "text-ink-soft",
      muted: "text-ink-muted",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
  },
  defaultVariants: { size: "base", tone: "default", weight: "normal" },
});

export interface TextProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: ElementType;
}

export function Text({
  as: Tag = "p",
  size,
  tone,
  weight,
  className,
  ...props
}: TextProps) {
  return (
    <Tag
      className={textVariants({ size, tone, weight, className })}
      {...props}
    />
  );
}

type Level = 1 | 2 | 3 | 4 | 5 | 6;
const HEADING_SIZE: Record<Level, VariantProps<typeof textVariants>["size"]> = {
  1: "4xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "base",
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: Level;
  /** 기본 크기는 level을 따르되 필요 시 재정의 */
  size?: VariantProps<typeof textVariants>["size"];
}

export function Heading({
  level = 2,
  size,
  className,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as ElementType;
  return (
    <Tag
      className={textVariants({
        size: size ?? HEADING_SIZE[level],
        weight: "extrabold",
        className: `tracking-tight ${className ?? ""}`,
      })}
      {...props}
    />
  );
}
