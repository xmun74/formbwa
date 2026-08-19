"use client";

import { useEffect, useState, type ReactNode } from "react";
import { loadDemoManifest, resolveDemoVideo } from "./manifest";

/**
 * 코치 시범 루프. characterId×exerciseId로 매니페스트에서 mp4를 골라 <video> 재생한다.
 * mp4/매니페스트가 없으면 children(플레이스홀더)을 유지한다 — 선구축, audio 폴백과 동형.
 * 판정과 동기화하지 않는 독립 루프다 (TRD-FE §6.2).
 */
export function CoachDemo({
  characterId,
  exerciseId,
  className,
  children,
}: {
  characterId: string;
  exerciseId: string;
  className?: string;
  children?: ReactNode; // 폴백 플레이스홀더
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void loadDemoManifest().then((m) => {
      if (alive)
        setSrc(m ? resolveDemoVideo(m, characterId, exerciseId) : null);
    });
    return () => {
      alive = false;
    };
  }, [characterId, exerciseId]);

  if (!src) return <>{children}</>;
  return (
    <video
      className={className}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  );
}
