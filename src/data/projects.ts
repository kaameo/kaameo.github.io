// Portfolio에 보여 줄 Project 개요. 배열 순서가 화면 순서다.
// 이력서 저장소의 work_experience.md(Company의 Project)와 portfolio.md(그 밖의 Project)를 옮겼다.
// content/portfolio/*.md Case의 project 값이 여기 slug와 같아야 한다.

type Link = { label: string; href: string };

export type Project = {
  slug: string;
  // experience: Company에서 한 Project, project: 교육과정·개인 작업 등 그 밖의 Project
  section: "experience" | "project";
  title: string;
  subtitle: string;
  period: string;
  overview: string;
  role: string;
  tech: string;
  links: Link[];
};

export const projects: Project[] = [
  {
    slug: "sentivex",
    section: "experience",
    title: "Sentivex",
    subtitle: "㈜인브릿지",
    period: "2025. 06 - 2026. 07",
    overview: "여러 보안 벤더의 로그를 수집/분석하여 AI 보고서를 생성하는 B2B SaaS",
    role: "NestJS 백엔드 설계/개발, AI 보고서 기능 개발, 데이터 수집 플랫폼과 AWS EKS 인프라 설계/구축/운영, CI/CD 구축",
    tech: "Go, NestJS, Next.js, PostgreSQL, Prisma, Redis, Kafka, OpenSearch, AWS (EKS, ALB), Terraform, GitHub Actions, Prometheus, Grafana",
    links: [],
  },
  {
    slug: "teams-addin",
    section: "experience",
    title: "Microsoft Teams Add-in",
    subtitle: "㈜인브릿지",
    period: "2025. 03 - 2025. 05",
    overview: "Microsoft Teams의 통화/미팅을 자동 녹취하고 LLM으로 요약하는 Add-in",
    role: "서비스 백엔드/프론트엔드 개발, 통화 도메인 모델 재설계",
    tech: "React, Node.js, Express, PostgreSQL, Docker, GitHub",
    links: [],
  },
  {
    slug: "hapbang",
    section: "project",
    title: "합방",
    subtitle: "프로그래머스 백엔드 심화 8기",
    period: "2026. 10 - 2026. 11",
    overview:
      "인플루언서 출연 요청을 중개하고, 인증된 인플루언서의 강의를 판매하는 HP(플랫폼 재화) 기반 플랫폼. 교육과제의 MSA 요구사항에 따라 멀티모듈 모놀리스를 7개 서비스로 분리",
    role: "강의 거래 모듈 개발, 서비스 간 HTTP/Kafka 연동 설계와 적용, k3s 인프라와 CI/CD, 관측성 구축, 프론트엔드 병행 (백엔드 5명)",
    tech: "Java 25, Spring Boot 4, PostgreSQL, Kafka, Redis, k3s, Envoy Gateway, GraalVM Native Image, AWS EC2, S3, Prometheus, Loki, Tempo, Grafana, GitHub Actions, React 19",
    links: [
      { label: "서비스", href: "https://hapbang.duckdns.org/" },
      { label: "GitHub", href: "https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/" },
    ],
  },
  {
    slug: "sidecar",
    section: "project",
    title: "Sidecar",
    subtitle: "오픈소스 Maintainer",
    period: "2026. 10 - now",
    overview: "Claude Code 옆 pane에서 AI의 질문에 버튼으로 답하고, 세션 요약을 보여 주는 Claude Code 플러그인(Mods)",
    role: "멀티 세션 개발 흐름의 불편을 해결하려고 개발, 합방 파이널 프로젝트 팀원 3명에게 공유",
    tech: "TypeScript, Claude Code mods",
    links: [{ label: "GitHub", href: "https://github.com/kaameo-lab/sidecar" }],
  },
];
