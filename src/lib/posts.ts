import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { normalizeDate } from "./date";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingMinutes: number;
};

export type Post = PostMeta & { content: string };

// 한국어 기준 분당 약 500자로 읽는 시간을 어림한다. 코드 블록은 뺀다.
function readingMinutes(content: string): number {
  const text = content.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, "");
  return Math.max(1, Math.round(text.length / 500));
}

function readPost(file: string): Post | null {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  if (data.draft) return null;
  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title ?? ""),
    date: normalizeDate(data.date),
    summary: String(data.summary ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingMinutes(content),
    content,
  };
}

let cache: Post[] | null = null;

function loadPosts(): Post[] {
  if (cache) return cache;
  const files = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")) : [];
  cache = files
    .map(readPost)
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export function getAllPosts(): PostMeta[] {
  return loadPosts().map(({ content: _content, ...meta }) => meta);
}

export function getPost(slug: string): Post | undefined {
  return loadPosts().find((p) => p.slug === slug);
}
