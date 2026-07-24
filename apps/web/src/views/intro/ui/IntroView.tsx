import Link from "next/link";
import { buttonClass } from "@/shared/ui/button";
import { AppShell } from "@/shared/ui/app-shell";
import { PosePreload } from "./PosePreload";

const FEATURES = [
  {
    icon: "👁",
    title: "되받아 봐주는 눈",
    body: "시범만 보는 게 아니라, 웹캠이 내 자세를 실시간으로 읽고 그 순간 교정해줘요.",
  },
  {
    icon: "🗣",
    title: "캐릭터 코치의 음성",
    body: "이름을 불러가며 짧게 교정하고 칭찬해요. 정말 옆에 코치가 있는 것처럼.",
  },
  {
    icon: "🔒",
    title: "카메라는 기기 안에서만",
    body: "영상은 저장·전송하지 않아요. 방어이자 안심 포인트.",
  },
];

export function IntroView() {
  return (
    <AppShell>
      <PosePreload />
      {/* 히어로 */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-gutter py-17.5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="bg-brand-100 text-brand-700 mb-5.5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.75 text-sm font-semibold">
            <span className="bg-brand-500 size-1.75 rounded-full" />
            AI 맨몸운동 코치
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] leading-[1.12] font-extrabold tracking-tight">
            옆에서 누가
            <br />
            진짜 봐주는 느낌.
          </h1>
          <p className="text-ink-soft mt-5 max-w-md text-lg leading-relaxed text-pretty">
            캐릭터 코치의 시범을 따라 하면, 웹캠이 내 자세를 실시간으로 읽고 그
            순간 바로 교정해줘요. 유튜브 홈트처럼 보되, 그 영상이 나를 마주
            봐줍니다.
          </p>
          <div className="mt-8 flex items-center gap-3.5">
            <Link
              href="/exercises"
              className={buttonClass("primary", "px-7.5 py-3.75 text-lg")}
            >
              시작하기
            </Link>
          </div>
          <div className="text-ink-soft mt-10 flex items-center gap-2.5 text-base">
            <span className="bg-brand-50 grid size-7.5 place-items-center rounded-lg">
              🔒
            </span>
            영상은 <b className="text-ink font-bold">기기 안에서만</b> 처리돼요.
            저장·전송하지 않습니다.
          </div>
        </div>

        {/* 시범 영상 플레이스홀더 (실제 영상은 M4) */}
        <div className="border-line relative flex h-95 items-end justify-center overflow-hidden rounded-2xl border bg-[repeating-linear-gradient(135deg,var(--color-brand-50)_0_14px,var(--color-canvas)_14px_28px)]">
          <span className="text-ink-muted bg-surface/80 absolute top-4 left-4 rounded-md px-2 py-1 font-mono text-xs">
            코치 시범 영상 · 히어로 루프
          </span>
          <span className="bg-brand-200 -mb-px h-80 w-32.5 rounded-t-[60px]" />
          <div className="bg-surface text-ink absolute right-5.5 bottom-5.5 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold shadow-[0_8px_20px_-10px] shadow-brand-900/40">
            <span className="bg-brand-500 grid size-7.5 place-items-center rounded-full text-sm text-white">
              ✓
            </span>
            방금 자세 좋았어요!
          </div>
        </div>
      </section>

      {/* 피처 */}
      <section className="mx-auto grid max-w-6xl gap-5 px-gutter pb-16 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="border-line bg-surface rounded-2xl border p-6"
          >
            <div className="bg-brand-100 text-brand-700 mb-4 grid size-10 place-items-center rounded-xl text-xl">
              {f.icon}
            </div>
            <div className="mb-1.5 text-lg font-bold">{f.title}</div>
            <div className="text-ink-soft text-base leading-relaxed">
              {f.body}
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
