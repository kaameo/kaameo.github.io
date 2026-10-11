// 날짜는 frontmatter에 YYYY-MM-DD로 적는다.
export function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

export function formatDot(date: string): string {
  return date.replaceAll("-", ".");
}

export function formatLong(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
