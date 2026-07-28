import { Logo } from "@/shared/ui/logo";

export function Header() {
  return (
    <header className="border-line-soft bg-canvas flex h-16.5 shrink-0 items-center justify-between border-b px-11">
      <Logo />

      <span className="border-line text-ink rounded-lg border px-4 py-2 text-base">
        로그인
      </span>
    </header>
  );
}
