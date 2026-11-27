import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import PrintButton from "@/components/PrintButton";
import { resume, type Bullet } from "@/data/resume";
import { renderInlineMarkdown } from "@/lib/markdown";
import { getCase } from "@/lib/portfolio";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Resume" };

type Entry = (typeof resume.education)[number];
type RenderedBullet = { text: ReactElement; caseSlug?: string };
type RenderedWork = { title: string; stack: string; items: RenderedBullet[] };

// Case가 있는 불릿은 Portfolio 상세 페이지로 잇는다. 없는 Case를 가리키면 빌드를 멈춘다.
function renderBullets(items: Bullet[]): Promise<RenderedBullet[]> {
  return Promise.all(
    items.map(async (item) => {
      if (typeof item === "string") return { text: await renderInlineMarkdown(item) };
      if (!getCase(item.case)) throw new Error(`src/data/resume.ts: Case "${item.case}"가 content/portfolio에 없습니다.`);
      return { text: await renderInlineMarkdown(item.text), caseSlug: item.case };
    }),
  );
}

function renderWorks(works: { title: string; stack: string; items: Bullet[] }[]): Promise<RenderedWork[]> {
  return Promise.all(works.map(async (work) => ({ ...work, items: await renderBullets(work.items) })));
}

function Bullets({ items }: { items: RenderedBullet[] }) {
  return (
    <ul className="resume-bullets">
      {items.map((item, i) => (
        <li key={i}>
          {item.text}
          {item.caseSlug && (
            <>
              {" "}
              <Link href={`/portfolio/${item.caseSlug}/`} className="case-link no-print">
                자세히 →
              </Link>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

// 업무 영역: 제목 옆에 기술 스택, 아래에 불릿.
function Works({ works }: { works: RenderedWork[] }) {
  return works.map((work) => (
    <div key={work.title} className="work">
      <div className="work-head">
        <h5>{work.title}</h5>
        <span className="resume-tags">{work.stack}</span>
      </div>
      <Bullets items={work.items} />
    </div>
  ));
}

// Experience·Projects 제목. 오른쪽에 자세한 내용은 Portfolio를 보라는 안내를 둔다.
function PortfolioSectionHead({ title }: { title: string }) {
  return (
    <div className="titled-section-head">
      <h2>{title}</h2>
      <p className="title-meta">
        자세한 내용은 <Link href="/portfolio/">포트폴리오</Link>를 참고해 주세요.
      </p>
    </div>
  );
}

// 학교, 교육과정, 자격증: 이름은 왼쪽, 기간은 오른쪽, 필요하면 아래에 한 줄 더.
function Entries({ entries }: { entries: Entry[] }) {
  return (
    <div className="resume-entries">
      {entries.map((entry) => (
        <div key={entry.name} className="resume-entry">
          <div className="item-head">
            <h3>
              {entry.name}
              <span className="item-sub">{entry.subtitle}</span>
            </h3>
            <span className="period">{entry.period}</span>
          </div>
          {entry.detail && <p className="resume-entry-detail">{entry.detail}</p>}
          {entry.link && (
            <p className="resume-entry-detail item-links">
              <a href={entry.link.href}>{entry.link.label} ↗</a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// 경력은 회사·직책 → 제품 → 업무 영역 → 불릿, 프로젝트는 프로젝트 → 업무 영역 → 불릿 순으로 그린다 (src/data/resume.ts 참고).
export default async function ResumePage() {
  const summary = await renderBullets(resume.summary);
  const experience = await Promise.all(
    resume.experience.map(async (job) => ({
      ...job,
      products: await Promise.all(
        job.products.map(async (product) => ({ ...product, works: await renderWorks(product.works) })),
      ),
    })),
  );
  const projects = await Promise.all(
    resume.projects.map(async (project) => ({ ...project, works: await renderWorks(project.works) })),
  );

  return (
    <div className="resume">
      <header className="resume-header">
        <p className="resume-role">{resume.role}</p>
        <div className="title-row">
          <h1 className="page-title">{resume.name}</h1>
          <PrintButton />
        </div>
        <div className="resume-contact">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.github}>GitHub ↗</a>
          <a href={resume.linkedin}>LinkedIn ↗</a>
          <Link href="/posts/">Blog</Link>
        </div>
      </header>

      <section className="titled-section">
        <h2>Summary</h2>
        <Bullets items={summary} />
      </section>

      <section className="titled-section">
        <h2>Skills</h2>
        <div className="skill-list">
          {resume.skills.map((row) => (
            <div key={row.group} className="skill-row">
              <span className="skill-group">{row.group}</span>
              <div className="chips">
                {row.items.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="titled-section">
        <PortfolioSectionHead title="Experience" />
        {experience.map((job) => (
          <div key={`${job.company} ${job.role}`} className="resume-item">
            <div className="item-head">
              <h3>
                {job.company}
                <span className="item-sub">{job.role}</span>
              </h3>
              <span className="period">{job.period}</span>
            </div>
            {job.products.map((product) => (
              <div key={product.name} className="product">
                <div className="product-head">
                  <h4>{product.name}</h4>
                </div>
                <blockquote className="resume-intro">{product.description}</blockquote>
                <Works works={product.works} />
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="titled-section">
        <PortfolioSectionHead title="Projects" />
        {projects.map((project) => (
          <div key={project.title} className="resume-item resume-project">
            <div className="item-head">
              <div className="item-title-line">
                <h3>
                  {project.title}
                  <span className="item-sub">{project.subtitle}</span>
                </h3>
                <span className="item-links">
                  {project.links.map((link) => (
                    <a key={link.href} href={link.href}>
                      {link.label} ↗
                    </a>
                  ))}
                </span>
              </div>
              <span className="period">{project.period}</span>
            </div>
            <blockquote className="resume-intro">{project.description}</blockquote>
            <Works works={project.works} />
          </div>
        ))}
      </section>

      <section className="titled-section">
        <h2>Education</h2>
        <Entries entries={resume.education} />
      </section>

      <section className="titled-section">
        <h2>직무 관련 교육 및 자격증</h2>
        <Entries entries={resume.training} />
      </section>
    </div>
  );
}
