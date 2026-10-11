import type { Metadata } from "next";
import Link from "next/link";
import { companies } from "@/data/companies";
import { getAllPortfolio } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  const items = getAllPortfolio();
  const groups = companies
    .map((company) => ({
      ...company,
      projects: items.filter((i) => i.company === company.key && i.type === "project"),
      troubles: items.filter((i) => i.company === company.key && i.type === "troubleshooting"),
    }))
    .filter((g) => g.projects.length + g.troubles.length > 0);

  return (
    <>
      <h1 className="page-title">Portfolio</h1>

      {groups.map((group) => (
        <section key={group.key} className="group" aria-labelledby={`group-${group.key}`}>
          <div className="group-head">
            <h2 id={`group-${group.key}`}>{group.name}</h2>
            <span className="period">{group.period}</span>
          </div>

          {group.projects.map((p) => (
            <Link key={p.slug} href={`/portfolio/${p.slug}/`} className="project">
              <div className="project-top">
                <h3>{p.title}</h3>
                <span aria-hidden="true" className="arrow">
                  →
                </span>
              </div>
              {p.tech.length > 0 && <span className="tech">{p.tech.join(" · ")}</span>}
              {p.highlights.length > 0 && (
                <ul>
                  {p.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </Link>
          ))}

          {group.troubles.length > 0 && (
            <div className="troubles">
              <h3>Troubleshooting</h3>
              {group.troubles.map((t) => (
                <Link key={t.slug} href={`/portfolio/${t.slug}/`}>
                  <span className="trouble-title">{t.title} →</span>
                  {t.summary && <span className="trouble-summary">{t.summary}</span>}
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}
