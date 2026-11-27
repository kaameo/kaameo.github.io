import type { ReactNode } from "react";
import PortfolioNav from "@/components/PortfolioNav";
import { getProjectsWithCases, groupCases } from "@/lib/portfolio";

// Portfolio 요약(/portfolio/)과 Case 상세(/portfolio/<slug>/)에 같은 사이드바를 붙인다. 위치는 globals.css의 .pf-sidebar.
// 인쇄 전용 페이지(/portfolio/print/)는 이 (browse) 묶음 밖에 있어 사이드바가 붙지 않는다.
export default function PortfolioLayout({ children }: { children: ReactNode }) {
  const projects = getProjectsWithCases().map(({ project, cases }) => ({
    slug: project.slug,
    title: project.title,
    groups: groupCases(cases).map((group) => ({
      label: group.label,
      cases: group.cases.map((c) => ({ slug: c.slug, title: c.title })),
    })),
  }));

  return (
    <>
      <PortfolioNav projects={projects} />
      {children}
    </>
  );
}
