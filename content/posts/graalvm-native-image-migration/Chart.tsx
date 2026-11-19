// 가로 누적 막대 그래프. 이 글(index.mdx)에서만 쓰고, 값은 data.ts에 둔다.
// 빌드 때 HTML로 그려지므로 JS가 없고, 색은 CSS 변수라 테마 토글을 그대로 따라간다.
// 테두리·제목·설명은 Figure가 그리고, 그래프 안쪽 스타일은 Chart.module.css에 둔다.
import Figure from "@/components/Figure";
import styles from "./Chart.module.css";

type Series = { name: string; track?: boolean };
// null은 그 항목에 해당 series가 없다는 뜻이다(막대에 안 그리고 표에는 "-"로 쓴다).
// JVM·native를 다른 줄에 나란히 놓을 때처럼, 줄마다 series 하나만 쓰는 비교에 쓴다.
type Value = number | null;
type Row = { label: string; values: Value[]; limit?: number };
export type ChartProps = {
  title: string;
  unit?: string;
  series: Series[];
  rows: Row[];
  limitLabel?: string;
  caption?: string;
};

// 카테고리 색은 순서대로만 쓴다(globals.css의 --chart-1 ~ --chart-4).
const MAX_SLOTS = 4;

const format = new Intl.NumberFormat("ko-KR").format;

// 타입으로 나타낼 수 없는 규칙만 확인한다. 어기면 그래프가 조용히 틀리게 그려지는 대신 빌드가 멈춘다.
function check({ title, series, rows }: ChartProps) {
  const fail = (message: string): never => {
    throw new Error(`Chart "${title}": ${message}`);
  };
  if (series[0]?.track) fail("첫 series는 track일 수 없습니다. track은 바로 앞 series의 남은 부분입니다.");
  if (series.filter((s) => !s.track).length > MAX_SLOTS) fail(`색이 있는 series는 ${MAX_SLOTS}개까지입니다.`);
  rows.forEach((r, i) => {
    if (r.values.length !== series.length || r.values.every((v) => v === null)) {
      fail(`rows[${i}].values는 series 수(${series.length})만큼 써야 하고, 하나 이상은 숫자여야 합니다.`);
    }
  });
}

// 눈금 간격을 1·2·2.5·5 × 10^n 중에서 골라 4칸 안팎으로 나눈다.
function niceScale(dataMax: number) {
  const rough = dataMax / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ??
    10 * magnitude;
  const max = Math.ceil(dataMax / step) * step;
  const ticks = Array.from(
    { length: Math.round(max / step) + 1 },
    (_, i) => i * step,
  );
  return { max, ticks };
}

const sum = (values: Value[]) =>
  values.reduce<number>((a, b) => a + (b ?? 0), 0);

export default function Chart(props: ChartProps) {
  check(props);
  const { title, unit = "", series, rows, limitLabel = "limit", caption } = props;

  // track series는 바로 앞 series 색을 옅게 쓴다(같은 대상의 비어 있는 부분).
  let slot = 0;
  const colors = series.map((s) =>
    s.track ? `var(--chart-${slot}-track)` : `var(--chart-${++slot})`,
  );

  const dataMax = Math.max(
    ...rows.map((r) => Math.max(sum(r.values), r.limit ?? 0)),
  );
  const { max, ticks } = niceScale(dataMax);
  const pct = (v: number) => `${(v / max) * 100}%`;
  const hasLimit = rows.some((r) => r.limit !== undefined);
  // 한 줄에 값이 둘 이상 쌓이는 줄이 있을 때만 표에 합계 칸을 둔다.
  const hasStack = rows.some(
    (r) => r.values.filter((v) => v !== null).length > 1,
  );
  // series가 하나면 제목이 무엇을 그렸는지 말해 주므로 범례에 넣지 않는다.
  const legendSeries = series.length > 1 ? series : [];
  const withUnit = (v: number) => `${format(v)}${unit}`;

  return (
    <Figure className={styles.chart} title={title} caption={caption}>

      {(legendSeries.length > 0 || hasLimit) && (
        <ul className={styles.legend}>
          {legendSeries.map((s, i) => (
            <li key={s.name}>
              <span
                className={styles.swatch}
                style={{ background: colors[i] }}
                aria-hidden="true"
              />
              {s.name}
            </li>
          ))}
          {hasLimit && (
            <li>
              <span className={styles.swatchLine} aria-hidden="true" />
              {limitLabel}
            </li>
          )}
        </ul>
      )}

      <div className={styles.rows}>
        {rows.map((row) => {
          const total = sum(row.values);
          const over = row.limit !== undefined ? total - row.limit : 0;
          const label = [
            ...row.values.flatMap((v, i) =>
              v === null ? [] : [`${series[i].name} ${withUnit(v)}`],
            ),
            ...(hasStack ? [`합계 ${withUnit(total)}`] : []),
            ...(row.limit !== undefined
              ? [`${limitLabel} ${withUnit(row.limit)}`]
              : []),
          ].join(", ");

          return (
            <div key={row.label}>
              <div className={styles.rowHead}>
                <span className={styles.label}>{row.label}</span>
                <span className={styles.value}>
                  {withUnit(total)}
                  {row.limit !== undefined && (
                    <>
                      {" "}
                      / {limitLabel} {format(row.limit)}
                      {over > 0 && <strong> · {format(over)} 초과</strong>}
                    </>
                  )}
                </span>
              </div>
              <div
                className={styles.track}
                role="img"
                aria-label={`${row.label}: ${label}`}
              >
                {ticks.map((t) => (
                  <span
                    key={t}
                    className={styles.grid}
                    style={{ left: pct(t) }}
                    aria-hidden="true"
                  />
                ))}
                <div className={styles.bar} style={{ width: pct(total) }}>
                  {row.values.map((v, i) =>
                    v ? (
                      <span
                        key={series[i].name}
                        className={styles.seg}
                        style={{ flexGrow: v, background: colors[i] }}
                        title={`${series[i].name} ${withUnit(v)}`}
                      />
                    ) : null,
                  )}
                </div>
                {row.limit !== undefined && (
                  <span
                    className={styles.limit}
                    style={{ left: pct(row.limit) }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.axis} aria-hidden="true">
        {ticks.map((t) => (
          <span key={t} style={{ left: pct(t) }}>
            {format(t)}
          </span>
        ))}
      </div>

      <details className={styles.table}>
        <summary>표로 보기{unit && ` (단위 ${unit})`}</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">항목</th>
              {series.map((s) => (
                <th scope="col" key={s.name}>
                  {s.name}
                </th>
              ))}
              {hasStack && <th scope="col">합계</th>}
              {hasLimit && <th scope="col">{limitLabel}</th>}
              {hasLimit && <th scope="col">초과</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const total = sum(row.values);
              const over =
                row.limit !== undefined ? total - row.limit : undefined;
              return (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((v, i) => (
                    <td key={series[i].name}>
                      {v === null ? "-" : format(v)}
                    </td>
                  ))}
                  {hasStack && <td>{format(total)}</td>}
                  {hasLimit && (
                    <td>{row.limit !== undefined ? format(row.limit) : "-"}</td>
                  )}
                  {hasLimit && (
                    <td>
                      {over !== undefined && over > 0 ? format(over) : "-"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>

    </Figure>
  );
}
