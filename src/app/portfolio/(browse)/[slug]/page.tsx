import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseArticle from "@/components/CaseArticle";
import { getAllCases, getCase } from "@/lib/portfolio";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllCases().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const item = getCase((await params).slug);
  if (!item) return {};
  return { title: item.title, description: item.summary };
}

// Case 상세. 다른 Case로는 Portfolio 사이드바((browse)/layout.tsx)에서 바로 간다.
export default async function CasePage({ params }: { params: Promise<Params> }) {
  const item = getCase((await params).slug);
  if (!item) notFound();

  return <CaseArticle item={item} />;
}
