import MarkdownList from "@/components/MarkdownList";
import type { Case } from "@/lib/portfolio";
import { loadCaseBody } from "@/lib/mdx";

// Case 본문 하나: 제목 위에 어느 Project의 Case인지, 기간, 내 역할. 제목 아래에 핵심 성과와 태그, 그 아래 본문.
// Case 상세 페이지와 인쇄 전용 페이지(/portfolio/print/)가 같은 모양을 쓴다. id(slug)는 인쇄 페이지 목차에서 이 위치로 오는 데 쓴다.
export default async function CaseArticle({ item, className }: { item: Case; className?: string }) {
  const Body = await loadCaseBody(item.slug);
  const { project } = item;

  return (
    <article id={item.slug} className={className}>
      <header className="pd-header">
        <p className="pd-kicker">
          <span className="pd-kicker-project">{project.title}</span> {project.subtitle} ·{" "}
          <span className="period">{project.period}</span>
          {item.role && <> · {item.role}</>}
        </p>
        <h1>{item.title}</h1>
        <MarkdownList items={item.highlights} className="pd-highlights" />
        {item.tags.length > 0 && <p className="pd-tags">{item.tags.join(" · ")}</p>}
      </header>

      <div className="prose">
        <Body />
      </div>
    </article>
  );
}
