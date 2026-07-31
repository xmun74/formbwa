import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Providers } from "@/app";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  siteJsonLd,
} from "@/shared/config";
import { GA_ID } from "@/shared/lib/analytics";
import { JsonLd } from "@/shared/ui/json-ld";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

const TITLE = `${SITE_NAME} — 집에서 하는 운동, 자세까지 봐드릴게요`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    // 이미지는 app/opengraph-image 파일 컨벤션이 자동 주입
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  // 네이버는 HTML 태그 방식 → env로 주입, 있을 때만 출력. (구글은 DNS TXT라 태그 불필요)
  verification: {
    other: process.env.NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
      : {},
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* 순수 흑백을 쓰지 않는다 — 뉴트럴은 전부 민트 색상환으로 틴트 (globals.css @theme) */}
      <body className="bg-canvas text-ink font-sans">
        <JsonLd data={siteJsonLd} />
        <Providers>{children}</Providers>
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
