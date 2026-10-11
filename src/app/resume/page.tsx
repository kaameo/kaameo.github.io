import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { resume } from "@/data/resume";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Resume" };

export default function ResumePage() {
  return (
    <div className="resume">
      <header className="resume-header">
        <div className="resume-title-row">
          <h1 className="page-title">{resume.name}</h1>
          <PrintButton />
        </div>
        <p className="resume-intro">{resume.intro}</p>
        <div className="resume-contact">
          <span>{site.email}</span>
          <a href={site.github}>GitHub ↗</a>
          <Link href="/posts/">Blog</Link>
        </div>
      </header>

      <section className="resume-section">
        <h2>Experience</h2>
        <div className="resume-stack">
          {resume.experience.map((job, i) => (
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
          {resume.projects.map((project) => (
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
    </div>
  );
}
