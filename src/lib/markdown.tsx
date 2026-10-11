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

type HastNode = { type: string; tagName?: string; children?: HastNode[] };

// 한 문단짜리 결과에서 <p>를 벗겨 <li>, <p> 안에 바로 넣을 수 있게 한다.
function rehypeUnwrapParagraph() {
  return (tree: HastNode) => {
    const only = tree.children?.length === 1 ? tree.children[0] : undefined;
    if (only?.type === "element" && only.tagName === "p") tree.children = only.children;
  };
}

// 한 줄짜리 마크다운(**굵게**, [링크](url), `코드`)을 감싸는 태그 없이 React 요소로 바꾼다.
export async function renderInlineMarkdown(markdown: string): Promise<ReactElement> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeUnwrapParagraph)
    .use(rehypeReact, { Fragment: runtime.Fragment, jsx: runtime.jsx, jsxs: runtime.jsxs })
    .process(markdown);
  return file.result as ReactElement;
}
