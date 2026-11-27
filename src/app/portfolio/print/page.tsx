import type { Metadata } from "next";
import CaseArticle from "@/components/CaseArticle";
import PortfolioSummary from "@/components/PortfolioSummary";
import { getProjectsWithCases, groupCases } from "@/lib/portfolio";
import { site } from "@/lib/site";

// 인쇄 창에서 "PDF로 저장"하면 페이지 제목이 파일 이름이 된다. 요약 페이지와 내용이 겹치므로 검색에는 싣지 않는다.
export const metadata: Metadata = {
  title: { absolute: `${site.author} 포트폴리오` },
  robots: { index: false },
};

// 인쇄 전용 Portfolio: 첫 장은 요약(머리 + 목차), 그 뒤로 모든 Case 전문을 요약과 같은 순서로 한 장씩 이어 붙인다.
// 이 페이지를 인쇄하면 PDF 한 벌이 된다. 목차의 Case 링크는 같은 문서 안의 Case 위치로 간다.
// 사이드바가 붙는 (browse) 묶음 밖에 두어 사이드바 없이 그린다.
export default function PortfolioPrintPage() {
  return (
    <div className="pf-print">
      <p className="pf-print-note no-print">
        인쇄용 페이지입니다. 오른쪽 아래 인쇄 버튼으로 PDF로 저장하면 요약과 모든 사례가 한 파일로 저장됩니다.
      </p>

      <PortfolioSummary caseHref={(slug) => `#${slug}`} />

      {getProjectsWithCases()
        .flatMap(({ cases }) => groupCases(cases).flatMap((group) => group.cases))
        .map((item) => (
        <CaseArticle key={item.slug} item={item} id={item.slug} className="pf-print-case" />
      ))}
    </div>
  );
}
