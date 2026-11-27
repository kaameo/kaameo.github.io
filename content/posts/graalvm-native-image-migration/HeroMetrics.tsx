import styles from "./HeroMetrics.module.css";

// 글 상단 핵심 결과 요약 카드. 얻은 효과 3개와 가장 큰 비용 1개를 한눈에 보여 준다.

type Metric = {
  label: string;
  value: string;
  delta: string;
  note: string;
  cost?: boolean;
};

const METRICS: Metric[] = [
  {
    label: "메모리 limit (운영)",
    value: "448 → 256Mi",
    delta: "−43% · 노드 192Mi 확보",
    note: "request·limit 동시 하향",
  },
  {
    label: "실행 메모리 RSS (동일 조건)",
    value: "413 → 231Mi",
    delta: "−44% 절감",
    note: "로컬 Serial GC · 2 vCPU 기준",
  },
  {
    label: "기동 시간 (운영)",
    value: "25초 → 1.1초",
    delta: "약 22배 단축",
    note: "배포 중단 시간 축소",
  },
  {
    label: "CI 빌드 시간 (비용)",
    value: "~3분 → 13~18분",
    delta: "컴파일 +10~14분",
    note: "러너 Peak RSS 최대 12.2GB",
    cost: true,
  },
];

export default function HeroMetrics() {
  return (
    <div className={styles.grid} role="region" aria-label="전환 핵심 결과 요약">
      {METRICS.map((m) => (
        <div key={m.label} className={m.cost ? `${styles.card} ${styles.cost}` : styles.card}>
          <span className={styles.label}>{m.label}</span>
          <strong className={styles.value}>{m.value}</strong>
          <span className={styles.delta}>{m.delta}</span>
          <span className={styles.note}>{m.note}</span>
        </div>
      ))}
    </div>
  );
}
