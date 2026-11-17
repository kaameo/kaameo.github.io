// 마크다운의 ```cluster 블록(JSON)을 노드별 배치도로 그린다. 노드마다 카드 하나를 그리고, 그 안에 묶음별로 pod를 나열한다.
// 노드에 capacity를 주면 pod를 value에 비례하는 블록으로 이어 붙인 막대를 함께 그린다(막대 전체 = capacity).
// 빌드 때 HTML로 그려지므로 JS가 없고, 색은 CSS 변수라 테마 토글을 그대로 따라간다.
import { formatNumber, isNumber, isObject, optionalString, parseSpecObject, specError } from "@/lib/figure-spec";

type Item = { name: string; value?: number; note?: string };
type Group = { name: string; color?: number; items: Item[] };
type ClusterNode = { name: string; details: string[]; capacity?: number; groups: Group[] };
type Labels = { value: string; capacity: string; rest: string };
type Spec = { title: string; unit: string; entry: string[]; nodes: ClusterNode[]; labels: Labels; caption?: string };

// globals.css의 --chart-1 ~ --chart-4. 묶음 색은 노드가 달라도 같은 묶음이면 같은 번호를 쓴다.
const COLOR_SLOTS = 4;

function fail(message: string): never {
  return specError("cluster", message);
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === "string");

function parseItem(raw: unknown, at: string): Item {
  if (!isObject(raw) || typeof raw.name !== "string") fail(`${at}에 name이 필요합니다.`);
  if (raw.value !== undefined && !(isNumber(raw.value) && raw.value >= 0)) fail(`${at}.value는 0 이상 숫자여야 합니다.`);
  return { name: raw.name, value: raw.value, note: optionalString(raw.note) };
}

function parseGroup(raw: unknown, at: string): Group {
  if (!isObject(raw) || typeof raw.name !== "string") fail(`${at}에 name이 필요합니다.`);
  const { color, items } = raw;
  if (color !== undefined && !(Number.isInteger(color) && (color as number) >= 1 && (color as number) <= COLOR_SLOTS)) {
    fail(`${at}.color는 1~${COLOR_SLOTS} 중 하나여야 합니다.`);
  }
  if (!Array.isArray(items) || items.length === 0) fail(`${at}.items가 비어 있습니다.`);
  return { name: raw.name, color: color as number | undefined, items: items.map((it, i) => parseItem(it, `${at}.items[${i}]`)) };
}

function parseNode(raw: unknown, at: string): ClusterNode {
  if (!isObject(raw) || typeof raw.name !== "string") fail(`${at}에 name이 필요합니다.`);
  const { details = [], capacity, groups } = raw;
  if (!isStringArray(details)) fail(`${at}.details는 문자열 배열이어야 합니다.`);
  if (capacity !== undefined && !(isNumber(capacity) && capacity > 0)) fail(`${at}.capacity는 양수여야 합니다.`);
  if (!Array.isArray(groups) || groups.length === 0) fail(`${at}.groups가 비어 있습니다.`);
  return { name: raw.name, details, capacity, groups: groups.map((g, i) => parseGroup(g, `${at}.groups[${i}]`)) };
}

function parseSpec(source: string): Spec {
  const raw = parseSpecObject("cluster", source);
  const { title, unit = "", entry = [], nodes } = raw;
  if (typeof title !== "string" || !title) fail("title이 필요합니다.");
  if (typeof unit !== "string") fail("unit은 문자열이어야 합니다.");
  if (!isStringArray(entry)) fail("entry는 문자열 배열이어야 합니다.");
  if (!Array.isArray(nodes) || nodes.length === 0) fail("nodes가 비어 있습니다.");
  return {
    title,
    unit,
    entry,
    nodes: nodes.map((n, i) => parseNode(n, `nodes[${i}]`)),
    labels: {
      value: optionalString(raw.valueLabel) ?? "합계",
      capacity: optionalString(raw.capacityLabel) ?? "용량",
      rest: optionalString(raw.restLabel) ?? "나머지",
    },
    caption: optionalString(raw.caption),
  };
}

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
      <div className="cluster-usage">
        <span>
          {labels.value} {withUnit(used)} / {labels.capacity} {withUnit(capacity)}
        </span>
        <strong>{Math.round((used / capacity) * 100)}%</strong>
      </div>
      <div
        className="cluster-bar"
        style={{ width: `${(Math.max(capacity, used) / scale) * 100}%` }}
        role="img"
        aria-label={`${node.name} ${labels.capacity} ${withUnit(capacity)}: ${label.join(", ")}`}
      >
        {blocks.map((b) => (
          <span key={b.name} className="cluster-block" style={{ flexGrow: b.value, background: b.color }} title={`${b.name} ${withUnit(b.value)}`} />
        ))}
        {rest > 0 && (
          <span className="cluster-block cluster-rest" style={{ flexGrow: rest }} title={`${labels.rest} ${withUnit(rest)}`} />
        )}
      </div>
    </>
  );
}

export default function Cluster({ source }: { source: string }) {
  const { title, unit, entry, nodes, labels, caption } = parseSpec(source);
  const used = (node: ClusterNode) => node.groups.flatMap((g) => g.items).reduce((total, it) => total + (it.value ?? 0), 0);
  const scale = Math.max(...nodes.map((n) => (n.capacity === undefined ? 0 : Math.max(n.capacity, used(n)))));

  return (
    <figure className="cluster">
      <figcaption className="cluster-title">{title}</figcaption>

      {entry.length > 0 && (
        <ol className="cluster-entry" aria-label="요청이 들어오는 길">
          {entry.map((step) => (
            <li key={step}>
              <span className="cluster-pill">{step}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="cluster-nodes">
        {nodes.map((node) => (
          <div className="cluster-node" key={node.name}>
            <div className="cluster-node-head">
              <span className="cluster-node-name">{node.name}</span>
              {node.details.length > 0 && <span className="cluster-node-detail">{node.details.join(" · ")}</span>}
            </div>
            {node.capacity !== undefined && (
              <CapacityBar node={node} capacity={node.capacity} scale={scale} unit={unit} labels={labels} />
            )}
            {node.groups.map((group) => (
              <div className="cluster-group" key={group.name}>
                <div className="cluster-group-name">
                  <span className="cluster-dot" style={{ background: groupColor(group) }} aria-hidden="true" />
                  {group.name}
                </div>
                <ul className="cluster-items">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <span>{item.name}</span>
                      {item.value !== undefined && (
                        <span className="cluster-value">
                          {formatNumber(item.value)}
                          {unit}
                        </span>
                      )}
                      {item.note && <span className="cluster-item-note">{item.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      {caption && <p className="cluster-caption">{caption}</p>}
    </figure>
  );
}
