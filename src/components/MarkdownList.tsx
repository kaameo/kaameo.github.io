import { renderInlineMarkdown } from "@/lib/markdown";

// 한 줄 마크다운 문자열들을 회색 • 불릿 목록(.bullets)으로 그린다. className으로 목록마다 간격과 글자 크기를 정한다.
// Resume의 Summary·업무 영역 불릿과 Case 상세 제목 아래 핵심 성과가 쓴다.
export default async function MarkdownList({ items, className }: { items: string[]; className: string }) {
  if (items.length === 0) return null;
  const rendered = await Promise.all(items.map(renderInlineMarkdown));
  return (
    <ul className={`bullets ${className}`}>
      {rendered.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
