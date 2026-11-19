<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`kaameo/kaameo.github.io`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `docs/GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.

## 콘텐츠 (MDX)

- 본문은 모두 `content/**/*.mdx`다. 그 글에서만 쓰는 컴포넌트가 있으면 `content/posts/<slug>/index.mdx` 폴더에 컴포넌트·`data.ts`·`*.module.css`를 함께 둔다. 세 번째 글에서 또 쓰면 `src/components`로 옮긴다. 자세한 규칙은 README "글 쓰기".
- `next.config.ts`의 MDX 플러그인은 Turbopack 때문에 패키지 이름 문자열과 JSON 옵션만 넘길 수 있다. 함수는 넘길 수 없다.
- 본문 import 경로는 `src/lib/mdx.ts`에 글자 그대로 적는다(Turbopack은 변수로 만든 경로를 처리하지 못한다). 목록·RSS가 쓰는 `posts.ts` 등에는 넣지 않는다.
- `draft: true`인 글도 빌드 때 컴파일된다. 초안의 MDX 문법 오류는 배포 빌드를 멈추고, 초안 폴더의 `"use client"` 코드는 정적 JS에 들어간다.
- MDX에서 코드 밖의 `<글자`(예: `Map<String>`)와 `{`는 JSX로 읽힌다. 백틱으로 감싼다.

## 확인 방법

- `pnpm typecheck && pnpm build`로 확인한다. 렌더링을 건드리는 리팩터링은 변경 전후 `out/`의 HTML을 `<script>`와 `<link>`를 빼고 비교한다.
- 같은 폴더에 `next dev`가 이미 떠 있으면, 포트를 바꿔도 두 번째 `pnpm dev`는 뜨지 않는다. 떠 있는 서버(:3000)를 쓴다.
