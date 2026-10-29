import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { normalizeDate } from "./date";

const BOOKS_DIR = path.join(process.cwd(), "content", "books");
const PUBLIC_DIR = path.join(process.cwd(), "public");

export type Book = {
  slug: string;
  title: string;
  author: string;
  cover: string;
  date: string;
  link: string;
  content: string;
};

function readBook(file: string): Book | null {
  const raw = fs.readFileSync(path.join(BOOKS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  if (data.draft) return null;

  const cover = String(data.cover ?? "");
  // 표지가 없으면 깨진 이미지가 배포되므로 빌드를 멈춘다.
  if (!cover || !fs.existsSync(path.join(PUBLIC_DIR, cover))) {
    throw new Error(`content/books/${file}: 표지 파일이 없습니다 (public${cover || "/books/?"})`);
  }

  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title ?? ""),
    author: String(data.author ?? ""),
    cover,
    date: normalizeDate(data.date),
    link: String(data.link ?? ""),
    content,
  };
}

let cache: Book[] | null = null;

// 작성일 기준 최신순
export function getAllBooks(): Book[] {
  if (cache) return cache;
  const files = fs.existsSync(BOOKS_DIR) ? fs.readdirSync(BOOKS_DIR).filter((f) => f.endsWith(".md")) : [];
  cache = files
    .map(readBook)
    .filter((b): b is Book => b !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export function getBook(slug: string): Book | undefined {
  return getAllBooks().find((b) => b.slug === slug);
}

const STORES: [string, string][] = [
  ["kyobobook", "교보문고"],
  ["yes24", "YES24"],
  ["aladin", "알라딘"],
];

// 링크 도메인으로 서점 이름을 정한다.
export function storeName(link: string): string {
  return STORES.find(([key]) => link.includes(key))?.[1] ?? "책 정보";
}
