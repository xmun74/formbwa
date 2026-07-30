import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * 텍스트 입력 프리미티브. **변형이 없어 tv 대신 `cn`** 으로 className 병합(shadcn 관례).
 * 상태(focus/disabled)는 Tailwind pseudo로 처리. 값은 기존 닉네임 입력과 동일.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "border-line focus:border-brand-400 bg-surface placeholder:text-ink-muted w-full rounded-xl border px-4 py-3.5 text-base outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
