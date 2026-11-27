import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactElement } from "react";
import ArrowLink from "@/components/ArrowLink";
import { ArrowIcon } from "@/components/Icons";
import { resume, type Work } from "@/data/resume";
import { renderInlineMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

// 인쇄 창에서 "PDF로 저장"하면 페이지 제목이 파일 이름이 되므로 사이트 이름을 붙이지 않는다.
export const metadata: Metadata = { title: { absolute: `${resume.name} 이력서` } };

type Entry = (typeof resume.education)[number];
type RenderedWork = Omit<Work, "items"> & { items: ReactElement[] };

function renderBullets(items: string[]): Promise<ReactElement[]> {
  return Promise.all(items.map(renderInlineMarkdown));
}

function renderWorks(works: Work[]): Promise<RenderedWork[]> {
  return Promise.all(works.map(async (work) => ({ ...work, items: await renderBullets(work.items) })));
}

function Bullets({ items }: { items: ReactElement[] }) {
  return (
    <ul className="resume-bullets">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
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

// 연락처: 두 줄(Email // Blog, GitHub // LinkedIn)에 "라벨: 주소"를 //로 나눈다(resume.html의 모양).
// 주소는 https://와 www.를 떼고 보여 준다. Email은 링크 없이 글자만 둔다.
type ContactItem = { label: string; text: string; href?: string };
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");
const contactLines: ContactItem[][] = [
  [
    { label: "Email", text: site.email },
    { label: "Blog", href: "/", text: bare(site.url) },
  ],
  [
    { label: "GitHub", href: site.github, text: bare(site.github) },
    { label: "LinkedIn", href: resume.linkedin, text: bare(resume.linkedin) },
  ],
];

function ContactValue({ item }: { item: ContactItem }) {
  if (!item.href) return item.text;
  return item.href.startsWith("/") ? <Link href={item.href}>{item.text}</Link> : <a href={item.href}>{item.text}</a>;
}

function Contact() {
  return (
    <div className="resume-contact">
      {contactLines.map((line) => (
        <p key={line[0].label}>
          {line.map((item, i) => (
            <Fragment key={item.label}>
              {i > 0 && (
                <span className="contact-sep" aria-hidden="true">
                  //
                </span>
              )}
              <span className="contact-item">
                <b>{item.label}:</b>{" "}
                <ContactValue item={item} />
              </span>
            </Fragment>
          ))}
        </p>
      ))}
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
        <h1 className="page-title">{resume.name}</h1>
        <Contact />
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
              <span className="skill-items">{row.items.join(", ")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="titled-section">
        <div className="titled-section-head">
          <h2>Experience</h2>
          <p className="title-meta">
            자세한 내용은{" "}
            <Link href="/portfolio/">
              포트폴리오
              <ArrowIcon />
            </Link>
            를 참고해 주세요.
          </p>
        </div>
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
        <h2>Projects</h2>
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
                    <ArrowLink key={link.href} href={link.href}>
                      {link.label}
                    </ArrowLink>
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
