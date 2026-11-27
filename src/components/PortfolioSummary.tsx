import Link from "next/link";
import { Fragment } from "react";
import ArrowLink from "@/components/ArrowLink";
import ProfileHeader from "@/components/ProfileHeader";
import type { Project } from "@/data/projects";
import { renderInlineMarkdown } from "@/lib/markdown";
import { getProjectsWithCases, groupCases, type Case } from "@/lib/portfolio";

// Portfolio 요약(머리 + Project별 Case 목록). /portfolio/와 인쇄 전용 /portfolio/print/의 첫 장이 같은 모양을 쓴다.
// caseHref로 Case 링크가 갈 곳을 정한다: 요약 페이지는 Case 상세, 인쇄 페이지는 같은 문서 안의 Case 위치.

type CaseHref = (slug: string) => string;

// Case 하나: 라벨형 불릿 "굵은 Case 제목: 핵심 성과". 줄 전체가 Case 링크이고 →는 오른쪽 끝.
// 핵심 성과가 여러 개면 " · "로 잇고, 없으면(전체 구조, 회고) 제목만 둔다. 줄 전체가 링크라 핵심 성과에는 링크를 쓰지 않는다.
// 태그는 Case 상세 머리에 둔다.
async function CaseItem({ item, caseHref }: { item: Case; caseHref: CaseHref }) {
  const highlights = await Promise.all(item.highlights.map(renderInlineMarkdown));
  return (
    <li>
      <Link href={caseHref(item.slug)}>
        <span>
          <span className="pf-case-label">
            {item.title}
            {highlights.length > 0 && ":"}
          </span>
          {highlights.map((h, i) => (
            <Fragment key={i}>
              {i === 0 ? " " : " · "}
              {h}
            </Fragment>
          ))}
        </span>
        <span aria-hidden="true" className="pf-case-more">
          →
        </span>
      </Link>
    </li>
  );
}

// Project 하나: Resume와 같은 이름 줄(이름, 부제, 링크, 기간)과 한 줄 설명 아래에 바로 Case 목록을 둔다.
// 전체 구조·회고처럼 group이 있는 Case는 주요 사례 아래에 작은 제목으로 따로 묶는다.
function ProjectCard({ project, cases, caseHref }: { project: Project; cases: Case[]; caseHref: CaseHref }) {
  return (
    <article id={project.slug} className="pf-project">
      <div className="item-head">
        <div className="item-title-line">
          <h2>
            {project.title}
            <span className="item-sub">{project.subtitle}</span>
          </h2>
          {project.links.length > 0 && (
            <span className="item-links">
              {project.links.map((link) => (
                <ArrowLink key={link.href} href={link.href}>
                  {link.label}
                </ArrowLink>
              ))}
            </span>
          )}
        </div>
        <span className="period">{project.period}</span>
      </div>
      <blockquote className="resume-intro">{project.description}</blockquote>

      {groupCases(cases).map((group) => (
        <div key={group.label ?? ""} className="pf-case-group">
          {group.label && <p className="pf-group-label">{group.label}</p>}
          <ul className="pf-cases">
            {group.cases.map((c) => (
              <CaseItem key={c.slug} item={c} caseHref={caseHref} />
            ))}
          </ul>
        </div>
      ))}
    </article>
  );
}

// 머리는 Resume와 같은 ProfileHeader에 이름 줄 오른쪽 "포트폴리오"를 더한 것. 인쇄하면 포트폴리오 첫 장이 되고, 연락처 링크는 PDF에서도 눌린다.
export default function PortfolioSummary({ caseHref }: { caseHref: CaseHref }) {
  return (
    <>
      <ProfileHeader docType="포트폴리오" />
      {getProjectsWithCases().map(({ project, cases }) => (
        <ProjectCard key={project.slug} project={project} cases={cases} caseHref={caseHref} />
      ))}
    </>
  );
}
