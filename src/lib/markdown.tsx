import type { ReactElement } from "react";
import * as runtime from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeReact from "rehype-react";
import CodeBlock from "@/components/CodeBlock";
import HeadingAnchor from "@/components/HeadingAnchor";

// 마크다운을 React 요소로 바꾼다. 코드 블록과 h2는 복사 기능이 있는 컴포넌트로 그린다.
export async function renderMarkdown(markdown: string): Promise<ReactElement> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark" },
      keepBackground: false,
      defaultLang: { block: "plaintext" },
    })
    .use(rehypeReact, {
      Fragment: runtime.Fragment,
      jsx: runtime.jsx,
      jsxs: runtime.jsxs,
      components: { pre: CodeBlock, h2: HeadingAnchor },
    })
    .process(markdown);
  return file.result as ReactElement;
}
