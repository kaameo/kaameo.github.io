import type { ReactNode } from "react";
import PortfolioNav from "@/components/PortfolioNav";
import { getProjectsWithCases } from "@/lib/portfolio";

// Portfolio 요약(/portfolio/)과 Case 상세(/portfolio/<slug>/)에 같은 사이드바를 붙인다. 위치는 globals.css의 .pf-sidebar.
export default function PortfolioLayout({ children }: { children: ReactNode }) {
  const projects = getProjectsWithCases().map(({ project, cases }) => ({
    slug: project.slug,
    title: project.title,
    cases: cases.map((c) => ({ slug: c.slug, title: c.title })),
  }));

  return (
    <>
      <PortfolioNav projects={projects} />
      {children}
    </>
  );
}
