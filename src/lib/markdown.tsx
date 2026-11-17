import type { ComponentProps, ReactElement } from "react";
import * as runtime from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeReact from "rehype-react";
import Chart from "@/components/Chart";
import Cluster from "@/components/Cluster";
import CodeBlock from "@/components/CodeBlock";
import HeadingAnchor from "@/components/HeadingAnchor";

// 취소선은 ~~두 개~~만 인정한다. "23~28초 → 1.10~1.16초"처럼 범위를 나타내는 ~ 두 개가 한 줄에 있으면 취소선으로 바뀌기 때문이다.
const gfm = { singleTilde: false };

// 언어 이름이 이것인 코드 블록은 코드가 아니라 그림으로 그린다. 블록 안의 JSON을 각 컴포넌트에 넘긴다.
const FIGURES = {
  chart: Chart, // 가로 누적 막대 그래프
  cluster: Cluster, // 노드별 배치도
} as const;

type FigureKind = keyof typeof FIGURES;
const isFigureKind = (lang: string | null | undefined): lang is FigureKind => !!lang && Object.hasOwn(FIGURES, lang);

type MdastNode = { type: string; lang?: string | null; value?: string; children?: MdastNode[]; data?: object };

// ```chart 같은 코드 블록을 <figure data-figure="chart" data-source="JSON">으로 바꾼다. 코드 블록이 아니게 되므로
// rehype-pretty-code가 건드리지 않고, 아래 figure 컴포넌트가 그림으로 그린다. Obsidian이나 GitHub에서는 그냥 코드 블록으로 보인다.
function remarkFigures() {
  return (tree: MdastNode) => {
    const walk = (node: MdastNode) => {
      if (node.type === "code" && isFigureKind(node.lang)) {
        node.data = { hName: "figure", hProperties: { dataFigure: node.lang, dataSource: node.value ?? "" }, hChildren: [] };
        node.type = "figureBlock";
        return;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

type FigureProps = ComponentProps<"figure"> & { "data-figure"?: string; "data-source"?: string };

// data-figure가 있는 figure만 그림으로 그리고, 나머지(rehype-pretty-code가 만든 코드 블록 figure 등)는 그대로 둔다.
function Figure({ "data-figure": kind, "data-source": source, ...rest }: FigureProps) {
  if (!isFigureKind(kind)) return <figure {...rest} />;
  const Component = FIGURES[kind];
  return <Component source={source ?? ""} />;
}

// 마크다운을 React 요소로 바꾼다. 코드 블록과 h2는 복사 기능이 있는 컴포넌트로, ```chart·```cluster 블록은 그림으로 그린다.
export async function renderMarkdown(markdown: string): Promise<ReactElement> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm, gfm)
    .use(remarkFigures)
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
      components: { pre: CodeBlock, h2: HeadingAnchor, figure: Figure },
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
    .use(remarkGfm, gfm)
    .use(remarkRehype)
    .use(rehypeUnwrapParagraph)
    .use(rehypeReact, { Fragment: runtime.Fragment, jsx: runtime.jsx, jsxs: runtime.jsxs })
    .process(markdown);
  return file.result as ReactElement;
}
