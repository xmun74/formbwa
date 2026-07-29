/** @type {import('next').NextConfig} */
const nextConfig = {
  // @repo/core·@repo/ui는 빌드 스텝 없이 소스를 직접 export하므로 Next가 트랜스파일 (TRD-FE §5)
  transpilePackages: ["@repo/core", "@repo/ui"],
};

export default nextConfig;
