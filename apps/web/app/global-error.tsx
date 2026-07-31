"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#f7f8f7",
          color: "#1a1c1b",
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <title>문제가 생겼어요 - 폼봐</title>
        <div>
          <p style={{ marginTop: "12px", color: "#5b615e", lineHeight: 1.6 }}>
            잠깐 문제가 생겼어요. 다시 시도하거나 잠시 후 다시 방문해 주세요.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: "28px",
              padding: "12px 28px",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#ffffff",
              background: "#10b394",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
