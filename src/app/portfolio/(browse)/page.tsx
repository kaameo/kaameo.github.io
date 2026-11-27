import type { Metadata } from "next";
import PortfolioSummary from "@/components/PortfolioSummary";
import { portfolioTitle } from "@/lib/portfolio";

export const metadata: Metadata = { title: { absolute: portfolioTitle } };

// Portfolio 요약. Case 링크는 각 Case 상세 페이지로 간다. 사례 전문을 한 PDF로 받으려면 /portfolio/print/를 인쇄한다(사이드바 아래 링크).
export default function PortfolioPage() {
  return (
    <div className="print-doc">
      <PortfolioSummary caseHref={(slug) => `/portfolio/${slug}/`} />
    </div>
  );
}
