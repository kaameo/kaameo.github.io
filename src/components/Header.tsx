"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { GitHubIcon } from "./Icons";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/posts/", label: "Post", match: "/posts" },
  { href: "/resume/", label: "Resume", match: "/resume" },
  { href: "/portfolio/", label: "Portfolio", match: "/portfolio" },
  { href: "/books/", label: "Book", match: "/books" },
];

export default function Header() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="site-header no-print">
      <div className="container">
        <Link href="/" className="brand">
          kaameo<span>.log</span>
        </Link>
        <nav aria-label="메뉴" className="site-nav">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.match);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions">
          <a href={site.github} className="icon-btn" aria-label="GitHub" title="GitHub">
            <GitHubIcon />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
