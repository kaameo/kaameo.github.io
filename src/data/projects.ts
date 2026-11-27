// Portfolio에 보여 줄 Company 소개와 Project 개요. 배열 순서가 화면 순서다.
// 이력서 저장소의 work_experience.md(Company와 그 Project)와 portfolio.md(그 밖의 Project)를 옮겼다.
// content/portfolio/*.mdx Case의 project 값이 여기 slug와 같아야 한다.

type Link = { label: string; href: string };

// Experience 섹션 맨 위에 두는 Company 소개. items는 한 줄 마크다운(**굵게** 등)이다.
export type Company = { name: string; role: string; period: string; items: string[] };

export type Project = {
  slug: string;
  // experience: Company에서 한 Project, project: 교육과정·개인 작업 등 그 밖의 Project
  section: "experience" | "project";
  title: string;
  subtitle: string;
  period: string;
  overview: string;
  team?: string;
  // 여러 줄이면 목록으로 보인다.
  role: string | string[];
  tech: string;
  links: Link[];
};

// Portfolio 제목 옆 다운로드 버튼. 이력서 저장소의 work_experience.html, portfolio.html을 Chrome으로 출력한 PDF를 고치지 않고 그대로 둔다.
export const pdfs: Link[] = [
  { label: "경력기술서 PDF", href: "/hong-jinsu_work-experience.pdf" },
  { label: "포트폴리오 PDF", href: "/hong-jinsu_portfolio.pdf" },
];

export const companies: Company[] = [
  {
    name: "㈜인브릿지",
    role: "개발팀 인턴 → 연구원 (Backend Engineer)",
    period: "2025. 03 - 2026. 07 (1년 5개월, 인턴 6개월 포함)",
    items: [
      "(인턴) Microsoft Teams 통화/미팅 녹취 및 LLM 요약 제공 서비스, Node.js 백엔드와 React 프론트엔드 개발",
      "2025. 06부터 Sentivex 프로젝트의 수집 플랫폼, 서비스 백엔드, 운영 인프라 담당",
      "2025. 09 **연구원으로 전환**해 계속 근무",
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "sentivex",
    section: "experience",
    title: "Sentivex",
    subtitle: "㈜인브릿지",
    period: "2025. 06 - 2026. 07",
    overview: "여러 보안 벤더의 로그를 수집/분석하여 AI 보고서를 생성하는 B2B SaaS",
    team: "7명 (프론트엔드 3명, 백엔드 4명)",
    role: [
      "수집 플랫폼: 멀티테넌트 데이터 수집 플랫폼을 설계부터 구현, 운영까지 단독으로 담당",
      "서비스 백엔드: 공통 인증/인가와 테넌트 격리를 담당하는 NestJS 코어 백엔드 설계, 변경이 잦은 수집 플랫폼과 AI 서비스 분리",
      "AI 보고서: 보안 담당자가 직접 작성하던 보안 사건 보고서를 LLM API로 생성하는 기능 설계, 구현",
      "인프라: AWS EKS 운영 클러스터 비용 최적화, GitHub Actions CI/CD와 Prometheus/Grafana 모니터링 구축",
    ],
    tech: "Go, NestJS, PostgreSQL, Prisma, Redis, Kafka, AWS EKS, GitHub Actions, Prometheus, Grafana",
    links: [],
  },
  {
    slug: "hapbang",
    section: "project",
    title: "합방",
    subtitle: "K-Digital Training 5인 팀 프로젝트, 우수상",
    period: "2026. 10 - 2026. 11",
    overview:
      "인플루언서 출연 요청을 중개하고, 인증된 인플루언서의 강의를 판매하는 포인트 기반 플랫폼. 교육과제의 MSA 요구사항에 따라 멀티모듈 모놀리스를 7개 서비스로 분리",
    role: "강의 거래 모듈 개발, 서비스 간 HTTP/Kafka 연동 설계와 적용, k3s 인프라와 CI/CD, 관측성 구축, 프론트엔드 병행 (백엔드 5명)",
    tech: "Java 25, Spring Boot 4, PostgreSQL, Kafka, Redis, k3s, Envoy Gateway, GraalVM Native Image, AWS EC2, S3, Prometheus, Loki, Tempo, Grafana, GitHub Actions, React",
    links: [
      { label: "서비스", href: "https://hapbang.duckdns.org/" },
      { label: "GitHub", href: "https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/" },
    ],
  },
  {
    slug: "sidecar",
    section: "project",
    title: "Sidecar",
    subtitle: "개인 오픈소스 프로젝트",
    period: "2026. 10 - now",
    overview:
      "Claude Code 패널에서 AI 에이전트의 질문을 버튼으로 답하고, 세션 요약을 보여 주는 플러그인(Mods), 병렬 세션 개발 흐름의 불편을 해결하기 위해 개발, 합방 프로젝트 팀원 3명에게 공유",
    role: "플러그인 단독 설계, 개발",
    tech: "TypeScript, Claude Code Mods",
    links: [{ label: "GitHub", href: "https://github.com/kaameo-lab/sidecar" }],
  },
];
