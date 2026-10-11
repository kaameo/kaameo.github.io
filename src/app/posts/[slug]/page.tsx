import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Comments from "@/components/Comments";
import { getAllPosts, getPost } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { formatDot, formatLong } from "@/lib/date";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.date },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const body = await renderMarkdown(post.content);
  const others = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <article>
        <header className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <time dateTime={post.date}>{formatLong(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes}분 분량</span>
          </div>
          {post.tags.length > 0 && (
            <ul aria-label="태그" className="tags">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </header>
        <div className="prose">{body}</div>
      </article>

      <div className="post-after">
        <section aria-labelledby="comments-title">
          <div className="section-head">
            <h2 id="comments-title">댓글</h2>
          </div>
          <div className="comments">
            <Comments />
          </div>
        </section>

        {others.length > 0 && (
          <section aria-labelledby="more-title">
            <div className="section-head">
              <h2 id="more-title">다른 글</h2>
            </div>
            {others.map((p) => (
              <Link key={p.slug} href={`/posts/${p.slug}/`} className="compact-item">
                <time dateTime={p.date}>{formatDot(p.date)}</time>
                <span>{p.title}</span>
              </Link>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
