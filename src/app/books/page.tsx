import type { Metadata } from "next";
import Link from "next/link";
import { getAllBooks } from "@/lib/books";

export const metadata: Metadata = { title: "Book" };

export default function BooksPage() {
  const books = getAllBooks();

  return (
    <>
      <h1 className="page-title">Book</h1>

      <ul className="book-grid">
        {books.map((book) => (
          <li key={book.slug}>
            <Link href={`/books/${book.slug}/`} className="book-card">
              <div className="book-cover">
                <img src={book.cover} alt={`${book.title} 표지`} loading="lazy" />
              </div>
              <span className="book-title">{book.title}</span>
              <span className="book-author">{book.author}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
