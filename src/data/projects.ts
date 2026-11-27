// Portfolio에 보여 줄 Project 개요. 배열 순서가 요약 페이지와 사이드바의 순서다.
// 이력서 저장소의 work_experience.md와 portfolio.md를 옮겼다.
// content/portfolio/*.mdx Case의 project 값이 여기 slug와 같아야 한다.

type Link = { label: string; href: string };

export type Project = {
  slug: string;
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

export const projects: Project[] = [
  {
    slug: "sentivex",
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
