import Link from "next/link";
import { Fragment } from "react";
import { resume } from "@/data/resume";
import { site } from "@/lib/site";

// Resume와 Portfolio(요약, 인쇄 전용) 맨 위의 같은 머리: 직무, 이름 줄, 연락처 한 줄. 모양은 globals.css의 .resume-header.
// docType을 주면 이름 줄 오른쪽 끝에 문서 종류(예: 포트폴리오)를 적는다(이력서 저장소 portfolio.html의 모양).

// 연락처: 한 줄에 Email // GitHub // Blog 순서로 "라벨: 주소"를 //로 나눈다.
// 주소는 https://와 www.를 떼고 보여 준다. Email은 링크 없이 글자만 둔다.
type ContactItem = { label: string; text: string; href?: string };
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");
const contacts: ContactItem[] = [
  { label: "Email", text: site.email },
  { label: "GitHub", href: site.github, text: bare(site.github) },
  { label: "Blog", href: "/", text: bare(site.url) },
];

function ContactValue({ item }: { item: ContactItem }) {
  if (!item.href) return item.text;
  return item.href.startsWith("/") ? <Link href={item.href}>{item.text}</Link> : <a href={item.href}>{item.text}</a>;
}

function Contact() {
  return (
    <div className="resume-contact">
      <p>
        {contacts.map((item, i) => (
          <Fragment key={item.label}>
            {i > 0 && (
              <span className="contact-sep" aria-hidden="true">
                //
              </span>
            )}
            <span className="contact-item">
              <b>{item.label}:</b> <ContactValue item={item} />
            </span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}

export default function ProfileHeader({ docType }: { docType?: string }) {
  return (
    <header className="resume-header">
      <p className="resume-role">{resume.role}</p>
      <div className="profile-name-line">
        <h1 className="page-title">{resume.name}</h1>
        {docType && <span className="profile-doc-type">{docType}</span>}
      </div>
      <Contact />
    </header>
  );
}
