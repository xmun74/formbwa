import { type ComponentType, type SVGProps } from "react";
import { cn } from "../lib/cn";

/**
 * 아이콘 래퍼 — 크기 토큰(sm/md/lg)과 접근성을 표준화한다.
 * **아이콘 라이브러리에 의존하지 않음** — SVG 컴포넌트(lucide 등)를 `icon`으로 받는다.
 * `label`이 있으면 의미 있는 아이콘(`role="img"`), 없으면 장식(`aria-hidden`).
 */
const SIZES = { sm: "size-4", md: "size-5", lg: "size-6" } as const;

export interface IconProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: keyof typeof SIZES;
  className?: string;
  /** 의미 있는 아이콘이면 라벨을 준다(스크린리더). 없으면 장식 취급. */
  label?: string;
}

export function Icon({ icon: Cmp, size = "md", className, label }: IconProps) {
  return (
    <Cmp
      className={cn(SIZES[size], className)}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    />
  );
}
