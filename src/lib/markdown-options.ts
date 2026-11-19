// .mdx 본문(next.config.ts)과 Resume 마크다운 문자열(src/lib/markdown.tsx)이 같은 GFM 설정을 쓰도록 한곳에 둔다.
// next.config.ts는 이 값을 Turbopack에 넘기므로, 함수 없이 JSON으로 바꿀 수 있는 값만 둔다.

// 취소선은 ~~두 개~~만 인정한다. "23~28초 → 1.10~1.16초"처럼 범위를 나타내는 ~ 두 개가 한 줄에 있으면 취소선으로 바뀌기 때문이다.
export const gfmOptions = { singleTilde: false };
