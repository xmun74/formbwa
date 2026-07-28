import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { buttonClass } from "@/shared/ui/button";
import { AppShell } from "@/shared/ui/app-shell";
import { Footer } from "@/shared/ui/footer";
import { PosePreload } from "./PosePreload";
import heroImg from "../assets/hero.png";
import poseWatch from "../assets/pose-watch.png";
import poseVoice from "../assets/pose-voice.png";
import posePrivacy from "../assets/pose-privacy.png";
import LogoSvg from "@/shared/ui/logo/Logo.svg";

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
            <Image
              src={LogoSvg}
              alt="폼봐 로고"
              width={12}
              height={12}
              priority
            />
            홈 트레이닝 자세 코칭 서비스
          </span>
          <h1 className="text-ink text-2xl font-extrabold tracking-tight">
            집에서 하는 운동,
            <br />
            자세까지 봐드릴게요
          </h1>
          <p className="text-ink-soft mt-5 text-md leading-relaxed text-pretty">
            캐릭터 코치의 시범을 따라 하면, 웹캠이 자세를 실시간으로 읽고 그
            순간 바로 교정해줘요. 집에서도 자세를 코칭 받아보세요.
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

        {/* 히어로 일러스트 */}
        <div className="border-line relative overflow-hidden rounded-2xl border">
          <Image
            src={heroImg}
            alt="공원에서 스트레칭하는 캐릭터 코치"
            priority
            placeholder="blur"
            className="h-auto w-fit"
          />
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
