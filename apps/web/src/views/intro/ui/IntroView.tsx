import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Button, Card } from "@repo/ui";
import { ROUTES } from "@/shared/config";
import { AppShell } from "@/shared/ui/app-shell";
import { Footer } from "@/shared/ui/footer";
import LogoSvg from "@/shared/ui/logo/Logo.svg";
import posePrivacy from "../assets/pose-privacy.png";
import poseVoice from "../assets/pose-voice.png";
import poseWatch from "../assets/pose-watch.png";
import { HeroImage } from "./HeroImage";
import { PosePreload } from "./PosePreload";

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

      <section className="mx-auto grid max-w-6xl items-center gap-6 lg:gap-1 px-gutter pt-16 pb-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="bg-brand-100 text-brand-700 inline-flex items-center gap-2 rounded-full px-3.5 py-1.75 text-sm font-semibold">
            <Image
              src={LogoSvg}
              alt="폼봐 로고"
              width={12}
              height={12}
              priority
            />
            홈 트레이닝 자세 코칭 서비스
          </span>
          <h1 className="text-ink mt-6 text-[clamp(2.1rem,3.8vw,3rem)] leading-[1.2] font-extrabold tracking-tight">
            집에서 하는 운동,
            <br />
            자세까지 봐드릴게요
          </h1>
          <p className="text-ink-soft mt-6 max-w-md text-lg leading-relaxed text-pretty">
            캐릭터 코치의 시범을 따라 하면, <br />
            웹캠이 자세를 실시간으로 읽고 그 순간 바로 교정해줘요.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-end lg:justify-start gap-x-5 gap-y-3">
            <Button asChild size="lg">
              <Link href={ROUTES.ROUTINE}>시작하기</Link>
            </Button>
          </div>
        </div>

        {/* 히어로 일러스트 (시간대별: 낮 / 노을) */}
        <div className="w-ful h-[40svh] lg:h-[55svh] ring-line/60 relative overflow-hidden rounded-3xl shadow-[0_30px_70px_-35px] shadow-brand-900/50 ring-1">
          <HeroImage />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-gutter pb-16 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title} className="flex py-5 pr-6">
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
            <div className="relative z-10 -ml-4 pt-3">
              <div className="mb-2 text-xl font-extrabold text-ink/80">
                {f.title}
              </div>
              <div className="text-ink-soft/70 text-base leading-5">
                {f.body}
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Footer />
    </AppShell>
  );
}
