import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { projects, type Project } from "@/data/projects";

const PORTFOLIO_DIR = path.join(process.cwd(), "content", "portfolio");

// 하나의 Project에서 문제 상황 → 접근 방식 → 해결 및 성과로 정리한 기록. 상세 페이지 하나가 Case 하나다.
export type Case = {
  slug: string;
  title: string;
  project: Project;
  order: number;
  // 상세 페이지 설명과 llms.txt에 쓰는 첫 문단(보통 문제 상황)
  summary: string;
};

// 제목·이미지·목록·표·import 줄·컴포넌트(<Figure ... />)를 건너뛴 첫 문단을 링크와 강조 기호 없이 한 줄로 만든다.
function firstParagraph(markdown: string): string {
  const block = markdown
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|!\[|-|\||import |export |<)/.test(b));
  return (block ?? "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "")
    .replace(/\s+/g, " ");
}

function readCase(file: string): Case {
  const raw = fs.readFileSync(path.join(PORTFOLIO_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const project = projects.find((p) => p.slug === data.project);
  // 오타로 Case가 조용히 사라지지 않게 빌드를 멈춘다.
  if (!project) throw new Error(`content/portfolio/${file}: project "${data.project}"가 src/data/projects.ts에 없습니다.`);
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: String(data.title ?? ""),
    project,
    order: Number(data.order ?? 0),
    summary: firstParagraph(content),
  };
}

// Project 순서(src/data/projects.ts), 그 안에서는 order 순.
export function getAllCases(): Case[] {
  if (!fs.existsSync(PORTFOLIO_DIR)) return [];
  return fs
    .readdirSync(PORTFOLIO_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(readCase)
    .sort((a, b) => projects.indexOf(a.project) - projects.indexOf(b.project) || a.order - b.order);
}

export function getCase(slug: string): Case | undefined {
  return getAllCases().find((c) => c.slug === slug);
}
