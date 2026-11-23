import type { MDXComponents } from "mdx/types";
import CodeBlock from "@/components/CodeBlock";
import HeadingAnchor from "@/components/HeadingAnchor";

/**
 * `@next/mdx`가 찾는 파일(App Router에서 필수). 모든 `.mdx` 본문에서 마크다운 문법이 만든 태그를 아래 컴포넌트로 그린다.
 *
 * - `pre`(코드 블록): 언어 이름과 복사 버튼
 * - `h2`: 링크 복사 아이콘
 */
const components: MDXComponents = { pre: CodeBlock, h2: HeadingAnchor };

export function useMDXComponents(): MDXComponents {
  return components;
}
