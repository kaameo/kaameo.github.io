import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

type Params = { page: string };

function pageCount() {
  return Math.max(1, Math.ceil(getAllPosts().length / site.postsPerPage));
}

export const dynamicParams = false;

// 1페이지는 /posts/ 에서 보여주므로 2페이지부터 만든다.
export function generateStaticParams(): Params[] {
  const count = pageCount();
  // 정적 내보내기는 빈 목록을 허용하지 않아, 글이 적을 때도 2페이지 자리는 만들어 두고 404로 보낸다.
  if (count < 2) return [{ page: "2" }];
  return Array.from({ length: count - 1 }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { page } = await params;
  return { title: `Post · ${page}페이지` };
}

export default async function PostsPageN({ params }: { params: Promise<Params> }) {
  const page = Number((await params).page);
  const count = pageCount();
  if (!Number.isInteger(page) || page < 2 || page > count) notFound();

  const posts = getAllPosts();
  const start = (page - 1) * site.postsPerPage;
  return (
    <PostList posts={posts.slice(start, start + site.postsPerPage)} total={posts.length} page={page} pageCount={count} />
  );
}
