"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import heroDay from "../assets/hero-day.png";
import heroSunset from "../assets/hero-sunset.png";

/**
 * 시간대별 히어로 — 방문자 로컬 18:00~20:00엔 노을 버전으로 교체.
 * 서버/클라이언트 타임존 불일치를 피하려 마운트 후 로컬 시각으로 판정(SSR 기본=낮).
 * 두 이미지 모두 1200×624 (OG 이미지와 같은 비율·에셋 계열).
 */
function isSunsetHour(hour: number): boolean {
  return hour >= 18 && hour < 20;
}

export function HeroImage() {
  const [sunset, setSunset] = useState(false);

  useEffect(() => {
    setSunset(isSunsetHour(new Date().getHours()));
  }, []);

  return (
    <Image
      src={sunset ? heroSunset : heroDay}
      alt="공원에서 스트레칭하는 캐릭터 코치"
      priority
      placeholder="blur"
      className="h-full w-full object-cover"
    />
  );
}
