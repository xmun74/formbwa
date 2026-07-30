import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

/**
 * 구조화 데이터(JSON-LD) — 검색엔진·AI가 폼봐를 정확히 이해/인용하게 하는 기계용 사전.
 * 정직 원칙: 리뷰가 없으므로 aggregateRating(별점)은 넣지 않는다(조작 = 스팸 정책 위반). offers=무료.
 * 전부 정적 상수(사용자 입력 없음)라 XSS 위험은 사실상 없지만, 주입부(JsonLd)에서 `<`를 이스케이프한다.
 * 모든 URL은 정규 호스트(apex) SITE_URL 기준 — 리다이렉트·canonical과 일치.
 */

/** 사이트 전역 — 브랜드 개체(Organization) + 사이트(WebSite). layout에서 주입. */
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "ko",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

/** 랜딩(`/`) — 서비스 정체(SoftwareApplication) */
export const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  inLanguage: "ko",
  description: SITE_DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  publisher: { "@id": `${SITE_URL}/#organization` },
};
