import type { Metadata } from "next";
import Link from "next/link";
import ArrowLink from "@/components/ArrowLink";
import CaseHighlights from "@/components/CaseHighlights";
import type { Project } from "@/data/projects";
import { getProjectsWithCases, groupCases, type Case } from "@/lib/portfolio";
import { site } from "@/lib/site";

// 인쇄 창에서 "PDF로 저장"하면 페이지 제목이 파일 이름이 되므로 사이트 이름을 붙이지 않는다.
export const metadata: Metadata = { title: { absolute: `${site.author} 포트폴리오` } };

// Case 하나: 제목과 태그는 왼쪽, "자세히 →"는 오른쪽 끝, 아래에 핵심 성과 한두 줄.
function CaseItem({ item }: { item: Case }) {
  return (
    <li>
      <Link href={`/portfolio/${item.slug}/`}>
        <span>
          {item.title}
          {item.tags.length > 0 && <span className="pf-case-tags">{item.tags.join(" · ")}</span>}
        </span>
        <span aria-hidden="true" className="pf-case-more">
          자세히 →
        </span>
      </Link>
      <CaseHighlights items={item.highlights} className="pf-highlights" />
    </li>
  );
}

// Project 하나: 개요 표 아래에 Case 목록을 두고, 각각 상세 페이지로 연결한다.
// 전체 구조·회고처럼 group이 있는 Case는 주요 사례 아래에 작은 제목으로 따로 묶는다.
function ProjectCard({ project, cases }: { project: Project; cases: Case[] }) {
  return (
    <article id={project.slug} className="pf-project">
      <div className="item-head">
        <h2>
          {project.title}
          <span className="item-sub">{project.subtitle}</span>
        </h2>
        <span className="period">{project.period}</span>
      </div>

      <dl className="pf-overview">
        <div>
          <dt>개요</dt>
          <dd>{project.overview}</dd>
        </div>
        {project.team && (
          <div>
            <dt>팀 구성</dt>
            <dd>{project.team}</dd>
          </div>
        )}
        {project.role && (
          <div>
            <dt>역할</dt>
            <dd>
              {typeof project.role === "string" ? (
                project.role
              ) : (
                <ul className="pf-role">
                  {project.role.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        )}
        <div>
          <dt>기술 스택</dt>
          <dd>{project.tech}</dd>
        </div>
        {project.links.length > 0 && (
          <div>
            <dt>링크</dt>
            <dd className="item-links">
              {project.links.map((link) => (
                <ArrowLink key={link.href} href={link.href}>
                  {link.label}
                </ArrowLink>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {groupCases(cases).map((group) => (
        <div key={group.label ?? ""} className="pf-case-group">
          {group.label && <p className="pf-group-label">{group.label}</p>}
          <ul className="pf-cases">
            {group.cases.map((c) => (
              <CaseItem key={c.slug} item={c} />
            ))}
          </ul>
        </div>
      ))}
    </article>
  );
}

export default function PortfolioPage() {
  return (
    <>
      <h1 className="page-title">Portfolio</h1>

      {getProjectsWithCases().map(({ project, cases }) => (
        <ProjectCard key={project.slug} project={project} cases={cases} />
      ))}
    </>
  );
}
