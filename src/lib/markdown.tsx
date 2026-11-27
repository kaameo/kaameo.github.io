import type { ReactElement } from "react";
import * as runtime from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import ArrowLink from "@/components/ArrowLink";
import { gfmOptions } from "./markdown-options";

// Resume 데이터(src/data/resume.ts)와 Case frontmatter(highlights)에 쓴 한 줄 마크다운 문자열을 React 요소로 바꾼다.
// 글·감상평·사례 본문은 .mdx 파일이라 여기를 거치지 않고 @next/mdx가 컴파일한다(next.config.ts).

type HastNode = { type: string; tagName?: string; children?: HastNode[] };

// 한 문단짜리 결과에서 <p>를 벗겨 <li>, <p> 안에 바로 넣을 수 있게 한다.
function rehypeUnwrapParagraph() {
  return (tree: HastNode) => {
    const only = tree.children?.length === 1 ? tree.children[0] : undefined;
    if (only?.type === "element" && only.tagName === "p") tree.children = only.children;
  };
}

// 링크 끝에는 resume.html처럼 작은 화살표를 붙인다.
const toReact = { Fragment: runtime.Fragment, jsx: runtime.jsx, jsxs: runtime.jsxs, components: { a: ArrowLink } };

// 처리기는 한 번만 만들어 문자열마다 다시 쓴다.
const inlineProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm, gfmOptions)
  .use(remarkRehype)
  .use(rehypeUnwrapParagraph)
  .use(rehypeReact, toReact)
  .freeze();

// 한 줄짜리 마크다운(**굵게**, [링크](url), `코드`)을 감싸는 태그 없이 React 요소로 바꾼다.
export async function renderInlineMarkdown(markdown: string): Promise<ReactElement> {
  const file = await inlineProcessor.process(markdown);
  return file.result as ReactElement;
}
