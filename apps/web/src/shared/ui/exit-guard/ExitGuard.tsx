"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Dialog } from "@repo/ui";
import { ROUTES } from "@/shared/config";
import { track } from "@/shared/lib/analytics";

/**
 * 운동 이탈 가드 (TRD-FE §4) — 다크 화면(/prepare·/workout)에서 실수 이탈을 막는다.
 * - `beforeunload`: 새로고침·탭 닫기 시 브라우저 기본 확인
 * - 뒤로가기 가로채기: 더미 히스토리 엔트리 + popstate → 화면 내 확인 모달
 * - [✕ 그만두기] 버튼: 같은 확인 모달 → 확인 시 `exitHref`로 이동
 *
 */
export function ExitGuard({
  exitHref = ROUTES.ROUTINE,
}: {
  exitHref?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // 새로고침·탭 닫기 방어
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // 뒤로가기 가로채기 — 더미 엔트리를 쌓아 첫 뒤로가기는 모달만 띄운다
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPopState = () => {
      setOpen(true);
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const confirmExit = useCallback(() => {
    setOpen(false);
    track("workout_exited");
    router.push(exitHref);
  }, [router, exitHref]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="bg-dark-surface/70 text-dark-ink-soft hover:text-dark-ink rounded-full px-4 py-2 text-base transition-colors">
        ✕ 그만두기
      </Dialog.Trigger>

      <Dialog.Content className="bg-dark-surface border-dark-line text-center">
        <Dialog.Title className="text-dark-ink">
          운동을 그만둘까요?
        </Dialog.Title>
        <Dialog.Description className="text-dark-ink-soft">
          지금 나가면 이번 세트 기록이 사라져요.
        </Dialog.Description>
        <Dialog.Footer>
          <Dialog.Close className="border-dark-line text-dark-ink flex-1 rounded-xl border py-3 font-bold">
            계속하기
          </Dialog.Close>
          <button
            type="button"
            onClick={confirmExit}
            className="bg-brand-500 hover:bg-brand-600 flex-1 rounded-xl py-3 font-bold text-white transition-colors"
          >
            그만두기
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
