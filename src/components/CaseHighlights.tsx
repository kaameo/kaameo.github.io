import { renderInlineMarkdown } from "@/lib/markdown";

// Case의 핵심 성과 한두 줄(frontmatter highlights). Portfolio 요약의 Case 제목 아래와 Case 상세 제목 아래에 같은 내용을 둔다.
export default async function CaseHighlights({ items, className }: { items: string[]; className: string }) {
  if (items.length === 0) return null;
  const rendered = await Promise.all(items.map(renderInlineMarkdown));
  return (
    <ul className={className}>
      {rendered.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
