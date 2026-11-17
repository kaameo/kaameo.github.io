// ```chart·```cluster 같은 그림 블록의 JSON을 읽을 때 쓰는 도구.
// 잘못된 블록은 조용히 넘기지 않고 빌드를 멈춰, 어느 블록의 무엇이 틀렸는지 바로 알 수 있게 한다.

export const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export const optionalString = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

export function specError(kind: string, message: string): never {
  throw new Error(`${kind} 블록: ${message}`);
}

export function parseSpecObject(kind: string, source: string): Record<string, unknown> {
  let raw: unknown;
  try {
    raw = JSON.parse(source);
  } catch (e) {
    specError(kind, `JSON을 읽지 못했습니다. ${(e as Error).message}`);
  }
  if (!isObject(raw)) specError(kind, "최상위는 객체여야 합니다.");
  return raw;
}

export const formatNumber = new Intl.NumberFormat("ko-KR").format;
