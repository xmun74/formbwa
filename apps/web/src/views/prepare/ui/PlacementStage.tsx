import { buttonClass } from "@/shared/ui/button";
import { ExitButton } from "@/shared/ui/exit-button";

import { DARK_STRIPE } from "../model/prepare";

/** 배치 — 웹캠 프레임에 몸 전체가 들어오도록 안내. "자세 잡았어요" → 캘리브레이션. */
export function PlacementStage({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-dark-canvas relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute top-6 right-8">
        <ExitButton />
      </div>

      <div
        className={`border-dark-line relative flex h-[420px] w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border border-dashed ${DARK_STRIPE}`}
      >
        <span className="text-dark-ink-muted absolute bottom-4 left-5 text-sm">
          내 웹캠 · 실시간
        </span>
        <span className="bg-dark-surface-2/80 h-64 w-[110px] rounded-t-[55px]" />
      </div>

      <h2 className="text-dark-ink mt-9 text-2xl font-extrabold">
        몸 전체가 보이게 서주세요
      </h2>
      <p className="text-dark-ink-soft mt-3 text-center text-base leading-relaxed">
        화면에서 <b className="text-brand-300 font-bold">약 2m</b> 떨어져,
        옆으로 <b className="text-brand-300 font-bold">45°</b> 돌아 서주세요.
        <br />
        머리부터 발끝까지 화면에 들어와야 정확히 봐줄 수 있어요.
      </p>

      <button
        type="button"
        onClick={onNext}
        className={buttonClass("primary", "mt-8 px-8 py-3.5")}
      >
        자세 잡았어요
      </button>
    </div>
  );
}
