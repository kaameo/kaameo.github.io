import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import ArrowLink from "@/components/ArrowLink";
import { ArrowIcon } from "@/components/Icons";
import ProfileHeader from "@/components/ProfileHeader";
import { resume, type Work } from "@/data/resume";
import { renderInlineMarkdown } from "@/lib/markdown";

// 인쇄 창에서 "PDF로 저장"하면 페이지 제목이 파일 이름이 되므로 사이트 이름을 붙이지 않는다.
export const metadata: Metadata = { title: { absolute: `${resume.name} 이력서` } };

type Entry = (typeof resume.education)[number];
type RenderedWork = Omit<Work, "items"> & { items: ReactElement[] };
type ItemLink = { label: string; href: string };

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

// Experience의 회사와 Projects의 프로젝트는 같은 모양: 이름 줄(이름, 부제, 링크, 기간) → 한 줄 설명 → 업무 영역.
function ResumeItem(props: {
  title: string;
  subtitle: string;
  period: string;
  links?: ItemLink[];
  description: string;
  works: RenderedWork[];
  className?: string;
}) {
  return (
    <div className={props.className ? `resume-item ${props.className}` : "resume-item"}>
      <div className="item-head">
        <div className="item-title-line">
          <h3>
            {props.title}
            <span className="item-sub">{props.subtitle}</span>
          </h3>
          {props.links && (
            <span className="item-links">
              {props.links.map((link) => (
                <ArrowLink key={link.href} href={link.href}>
                  {link.label}
                </ArrowLink>
              ))}
            </span>
          )}
        </div>
        <span className="period">{props.period}</span>
      </div>
      <blockquote className="resume-intro">{props.description}</blockquote>
      <Works works={props.works} />
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

// 경력과 프로젝트 모두 이름 줄 → 한 줄 설명 → 업무 영역 → 불릿 순으로 그린다 (src/data/resume.ts 참고).
export default async function ResumePage() {
  const summary = await renderBullets(resume.summary);
  const experience = await Promise.all(
    resume.experience.map(async (job) => ({ ...job, works: await renderWorks(job.works) })),
  );
  const projects = await Promise.all(
    resume.projects.map(async (project) => ({ ...project, works: await renderWorks(project.works) })),
  );

  return (
    <div className="resume">
      <ProfileHeader />

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
          <ResumeItem
            key={`${job.company} ${job.role}`}
            title={job.company}
            subtitle={job.role}
            period={job.period}
            description={job.description}
            works={job.works}
          />
        ))}
      </section>

      <section className="titled-section">
        <h2>Projects</h2>
        {projects.map((project) => (
          <ResumeItem
            key={project.title}
            className="resume-project"
            title={project.title}
            subtitle={project.subtitle}
            period={project.period}
            links={project.links}
            description={project.description}
            works={project.works}
          />
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
