import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import { DownloadIcon } from "@/components/Icons";
import { resume } from "@/data/resume";
import { renderInlineMarkdown, renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Resume" };

type Entry = (typeof resume.education)[number];

const inline = (items: string[]) => Promise.all(items.map(renderInlineMarkdown));

function Bullets({ items }: { items: ReactElement[] }) {
  return (
    <ul className="resume-bullets">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// 학교, 교육과정, 자격증: 이름은 왼쪽, 기간은 오른쪽, 필요하면 아래에 한 줄 더.
function Entries({ entries }: { entries: Entry[] }) {
  return (
    <div className="resume-entries">
      {entries.map((entry) => (
        <div key={entry.name} className="resume-entry">
          <div className="resume-item-head">
            <h3>
              {entry.name}
              <span className="resume-sub">{entry.subtitle}</span>
            </h3>
            <span className="period">{entry.period}</span>
          </div>
          {entry.detail && <p className="resume-entry-detail">{entry.detail}</p>}
          {entry.link && (
            <p className="resume-entry-detail resume-links">
              <a href={entry.link.href}>{entry.link.label} ↗</a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// 경력은 회사·직책 → 제품 → 업무 영역 → 불릿 순으로 그린다 (src/data/resume.ts 참고).
export default async function ResumePage() {
  const summary = await renderMarkdown(resume.summary);
  const experience = await Promise.all(
    resume.experience.map(async (job) => ({
      ...job,
      products: await Promise.all(
        job.products.map(async (product) => ({
          ...product,
          works: await Promise.all(product.works.map(async (work) => ({ ...work, items: await inline(work.items) }))),
        })),
      ),
    })),
  );
  const projects = await Promise.all(
    resume.projects.map(async (project) => ({
      ...project,
      intro: await renderMarkdown(project.intro),
      items: await inline(project.items),
    })),
  );

  return (
    <div className="resume">
      <header className="resume-header">
        <p className="resume-role">{resume.role}</p>
        <div className="resume-title-row">
          <h1 className="page-title">{resume.name}</h1>
          <a href={resume.pdf} download className="resume-pdf no-print">
            <DownloadIcon />
            PDF
          </a>
        </div>
        <div className="resume-contact">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.github}>GitHub ↗</a>
          <a href={resume.linkedin}>LinkedIn ↗</a>
          <Link href="/posts/">Blog</Link>
        </div>
      </header>

      <section className="resume-section">
        <h2>Summary</h2>
        <div className="resume-summary">{summary}</div>
      </section>

      <section className="resume-section">
        <h2>Experience</h2>
        {experience.map((job) => (
          <div key={`${job.company} ${job.role}`} className="resume-item">
            <div className="resume-item-head">
              <h3>
                {job.company}
                <span className="resume-sub">{job.role}</span>
              </h3>
              <span className="period">{job.period}</span>
            </div>
            {job.products.map((product) => (
              <div key={product.name} className="product">
                <div className="product-head">
                  <h4>{product.name}</h4>
                  <span className="resume-tags">{product.keywords}</span>
                </div>
                {product.works.map((work) => (
                  <div key={work.title} className="work">
                    <div className="work-head">
                      <h5>{work.title}</h5>
                      <span className="resume-tags">{work.stack}</span>
                    </div>
                    <Bullets items={work.items} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="resume-section">
        <h2>Projects</h2>
        {projects.map((project) => (
          <div key={project.title} className="resume-item resume-project">
            <div className="resume-item-head">
              <div className="resume-title-line">
                <h3>
                  {project.title}
                  <span className="resume-sub">{project.subtitle}</span>
                </h3>
                <span className="resume-links">
                  {project.links.map((link) => (
                    <a key={link.href} href={link.href}>
                      {link.label} ↗
                    </a>
                  ))}
                </span>
              </div>
              <span className="period">{project.period}</span>
            </div>
            <blockquote className="resume-intro">{project.intro}</blockquote>
            <Bullets items={project.items} />
          </div>
        ))}
      </section>

      <section className="resume-section">
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

      <section className="resume-section">
        <h2>Education</h2>
        <Entries entries={resume.education} />
      </section>

      <section className="resume-section">
        <h2>ETC</h2>
        <Entries entries={resume.etc} />
      </section>
    </div>
  );
}
