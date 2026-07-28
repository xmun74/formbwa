import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { buttonClass } from "@/shared/ui/button";
import { AppShell } from "@/shared/ui/app-shell";
import { Footer } from "@/shared/ui/footer";
import { PosePreload } from "./PosePreload";
import poseWatch from "../assets/pose-watch.png";
import poseVoice from "../assets/pose-voice.png";
import posePrivacy from "../assets/pose-privacy.png";

const FEATURES: { img: StaticImageData; title: string; body: string }[] = [
  {
    img: poseWatch,
    title: "따라 하는 동안, 봐줍니다",
    body: "시범을 따라 하는 동안 무릎, 허리 등의 각도를 읽습니다. 자세가 흐트러지는 순간 바로 짚어줍니다.",
  },
  {
    img: poseVoice,
    title: "말로 짚어주는 코치",
    body: "정말 옆에 코치가 있는 것처럼 운동 중에도 코치의 음성으로 자세를 교정해줍니다.",
  },
  {
    img: posePrivacy,
    title: "카메라는 기기 안에서만",
    body: "영상은 브라우저 밖으로 나가지 않습니다. 저장되는 건 횟수와 자세 기록뿐입니다.",
  },
];

export function IntroView() {
  return (
    <AppShell>
      <PosePreload />

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-gutter py-17.5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="bg-brand-100 text-brand-700 mb-5.5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.75 text-sm font-semibold">
            <span className="bg-brand-500 size-1.75 rounded-full" />홈 트레이닝
            자세 코칭 서비스
          </span>
          <h1 className="text-ink text-2xl font-extrabold tracking-tight">
            집에서 하는 운동에
            <br />
            자세를 봐주는 눈
          </h1>
          <p className="text-ink-soft mt-5 text-md leading-relaxed text-pretty">
            캐릭터 코치의 시범을 따라 하면, 웹캠이 내 자세를 실시간으로 읽고 그
            순간 바로 교정해줘요. 유튜브 홈트처럼 보되, 코치가 나를 마주
            봐줍니다.
          </p>
          <div className="mt-8 flex justify-end gap-3.5">
            <Link
              href="/exercises"
              className={buttonClass("primary", "px-8 py-4 text-lg")}
            >
              시작하기
            </Link>
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

      <section className="mx-auto grid max-w-6xl gap-5 px-gutter pb-16 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="border-line bg-surface flex rounded-2xl border py-5 pr-6"
          >
            <div className="relative size-32 shrink-0">
              <Image
                src={f.img}
                alt=""
                fill
                placeholder="blur"
                sizes="8rem"
                className="object-contain"
              />
            </div>
            {/* 투명 여백 안쪽으로 글자를 겹쳐 넣음 */}
            <div className="relative z-10 -ml-4 pt-3">
              <div className="mb-2 text-xl font-extrabold text-ink/80">
                {f.title}
              </div>
              <div className="text-ink-soft/70 text-base leading-5">
                {f.body}
              </div>
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </AppShell>
  );
}
