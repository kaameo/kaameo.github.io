// Resume 페이지 내용. 이력서 저장소(resume.html)와 같은 내용을 손으로 맞춘다.
// summary와 project.intro는 여러 문단 마크다운(빈 줄로 문단 구분), 불릿(items)은 한 줄 마크다운으로 쓴다: **굵게**, [링크](url), `코드`.
// 불릿을 { text, case }로 쓰면 끝에 Portfolio의 Case(content/portfolio/<case>.mdx)로 가는 "자세히 →" 링크가 붙는다.

type Link = { label: string; href: string };
export type Bullet = string | { text: string; case: string };

// 회사·직책 → 제품 → 업무 영역 → 불릿. 연구원과 인턴처럼 직책이 바뀌면 Employment를 나눈다.
type Work = { title: string; stack: string; items: Bullet[] };
type Product = { name: string; keywords: string; works: Work[] };
type Employment = { company: string; role: string; period: string; products: Product[] };

type Project = { title: string; subtitle: string; period: string; links: Link[]; intro: string; items: Bullet[] };

// 학교, 교육과정, 자격증처럼 이름·기간만 있는 항목.
type Entry = { name: string; subtitle: string; period: string; detail?: string; link?: Link };

type Resume = {
  name: string;
  role: string;
  linkedin: string;
  pdf: string;
  summary: string;
  experience: Employment[];
  projects: Project[];
  skills: { group: string; items: string[] }[];
  education: Entry[];
  etc: Entry[];
};

export const resume: Resume = {
  name: "홍진수",
  role: "Backend Engineer",
  linkedin: "https://www.linkedin.com/in/jinsu-hong",
  // 이력서 저장소의 resume.html을 Chrome으로 출력한 파일. 웹용이라 사진은 빼고, EXPERIENCE 안내는 웹 Resume처럼
  // "자세한 내용은 포트폴리오를 참고해 주세요."(사이트 /portfolio/ 링크)로 바꾸고, PROJECTS 안내는 뺐다.
  pdf: "/hong-jinsu_resume.pdf",

  summary: `Node.js 기반 백엔드와 Go 기반 데이터 수집 플랫폼을 설계하고 운영했습니다. AWS와 Kubernetes 환경에서 안정성과 운영 효율을 개선했고, 최근에는 Java/Spring 기반 프로젝트로 개발 범위를 넓히고 있습니다.

좋은 아키텍처는 비즈니스 이해에서 나온다고 생각합니다. 비즈니스를 이해해야 변경 가능성이 보이고, 변경 가능성을 알아야 설계의 트레이드오프를 판단할 수 있기 때문입니다. 보안 도메인을 처음 접했을 때도 보안팀의 업무 흐름을 익혔습니다.

AI 에이전트를 개발과 검증에 활용합니다. 구현 계획을 검토한 뒤 테스트 기반 구현을 맡기고, 변경 코드와 관련 문서를 대조하는 리뷰를 추가해 결과를 확인합니다.`,

  experience: [
    {
      company: "㈜인브릿지",
      role: "개발팀 연구원 (Backend Engineer)",
      period: "2025. 09 - 2026. 07 (11개월)",
      products: [
        {
          name: "Sentivex",
          keywords: "B2B SaaS, 보안 로그 분석 플랫폼, AI 보고서",
          works: [
            {
              title: "멀티테넌트 수집 플랫폼 설계, 운영",
              stack: "Go, PostgreSQL, Redis Streams, Kafka",
              items: [
                { text: "글로벌 4개 보안 벤더를 지원하는 멀티테넌트 로그 수집 플랫폼 0→1 설계/구축", case: "sentivex-collection-platform" },
                { text: "에러 로그 없이 유실된 수집 작업 80,375건의 원인 규명과 재발 방지", case: "sentivex-redis-streams-loss" },
                { text: "81분간 진행되는 수집을 10분 만에 타임아웃 처리해 반복 재수집되던 문제를 heartbeat로 해결", case: "sentivex-heartbeat-timeout" },
              ],
            },
            {
              title: "서비스 백엔드 설계, 인프라 운영",
              stack: "NestJS, Next.js, PostgreSQL, AWS EKS",
              items: [
                "Hub&Spoke 백엔드 설계, 인증/인가와 테넌트 격리 등 공통 기능을 Hub에 통합, 독립 배포가 필요한 서비스를 Spoke로 분리",
                "LiteLLM 게이트웨이로 사내 AI 호출의 키, 비용, 호출 한도, 로그 일원화",
                "EKS 월 비용 약 52% 절감, 리소스 사용량 분석으로 노드 8 → 3대 축소, 3AZ 구성 유지",
              ],
            },
          ],
        },
      ],
    },
    {
      company: "㈜인브릿지",
      role: "개발팀 인턴",
      period: "2025. 03 - 2025. 08 (6개월)",
      products: [
        {
          name: "Microsoft Teams Add-in",
          keywords: "통화/미팅 녹취, LLM 요약",
          works: [
            {
              title: "도메인 모델 재설계",
              stack: "React, Node.js, Express, PostgreSQL",
              items: [
                "발신자/수신자 모델을 사용자/상대방 + 통화 방향 구조로 재설계, 백엔드와 프론트엔드에 중복된 통화 방향 판별 로직 제거",
              ],
            },
          ],
        },
      ],
    },
  ],

  projects: [
    {
      title: "합방",
      subtitle: "프로그래머스",
      period: "2026. 10 - 2026. 11",
      links: [
        { label: "서비스", href: "https://hapbang.duckdns.org/" },
        { label: "GitHub", href: "https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/" },
      ],
      intro: `백엔드 5명 팀에서 강의 거래 모듈과 프론트엔드 개발을 맡았습니다.

MSA 전환의 서비스 간 연동을 설계하고, k3s 클러스터와 CI/CD, 모니터링 환경을 구축했습니다.`,
      items: [
        { text: "주문/취소/정산 등 7개 처리 과정의 공유 트랜잭션 의존을 멱등 API 재시도, Kafka 이벤트, 보상 처리로 제거", case: "hapbang-shared-transaction" },
        { text: "고객센터 앱을 GraalVM Native Image로 전환해 메모리 할당량 43% 절감, 기동 시간 약 25초 → 1.1초 단축", case: "hapbang-native-image" },
        { text: "S3 직접 업로드 제약을 서버 경유 스트리밍으로 해결, 운영 단일 2GB 업로드에서 컨테이너 메모리 증가 약 6.7MiB 확인", case: "hapbang-s3-streaming-upload" },
      ],
    },
    {
      title: "Sidecar",
      subtitle: "오픈소스 Maintainer",
      period: "2026. 10 - now",
      links: [{ label: "GitHub", href: "https://github.com/kaameo-lab/sidecar" }],
      intro: `멀티 세션 개발 흐름에 맞춰 Claude Code 플러그인(Mods)을 개발했습니다.

합방 프로젝트 팀원 3명에게 공유해 함께 사용했습니다.`,
      items: [
        { text: "질문 번호에 맞춰 직접 입력하던 답변을 버튼 선택과 일괄 전송으로 변경", case: "sidecar-multi-session" },
        "세션별 작업 요약을 제공해, 다른 세션에서 돌아왔을 때 작업 맥락을 파악하도록 지원",
      ],
    },
  ],

  skills: [
    { group: "Backend", items: ["TypeScript (NestJS)", "Java (Spring Boot)", "Go"] },
    { group: "Data & Messaging", items: ["PostgreSQL", "MySQL", "Redis", "Apache Kafka", "OpenSearch"] },
    { group: "Infra & DevOps", items: ["AWS", "Kubernetes", "Terraform", "Docker", "GitHub Actions"] },
    { group: "Observability", items: ["Prometheus", "Grafana", "Loki", "Tempo"] },
    { group: "Frontend", items: ["Next.js", "React"] },
  ],

  education: [{ name: "아주대학교", subtitle: "대한민국, 수원", period: "2025. 08", detail: "소프트웨어학과 졸업" }],

  etc: [
    {
      name: "데브코스 백엔드 심화 8기",
      subtitle: "프로그래머스",
      period: "2026. 09 - 2026. 11",
      link: {
        label: "Spring AI와 MSA를 활용한 백엔드 개발",
        href: "https://school.programmers.co.kr/learn/courses/26328/26328-9%EA%B8%B0-k-digital-training-%EC%8B%AC%ED%99%94-spring-ai%EC%99%80-msa%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EB%B0%B1%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C",
      },
    },
    { name: "SQLD (SQL 개발자)", subtitle: "한국데이터산업진흥원", period: "2025. 04" },
  ],
};
