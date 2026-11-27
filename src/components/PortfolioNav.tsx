"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import type { CaseGroup } from "@/lib/portfolio";

type NavCase = { slug: string; title: string };
type NavProject = { slug: string; title: string; groups: CaseGroup<NavCase>[] };

// Portfolio 사이드바: 요약 → Project → Case. 다른 Case로 가려고 요약으로 돌아가지 않도록 모든 Case를 펼쳐 두고,
// 보고 있는 페이지(요약이나 Case)를 강조한다. 1440px 이상 화면에서만 보이고 인쇄에는 빠진다.
export default function PortfolioNav({ projects }: { projects: NavProject[] }) {
  const path = usePathname().replace(/\/+$/, "");
  const current = (slug?: string) => (path === `/portfolio${slug ? `/${slug}` : ""}` ? "page" : undefined);

  return (
    <aside className="pf-sidebar no-print" aria-label="포트폴리오 목차">
      <div className="pf-sidebar-inner">
        <ul className="pf-nav">
          <li>
            <Link href="/portfolio/" className="pf-nav-home" aria-current={current()}>
              Portfolio
            </Link>
          </li>
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/portfolio/#${project.slug}`} className="pf-nav-project">
                {project.title}
              </Link>
              <ul>
                {project.groups.map((group) => (
                  <Fragment key={group.label ?? ""}>
                    {group.label && <li className="pf-nav-group">{group.label}</li>}
                    {group.cases.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/portfolio/${c.slug}/`} className="pf-nav-case" aria-current={current(c.slug)}>
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </Fragment>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {/* 목록이 길어 스크롤돼도 같이 움직이지 않도록 스크롤되는 목록(.pf-nav) 밖에 둔다. */}
        <Link href="/portfolio/print/" className="pf-sidebar-print">
          PDF용 전체 페이지 →
        </Link>
      </div>
    </aside>
  );
}
