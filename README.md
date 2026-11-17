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

`pnpm new:post 글-주소 "글 제목"`을 실행하면 오늘 날짜가 들어간 뼈대 파일이 `draft: true` 상태로 만들어집니다.

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

### 그래프 넣기

언어를 `chart`로 적은 코드 블록에 JSON을 쓰면 가로 누적 막대 그래프로 그려집니다. 빌드 때 HTML로 그려지고 다크 모드를 따라갑니다. Obsidian이나 GitHub에서는 그냥 코드 블록으로 보입니다.

````md
```chart
{
  "title": "그래프 제목",
  "unit": "MiB",
  "series": [
    { "name": "heap 사용" },
    { "name": "heap 상한까지 빈 공간", "track": true },
    { "name": "off-heap" }
  ],
  "rows": [
    { "label": "billing", "values": [95, 166, 285], "limit": 448 }
  ],
  "caption": "그래프 아래에 붙일 설명(선택)"
}
```
````

- `series`는 순서대로 색이 정해집니다(색이 있는 series는 4개까지). `"track": true`는 바로 앞 series의 비어 있는 부분이라 같은 색을 옅게 씁니다.
- `values`는 `series`와 같은 순서와 개수로 씁니다. `limit`(선택)을 주면 세로선과 초과량이 표시됩니다. 선 이름은 `limitLabel`로 바꿀 수 있습니다(기본값 `limit`).
- JSON이 틀리면 빌드가 멈추고 어디가 틀렸는지 알려 줍니다.

### 배치도 넣기

언어를 `cluster`로 적으면 노드(서버)마다 카드 하나를 그리고, 그 안에 묶음별로 pod를 나열합니다. 넓은 화면에서는 카드가 나란히 놓입니다.
노드에 `capacity`를 주면 pod를 `value`에 비례하는 블록으로 이어 붙인 막대도 그립니다.

````md
```cluster
{
  "title": "배치도 제목",
  "unit": "Mi",
  "valueLabel": "limit 합계",
  "capacityLabel": "할당 가능",
  "restLabel": "그 밖의 pod·빈 자리",
  "entry": ["인터넷 (HTTPS 443)", "EIP", "Envoy Gateway proxy"],
  "nodes": [
    {
      "name": "t3.large",
      "details": ["k3s server", "노드 라벨 core-data"],
      "capacity": 7818,
      "groups": [
        { "name": "데이터", "color": 2, "items": [{ "name": "PostgreSQL", "value": 768 }] }
      ]
    }
  ],
  "caption": "그림 아래에 붙일 설명(선택)"
}
```
````

- `entry`(선택)는 요청이 들어오는 길을 화살표로 잇습니다.
- 묶음의 `color`는 1~4(그래프와 같은 색 순서)이고, 빼면 회색입니다. 노드가 달라도 같은 묶음에는 같은 번호를 씁니다.
- `value`(선택)는 숫자로 쓰고 `unit`이 뒤에 붙습니다. `note`(선택)는 이름 옆에 흐리게 붙습니다.
- `capacity`(선택)를 주면 막대 위에 "`valueLabel` 합 / `capacityLabel` 용량 · 비율"이 붙고, 용량까지 남는 부분은 회색 블록(`restLabel`)이 됩니다. 막대 길이는 가장 큰 노드에 맞춰서 노드끼리도 같은 축척입니다.

`pnpm dev`에서는 `draft: true`인 글도 주소로 열 수 있습니다(목록에는 나오지 않고, 제목 아래에 "초안" 표시가 붙습니다). 빌드 결과에는 들어가지 않습니다.

## 내용 바꾸기

| 바꿀 것 | 파일 |
| --- | --- |
| 블로그 이름, 소개, GitHub 주소, 이메일 | `src/lib/site.ts` |
| Resume | `src/data/resume.ts` |
| Resume PDF | `public/hong-jinsu_resume.pdf` (이력서 저장소의 `resume.html`을 Chrome으로 출력. 사진과 PROJECTS 안내는 빼고, EXPERIENCE 안내는 "자세한 내용은 포트폴리오를 참고해 주세요."로 바꿔 `https://kaameo.github.io/portfolio/`에 연결한다) |
| Portfolio 프로젝트 개요와 순서 | `src/data/projects.ts` |
| Portfolio 사례(Case) | `content/portfolio/*.md` |
| 사례 본문 이미지 | `public/portfolio/` |
| Home 프로필 사진 | `public/profile.jpg` 파일을 넣으면 자동으로 보입니다 |

사례 파일 하나가 Portfolio 상세 페이지 하나입니다. frontmatter는 다음과 같이 씁니다.

```yaml
---
title: "GraalVM Native Image로 고객센터 앱 메모리 할당량 43% 절감"
project: hapbang # src/data/projects.ts의 slug
order: 2         # 같은 프로젝트 안에서의 순서
---
```

본문은 `## 문제 상황`, `## 접근 방식`, `## 해결 및 성과`, `## 참고` 순서로 씁니다. 이미지는 `![설명](/portfolio/파일.png)`로 넣고, 한 문단에 두 장을 붙여 쓰면 나란히 놓입니다.

Resume 불릿을 `{ text: "...", case: "사례 파일 이름" }`으로 쓰면 끝에 그 사례로 가는 "자세히 →" 링크가 붙습니다. `project`나 `case`가 없는 값을 가리키면 빌드가 실패합니다.

## 댓글 (giscus)

이 저장소의 Discussions(`Announcements` 카테고리)에 `pathname` 매핑으로 연결되어 있습니다. 설정은 `src/lib/site.ts`의 `giscus`에 있습니다. 글 파일 이름을 바꾸면 주소가 바뀌어 기존 댓글과 연결이 끊기니 주의합니다.

## 배포

1. GitHub에 `kaameo.github.io` 저장소를 만들고 이 폴더를 `main` 브랜치로 푸시합니다.
2. 저장소 Settings → Pages → Build and deployment의 Source를 **GitHub Actions**로 바꿉니다.
3. 이후 `main`에 푸시할 때마다 `.github/workflows/deploy.yml`이 자동으로 배포합니다. 설치 전에 `pnpm audit`로 high 이상 취약점을 검사하고, 걸리면 배포하지 않습니다. PR에서는 빌드만 확인합니다.

의존성과 Actions 버전은 Dependabot(`.github/dependabot.yml`)이 매주 PR로 올립니다. Actions는 커밋 SHA로 고정해 두었으니 손으로 버전을 바꿀 때도 SHA와 뒤의 `# vX.Y.Z` 주석을 함께 바꿉니다.
