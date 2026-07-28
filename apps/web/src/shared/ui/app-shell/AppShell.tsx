import type { ReactNode } from "react";

import { Header } from "@/shared/ui/header";

/**
 * 라이트 화면 공용 레이아웃 — 상단 고정 헤더 + 그 아래 스크롤 영역.
 *
 * 스크롤을 콘텐츠 영역(헤더 아래)에서만 일으킨다. 페이지(html) 스크롤바는
 * 뷰포트 전체 높이라 헤더 오른쪽 위에 겹쳐 그려지는데, 이 구조는 스크롤바가
 * 헤더 아래에만 생기게 한다. 몰입형 다크 화면(/prepare·/workout)엔 쓰지 않는다.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex-1 overflow-y-scroll">{children}</div>
    </div>
  );
}
