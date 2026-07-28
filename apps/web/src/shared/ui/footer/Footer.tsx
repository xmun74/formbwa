import { Logo } from "@/shared/ui/logo";

export function Footer() {
  return (
    <footer className="border-line-soft mt-4 border-t bg-gray-100 text-gray-400">
      <div className="mx-auto max-w-6xl px-gutter py-12">
        <div className="grid gap-10 sm:grid-cols-[1.6fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              코치의 시범을 따라 하면, 내 자세를 실시간으로 봐주는 홈 트레이닝
              코칭 서비스
            </p>

            <div className="text-sm leading-relaxed">
              폼봐는 <b className="font-semibold">의료, 재활 목적이 아닌</b>{" "}
              운동 보조 서비스입니다. 통증이나 무리가 느껴지면 즉시 멈추세요.
              카메라 영상은 기기 안에서만 처리되며 저장 및 전송하지 않습니다.
            </div>

            <div className="mt-4 shrink-0 text-xs">
              Copyright © 2026 폼봐 (formbwa)
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
