// Resume 페이지 내용.
// intro, experience.items, projects.description은 마크다운으로 쓴다: **굵게**, [링크](url), `코드`.
// intro는 빈 줄로 문단을 나누고, 문단 안에서 줄만 바꾸려면 줄 끝에 공백 두 칸을 넣는다.
export const resume = {
  name: "홍진수",
  intro: `백엔드 애플리케이션과 AWS/Kubernetes 기반 운영 인프라를 함께 다뤄 온 엔지니어입니다.

보안 로그 분석 도메인에서 대규모 데이터 수집 플랫폼을 개발하며 데이터 정합성, 확장성, 장애 복구 흐름을 개선했습니다.

AI 도구를 활용해 문서화와 지식 정리 속도를 높이고, 팀의 반복 업무를 줄이는 데 기여합니다.`,
  linkedin: "https://www.linkedin.com/in/jinsu-hong",
  experience: [
    {
      company: "㈜인브릿지",
      period: "2025.03 - 2026.07",
      role: "Software Engineer (연구원, 2025.09 - 2026.07), Internship (2025.03 - 2025.08)",
      items: [
        "보안 로그 수집·분석 플랫폼: API 서버와 인증/인가 시스템 구축, Hub & Spoke 구조로 모듈 간 의존성 최소화",
        "서로 다른 데이터 수집 방식을 공통 adapter 인터페이스로 추상화해 신규 벤더 수집을 쉽게 추가할 수 있도록 설계",
        "at-least-once 전달과 멱등 처리를 결합해 중복 없는 수집 파이프라인 설계",
        "수집 제어와 실행 계층을 분리한 분산 수집 아키텍처 설계, Go 기반 수집기 개발, 워커 자동 복구로 수집 연속성 확보",
        "Terraform(IaC)으로 Kubernetes 운영 인프라를 코드화해 서로 다른 배포 환경에 공통 적용, 가용성 구성으로 장애 대응 기반 마련",
        "여러 서비스가 공유하는 공용 CI/CD 파이프라인 설계·운영으로 서비스별 설정 관리 부담 해소",
        "Git 브랜치 전략과 PR 기반 코드 리뷰 체계 담당",
      ],
    },
  ],
  skills: [
    { group: "Backend", items: ["Node.js (NestJS)", "Java (Spring Boot)", "Go"] },
    { group: "Infra & DevOps", items: ["Docker", "Kubernetes", "GitHub Actions"] },
    { group: "Cloud", items: ["AWS"] },
    { group: "Data & Messaging", items: ["PostgreSQL", "MySQL", "Redis", "Apache Kafka", "OpenSearch"] },
    { group: "Frontend", items: ["TypeScript (Next.js, React)"] },
    { group: "AI Tools", items: ["Claude Code", "Codex"] },
    { group: "Collaboration", items: ["Jira", "Confluence", "Notion"] },
  ],
  projects: [
    {
      title: "보안 로그 수집·분석 플랫폼",
      description:
        "보안 로그 수집/정규화 및 위협 탐지·분석 플랫폼. 백엔드, 데이터 파이프라인, 인프라 구축 및 운영 (㈜인브릿지, 2025.06 - 2026.07)",
    },
    {
      title: "통화·회의 녹취 및 AI 요약 서비스",
      description: "통화·회의 녹취록을 자동 생성하고 AI로 요약하는 서비스. 어드민 페이지 및 백엔드 개발 (㈜인브릿지, 2025.03 - 2025.05)",
    }
  ],
  education: [
    { school: "프로그래머스 백엔드 단기심화", period: "2026.09 - 2026.11" },
    { school: "아주대학교, 소프트웨어학과 학사", period: "2023.03 - 2025.08" }
  ],
  certifications: [{ name: "SQL 개발자 (SQLD), 한국데이터산업진흥원", date: "2025.04.04" }],
};
