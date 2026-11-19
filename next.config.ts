import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import { gfmOptions } from "./src/lib/markdown-options";

// GitHub Pages는 정적 파일만 서빙하므로 out/ 폴더로 내보낸다.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

const prettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  defaultLang: { block: "plaintext" },
} satisfies PrettyCodeOptions;

// content/ 아래 .mdx 본문(글·감상평·사례)을 빌드 때 React 컴포넌트로 컴파일한다. 불러오는 곳은 src/lib/mdx.ts.
// Turbopack에는 함수를 넘길 수 없어서 플러그인을 패키지 이름(문자열)으로 적는다.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", ["remark-gfm", gfmOptions]],
    rehypePlugins: ["rehype-slug", ["rehype-pretty-code", prettyCodeOptions]],
  },
});

export default withMDX(nextConfig);
