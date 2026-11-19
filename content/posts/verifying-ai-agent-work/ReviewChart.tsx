import Figure from "@/components/Figure";
import styles from "./ReviewChart.module.css";

// 3절의 그래프: #701 전후로, Claude 리뷰가 인라인 지적을 단 내 PR의 비율을 PR 종류별로 비교한다.
// 이 글에서만 쓰는 그림이라 값도 여기 둔다. 빌드 때 HTML로 그려지고, 색은 CSS 변수라 테마를 따라간다.

// hit: 인라인 지적이 달린 PR 수, total: Claude 리뷰가 돈 PR 수
type Count = { hit: number; total: number };

const GROUPS: { name: string; before: Count; after: Count }[] = [
  { name: "전체", before: { hit: 10, total: 91 }, after: { hit: 30, total: 39 } },
  { name: "Infra", before: { hit: 6, total: 52 }, after: { hit: 21, total: 26 } },
  { name: "Lecture", before: { hit: 0, total: 19 }, after: { hit: 5, total: 6 } },
  { name: "Others", before: { hit: 4, total: 20 }, after: { hit: 4, total: 7 } },
];

const PERIODS = [
  { key: "before", label: "이전", color: "var(--muted)" },
  { key: "after", label: "이후", color: "var(--chart-1)" },
] as const;

export default function ReviewChart() {
  return (
    <Figure
      title="인라인 리뷰가 달린 PR 비율의 증가"
      caption="이전: 10. 15 ~ 11. 05 / 이후: 11. 05 ~ 11. 18"
    >
      <div className={styles.groups}>
        {GROUPS.map((group) => (
          <div key={group.name}>
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
                    <strong>{pct}%</strong> PR {total}개 중 {hit}개
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
