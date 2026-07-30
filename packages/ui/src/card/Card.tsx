import { forwardRef, type HTMLAttributes } from "react";
import type { VariantProps } from "../lib/tv";
import { cardStyles } from "./card.styles";

/**
 * Card 합성 — **named export** (`Card`/`CardHeader`/`CardBody`/`CardFooter`).
 *
 * Context·상태가 없어 `"use client"`가 불필요하다 → **서버 컴포넌트로도 렌더 가능(RSC-safe)**.
 * (닷 노테이션(`Card.Header`)은 클라이언트 참조 프로퍼티 접근 문제로 서버에서 깨지므로 named export.)
 * 파트별 스타일은 `card.styles.ts`의 tv slots에서 온다.
 */
type DivProps = HTMLAttributes<HTMLDivElement>;

export interface CardProps extends DivProps, VariantProps<typeof cardStyles> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { elevated, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cardStyles({ elevated }).root({ className })}
      {...props}
    />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, DivProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cardStyles().header({ className })}
        {...props}
      />
    );
  },
);

export const CardBody = forwardRef<HTMLDivElement, DivProps>(function CardBody(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cardStyles().body({ className })} {...props} />
  );
});

export const CardFooter = forwardRef<HTMLDivElement, DivProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cardStyles().footer({ className })}
        {...props}
      />
    );
  },
);
