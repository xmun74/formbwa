import { ExitGuard } from "@/shared/ui/exit-guard";

export function CalibrationStage({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-dark-canvas relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute top-6 right-8">
        <ExitGuard />
      </div>

      {/* 동심원 + 실루엣 */}
      <div className="relative grid size-52 place-items-center">
        <span className="border-dark-line absolute inset-0 rounded-full border" />
        <span className="border-brand-700/40 absolute inset-5 rounded-full border" />
        <span className="bg-brand-600/30 grid size-32 place-items-center rounded-full text-2xl">
          🧍
        </span>
      </div>

      <h2 className="text-dark-ink mt-8 text-2xl font-extrabold">
        가만히 서 계세요
      </h2>
      <p className="text-dark-ink-soft mt-3 text-base">
        기준 자세를 잡고 있어요... 약 3초
      </p>

      <div className="bg-dark-line mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full">
        <span className="bg-brand-500 block h-full w-full rounded-full" />
      </div>

      <button
        type="button"
        onClick={onNext}
        className="border-dark-line text-dark-ink-soft hover:text-dark-ink mt-8 rounded-full border px-5 py-2.5 text-base transition-colors"
      >
        건너뛰기 →
      </button>
    </div>
  );
}
