import type { ChartProps } from "./Chart";
import type { ClusterProps } from "./Cluster";

// 본문(index.mdx)의 그래프와 배치도에 넣는 값. MDX 안의 props는 타입 검사를 받지 않아서 여기 .ts에 둔다.

export const k3sCluster: ClusterProps = {
  title: "EC2 두 대로 만든 k3s 클러스터 (전환 전 memory limit)",
  unit: "Mi",
  valueLabel: "주요 pod limit",
  capacityLabel: "할당 가능",
  restLabel: "그 밖의 pod·빈 자리",
  entry: ["인터넷 (HTTPS 443)", "t3.large EIP", "Envoy Gateway"],
  nodes: [
    {
      name: "t3.large",
      details: ["k3s server", "core-data"],
      capacity: 7818,
      groups: [
        {
          name: "데이터",
          color: 2,
          items: [
            { name: "PostgreSQL", value: 768 },
            { name: "Kafka", value: 700 },
            { name: "Redis", value: 64 },
            { name: "Elasticsearch", value: 1536 },
          ],
        },
        {
          name: "앱",
          color: 1,
          items: [
            { name: "member", value: 512 },
            { name: "appearance", value: 576 },
            { name: "billing", value: 448 },
          ],
        },
      ],
    },
    {
      name: "t3.medium",
      details: ["k3s agent", "app-observe"],
      capacity: 3832,
      groups: [
        {
          name: "앱",
          color: 1,
          items: [
            { name: "lecture", value: 640 },
            { name: "customer-support", value: 448 },
            { name: "chat", value: 576 },
          ],
        },
        {
          name: "관측성",
          color: 3,
          items: [
            { name: "Prometheus", value: 416 },
            { name: "Loki", value: 256 },
            { name: "Tempo", value: 160 },
            { name: "Grafana", value: 448 },
            { name: "Alloy", value: 192 },
          ],
        },
      ],
    },
  ],
  caption: "막대 전체는 노드의 할당 가능 메모리, 색 블록은 pod 하나의 memory limit이다. 회색은 시스템 pod(operator·관리 도구 등)와 빈 자리다.",
};

export const workingSet7d: ChartProps = {
  title: "7일 최대 working set: 6개 앱 모두 limit의 85% 이상을 쓰고 있었다",
  unit: "Mi",
  series: [{ name: "7일 최대 working set" }],
  rows: [
    { label: "billing · 100%", values: [448], limit: 448 },
    { label: "lecture · 92%", values: [589], limit: 640 },
    { label: "customer-support · 90%", values: [404], limit: 448 },
    { label: "member · 89%", values: [456], limit: 512 },
    { label: "appearance · 89%", values: [510], limit: 576 },
    { label: "chat · 85%", values: [492], limit: 576 },
  ],
  caption: "전환 전 운영 Prometheus에서 본 7일 최대 working set이다. billing과 Grafana(418/448Mi)는 여유가 거의 없어 먼저 512Mi로 올렸다.",
};

export const heapAtMax: ChartProps = {
  title: "heap이 상한까지 차면 6개 앱 모두 limit을 넘는다",
  unit: "MiB",
  series: [{ name: "heap 사용(7일 최대)" }, { name: "heap 상한까지 여유", track: true }, { name: "off-heap" }],
  rows: [
    { label: "billing", values: [95, 166, 285], limit: 448 },
    { label: "customer-support", values: [82, 179, 280], limit: 448 },
    { label: "member", values: [90, 208, 333], limit: 512 },
    { label: "appearance", values: [110, 224, 318], limit: 576 },
    { label: "chat", values: [103, 231, 335], limit: 576 },
    { label: "lecture", values: [154, 217, 355], limit: 640 },
  ],
  caption: "heap 상한은 -XX:MaxRAMPercentage=60(Serial GC라 survivor 하나 제외), off-heap은 RSS − heap committed다. 막대 끝이 heap 상한 도달 시 합계다.",
};

export const rssComparison: ChartProps = {
  title: "같은 조건에서 잰 RSS: native가 44~45% 작다",
  unit: "Mi",
  series: [{ name: "JVM" }, { name: "Native" }],
  rows: [
    { label: "기동 20초 뒤 · JVM", values: [379, null] },
    { label: "기동 20초 뒤 · Native (−45%)", values: [null, 208] },
    { label: "작업 직후 · JVM", values: [413, null] },
    { label: "작업 직후 · Native (−44%)", values: [null, 231] },
    { label: "60초 idle 뒤 · JVM", values: [415, null] },
    { label: "60초 idle 뒤 · Native (−44%)", values: [null, 233] },
  ],
  caption: "macOS arm64 로컬에서 같은 인프라·같은 워크로드로 쟀다. JVM은 운영과 같게 Serial GC·2 vCPU·heap 상한 448Mi×60%로 맞췄다.",
};

export const limitReduction: ChartProps = {
  title: "운영 working set이 줄어 limit을 448Mi에서 256Mi로 낮췄다",
  unit: "Mi",
  series: [{ name: "working set 최대" }],
  rows: [
    { label: "JVM · 7일 최대", values: [404], limit: 448 },
    { label: "Native · 256Mi·-Xmx128m 적용 뒤 17시간 최대", values: [123], limit: 256 },
  ],
  caption: "customer-support-app의 운영 working set 최대치와 memory limit(= request)이다. 관측 기간과 부하 조건이 달라 단순 감소율로 환산하지 않고, 동일 조건 비교는 위 로컬 측정(−44~45%)을 기준으로 본다.",
};

export const ciJobTime: ChartProps = {
  title: "같은 CI run에서 이 앱 job만 13분을 넘었다",
  unit: "분",
  series: [{ name: "테스트·jar 빌드" }, { name: "native 컴파일·이미지 확인" }],
  rows: [
    { label: "customer-support", values: [2.3, 11] },
    { label: "billing", values: [5.7, null] },
    { label: "chat", values: [5.2, null] },
    { label: "member", values: [4.5, null] },
    { label: "appearance", values: [3.8, null] },
    { label: "lecture", values: [3.2, null] },
  ],
  caption: "6개 앱이 함께 돈 CI run의 job별 소요 시간이다. customer-support는 GraalVM 설치부터 native 이미지 빌드까지 약 11분이 추가됐고, 다른 run에서는 최대 18분까지 걸렸다.",
};
