// 새 글 뼈대를 만든다: pnpm new:post <글-주소> [제목]
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const [slugArg, ...titleWords] = process.argv.slice(2);

if (!slugArg) {
  console.error('사용법: pnpm new:post <글-주소> ["글 제목"]');
  process.exit(1);
}

const slug = slugArg.replace(/\.mdx?$/, "");
if (/[\s/\\]/.test(slug)) {
  console.error("글 주소에는 공백이나 슬래시를 쓸 수 없습니다. 하이픈(-)으로 이어 주세요.");
  process.exit(1);
}

// 그 글에서만 쓰는 컴포넌트가 생기면 content/posts/<글-주소>/index.mdx 폴더 형태로 옮긴다. 둘 중 하나라도 있으면 같은 주소다.
const file = fileURLToPath(new URL(`../content/posts/${slug}.mdx`, import.meta.url));
const folder = fileURLToPath(new URL(`../content/posts/${slug}`, import.meta.url));
if (existsSync(file) || existsSync(folder)) {
  console.error(`이미 있는 글입니다: content/posts/${slug}`);
  process.exit(1);
}

// 로컬 시간 기준 오늘 날짜 (YYYY-MM-DD)
const now = new Date();
const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  .map((n) => String(n).padStart(2, "0"))
  .join("-");

// JSON 문자열은 그대로 YAML 큰따옴표 문자열로 쓸 수 있다.
const title = JSON.stringify(titleWords.join(" ") || slug);

writeFileSync(
  file,
  `---
title: ${title}
date: "${date}"
summary: ""
tags: []
draft: true
---

## 개요

`,
);

console.log(`만들었습니다: content/posts/${slug}.mdx`);
console.log("다 쓰면 draft: true 줄을 지우거나 false로 바꿔야 사이트에 나옵니다.");
