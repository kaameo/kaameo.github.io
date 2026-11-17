// 마크다운의 ```chart 블록(JSON)을 가로 누적 막대 그래프로 그린다.
// 빌드 때 HTML로 그려지므로 JS가 없고, 색은 CSS 변수라 테마 토글을 그대로 따라간다.
import {
  formatNumber as format,
  isNumber,
  isObject,
  parseSpecObject,
  specError,
} from "@/lib/figure-spec";

type Series = { name: string; track?: boolean };
// null은 그 항목에 해당 series가 없다는 뜻이다(막대에 안 그리고 표에는 "-"로 쓴다).
// JVM·native를 다른 줄에 나란히 놓을 때처럼, 줄마다 series 하나만 쓰는 비교에 쓴다.
type Value = number | null;
type Row = { label: string; values: Value[]; limit?: number };
type Spec = {
  title: string;
  unit?: string;
  series: Series[];
  rows: Row[];
  limitLabel?: string;
  caption?: string;
};

// 카테고리 색은 순서대로만 쓴다(globals.css의 --chart-1 ~ --chart-4).
const MAX_SLOTS = 4;

function fail(message: string): never {
  return specError("chart", message);
}

function parseSpec(source: string): Spec {
  const { title, unit, series, rows, limitLabel, caption } = parseSpecObject(
    "chart",
    source,
  );

  if (typeof title !== "string" || !title) fail("title이 필요합니다.");
  if (!Array.isArray(series) || series.length === 0)
    fail("series가 비어 있습니다.");
  if (!Array.isArray(rows) || rows.length === 0) fail("rows가 비어 있습니다.");

  const parsedSeries = series.map((s, i): Series => {
    if (!isObject(s) || typeof s.name !== "string")
      fail(`series[${i}]에 name이 필요합니다.`);
    if (s.track === true && i === 0)
      fail(
        "첫 series는 track일 수 없습니다. track은 바로 앞 series의 남은 부분입니다.",
      );
    return { name: s.name, track: s.track === true };
  });
  if (parsedSeries.filter((s) => !s.track).length > MAX_SLOTS)
    fail(`색이 있는 series는 ${MAX_SLOTS}개까지입니다.`);

  const parsedRows = rows.map((r, i): Row => {
    if (!isObject(r) || typeof r.label !== "string")
      fail(`rows[${i}]에 label이 필요합니다.`);
    const { values, limit } = r;
    if (
      !Array.isArray(values) ||
      values.length !== parsedSeries.length ||
      !values.every((v) => v === null || (isNumber(v) && v >= 0)) ||
      values.every((v) => v === null)
    ) {
      fail(
        `rows[${i}].values는 series 수(${parsedSeries.length})만큼의 0 이상 숫자(또는 null)여야 하고, 하나 이상은 숫자여야 합니다.`,
      );
    }
    if (limit !== undefined && !(isNumber(limit) && limit > 0))
      fail(`rows[${i}].limit은 양수여야 합니다.`);
    return { label: r.label, values, limit };
  });

  return {
    title,
    unit: typeof unit === "string" ? unit : undefined,
    series: parsedSeries,
    rows: parsedRows,
    limitLabel: typeof limitLabel === "string" ? limitLabel : "limit",
    caption: typeof caption === "string" ? caption : undefined,
  };
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

export default function Chart({ source }: { source: string }) {
  const {
    title,
    unit = "",
    series,
    rows,
    limitLabel,
    caption,
  } = parseSpec(source);

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
    <figure className="chart">
      <figcaption className="chart-title">{title}</figcaption>

      {(legendSeries.length > 0 || hasLimit) && (
        <ul className="chart-legend">
          {legendSeries.map((s, i) => (
            <li key={s.name}>
              <span
                className="chart-swatch"
                style={{ background: colors[i] }}
                aria-hidden="true"
              />
              {s.name}
            </li>
          ))}
          {hasLimit && (
            <li>
              <span className="chart-swatch-line" aria-hidden="true" />
              {limitLabel}
            </li>
          )}
        </ul>
      )}

      <div className="chart-rows">
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
            <div className="chart-row" key={row.label}>
              <div className="chart-row-head">
                <span className="chart-label">{row.label}</span>
                <span className="chart-value">
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
                className="chart-track"
                role="img"
                aria-label={`${row.label}: ${label}`}
              >
                {ticks.map((t) => (
                  <span
                    key={t}
                    className="chart-grid"
                    style={{ left: pct(t) }}
                    aria-hidden="true"
                  />
                ))}
                <div className="chart-bar" style={{ width: pct(total) }}>
                  {row.values.map((v, i) =>
                    v ? (
                      <span
                        key={series[i].name}
                        className="chart-seg"
                        style={{ flexGrow: v, background: colors[i] }}
                        title={`${series[i].name} ${withUnit(v)}`}
                      />
                    ) : null,
                  )}
                </div>
                {row.limit !== undefined && (
                  <span
                    className="chart-limit"
                    style={{ left: pct(row.limit) }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-axis" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t} style={{ left: pct(t) }}>
            {format(t)}
          </span>
        ))}
      </div>

      <details className="chart-table">
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

      {caption && <p className="chart-note">{caption}</p>}
    </figure>
  );
}
