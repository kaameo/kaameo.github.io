import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
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

// Case 상세. 제목 위에 어느 Project의 Case인지 글자로 적는다. 다른 Case로는 Portfolio 사이드바(layout.tsx)에서 바로 간다.
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
          <span className="pd-kicker-project">{project.title}</span> {project.subtitle}
        </p>
        <div className="pd-title-row">
          <h1>{item.title}</h1>
          <PrintButton />
        </div>
      </header>

      <div className="prose">
        <Body />
      </div>
    </article>
  );
}
