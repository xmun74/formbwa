import { ExitButton } from "@/shared/ui/exit-button";

/**
 * 캘리브레이션 — 기준 자세를 잡는 동안 가만히 서 있게 안내.
 * TODO(M3): 3초 자동 완료 로직. 지금은 "건너뛰기"로 운동으로 넘어간다.
 */
export function CalibrationStage({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-dark-canvas relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute top-6 right-8">
        <ExitButton />
      </div>

      {/* 동심원 + 실루엣 */}
      <div className="relative grid size-52 place-items-center">
        <span className="border-dark-line absolute inset-0 rounded-full border" />
        <span className="border-brand-700/40 absolute inset-5 rounded-full border" />
        <span className="bg-brand-600/30 grid size-32 place-items-center rounded-full text-[26px]">
          🧍
        </span>
      </div>

      <h2 className="text-dark-ink mt-8 text-[27px] font-extrabold">
        가만히 서 계세요
      </h2>
      <p className="text-dark-ink-soft mt-3 text-[15px]">
        기준 자세를 잡고 있어요... 약 3초
      </p>

      <div className="bg-dark-line mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full">
        <span className="bg-brand-500 block h-full w-full rounded-full" />
      </div>

      <button
        type="button"
        onClick={onNext}
        className="border-dark-line text-dark-ink-soft hover:text-dark-ink mt-8 rounded-full border px-5 py-2.5 text-[14px] transition-colors"
      >
        건너뛰기 →
      </button>
    </div>
  );
}
