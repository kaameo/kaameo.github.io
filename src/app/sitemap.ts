import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllPortfolio } from "@/lib/portfolio";
import { getAllBooks } from "@/lib/books";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/posts/", "/resume/", "/portfolio/", "/books/"].map((p) => ({ url: `${site.url}${p}` }));
  const posts = getAllPosts().map((p) => ({ url: `${site.url}/posts/${p.slug}/`, lastModified: p.date }));
  const portfolio = getAllPortfolio().map((p) => ({ url: `${site.url}/portfolio/${p.slug}/` }));
  const books = getAllBooks().map((b) => ({ url: `${site.url}/books/${b.slug}/` }));
  return [...pages, ...posts, ...portfolio, ...books];
}
