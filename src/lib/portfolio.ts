import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { companies } from "@/data/companies";

const PORTFOLIO_DIR = path.join(process.cwd(), "content", "portfolio");

export type PortfolioItem = {
  slug: string;
  title: string;
  company: string;
  type: "project" | "troubleshooting";
  period: string;
  tech: string[];
  highlights: string[];
  summary: string;
  github: string;
  demo: string;
  order: number;
  content: string;
};

function readItem(file: string): PortfolioItem {
  const raw = fs.readFileSync(path.join(PORTFOLIO_DIR, file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title ?? ""),
    company: String(data.company ?? ""),
    type: data.type === "troubleshooting" ? "troubleshooting" : "project",
    period: String(data.period ?? ""),
    tech: Array.isArray(data.tech) ? data.tech.map(String) : [],
    highlights: Array.isArray(data.highlights) ? data.highlights.map(String) : [],
    summary: String(data.summary ?? ""),
    github: String(data.github ?? ""),
    demo: String(data.demo ?? ""),
    order: Number(data.order ?? 0),
    content,
  };
}

const companyIndex = (key: string) => {
  const i = companies.findIndex((c) => c.key === key);
  return i === -1 ? companies.length : i;
};

export function getAllPortfolio(): PortfolioItem[] {
  if (!fs.existsSync(PORTFOLIO_DIR)) return [];
  return fs
    .readdirSync(PORTFOLIO_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readItem)
    .sort((a, b) => companyIndex(a.company) - companyIndex(b.company) || a.order - b.order);
}

export function getPortfolioItem(slug: string): PortfolioItem | undefined {
  return getAllPortfolio().find((item) => item.slug === slug);
}

export function getCompanyName(key: string): string {
  return companies.find((c) => c.key === key)?.name ?? key;
}
