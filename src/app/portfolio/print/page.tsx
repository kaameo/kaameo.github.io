import type { Metadata } from "next";
import CaseArticle from "@/components/CaseArticle";
import PortfolioSummary from "@/components/PortfolioSummary";
import { getCasesInReadingOrder, portfolioTitle } from "@/lib/portfolio";

// 요약 페이지와 내용이 겹치므로 검색에는 싣지 않는다.
export const metadata: Metadata = {
  title: { absolute: portfolioTitle },
  robots: { index: false },
};

// 인쇄 전용 Portfolio: 첫 장은 요약(머리 + 목차), 그 뒤로 모든 Case 전문을 요약과 같은 순서로 한 장씩 이어 붙인다.
// 이 페이지를 인쇄하면 PDF 한 벌이 된다. 목차의 Case 링크는 같은 문서 안의 Case 위치(article id)로 간다.
// 사이드바가 붙는 (browse) 묶음 밖에 두어 사이드바 없이 그린다.
export default function PortfolioPrintPage() {
  return (
    <div className="print-doc">
      <p className="pf-print-note no-print">
        인쇄용 페이지입니다. 오른쪽 아래 인쇄 버튼으로 PDF로 저장하면 요약과 모든 사례가 한 파일로 저장됩니다.
      </p>

      <PortfolioSummary caseHref={(slug) => `#${slug}`} />

      {getCasesInReadingOrder().map((item) => (
        <CaseArticle key={item.slug} item={item} className="pf-print-case" />
      ))}
    </div>
  );
}
