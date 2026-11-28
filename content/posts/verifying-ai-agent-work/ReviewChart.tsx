import Figure from "@/components/Figure";
import styles from "./ReviewChart.module.css";

// 리뷰 절의 그래프: 11월 5일 CI 리뷰 프롬프트 개편 전후로 인라인 지적이 달린 내 PR 비율과 반영 결과를 비교한다.

type Count = { hit: number; total: number };

const SUMMARY = [
  {
    label: "리뷰가 달린 PR 비율",
    value: "11% → 77%",
    detail: "91개 중 10개 → 39개 중 30개",
  },
  {
    label: "인라인 지적 수",
    value: "11건 → 69건",
    detail: "개편 전 11건 → 개편 후 69건",
  },
  {
    label: "실제 수정 반영",
    value: "64 / 69건",
    detail: "전부 수정 42 · 일부 수정 22 · 이유만 2",
  },
];

const GROUPS: { name: string; highlight?: boolean; before: Count; after: Count }[] = [
  { name: "전체 PR", highlight: true, before: { hit: 10, total: 91 }, after: { hit: 30, total: 39 } },
  { name: "인프라 (k8s · CI 등)", before: { hit: 6, total: 52 }, after: { hit: 21, total: 26 } },
  { name: "강의 도메인", before: { hit: 0, total: 19 }, after: { hit: 5, total: 6 } },
  { name: "그 외 기능", before: { hit: 4, total: 20 }, after: { hit: 4, total: 7 } },
];

const PERIODS = [
  { key: "before", label: "개편 전", range: "10.15 ~ 11.05", color: "var(--muted)" },
  { key: "after", label: "개편 후", range: "11.05 ~ 11.18", color: "var(--chart-1)" },
] as const;

export default function ReviewChart() {
  return (
    <Figure
      title="CI 리뷰 프롬프트 개편 전후 변화"
      caption="각 막대는 Claude 리뷰가 실행된 내 PR 중 인라인 지적이 1건 이상 달린 비율이다."
    >
      <div className={styles.summary}>
        {SUMMARY.map((item) => (
          <div key={item.label} className={styles.stat}>
            <span className={styles.statLabel}>{item.label}</span>
            <strong className={styles.statValue}>{item.value}</strong>
            <span className={styles.statDetail}>{item.detail}</span>
          </div>
        ))}
      </div>

      <div className={styles.legend} aria-label="비교 기간">
        {PERIODS.map((period) => (
          <span key={period.key} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: period.color }} aria-hidden="true" />
            <strong>{period.label}</strong>
            <span>({period.range})</span>
          </span>
        ))}
      </div>

      <div className={styles.groups}>
        {GROUPS.map((group) => (
          <div key={group.name} className={group.highlight ? `${styles.group} ${styles.highlight}` : styles.group}>
            <div className={styles.name}>{group.name}</div>
            {PERIODS.map(({ key, label, color }) => {
              const { hit, total } = group[key];
              const pct = Math.round((hit / total) * 100);
              return (
                <div key={key} className={styles.row}>
                  <span className={styles.period}>{label}</span>
                  <span className={styles.track} aria-hidden="true">
                    <span className={styles.bar} style={{ width: `${pct}%`, background: color }} />
                  </span>
                  <span className={styles.value}>
                    <strong>{pct}%</strong> ({hit}/{total})
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Figure>
  );
}
