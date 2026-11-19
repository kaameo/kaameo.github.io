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

// 글은 content/posts/<slug>.mdx 한 파일이다. 그 글에서만 쓰는 컴포넌트가 있으면 content/posts/<slug>/ 폴더에
// index.mdx와 컴포넌트 파일을 함께 두고(folder: true), 본문에서 import한다. 본문은 src/lib/mdx.ts가 불러온다.
export type Post = PostMeta & { draft: boolean; folder: boolean };

type PostSource = { slug: string; file: string; folder: boolean };

// pnpm dev에서는 Draft도 주소로 열어 미리 볼 수 있다. 목록·RSS·사이트맵과 빌드(배포) 결과에는 나오지 않는다.
// 또 글을 고치고 새로고침하면 바로 보이도록 개발 서버에서는 읽은 글을 캐시하지 않는다.
const DEV = process.env.NODE_ENV === "development";

// 한국어 기준 분당 약 500자로 읽는 시간을 어림한다. 코드 블록, import 줄, 스스로 닫는 컴포넌트(<Chart ... />, 여러 줄이어도)는 뺀다.
function readingMinutes(content: string): number {
  const text = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^import .*$/gm, "")
    .replace(/^<[A-Z][^>]*\/>[ \t]*$/gm, "")
    .replace(/\s+/g, "");
  return Math.max(1, Math.round(text.length / 500));
}

function listSources(): PostSource[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const sources = fs.readdirSync(POSTS_DIR, { withFileTypes: true }).flatMap((entry): PostSource[] => {
    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      return [{ slug: entry.name.replace(/\.mdx$/, ""), file: path.join(POSTS_DIR, entry.name), folder: false }];
    }
    const index = path.join(POSTS_DIR, entry.name, "index.mdx");
    if (entry.isDirectory() && fs.existsSync(index)) return [{ slug: entry.name, file: index, folder: true }];
    return [];
  });
  const seen = new Set<string>();
  for (const { slug } of sources) {
    if (seen.has(slug)) throw new Error(`글 주소가 겹칩니다: content/posts/${slug}.mdx와 content/posts/${slug}/index.mdx 중 하나만 두세요.`);
    seen.add(slug);
  }
  return sources;
}

function readPost({ slug, file, folder }: PostSource): Post | null {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const draft = Boolean(data.draft);
  if (draft && !DEV) return null;
  return {
    slug,
    title: String(data.title ?? ""),
    date: normalizeDate(data.date),
    summary: String(data.summary ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingMinutes(content),
    draft,
    folder,
  };
}

let cache: Post[] | null = null;

function loadPosts(): Post[] {
  if (cache) return cache;
  const posts = listSources()
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
    .map(({ draft: _draft, folder: _folder, ...meta }) => meta);
}

// 상세 페이지를 만들 주소. 개발 서버에서는 Draft도 들어가 미리 볼 수 있다.
export function getPostSlugs(): string[] {
  return loadPosts().map((p) => p.slug);
}

export function getPost(slug: string): Post | undefined {
  return loadPosts().find((p) => p.slug === slug);
}
