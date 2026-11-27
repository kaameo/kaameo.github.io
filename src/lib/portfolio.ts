import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { projects, type Project } from "@/data/projects";

const PORTFOLIO_DIR = path.join(process.cwd(), "content", "portfolio");

// 하나의 Project에서 문제 상황 → 접근 방식 → 해결 및 성과로 정리한 기록. 상세 페이지 하나가 Case 하나다.
// Project 전체 구조나 회고처럼 이 순서를 따르지 않는 기록도 같은 상세 페이지로 둔다.
export type Case = {
  slug: string;
  // 짧은 주제 이름(예: "EKS 클러스터 재설계"). 요약 목록, 사이드바, 상세 페이지 제목이 같은 이름을 쓴다. 결과는 highlights에 쓴다.
  title: string;
  project: Project;
  order: number;
  // 기술·주제 태그. Case 상세 머리에 둔다.
  tags: string[];
  // 이 Case에서 내가 맡은 범위(예: "단독 설계·구현", "팀 내 담당"). 상세 페이지 머리 위 줄에 기간 다음으로 둔다. 없으면 두지 않는다.
  role?: string;
  // "문제 → 결과"를 짧게 쓴 한두 문장(한 줄 마크다운, 굵게는 결과 수치에만, 링크 없이). Resume 불릿(결과 중심)과 같은 문장을 피한다.
  // 요약 페이지에서는 "제목: 성과" 한 줄, 상세 페이지에서는 제목 아래 불릿.
  highlights: string[];
  // 문제 상황 → 접근 방식 → 해결 및 성과 순서가 아닌 기록(전체 구조, 회고)을 따로 묶는 작은 제목. 없으면 주요 사례다.
  group?: string;
  // 상세 페이지 설명과 llms.txt에 쓰는 첫 문단이나 첫 목록(보통 문제 상황)
  summary: string;
};

// 제목·이미지·표·import 줄·컴포넌트(<Figure ... />)를 건너뛴 첫 블록을 링크와 강조 기호(<strong> 포함) 없이 한 줄로 만든다.
// 문제 상황을 개조식으로 쓴 Case는 첫 블록이 목록이라, 목록 기호를 떼고 항목들을 이어 붙인다.
function firstParagraph(markdown: string): string {
  const block = markdown
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|!\[|\||import |export |<)/.test(b));
  return (block ?? "")
    .replace(/^- /gm, "")
    .replace(/<\/?[a-z]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "")
    .replace(/\s+/g, " ");
}

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

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
    tags: strings(data.tags),
    role: data.role ? String(data.role) : undefined,
    highlights: strings(data.highlights),
    group: data.group ? String(data.group) : undefined,
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

// Case 묶음. label이 없으면 주요 사례, 있으면 그 아래 작은 제목(예: 기타)으로 따로 묶인 Case들이다.
export type CaseGroup<T> = { label?: string; cases: T[] };

// Case를 묶음으로 나눈다. 주요 사례(group 없음)가 먼저, 그다음 group이 처음 나온 순서대로. 묶음 안에서는 원래 순서.
// Portfolio 요약과 사이드바가 같은 묶음을 쓴다.
export function groupCases<T extends { group?: string }>(cases: T[]): CaseGroup<T>[] {
  const groups: CaseGroup<T>[] = [];
  for (const item of [...cases.filter((c) => !c.group), ...cases.filter((c) => c.group)]) {
    const group = groups.find((g) => g.label === item.group);
    if (group) group.cases.push(item);
    else groups.push({ label: item.group, cases: [item] });
  }
  return groups;
}

// Project마다 그 Case 목록. Portfolio 요약과 사이드바가 같은 순서를 쓴다.
export function getProjectsWithCases(): { project: Project; cases: Case[] }[] {
  const cases = getAllCases();
  return projects.map((project) => ({ project, cases: cases.filter((c) => c.project === project) }));
}
