// Portfolio에 보여 줄 Project. 배열 순서가 요약 페이지와 사이드바의 순서다.
// content/portfolio/*.mdx Case의 project 값이 여기 slug와 같아야 한다.

export type Link = { label: string; href: string };

// 요약 페이지에서는 이름 줄(이름, 부제, 링크, 기간) 아래에 한 줄 설명(description)만 두고 바로 Case 목록이 온다.
// description에는 무엇인지와 내가 맡은 것을 함께 쓴다. 기술은 Case 태그가 보여 준다.
export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  period: string;
  description: string;
  links: Link[];
};

export const projects: Project[] = [
  {
    slug: "sentivex",
    title: "Sentivex",
    subtitle: "인브릿지",
    period: "2025. 06 - 2026. 07",
    description:
      "보안 로그를 수집/분석해 AI 보고서를 만드는 B2B SaaS. 7명 팀(백엔드 4명)에서 수집 플랫폼, 코어 백엔드, AI 보고서, 인프라 담당",
    links: [],
  },
  {
    slug: "hapbang",
    title: "합방",
    subtitle: "K-Digital Training 5인 팀 프로젝트, 우수상",
    period: "2026. 10 - 2026. 11",
    description:
      "인플루언서 출연 요청 중개와 강의 판매를 포인트로 거래하는 플랫폼. 강의 거래 모듈, 서비스 간 HTTP/Kafka 연동, k3s 인프라와 관측성, 프론트엔드 담당",
    links: [
      { label: "서비스", href: "https://hapbang.duckdns.org/" },
      { label: "GitHub", href: "https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/" },
    ],
  },
  {
    slug: "sidecar",
    title: "Sidecar",
    subtitle: "개인 오픈소스 프로젝트",
    period: "2026. 10 - now",
    description:
      "Claude Code 패널에서 AI 에이전트의 질문에 버튼으로 답하고 세션 요약을 보여 주는 플러그인. 단독 개발, 합방 팀원 3명이 사용",
    links: [{ label: "GitHub", href: "https://github.com/kaameo-lab/sidecar" }],
  },
];
