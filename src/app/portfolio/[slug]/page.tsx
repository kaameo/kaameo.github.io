import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPortfolio, getCompanyName, getPortfolioItem } from "@/lib/portfolio";
import { renderMarkdown } from "@/lib/markdown";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllPortfolio().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const item = getPortfolioItem((await params).slug);
  if (!item) return {};
  return { title: item.title, description: item.highlights[0] ?? item.summary };
}

export default async function PortfolioDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = getPortfolioItem(slug);
  if (!item) notFound();

  const body = await renderMarkdown(item.content);
  const all = getAllPortfolio();
  const index = all.findIndex((i) => i.slug === slug);
  const prev = all[index - 1];
  const next = all[index + 1];
  const kicker = [getCompanyName(item.company), item.period].filter(Boolean).join(" · ");

  return (
    <article>
      <Link href="/portfolio/" className="back-link">
        ← Portfolio
      </Link>

      <header className="pd-header">
        {kicker && <span className="pd-kicker">{kicker}</span>}
        <h1>{item.title}</h1>
        {item.tech.length > 0 && <span className="pd-kicker">{item.tech.join(" · ")}</span>}
        {item.highlights.length > 0 && (
          <ul>
            {item.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
        {item.type === "troubleshooting" && item.summary && <p className="pd-summary">{item.summary}</p>}
        {(item.github || item.demo) && (
          <div className="pd-links">
            {item.github && <a href={item.github}>GitHub ↗</a>}
            {item.demo && <a href={item.demo}>Demo ↗</a>}
          </div>
        )}
      </header>

      <div className="prose">{body}</div>

      {(prev || next) && (
        <nav aria-label="다른 프로젝트" className="pager">
          {prev && (
            <Link href={`/portfolio/${prev.slug}/`}>
              <span className="pager-label">← 이전</span>
              <span className="pager-title">{prev.title}</span>
            </Link>
          )}
          {next && (
            <Link href={`/portfolio/${next.slug}/`} className="pager-next">
              <span className="pager-label">다음 →</span>
              <span className="pager-title">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
