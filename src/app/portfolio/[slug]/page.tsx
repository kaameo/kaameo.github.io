import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseHighlights from "@/components/CaseHighlights";
import { getAllCases, getCase } from "@/lib/portfolio";
import { loadCaseBody } from "@/lib/mdx";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllCases().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const item = getCase((await params).slug);
  if (!item) return {};
  return { title: item.title, description: item.summary };
}

// Case 상세. 제목 위에 어느 Project의 Case인지와 기간, 제목 아래에 핵심 성과 한두 줄을 둔다.
// 다른 Case로는 Portfolio 사이드바(layout.tsx)에서 바로 간다.
export default async function CasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) notFound();

  const Body = await loadCaseBody(item.slug);
  const { project } = item;

  return (
    <article>
      <header className="pd-header">
        <p className="pd-kicker">
          <span className="pd-kicker-project">{project.title}</span> {project.subtitle} · {project.period}
        </p>
        <h1>{item.title}</h1>
        <CaseHighlights items={item.highlights} className="pd-highlights" />
      </header>

      <div className="prose">
        <Body />
      </div>
    </article>
  );
}
