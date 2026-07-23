import Image from "next/image";
import Link from "next/link";
import logoMark from "./Logo.svg";

/**
 * 폼봐 로고 — 인트로·운동목록·설정 헤더에서 공용 (2+ 사용처라 shared).
 * 브랜드 마크(슬라이스에 코로케이션) + "폼봐" 워드마크.
 */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="text-ink flex items-center gap-2 text-xl font-extrabold tracking-tight"
    >
      <Image src={logoMark} alt="폼봐 로고" width={28} height={28} priority />
      폼봐
    </Link>
  );
}
