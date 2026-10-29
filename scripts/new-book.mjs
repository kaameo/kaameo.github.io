// 새 감상평 뼈대를 만든다: pnpm new:book <책-주소> [책 제목]
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const [slugArg, ...titleWords] = process.argv.slice(2);

if (!slugArg) {
  console.error('사용법: pnpm new:book <책-주소> ["책 제목"]');
  process.exit(1);
}

const slug = slugArg.replace(/\.md$/, "");
if (/[\s/\\]/.test(slug)) {
  console.error("책 주소에는 공백이나 슬래시를 쓸 수 없습니다. 하이픈(-)으로 이어 주세요.");
  process.exit(1);
}

const file = fileURLToPath(new URL(`../content/books/${slug}.md`, import.meta.url));
if (existsSync(file)) {
  console.error(`이미 있는 책입니다: content/books/${slug}.md`);
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
author: ""
cover: /books/${slug}.jpg
date: "${date}"
link: ""
draft: true
---

## 후기

`,
);

console.log(`만들었습니다: content/books/${slug}.md`);
console.log(`표지는 public/books/${slug}.jpg 에 넣어 주세요. 없으면 빌드가 실패합니다.`);
console.log("다 쓰면 draft: true 줄을 지우거나 false로 바꿔야 사이트에 나옵니다.");
