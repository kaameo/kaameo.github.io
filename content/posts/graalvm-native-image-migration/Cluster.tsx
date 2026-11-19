// 노드별 배치도. 노드마다 카드 하나를 그리고, 그 안에 묶음별로 pod를 나열한다. 이 글(index.mdx)에서만 쓰고, 값은 data.ts에 둔다.
// 노드에 capacity를 주면 pod를 value에 비례하는 블록으로 이어 붙인 막대를 함께 그린다(막대 전체 = capacity).
// 빌드 때 HTML로 그려지므로 JS가 없고, 색은 CSS 변수라 테마 토글을 그대로 따라간다. 스타일은 Cluster.module.css에 둔다.
import styles from "./Cluster.module.css";

type Item = { name: string; value?: number; note?: string };
// color는 globals.css의 --chart-1 ~ --chart-4. 묶음 색은 노드가 달라도 같은 묶음이면 같은 번호를 쓴다. 빼면 회색이다.
type Group = { name: string; color?: 1 | 2 | 3 | 4; items: Item[] };
type ClusterNode = { name: string; details: string[]; capacity?: number; groups: Group[] };
type Labels = { value: string; capacity: string; rest: string };
export type ClusterProps = {
  title: string;
  unit?: string;
  // 요청이 들어오는 길. 맨 위에 화살표로 이어 그린다.
  entry?: string[];
  nodes: ClusterNode[];
  valueLabel?: string;
  capacityLabel?: string;
  restLabel?: string;
  caption?: string;
};

const formatNumber = new Intl.NumberFormat("ko-KR").format;

const groupColor = (group: Group) => (group.color ? `var(--chart-${group.color})` : "var(--muted)");

type CapacityBarProps = { node: ClusterNode; capacity: number; scale: number; unit: string; labels: Labels };

// value가 있는 pod를 순서대로 이어 붙이고, capacity까지 남는 부분은 회색 블록 하나로 채운다.
// 막대 길이는 가장 큰 노드의 capacity(scale)에 맞춰서, 노드끼리도 같은 축척으로 비교된다.
function CapacityBar({ node, capacity, scale, unit, labels }: CapacityBarProps) {
  const withUnit = (v: number) => `${formatNumber(v)}${unit}`;
  const blocks = node.groups.flatMap((group) =>
    group.items.flatMap((item) => (item.value ? [{ name: item.name, value: item.value, color: groupColor(group) }] : [])),
  );
  const used = blocks.reduce((total, b) => total + b.value, 0);
  const rest = capacity - used;
  const label = [...blocks.map((b) => `${b.name} ${withUnit(b.value)}`), ...(rest > 0 ? [`${labels.rest} ${withUnit(rest)}`] : [])];

  return (
    <>
      <div className={styles.usage}>
        <span>
          {labels.value} {withUnit(used)} / {labels.capacity} {withUnit(capacity)}
        </span>
        <strong>{Math.round((used / capacity) * 100)}%</strong>
      </div>
      <div
        className={styles.bar}
        style={{ width: `${(Math.max(capacity, used) / scale) * 100}%` }}
        role="img"
        aria-label={`${node.name} ${labels.capacity} ${withUnit(capacity)}: ${label.join(", ")}`}
      >
        {blocks.map((b) => (
          <span key={b.name} className={styles.block} style={{ flexGrow: b.value, background: b.color }} title={`${b.name} ${withUnit(b.value)}`} />
        ))}
        {rest > 0 && (
          <span className={`${styles.block} ${styles.rest}`} style={{ flexGrow: rest }} title={`${labels.rest} ${withUnit(rest)}`} />
        )}
      </div>
    </>
  );
}

export default function Cluster({
  title,
  unit = "",
  entry = [],
  nodes,
  valueLabel = "합계",
  capacityLabel = "용량",
  restLabel = "나머지",
  caption,
}: ClusterProps) {
  const labels: Labels = { value: valueLabel, capacity: capacityLabel, rest: restLabel };
  const used = (node: ClusterNode) => node.groups.flatMap((g) => g.items).reduce((total, it) => total + (it.value ?? 0), 0);
  const scale = Math.max(...nodes.map((n) => (n.capacity === undefined ? 0 : Math.max(n.capacity, used(n)))));

  return (
    <figure className={styles.cluster}>
      <figcaption className={styles.title}>{title}</figcaption>

      {entry.length > 0 && (
        <ol className={styles.entry} aria-label="요청이 들어오는 길">
          {entry.map((step) => (
            <li key={step}>
              <span className={styles.pill}>{step}</span>
            </li>
          ))}
        </ol>
      )}

      <div className={styles.nodes}>
        {nodes.map((node) => (
          <div className={styles.node} key={node.name}>
            <div className={styles.nodeHead}>
              <span className={styles.nodeName}>{node.name}</span>
              {node.details.length > 0 && <span className={styles.nodeDetail}>{node.details.join(" · ")}</span>}
            </div>
            {node.capacity !== undefined && (
              <CapacityBar node={node} capacity={node.capacity} scale={scale} unit={unit} labels={labels} />
            )}
            {node.groups.map((group) => (
              <div className={styles.group} key={group.name}>
                <div className={styles.groupName}>
                  <span className={styles.dot} style={{ background: groupColor(group) }} aria-hidden="true" />
                  {group.name}
                </div>
                <ul className={styles.items}>
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <span>{item.name}</span>
                      {item.value !== undefined && (
                        <span className={styles.value}>
                          {formatNumber(item.value)}
                          {unit}
                        </span>
                      )}
                      {item.note && <span className={styles.itemNote}>{item.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      {caption && <p className={styles.caption}>{caption}</p>}
    </figure>
  );
}
