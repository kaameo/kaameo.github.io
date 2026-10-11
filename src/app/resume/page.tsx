import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { resume } from "@/data/resume";
import { renderInlineMarkdown, renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Resume" };

// 소개는 여러 문단 마크다운, 경력 항목과 프로젝트 설명은 한 줄 마크다운으로 그린다.
export default async function ResumePage() {
  const intro = await renderMarkdown(resume.intro);
  const experience = await Promise.all(
    resume.experience.map(async (job) => ({ ...job, items: await Promise.all(job.items.map(renderInlineMarkdown)) })),
  );
  const projects = await Promise.all(
    resume.projects.map(async (project) => ({ ...project, description: await renderInlineMarkdown(project.description) })),
  );

  return (
    <div className="resume">
      <header className="resume-header">
        <div className="resume-title-row">
          <h1 className="page-title">{resume.name}</h1>
          <PrintButton />
        </div>
        <div className="resume-intro">{intro}</div>
        <div className="resume-contact">
          <span>{site.email}</span>
          <a href={site.github}>GitHub ↗</a>
          <a href={resume.linkedin}>LinkedIn ↗</a>
          <Link href="/posts/">Blog</Link>
        </div>
      </header>

      <section className="resume-section">
        <h2>Experience</h2>
        <div className="resume-stack">
          {experience.map((job, i) => (
            <div key={i} className="job">
              <div className="job-top">
                <h3>{job.company}</h3>
                <span className="period">{job.period}</span>
              </div>
              <p className="job-role">{job.role}</p>
              <ul>
                {job.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="resume-section">
        <h2>Skills</h2>
        <div className="resume-stack tight">
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
        <h2>Projects</h2>
        <div className="resume-stack tight">
          {projects.map((project) => (
            <div key={project.title} className="resume-project">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
          ))}
          <Link href="/portfolio/" className="accent-link no-print">
            Portfolio에서 전체 보기 →
          </Link>
        </div>
      </section>

      <section className="resume-section">
        <h2>Education</h2>
        <div className="resume-stack tight">
          {resume.education.map((edu) => (
            <div key={edu.school} className="job-top">
              <strong>{edu.school}</strong>
              <span className="period">{edu.period}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="resume-section">
        <h2>Certifications</h2>
        <div className="resume-stack tight">
          {resume.certifications.map((cert) => (
            <div key={cert.name} className="job-top">
              <strong>{cert.name}</strong>
              <span className="period">{cert.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
