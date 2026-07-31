import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/shared/config";

/**
 * /robots.txt 자동 생성. 공개 콘텐츠는 크롤 허용, 운동 진행 플로우는 제외
 * (상태가 있어야 의미 있고 검색 결과로 들어오면 안 되는 화면).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ROUTES.HOME,
      disallow: [ROUTES.PREPARE, ROUTES.WORKOUT, ROUTES.SUMMARY],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
