import type { Metadata } from "next";
import PostList from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Post" };

export default function PostsPage() {
  const posts = getAllPosts();
  const pageCount = Math.max(1, Math.ceil(posts.length / site.postsPerPage));
  return <PostList posts={posts.slice(0, site.postsPerPage)} total={posts.length} page={1} pageCount={pageCount} />;
}
