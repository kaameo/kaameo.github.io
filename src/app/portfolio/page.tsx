import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import type { Project } from "@/data/projects";
import { getProjectsWithCases, type Case } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Portfolio" };

// Project 하나: 개요 표 아래에 Case 제목을 불릿으로 두고, 각각 상세 페이지로 연결한다.
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
        <div>
          <dt>기술 스택</dt>
          <dd>{project.tech}</dd>
        </div>
        {project.links.length > 0 && (
          <div>
            <dt>링크</dt>
            <dd className="item-links">
              {project.links.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label} ↗
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {cases.length > 0 && (
        <ul className="pf-cases">
          {cases.map((c) => (
            <li key={c.slug}>
              <Link href={`/portfolio/${c.slug}/`}>
                {c.title}
                <span aria-hidden="true" className="arrow">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function PortfolioPage() {
  return (
    <>
      <div className="title-row">
        <h1 className="page-title">Portfolio</h1>
        <PrintButton />
      </div>

      {getProjectsWithCases().map(({ project, cases }) => (
        <ProjectCard key={project.slug} project={project} cases={cases} />
      ))}
    </>
  );
}
