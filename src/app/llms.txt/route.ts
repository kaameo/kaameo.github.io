import { getAllBooks } from "@/lib/books";
import { getAllCases } from "@/lib/portfolio";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-static";

// llmstxt.org 형식: H1 사이트명, 인용구 요약, H2 섹션별 "- [제목](URL): 설명" 목록.
// "## Optional" 섹션은 컨텍스트가 모자랄 때 건너뛰어도 되는 자료다.
function link(title: string, path: string, description = "") {
  const desc = description.replace(/\s+/g, " ").trim();
  return `- [${title.replace(/[[\]]/g, "")}](${site.url}${path})${desc ? `: ${desc}` : ""}`;
}

export function GET() {
  const posts = getAllPosts().map((p) => link(p.title, `/posts/${p.slug}/`, p.summary));
  // Case는 summary가 없어 상세 페이지 메타데이터처럼 첫 문단(문제 상황)을 쓰고, 어느 Project인지 앞에 붙인다.
  const portfolio = getAllCases().map((c) => link(c.title, `/portfolio/${c.slug}/`, `${c.project.title}: ${c.summary}`));
  const books = getAllBooks().map((b) => link(b.title, `/books/${b.slug}/`, `${b.author} 지음, 감상평`));

  const text = [
    `# ${site.title}`,
    `> ${site.description}`,
    `${site.author}의 기술 블로그입니다. ${site.hero.intro}`,
    ["## About", link("Resume", "/resume/", "경력, 프로젝트, 기술 스택을 정리한 이력서"), `- [GitHub](${site.github})`].join("\n"),
    ["## Posts", ...posts].join("\n"),
    ["## Portfolio", ...portfolio].join("\n"),
    ["## Optional", ...books].join("\n"),
  ].join("\n\n");

  return new Response(`${text}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
