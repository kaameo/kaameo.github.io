import type { NextConfig } from "next";

// GitHub Pages는 정적 파일만 서빙하므로 out/ 폴더로 내보낸다.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
