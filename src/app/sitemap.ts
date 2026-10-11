import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllPortfolio } from "@/lib/portfolio";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/posts/", "/resume/", "/portfolio/"].map((p) => ({ url: `${site.url}${p}` }));
  const posts = getAllPosts().map((p) => ({ url: `${site.url}/posts/${p.slug}/`, lastModified: p.date }));
  const portfolio = getAllPortfolio().map((p) => ({ url: `${site.url}/portfolio/${p.slug}/` }));
  return [...pages, ...posts, ...portfolio];
}
