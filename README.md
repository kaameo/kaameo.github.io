# kaameo.log

Next.js 정적 내보내기로 만든 개인 블로그입니다. `main` 브랜치에 푸시하면 GitHub Actions가 빌드해서 https://kaameo.github.io 에 배포합니다.

## 로컬에서 보기

```bash
pnpm install
pnpm dev
```

http://localhost:3000 에서 확인합니다. 배포될 결과물을 그대로 보려면 `pnpm build` 후 `out/` 폴더를 확인합니다.

## 글 쓰기

`content/posts/글-주소.md` 파일을 만듭니다. 파일 이름이 주소가 됩니다 (`/posts/글-주소/`).

```md
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

`draft: true`로 두면 사이트에 나오지 않습니다.

## 내용 바꾸기

| 바꿀 것 | 파일 |
| --- | --- |
| 블로그 이름, 소개, About, GitHub 주소, 이메일 | `src/lib/site.ts` |
| Resume | `src/data/resume.ts` |
| Portfolio 회사 목록과 순서 | `src/data/companies.ts` |
| Portfolio 프로젝트, 트러블슈팅 | `content/portfolio/*.md` |
| Home 프로필 사진 | `public/profile.jpg` 파일을 넣으면 자동으로 보입니다 |

Portfolio 파일은 `company`가 `companies.ts`의 `key`와 같아야 하고, `type`은 `project` 또는 `troubleshooting`입니다.

## 댓글 (giscus)

이 저장소의 Discussions(`Announcements` 카테고리)에 `pathname` 매핑으로 연결되어 있습니다. 설정은 `src/lib/site.ts`의 `giscus`에 있습니다. 글 파일 이름을 바꾸면 주소가 바뀌어 기존 댓글과 연결이 끊기니 주의합니다.

## 배포

1. GitHub에 `kaameo.github.io` 저장소를 만들고 이 폴더를 `main` 브랜치로 푸시합니다.
2. 저장소 Settings → Pages → Build and deployment의 Source를 **GitHub Actions**로 바꿉니다.
3. 이후 `main`에 푸시할 때마다 `.github/workflows/deploy.yml`이 자동으로 배포합니다.
