import type { Metadata } from "next";
import Link from "next/link";
import { projects, type Project } from "@/data/projects";
import { getAllCases, type Case } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Portfolio" };

const SECTIONS = [
  { key: "experience", title: "Experience" },
  { key: "project", title: "Projects" },
] as const;

// Project 하나: 개요 표 아래에 Case 제목을 불릿으로 두고, 각각 상세 페이지로 연결한다.
function ProjectCard({ project, cases }: { project: Project; cases: Case[] }) {
  return (
    <article id={project.slug} className="pf-project">
      <div className="item-head">
        <h3>
          {project.title}
          <span className="item-sub">{project.subtitle}</span>
        </h3>
        <span className="period">{project.period}</span>
      </div>

      <dl className="pf-overview">
        <div>
          <dt>개요</dt>
          <dd>{project.overview}</dd>
        </div>
        <div>
          <dt>역할</dt>
          <dd>{project.role}</dd>
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
  const cases = getAllCases();

  return (
    <>
      <h1 className="page-title">Portfolio</h1>

      {SECTIONS.map((section) => (
        <section key={section.key} className="titled-section">
          <h2>{section.title}</h2>
          {projects
            .filter((p) => p.section === section.key)
            .map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                cases={cases.filter((c) => c.project.slug === project.slug)}
              />
            ))}
        </section>
      ))}
    </>
  );
}
