import { cloneElement, type ReactElement, type ReactNode, useId } from "react";
import { cn } from "../lib/cn";

/**
 * 폼 필드 몰큘 — Label + control + helper/error. **a11y 연결**을 담당한다:
 * `useId`로 만든 id를 label(htmlFor)·control(id)·설명(aria-describedby)에 엮고,
 * error 시 `aria-invalid`를 세운다. 자식 control(예: `<Input>`)에 `cloneElement`로 주입.
 * 상태·이벤트가 없어 `"use client"` 불필요 → **RSC-safe** (composition만).
 */
export interface FieldProps {
  label: ReactNode;
  /** 라벨 옆 보조 표기 (예: "(선택)") */
  hint?: ReactNode;
  /** 입력 아래 도움말 */
  helper?: ReactNode;
  /** 에러 메시지 — 있으면 aria-invalid + 에러 색 */
  error?: ReactNode;
  className?: string;
  /** 단일 control 요소 (Input 등) */
  children: ReactElement;
}

export function Field({
  label,
  hint,
  helper,
  error,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const desc = error ?? helper;
  const descId = desc ? `${id}-desc` : undefined;

  const control = cloneElement(children, {
    id,
    "aria-describedby": descId,
    "aria-invalid": error ? true : undefined,
  } as Record<string, unknown>);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-base font-bold">
        {label}
        {hint && <span className="text-ink-muted font-normal"> {hint}</span>}
      </label>
      <div className="mt-2.5">{control}</div>
      {desc && (
        <p
          id={descId}
          className={cn(
            "mt-1.5 text-sm",
            error ? "text-point-coral-ink" : "text-ink-muted",
          )}
        >
          {desc}
        </p>
      )}
    </div>
  );
}
