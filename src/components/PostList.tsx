import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDot } from "@/lib/date";
import { ChevronIcon } from "./Icons";

function pageHref(page: number) {
  return page === 1 ? "/posts/" : `/posts/page/${page}/`;
}

export default function PostList({
  posts,
  total,
  page,
  pageCount,
}: {
  posts: PostMeta[];
  total: number;
  page: number;
  pageCount: number;
}) {
  return (
    <>
      <div className="list-head">
        <h1 className="page-title">Post</h1>
        <span className="list-count">전체 글 ({total})</span>
      </div>

      {posts.map((post) => (
        <Link key={post.slug} href={`/posts/${post.slug}/`} className="post-item">
          <time dateTime={post.date}>{formatDot(post.date)}</time>
          <div>
            <h2>{post.title}</h2>
            {post.summary && <p>{post.summary}</p>}
          </div>
        </Link>
      ))}

      {pageCount > 1 && (
        <nav aria-label="페이지" className="pagination">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="page-link" aria-label="이전 페이지">
              <ChevronIcon direction="left" />
            </Link>
          ) : (
            <span className="page-link disabled" aria-hidden="true">
              <ChevronIcon direction="left" />
            </span>
          )}
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={pageHref(n)} className="page-link" aria-current={n === page ? "page" : undefined}>
              {n}
            </Link>
          ))}
          {page < pageCount ? (
            <Link href={pageHref(page + 1)} className="page-link" aria-label="다음 페이지">
              <ChevronIcon direction="right" />
            </Link>
          ) : (
            <span className="page-link disabled" aria-hidden="true">
              <ChevronIcon direction="right" />
            </span>
          )}
        </nav>
      )}
    </>
  );
}
