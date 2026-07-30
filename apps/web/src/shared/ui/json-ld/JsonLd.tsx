/**
 * JSON-LD 주입용 서버 컴포넌트 — `<script type="application/ld+json">`로 구조화 데이터를 심는다.
 * 서버에서 렌더돼 초기 HTML에 포함돼야 크롤러·AI 수집기가 확실히 읽는다("use client" 금지).
 * `<`를 유니코드(`<`)로 치환해 데이터에 `</script>`가 섞여도 스크립트가 조기 종료되지 않게(XSS 방어).
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
