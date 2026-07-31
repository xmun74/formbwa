"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@repo/ui";
import { ROUTES } from "@/shared/config";
import logoMark from "@/shared/ui/logo/Logo.svg";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
        <h1 className="mt-7 text-3xl font-extrabold tracking-tight">
          문제가 생겼어요
        </h1>
        <p className="text-ink-soft mt-3 leading-relaxed">
          잠깐 문제가 생겼어요. 다시 시도하거나 홈으로 돌아가 주세요.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => unstable_retry()}>
            다시 시도
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={ROUTES.HOME}>홈으로 가기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
