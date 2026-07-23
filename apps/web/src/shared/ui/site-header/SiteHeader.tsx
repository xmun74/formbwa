import { Logo } from "@/shared/ui/logo";

/**
 * 사이트 상단 헤더 (로고 + 로그인) — 라이트 화면 공용.
 * AppShell 안에서 상단에 고정되고, 스크롤은 그 아래 영역에서 일어난다.
 * (그래서 세로 스크롤바가 헤더 위에 안 그려진다.) 다크 화면(/prepare·/workout)엔 넣지 않는다.
 */
export function SiteHeader() {
  return (
    <header className="border-line-soft bg-canvas flex h-[66px] shrink-0 items-center justify-between border-b px-11">
      <Logo />
      <span className="border-line text-ink rounded-lg border px-4 py-2 text-base">
        로그인
      </span>
    </header>
  );
}
