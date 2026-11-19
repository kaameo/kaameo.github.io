import type { MDXContent } from "mdx/types";

// content/ 아래 .mdx 본문을 불러온다. @next/mdx가 빌드 때 컴포넌트로 컴파일해 둔다(next.config.ts).
// Turbopack은 import 경로를 변수로 만들 수 없어서, 콘텐츠 종류와 형태마다 경로를 글자 그대로 적는다.
// 이 import들이 목록·RSS 같은 다른 페이지 번들에 끼지 않도록, 목록을 읽는 posts.ts 등과 나눠 상세 페이지에서만 쓴다.

type Module = { default: MDXContent };

export async function loadPostBody(slug: string, folder: boolean): Promise<MDXContent> {
  const mod: Module = folder
    ? await import(`../../content/posts/${slug}/index.mdx`)
    : await import(`../../content/posts/${slug}.mdx`);
  return mod.default;
}

export async function loadBookBody(slug: string): Promise<MDXContent> {
  const mod: Module = await import(`../../content/books/${slug}.mdx`);
  return mod.default;
}

export async function loadCaseBody(slug: string): Promise<MDXContent> {
  const mod: Module = await import(`../../content/portfolio/${slug}.mdx`);
  return mod.default;
}
