import Link from "next/link";

/**
 * 폼봐 로고 — 인트로·운동목록·설정 헤더에서 공용 (2+ 사용처라 shared).
 * "폼" 배지는 brand-500 + 흰 글씨 — Claude Design 원본 그대로.
 */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="text-ink flex items-center gap-2.5 text-xl font-extrabold tracking-tight"
    >
      <span className="bg-brand-500 grid size-[26px] place-items-center rounded-lg text-[15px] text-white">
        폼
      </span>
      폼봐
    </Link>
  );
}
