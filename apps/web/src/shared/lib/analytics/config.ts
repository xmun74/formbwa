/** GA4 활성 조건 = 프로덕션 빌드 + 측정 ID 존재.
 * 개발에선 무동작: 로컬 트래픽이 데이터를 오염하는 것 방지
 * 프로덕션(`next build`/Vercel)에서 `NEXT_PUBLIC_GA_ID`가 있을 때만 활성화
 * (서버 레이아웃도 이 값을 쓰므로 여기엔 클라이언트 의존을 두지 않는다.)
 */
export const GA_ID =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_GA_ID
    : undefined;
