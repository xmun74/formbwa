import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/shared/config";

/**
 * /sitemap.xml 자동 생성 — 색인 대상 공개 페이지만.
 * (운동 진행 플로우는 robots에서 제외했으므로 여기에도 넣지 않는다.)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}${ROUTES.HOME}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}${ROUTES.ROUTINE}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}${ROUTES.START}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
