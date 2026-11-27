import type { Metadata } from "next";
import ArrowLink from "@/components/ArrowLink";
import ItemHead from "@/components/ItemHead";
import MarkdownList from "@/components/MarkdownList";
import ProfileHeader from "@/components/ProfileHeader";
import { resume, type Entry, type ResumeEntry, type Work } from "@/data/resume";

// 인쇄 창에서 "PDF로 저장"하면 페이지 제목이 파일 이름이 되므로 사이트 이름을 붙이지 않는다.
export const metadata: Metadata = { title: { absolute: `${resume.name} 이력서` } };

// 업무 영역: 제목 옆에 기술 스택, 아래에 불릿.
function Works({ works }: { works: Work[] }) {
  return works.map((work) => (
    <div key={work.title} className="work">
      <div className="work-head">
        <h5>{work.title}</h5>
        <span className="resume-tags">{work.stack}</span>
      </div>
      <MarkdownList items={work.items} className="resume-bullets" />
    </div>
  ));
}

// Experience의 회사와 Projects의 프로젝트는 같은 모양: 이름 줄 → 한 줄 설명 → 업무 영역 → 불릿 (src/data/resume.ts 참고).
// keepTogether는 인쇄에서 쪽 경계에 걸치지 않게 할 항목(프로젝트)에 준다. 회사 항목은 길어서 나뉘어도 둔다.
function ResumeItem({ item, keepTogether }: { item: ResumeEntry; keepTogether?: boolean }) {
  return (
    <div className={keepTogether ? "resume-item resume-project" : "resume-item"}>
      <ItemHead as="h3" title={item.title} subtitle={item.subtitle} period={item.period} links={item.links} large />
      <blockquote className="item-intro">{item.description}</blockquote>
      <Works works={item.works} />
    </div>
  );
}

// 학교, 교육과정, 자격증: 이름 줄 아래에 필요하면 한 줄 더.
function Entries({ entries }: { entries: Entry[] }) {
  return (
    <div className="resume-entries">
      {entries.map((entry) => (
        <div key={entry.name} className="resume-entry">
          <ItemHead as="h3" title={entry.name} subtitle={entry.subtitle} period={entry.period} />
          {entry.detail && <p className="resume-entry-detail">{entry.detail}</p>}
        </div>
      ))}
    </div>
  );
}

export default function ResumePage() {
  return (
    <div className="resume print-doc">
      <ProfileHeader />

      <section className="titled-section">
        <h2>Summary</h2>
        <MarkdownList items={resume.summary} className="resume-bullets" />
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
            자세한 내용은 <ArrowLink href="/portfolio/">포트폴리오</ArrowLink>를 참고해 주세요.
          </p>
        </div>
        {resume.experience.map((job) => (
          <ResumeItem key={`${job.title} ${job.subtitle}`} item={job} />
        ))}
      </section>

      <section className="titled-section">
        <h2>Projects</h2>
        {resume.projects.map((project) => (
          <ResumeItem key={project.title} item={project} keepTogether />
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
