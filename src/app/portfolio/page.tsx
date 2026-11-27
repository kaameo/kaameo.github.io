import type { Metadata } from "next";
import Link from "next/link";
import { DownloadIcon } from "@/components/Icons";
import { companies, pdfs, projects, type Company, type Project } from "@/data/projects";
import { renderInlineMarkdown } from "@/lib/markdown";
import { getAllCases, type Case } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Portfolio" };

const SECTIONS = [
  { key: "experience", title: "Experience" },
  { key: "project", title: "Projects" },
] as const;

// Experience 섹션 맨 위의 Company 소개: 회사·직책·기간 아래 불릿.
async function CompanyIntro({ company }: { company: Company }) {
  const items = await Promise.all(company.items.map((item) => renderInlineMarkdown(item)));
  return (
    <div className="pf-company">
      <div className="item-head">
        <h3>
          {company.name}
          <span className="item-sub">{company.role}</span>
        </h3>
        <span className="period">{company.period}</span>
      </div>
      <ul className="resume-bullets">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

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
  const cases = getAllCases();

  return (
    <>
      <div className="title-row">
        <h1 className="page-title">Portfolio</h1>
        <div className="pdf-buttons no-print">
          {pdfs.map((pdf) => (
            <a key={pdf.href} href={pdf.href} download className="pdf-button">
              <DownloadIcon />
              {pdf.label}
            </a>
          ))}
        </div>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.key} className="titled-section">
          <h2>{section.title}</h2>
          {section.key === "experience" &&
            companies.map((company) => <CompanyIntro key={company.name} company={company} />)}
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
