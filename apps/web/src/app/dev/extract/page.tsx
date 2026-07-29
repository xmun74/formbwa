import { notFound } from "next/navigation";

import { FixtureExtractView } from "@/views/fixture-extract";

// dev 전용 도구 — 프로덕션 빌드에선 존재하지 않는다.
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <FixtureExtractView />;
}
