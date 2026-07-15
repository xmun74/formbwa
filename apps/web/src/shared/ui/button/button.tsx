import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-700",
  ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
