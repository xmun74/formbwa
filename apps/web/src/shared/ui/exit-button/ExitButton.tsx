"use client";

import { useRouter } from "next/navigation";

/**
 * "그만두기" — 다크 운동 흐름(배치·캘리브레이션·운동) 공용.
 * TODO(M2): 운동 중 이탈 가드(확인) 추가. 지금은 바로 운동 목록으로.
 */
export function ExitButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/exercises")}
      className="bg-dark-surface/70 text-dark-ink-soft hover:text-dark-ink rounded-full px-4 py-2 text-[14px] transition-colors"
    >
      ✕ 그만두기
    </button>
  );
}
