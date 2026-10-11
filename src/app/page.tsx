import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/posts";
import { formatDot } from "@/lib/date";

// public/profile.jpg를 넣으면 사진이 보이고, 없으면 자리 표시가 나온다.
const hasProfilePhoto = fs.existsSync(path.join(process.cwd(), "public", "profile.jpg"));

export default function HomePage() {
  const recent = getAllPosts().slice(0, 3);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>{site.hero.greeting}</h1>
          <p>{site.hero.intro}</p>
          <div className="hero-links">
            <Link href="/resume/">Resume →</Link>
            <a href={site.github}>GitHub ↗</a>
          </div>
        </div>
        <div className="profile">
          {hasProfilePhoto ? (
            <img src="/profile.jpg" alt={`${site.author} 프로필 사진`} />
          ) : (
            <span>[사진]</span>
          )}
        </div>
      </section>

      <section aria-labelledby="about">
        <div className="section-head">
          <h2 id="about">About</h2>
        </div>
        <p className="about-body">{site.about.body}</p>
        <dl className="kv-list">
          {site.about.items.map((item) => (
            <div key={item.label} className="kv-row">
              <dt>{item.label}</dt>
              <dd className={item.mono ? "mono" : undefined}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="recent-posts">
        <div className="section-head">
          <h2 id="recent-posts">최근 글</h2>
          <Link href="/posts/">전체 보기 →</Link>
        </div>
        {recent.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}/`} className="compact-item">
            <time dateTime={post.date}>{formatDot(post.date)}</time>
            <span>{post.title}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
