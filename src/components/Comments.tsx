"use client";

import { useEffect, useState } from "react";
import Giscus from "@giscus/react";
import { site } from "@/lib/site";

// 사이트 테마가 바뀌면 giscus 테마도 따라 바꾼다.
function useSiteTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export default function Comments() {
  const theme = useSiteTheme();
  const { repo, repoId, category, categoryId } = site.giscus;

  if (!repoId || !categoryId) {
    return <p className="comments-empty">giscus 설정을 마치면 댓글이 여기에 표시됩니다. (src/lib/site.ts)</p>;
  }

  return (
    <Giscus
      repo={repo}
      repoId={repoId}
      category={category}
      categoryId={categoryId}
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme}
      lang="ko"
      loading="lazy"
    />
  );
}
