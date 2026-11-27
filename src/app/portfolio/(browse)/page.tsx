import type { Metadata } from "next";
import PortfolioSummary from "@/components/PortfolioSummary";
import { site } from "@/lib/site";

// 인쇄 창에서 "PDF로 저장"하면 페이지 제목이 파일 이름이 되므로 사이트 이름을 붙이지 않는다.
export const metadata: Metadata = { title: { absolute: `${site.author} 포트폴리오` } };

// Portfolio 요약. Case 링크는 각 Case 상세 페이지로 간다. 사례 전문을 한 PDF로 받으려면 /portfolio/print/를 인쇄한다(사이드바 아래 링크).
export default function PortfolioPage() {
  return (
    <div className="pf-summary">
      <PortfolioSummary caseHref={(slug) => `/portfolio/${slug}/`} />
    </div>
  );
}
