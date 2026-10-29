import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Comments from "@/components/Comments";
import { getAllBooks, getBook, storeName } from "@/lib/books";
import { renderMarkdown } from "@/lib/markdown";
import { formatLong } from "@/lib/date";

type Params = { slug: string };

export const dynamicParams = false;

// output: export는 경로가 하나도 없으면 빌드를 멈춘다.
// 공개된 책이 없을 때는 자리 표시용 경로 하나를 404로 내보낸다.
export function generateStaticParams(): Params[] {
  const params = getAllBooks().map((book) => ({ slug: book.slug }));
  return params.length > 0 ? params : [{ slug: "_" }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const book = getBook((await params).slug);
  if (!book) return {};
  return { title: book.title, description: `${book.author} 「${book.title}」 감상평` };
}

export default async function BookPage({ params }: { params: Promise<Params> }) {
  const book = getBook((await params).slug);
  if (!book) notFound();

  const body = await renderMarkdown(book.content);

  return (
    <>
      <article>
        <header className="book-header">
          <img src={book.cover} alt={`${book.title} 표지`} className="book-header-cover" />
          <div className="book-header-info">
            <h1>{book.title}</h1>
            <span className="book-header-author">{book.author}</span>
            <time dateTime={book.date} className="book-header-date">
              {formatLong(book.date)}
            </time>
            {book.link && <a href={book.link}>{storeName(book.link)} ↗</a>}
          </div>
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
      </div>
    </>
  );
}
