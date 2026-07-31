import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui";
import { ROUTES } from "@/shared/config";
import logoMark from "@/shared/ui/logo/Logo.svg";

export default function NotFound() {
  return (
    <main className="bg-canvas text-ink grid min-h-screen place-items-center px-6">
      <div className="flex flex-col items-center text-center">
        <Image
          src={logoMark}
          alt="폼봐 로고 이미지"
          width={72}
          height={72}
          priority
          className="opacity-90"
        />
        <p className="text-brand-500 mt-7 text-7xl font-extrabold tracking-tight">
          404
        </p>
        <h1 className="mt-3 text-2xl font-bold">페이지를 찾을 수 없어요</h1>
        <p className="text-ink-soft mt-2 leading-relaxed">
          주소가 바뀌었거나 사라진 페이지예요.
          <br />
          홈으로 돌아가 다시 시작해볼까요?
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href={ROUTES.HOME}>홈으로 가기</Link>
        </Button>
      </div>
    </main>
  );
}
