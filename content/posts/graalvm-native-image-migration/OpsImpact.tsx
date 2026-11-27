import Figure from "@/components/Figure";
import styles from "./OpsImpact.module.css";

// 결과 절의 보조 그래프: 메모리 외에 운영에서 달라진 세 가지(기동 시간, 컨테이너 이미지 크기, t3.medium 노드 요청률)를 나란히 비교한다.

type BarRow = {
  label: string;
  pct: number;
  strong: string;
  sub?: string;
  color: string;
};

type Group = {
  name: string;
  delta: string;
  rows: BarRow[];
};

const GROUPS: Group[] = [
  {
    name: "운영 기동 시간 (application_ready_time_seconds)",
    delta: "약 22배 단축",
    rows: [
      { label: "JVM", pct: 100, strong: "22.9~27.8초", color: "var(--chart-1)" },
      { label: "Native", pct: 4.5, strong: "1.10~1.16초", color: "var(--chart-3)" },
    ],
  },
  {
    name: "컨테이너 이미지 크기 (GHCR 압축, linux/amd64)",
    delta: "−29%",
    rows: [
      { label: "JVM", pct: 100, strong: "204.5MiB", sub: "9 layers", color: "var(--chart-1)" },
      { label: "Native", pct: 70.6, strong: "144.3MiB", sub: "4 layers", color: "var(--chart-3)" },
    ],
  },
  {
    name: "t3.medium 노드 request 합계 (할당 가능 3,832Mi)",
    delta: "192Mi 여유 확보",
    rows: [
      { label: "이전", pct: 96.9, strong: "3,712Mi", sub: "96%", color: "var(--chart-2)" },
      { label: "이후", pct: 91.9, strong: "3,520Mi", sub: "92%", color: "var(--chart-3)" },
    ],
  },
];

export default function OpsImpact() {
  return (
    <Figure
      title="운영 지표 변화: 기동 시간 · 컨테이너 이미지 · 노드 배치 여유"
      caption="로컬 동일 조건 기동도 4.3초 → 0.57초로 약 1/7이 됐다. t3.medium 노드는 maxSurge: 0으로 기존 pod를 내린 뒤 새 pod를 띄우기 때문에, 기동 단축이 배포 중단 시간 축소로 이어진다."
    >
      <div className={styles.groups}>
        {GROUPS.map((g) => (
          <div key={g.name}>
            <div className={styles.groupHead}>
              <span className={styles.name}>{g.name}</span>
              <span className={styles.badge}>{g.delta}</span>
            </div>
            {g.rows.map((r) => (
              <div key={r.label} className={styles.row}>
                <span className={styles.period}>{r.label}</span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.bar} style={{ width: `${r.pct}%`, background: r.color }} />
                </span>
                <span className={styles.value}>
                  <strong>{r.strong}</strong>
                  {r.sub ? ` (${r.sub})` : ""}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Figure>
  );
}
