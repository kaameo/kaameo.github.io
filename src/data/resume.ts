// Resume 페이지 내용.
// summary와 불릿(items)은 한 줄 마크다운으로 쓴다: **굵게**, [링크](url), `코드`.
// 굵게는 결과 수치에만 쓴다(**52%**, **3주 → 1주**). 문제를 설명하는 숫자(81분, 7개 처리 과정)와 문장은 굵게 하지 않는다.

type Link = { label: string; href: string };

// Employment와 Project는 같은 모양이다: 이름 줄 → 한 줄 설명(description) → 업무 영역(works) → 불릿.
// Employment의 기간은 재직기간이고, 제품 이름은 description에 쓴다. 같은 회사에서 직책만 바뀌었으면 "인턴 → 연구원"처럼 적는다.
// 불릿에는 Portfolio 사례 링크를 달지 않는다. 사례 상세로는 Portfolio에서만 간다.
export type Work = { title: string; stack: string; items: string[] };
type Employment = { company: string; role: string; period: string; description: string; works: Work[] };

type Project = { title: string; subtitle: string; period: string; links: Link[]; description: string; works: Work[] };

// 학교, 교육과정, 자격증처럼 이름·기간만 있는 항목.
type Entry = { name: string; subtitle: string; period: string; detail?: string };

type Resume = {
  name: string;
  role: string;
  linkedin: string;
  summary: string[];
  experience: Employment[];
  projects: Project[];
  skills: { group: string; items: string[] }[];
  education: Entry[];
  training: Entry[];
};

export const resume: Resume = {
  name: "홍진수",
  role: "Backend Engineer",
  linkedin: "https://www.linkedin.com/in/jinsu-hong",

  summary: [
    "Node.js 백엔드와 Go 데이터 수집 플랫폼을 설계, 구현하고 AWS EKS에서 운영",
    "Java/Spring 팀 프로젝트에서 MSA 환경의 서비스 간 HTTP/Kafka 연동 설계, 구현",
    "큐 지표와 DB 상태, 실행 로그를 교차 대조해 에러 로그 없이 발생한 장애의 근본 원인을 추적",
    "변경 가능성을 기준으로 구조를 분리해, 신규 연동 추가 기간을 기존 약 3주에서 약 1주로 단축",
    "[AI 에이전트를 개발과 검증에 활용](/posts/verifying-ai-agent-work/), 계획 검토 → 테스트 기반 구현 → 코드/문서 대조 사이클로 결과 검증",
  ],

  experience: [
    {
      company: "인브릿지",
      role: "개발팀 인턴 6개월 → 연구원",
      period: "2025. 03 - 2026. 07",
      description:
        "보안 로그를 수집/분석해 AI 보고서를 만드는 B2B SaaS Sentivex의 수집 플랫폼, 서비스 백엔드, AWS 인프라를 설계, 운영",
      works: [
        {
          title: "멀티테넌트 수집 플랫폼 설계, 운영",
          stack: "Go, PostgreSQL, Redis Streams, Kafka",
          items: [
            "글로벌 4개 보안 벤더를 지원하는 멀티테넌트 로그 수집 플랫폼 0→1 구축, 신규 벤더 추가 기간을 약 **3주 → 1주**로 단축",
            "에러 로그 없이 큐 상한에 밀려 삭제된 수집 작업 **80,375건**을 재수집으로 복구하고 재발 방지",
            "81분간 진행되는 수집을 10분 만에 타임아웃 처리해 반복 재수집되던 문제를 heartbeat로 해결",
          ],
        },
        {
          title: "Sentivex 백엔드 설계, 인프라 운영",
          stack: "NestJS, PostgreSQL, AWS EKS",
          items: [
            "공통 기능과 독립 배포 서비스 분리 설계, 인증/인가와 테넌트 격리를 NestJS 코어에 통합, 변경이 잦은 수집 플랫폼과 AI 서비스는 분리",
            "EKS 월 비용 약 **52%** 절감, 8 → 4대로 노드를 줄이고 3AZ 구성 유지",
          ],
        },
      ],
    },
  ],

  projects: [
    {
      title: "합방",
      subtitle: "K-Digital Training 5인 팀 프로젝트, 우수상",
      period: "2026. 10 - 2026. 11",
      links: [
        { label: "서비스", href: "https://hapbang.duckdns.org/" },
        { label: "GitHub", href: "https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/" },
      ],
      description: "인플루언서 합동 방송(합방) 섭외와 강의 판매를 포인트로 거래하는 플랫폼",
      works: [
        {
          title: "강의 모듈, 서비스 간 연동 설계, 인프라 구축, FE",
          stack: "Java, Spring Boot, PostgreSQL, Kafka, k3s, AWS EC2/S3, React",
          items: [
            "주문/취소/환불 경쟁별로 비관적 락, 낙관적 락, 부분 유니크 인덱스를 분리 적용해 write skew와 중복 구매 차단",
            "멱등 API 재시도, Kafka 이벤트, 보상 처리로 주문/취소/정산 등 7개 처리 과정의 공유 트랜잭션 의존 제거",
            "고객센터 앱을 GraalVM Native Image로 전환해 메모리 할당량 **43%** 절감, 기동 시간 약 **25초 → 1.1초** 단축",
            "S3 직접 업로드 제약을 서버 경유 스트리밍으로 해결, 운영 단일 2GB 업로드에서 컨테이너 메모리 증가 약 **6.7MiB** 확인",
          ],
        },
      ],
    },
    {
      title: "Sidecar",
      subtitle: "개인 오픈소스 프로젝트",
      period: "2026. 10 - now",
      links: [{ label: "GitHub", href: "https://github.com/kaameo-lab/sidecar" }],
      description: "Claude Code 패널에서 AI 에이전트의 질문에 버튼으로 답하고, 세션 요약을 보여 주는 플러그인",
      works: [
        {
          title: "플러그인 단독 설계, 개발",
          stack: "TypeScript, Claude Code Mods",
          items: [
            "10개가량의 AI 에이전트 질문에 번호를 맞춰 직접 입력하던 방식을 버튼 선택과 일괄 전송으로 변경",
            "병렬 세션을 오갈 때 맥락 파악을 위해 3턴마다 대화를 fork해 작업 요약",
            "합방 프로젝트 팀원 3명에게 공유하고 지속적으로 사용",
          ],
        },
      ],
    },
  ],

  skills: [
    { group: "Backend", items: ["TypeScript (NestJS)", "Java (Spring Boot)", "Go"] },
    { group: "Data & Messaging", items: ["PostgreSQL", "Redis", "Apache Kafka"] },
    { group: "Infra & DevOps", items: ["AWS", "Kubernetes", "Docker", "GitHub Actions"] },
    { group: "Observability", items: ["Prometheus", "Grafana"] },
    { group: "Frontend", items: ["React"] },
  ],

  education: [{ name: "아주대학교", subtitle: "대한민국, 수원", period: "2025. 08", detail: "소프트웨어학과 졸업" }],

  // 직무 관련 교육 및 자격증
  training: [
    { name: "프로그래머스 데브코스 백엔드 심화 8기", subtitle: "K-Digital Training", period: "2026. 09 - 2026. 11" },
    { name: "SQLD (SQL 개발자)", subtitle: "한국데이터산업진흥원", period: "2025. 04" },
  ],
};
