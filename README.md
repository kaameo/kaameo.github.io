# kaameo.log

Next.js 정적 내보내기로 만든 개인 블로그입니다. `main` 브랜치에 푸시하면 GitHub Actions가 빌드해서 https://kaameo.github.io 에 배포합니다.

## 로컬에서 보기

```bash
pnpm install
pnpm dev
```

http://localhost:3000 에서 확인합니다. 배포될 결과물을 그대로 보려면 `pnpm build` 후 `out/` 폴더를 확인합니다.

## 글 쓰기

`content/posts/글-주소.mdx` 파일을 만듭니다. 파일 이름이 주소가 됩니다 (`/posts/글-주소/`). 감상평(`content/books/`)과 Portfolio 사례(`content/portfolio/`)도 같은 `.mdx`입니다.

`pnpm new:post 글-주소 "글 제목"`을 실행하면 오늘 날짜가 들어간 뼈대 파일이 `draft: true` 상태로 만들어집니다.

```mdx
---
title: 글 제목
date: 2026-10-11
summary: 목록에 보일 한두 문장 요약
tags: [react, nextjs]
draft: false
---

본문은 마크다운으로 씁니다. `## 소제목`에는 링크 복사 아이콘이 붙고,
언어를 적은 코드 블록(```ts)에는 색 구분과 복사 버튼이 붙습니다.
```

`draft: true`로 두면 사이트에 나오지 않습니다. 다만 초안도 빌드 때 컴파일되므로, MDX 문법이 틀린 초안이 있으면 배포 빌드가 멈춥니다. 커밋 전에 `pnpm dev`에서 열어 확인합니다.

`.mdx`는 마크다운 안에 JSX를 쓸 수 있는 형식이라, 코드 밖에서 글자 바로 앞에 붙은 `<`(예: `Map<String>`)와 `{`는 JSX로 읽힙니다. `p99 < 200ms`처럼 뒤에 공백이 있는 `<`는 괜찮습니다. 글자로 쓰려면 백틱으로 감싸거나 `\<`, `\{`로 씁니다. 틀리면 빌드가 멈춥니다.

### 그림 넣기

사진·캡처 같은 이미지 파일은 `public/posts/글-주소/`에 두고 `![설명](/posts/글-주소/파일.png)`으로 넣습니다. 설명(대체 텍스트)은 화면에 보이지 않고 화면 낭독기가 읽습니다. 한 문단에 두 장을 붙여 쓰면(`![a](x) ![b](y)`) 나란히 놓입니다.

그림 밑에 캡션을 달려면 이미지 다음에 빈 줄을 하나 두고 `<small>캡션</small>`을 씁니다. 회색 작은 글씨로 그림에 붙고, 안에서 `[링크](주소)`도 쓸 수 있습니다. 빈 줄 없이 붙여 쓰면 이미지와 한 문단이 되어, 나란히 놓은 사진 옆에 캡션이 끼어듭니다.

```mdx
![사이버캡](/posts/글-주소/a.png) ![사이버캡 내부](/posts/글-주소/b.png)

<small>사진: Dllu, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.ko), 위키미디어 공용</small>
```

그래프·배치도 같은 그림은 컴포넌트로 그려 본문에 넣습니다. 그 글에서만 쓰는 그림이면 파일 하나 대신 폴더를 만들고 본문을 `index.mdx`에 씁니다. 주소는 폴더 이름입니다.

```
content/posts/글-주소/
  index.mdx        본문
  MyFigure.tsx     이 글에서만 쓰는 그림
  data.ts          그림에 넣을 값(선택)
```

```mdx
import MyFigure from "./MyFigure";
import { latency } from "./data";

본문은 마크다운으로 씁니다.

<MyFigure {...latency} />
```

- 예시: `content/posts/ai-hiring-triangle/`(SVG 그림), `content/posts/graalvm-native-image-migration/`(가로 누적 막대 그래프 `Chart`, 노드별 배치도 `Cluster`).
- 그림에 넣을 값이 길면 `data.ts`에 타입을 붙여 둡니다. MDX 안에 직접 쓴 props는 타입 검사를 받지 않습니다.
- 그림은 `src/components/Figure.tsx`로 감싸면 테두리·제목·설명이 그래프와 같은 모양이 됩니다.
- 그 그림에만 쓰는 스타일은 같은 폴더의 `그림이름.module.css`(CSS Modules)에 둡니다. `globals.css`에는 여러 글이 같이 쓰는 스타일만 둡니다.
- 색은 `var(--fg)`, `var(--muted)`, `var(--line)`, `var(--chart-1)`~`var(--chart-4)`를 `style`로 주면 다크 모드를 따라갑니다. 빌드 때 HTML로 그려져 JS가 없습니다.
- 슬라이더처럼 상태가 있는 그림은 그 파일 맨 위에 `"use client"`를 붙입니다. MDX 본문 안에서는 클라이언트 컴포넌트를 만들 수 없습니다.
- 같은 그림을 세 번째 글에서도 쓰게 되면 그때 `src/components`로 옮기고, 각 글에서는 `@/components/...`로 import합니다.

`pnpm dev`에서는 `draft: true`인 글도 주소로 열 수 있습니다(목록에는 나오지 않고, 제목 아래에 "초안" 표시가 붙습니다). 빌드 결과에는 들어가지 않습니다.

## 내용 바꾸기

| 바꿀 것 | 파일 |
| --- | --- |
| 블로그 이름, 소개, GitHub 주소, 이메일 | `src/lib/site.ts` |
| Resume (이력서 저장소 `resume.html`과 같은 내용) | `src/data/resume.ts` |
| Portfolio 프로젝트 개요와 순서 | `src/data/projects.ts` |
| Portfolio 사례(Case) | `content/portfolio/*.mdx` |
| 사례 본문 이미지 | `public/portfolio/` |
| Home 프로필 사진 | `public/profile.jpg` 파일을 넣으면 자동으로 보입니다 |

사례 파일 하나가 Portfolio 상세 페이지 하나입니다. Portfolio 요약과 사례 상세에는 모든 사례가 담긴 사이드바가 붙습니다(`src/app/portfolio/layout.tsx`). frontmatter는 다음과 같이 씁니다.

```yaml
---
title: "GraalVM Native Image로 고객센터 앱 메모리 할당량 43% 절감"
project: hapbang # src/data/projects.ts의 slug
order: 2         # 같은 프로젝트 안에서의 순서
---
```

본문은 `## 문제 상황`, `## 접근 방식`, `## 해결 및 성과`, `## 참고` 순서로 씁니다. 프로젝트 전체 구조나 회고처럼 이 순서를 따르지 않는 기록도 사례 파일로 둘 수 있습니다. 상세 페이지 설명은 본문의 첫 문단이나 첫 목록에서 가져옵니다. 이미지는 `![설명](/portfolio/파일.png)`로 넣고, 한 문단에 두 장을 붙여 쓰면 나란히 놓입니다.

사례의 `project`가 `src/data/projects.ts`에 없는 값을 가리키면 빌드가 실패합니다.

화면 오른쪽 아래 도구 막대의 인쇄 아이콘으로 인쇄 창을 열고 "PDF로 저장"을 고르면 지금 페이지를 PDF로 받을 수 있습니다. 인쇄할 때는 메뉴, 사이드바, 도구 막대가 빠집니다. Resume는 화면을 그대로 89%로 줄여 찍어서 A4 두 장에 들어가고(본문 10pt), PDF가 화면과 같은 비율로 보입니다(`globals.css`의 인쇄 규칙).

## 댓글 (giscus)

이 저장소의 Discussions(`Announcements` 카테고리)에 `pathname` 매핑으로 연결되어 있습니다. 설정은 `src/lib/site.ts`의 `giscus`에 있습니다. 글 파일 이름을 바꾸면 주소가 바뀌어 기존 댓글과 연결이 끊기니 주의합니다.

## 배포

1. GitHub에 `kaameo.github.io` 저장소를 만들고 이 폴더를 `main` 브랜치로 푸시합니다.
2. 저장소 Settings → Pages → Build and deployment의 Source를 **GitHub Actions**로 바꿉니다.
3. 이후 `main`에 푸시할 때마다 `.github/workflows/deploy.yml`이 자동으로 배포합니다. 설치 전에 `pnpm audit`로 high 이상 취약점을 검사하고, 걸리면 배포하지 않습니다. PR에서는 빌드만 확인합니다.

의존성과 Actions 버전은 Dependabot(`.github/dependabot.yml`)이 매주 PR로 올립니다. Actions는 커밋 SHA로 고정해 두었으니 손으로 버전을 바꿀 때도 SHA와 뒤의 `# vX.Y.Z` 주석을 함께 바꿉니다.
