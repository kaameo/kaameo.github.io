import type { ReactNode } from "react";
import PortfolioNav from "@/components/PortfolioNav";
import { getPortfolio } from "@/lib/portfolio";

// Portfolio 요약(/portfolio/)과 Case 상세(/portfolio/<slug>/)에 같은 사이드바를 붙인다. 위치는 globals.css의 .pf-sidebar.
// 인쇄 전용 페이지(/portfolio/print/)는 이 (browse) 묶음 밖에 있어 사이드바가 붙지 않는다.
// 사이드바는 클라이언트 컴포넌트라 slug와 제목만 넘긴다.
export default function PortfolioLayout({ children }: { children: ReactNode }) {
  const projects = getPortfolio().map(({ project, groups }) => ({
    slug: project.slug,
    title: project.title,
    groups: groups.map((group) => ({
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
