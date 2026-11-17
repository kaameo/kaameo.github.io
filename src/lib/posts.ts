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

export type Post = PostMeta & { content: string; draft: boolean };

// pnpm dev에서는 Draft도 주소로 열어 미리 볼 수 있다. 목록·RSS·사이트맵과 빌드(배포) 결과에는 나오지 않는다.
// 또 글을 고치고 새로고침하면 바로 보이도록 개발 서버에서는 읽은 글을 캐시하지 않는다.
const DEV = process.env.NODE_ENV === "development";

// 한국어 기준 분당 약 500자로 읽는 시간을 어림한다. 코드 블록은 뺀다.
function readingMinutes(content: string): number {
  const text = content.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, "");
  return Math.max(1, Math.round(text.length / 500));
}

function readPost(file: string): Post | null {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const draft = Boolean(data.draft);
  if (draft && !DEV) return null;
  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title ?? ""),
    date: normalizeDate(data.date),
    summary: String(data.summary ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingMinutes(content),
    content,
    draft,
  };
}

let cache: Post[] | null = null;

function loadPosts(): Post[] {
  if (cache) return cache;
  const files = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")) : [];
  const posts = files
    .map(readPost)
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!DEV) cache = posts;
  return posts;
}

// 목록에 보일 공개된 Post. 개발 서버에서도 Draft는 빠진다.
export function getAllPosts(): PostMeta[] {
  return loadPosts()
    .filter((p) => !p.draft)
    .map(({ content: _content, draft: _draft, ...meta }) => meta);
}

// 상세 페이지를 만들 주소. 개발 서버에서는 Draft도 들어가 미리 볼 수 있다.
export function getPostSlugs(): string[] {
  return loadPosts().map((p) => p.slug);
}

export function getPost(slug: string): Post | undefined {
  return loadPosts().find((p) => p.slug === slug);
}
