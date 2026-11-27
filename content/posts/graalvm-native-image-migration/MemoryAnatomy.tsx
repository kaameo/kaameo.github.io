import Figure from "@/components/Figure";
import styles from "./MemoryAnatomy.module.css";

// 원인 분석 절의 SVG 그림: customer-support-app 기준으로 JVM과 Native Image의 메모리 구성을 같은 축척으로 나란히 비교한다.
// JVM은 Metaspace·JIT 코드 캐시·Native로 off-heap 280MiB를 상시 쓰므로, heap이 상한(261Mi)까지 차면 448Mi limit을 넘는다.
// Native Image는 빌드 때 AOT 컴파일로 Metaspace와 JIT 코드 캐시를 없애고, -Xmx128m으로 상한을 묶어 256Mi limit 안에 들어온다.

const SCALE = 0.44; // 1 MiB = 0.44px (541MiB ≈ 238px)
const BASE_Y = 310;
const BAR_W = 154;
const LEFT_X = 112;
const RIGHT_X = 486;

const h = (mi: number) => Math.round(mi * SCALE * 10) / 10;
const yAt = (mi: number) => Math.round((BASE_Y - mi * SCALE) * 10) / 10;

// JVM(customer-support-app): heap 실사용 82 + heap 여유 179 (= 상한 261) + off-heap 280 (Metaspace ~140 + JIT ~25 + Native ~115) = 541Mi
const JVM_SEGMENTS = [
  { label: "Heap 실사용", value: 82, detail: "82Mi", fill: "var(--chart-1)", textLight: true },
  { label: "Heap 여유", value: 179, detail: "상한 261Mi", fill: "var(--chart-1-track)", textLight: false },
  { label: "Metaspace", value: 140, detail: "~140Mi", fill: "var(--chart-2)", textLight: true },
  { label: "JIT 코드 캐시", value: 25, detail: "~25Mi", fill: "var(--chart-4)", textLight: false },
  { label: "Native", value: 115, detail: "~115Mi", fill: "var(--soft)", stroke: "var(--line)", textLight: false },
];

// Native Image(256Mi · -Xmx128m, 17시간 실측): heap 실사용 52 + heap 여유 76 (= 상한 128) + Native·Page Cache 71 (working set 123 - 52) = 199Mi
const NATIVE_SEGMENTS = [
  { label: "Heap 실사용", value: 52, detail: "52Mi", fill: "var(--chart-3)", textLight: true },
  { label: "Heap 여유", value: 76, detail: "-Xmx128m", fill: "var(--chart-3-track)", textLight: false },
  { label: "Native·Cache", value: 71, detail: "71Mi", fill: "var(--soft)", stroke: "var(--line)", textLight: false },
];

function stackLayout(segments: typeof JVM_SEGMENTS) {
  let acc = 0;
  return segments.map((seg) => {
    const bottom = acc;
    acc += seg.value;
    const topY = yAt(acc);
    const height = h(seg.value);
    return { ...seg, bottom, top: acc, y: topY, height, midY: Math.round((topY + height / 2) * 10) / 10 };
  });
}

const jvmStack = stackLayout(JVM_SEGMENTS);
const nativeStack = stackLayout(NATIVE_SEGMENTS);

const jvmLimitY = yAt(448); // 112.9
const nativeLimitY = yAt(256); // 197.4

// JVM off-heap 브래킷 범위 (261Mi ~ 541Mi)
const offHeapBottomY = yAt(261); // 195.2
const offHeapTopY = yAt(541); // 72.0
const offHeapMidY = Math.round(((offHeapBottomY + offHeapTopY) / 2) * 10) / 10; // 133.6

const ALT =
  "customer-support-app 기준 JVM과 Native Image의 메모리 구조 비교. JVM은 heap 실사용 82Mi, heap 여유 179Mi 위에 Metaspace, JIT 코드 캐시, Native로 구성된 off-heap 280Mi가 얹혀 상한 도달 시 541Mi로 448Mi limit을 93Mi 넘는다. Native Image는 빌드 때 AOT 컴파일로 Metaspace와 JIT 코드 캐시가 사라져 heap 상한 128Mi와 Native·Page Cache 71Mi를 합쳐도 199Mi로 256Mi limit 안에 들어온다.";

export default function MemoryAnatomy() {
  return (
    <Figure
      title="JVM과 Native Image의 메모리 구조 비교 (customer-support-app)"
      caption="같은 축척(MiB)으로 그렸다. JVM off-heap 280Mi의 세부 구간은 6개 앱 측정 비율(Metaspace 130~152Mi, JIT 코드 캐시 20~43Mi, Native 117~163Mi)을 반영했다. Native는 256Mi·-Xmx128m 적용 뒤 17시간 최대 working set(123Mi)과 heap(52Mi) 기준이다."
    >
      <svg className={styles.svg} width={700} height={352} viewBox="0 0 700 352" fill="currentColor" role="img" aria-label={ALT}>
        <defs>
          <marker id="mem-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0L10 5L0 10z" style={{ fill: "var(--chart-3)" }} />
          </marker>
        </defs>

        {/* 바닥 기준선 */}
        <line x1={24} y1={BASE_Y} x2={676} y2={BASE_Y} strokeWidth={1} style={{ stroke: "var(--line)" }} />

        {/* 컬럼 제목 */}
        <text x={LEFT_X + BAR_W / 2} y={24} fontSize={14} fontWeight={700} textAnchor="middle">
          JVM (이전)
        </text>
        <text x={LEFT_X + BAR_W / 2} y={42} fontSize={12} textAnchor="middle" style={{ fill: "var(--muted)" }}>
          최대 541Mi · limit 448Mi 초과
        </text>

        <text x={RIGHT_X + BAR_W / 2} y={24} fontSize={14} fontWeight={700} textAnchor="middle" style={{ fill: "var(--chart-3)" }}>
          Native Image (이후)
        </text>
        <text x={RIGHT_X + BAR_W / 2} y={42} fontSize={12} textAnchor="middle" style={{ fill: "var(--muted)" }}>
          최대 199Mi · limit 256Mi 이내
        </text>

        {/* 왼쪽: JVM 스택 */}
        {jvmStack.map((seg) => (
          <g key={seg.label}>
            <rect
              x={LEFT_X}
              y={seg.y}
              width={BAR_W}
              height={Math.max(seg.height - 1.5, 4)}
              rx={3}
              style={{
                fill: seg.fill,
                stroke: seg.stroke ?? "none",
                strokeWidth: seg.stroke ? 1 : 0,
              }}
            />
            {seg.height >= 22 ? (
              <text
                x={LEFT_X + BAR_W / 2}
                y={seg.midY + 4}
                fontSize={11.5}
                fontWeight={seg.textLight ? 600 : 500}
                textAnchor="middle"
                style={{ fill: seg.textLight ? "#ffffff" : "var(--fg)" }}
              >
                {seg.label} ({seg.detail})
              </text>
            ) : (
              /* JIT 코드 캐시(얇은 블록)는 왼쪽 바깥에 깔끔하게 지시선과 라벨 표시 */
              <g>
                <line x1={LEFT_X - 10} y1={seg.midY} x2={LEFT_X - 2} y2={seg.midY} strokeWidth={1.2} style={{ stroke: "var(--chart-4)" }} />
                <text x={LEFT_X - 14} y={seg.midY + 4} fontSize={11} textAnchor="end" style={{ fill: "var(--muted)" }}>
                  JIT ({seg.detail})
                </text>
              </g>
            )}
          </g>
        ))}

        {/* JVM limit 448Mi 선 (라벨은 왼쪽 여백에 배치해 막대 글자·JIT 라벨과 겹치지 않게 한다) */}
        <line
          x1={LEFT_X - 10}
          y1={jvmLimitY}
          x2={LEFT_X + BAR_W + 6}
          y2={jvmLimitY}
          strokeWidth={2}
          strokeDasharray="5 3"
          style={{ stroke: "var(--fg)" }}
        />
        <text x={LEFT_X - 14} y={jvmLimitY - 14} fontSize={11.5} fontWeight={700} textAnchor="end" className={styles.mono}>
          limit 448Mi
        </text>
        <text x={LEFT_X - 14} y={jvmLimitY - 1} fontSize={10.5} textAnchor="end" style={{ fill: "var(--chart-2)" }}>
          +93Mi 초과
        </text>

        {/* JVM off-heap 브래킷 (오른쪽 여백) */}
        <path
          d={`M${LEFT_X + BAR_W + 8} ${offHeapTopY + 2} h8 V${offHeapBottomY - 2} h-8`}
          fill="none"
          strokeWidth={1.5}
          style={{ stroke: "var(--chart-2)" }}
        />
        <text x={LEFT_X + BAR_W + 24} y={offHeapMidY - 4} fontSize={12.5} fontWeight={700} style={{ fill: "var(--chart-2)" }}>
          off-heap 280Mi
        </text>
        <text x={LEFT_X + BAR_W + 24} y={offHeapMidY + 13} fontSize={11} style={{ fill: "var(--muted)" }}>
          앱마다 상시 고정 비용
        </text>

        {/* 가운데 전환 영역: AOT 컴파일 */}
        <g>
          <rect
            x={292}
            y={202}
            width={150}
            height={82}
            rx={8}
            style={{ fill: "var(--code)", stroke: "var(--line)" }}
            strokeWidth={1}
          />
          <text x={367} y={224} fontSize={12.5} fontWeight={700} textAnchor="middle">
            AOT 컴파일
          </text>
          <text x={367} y={242} fontSize={11} textAnchor="middle" style={{ fill: "var(--chart-2)" }}>
            Metaspace 제거
          </text>
          <text x={367} y={258} fontSize={11} textAnchor="middle" style={{ fill: "var(--chart-4)" }}>
            JIT 코드 캐시 제거
          </text>
          <text x={367} y={274} fontSize={10.5} textAnchor="middle" style={{ fill: "var(--muted)" }}>
            필요한 클래스만 기계어로
          </text>

          {/* off-heap 브래킷 하단에서 AOT 박스로 이어지는 점선 */}
          <path
            d={`M${LEFT_X + BAR_W + 16} ${offHeapMidY + 26} V243 H290`}
            fill="none"
            strokeWidth={1.2}
            strokeDasharray="3 3"
            style={{ stroke: "var(--muted)" }}
          />
          {/* AOT 박스에서 Native 막대로 가는 화살표 */}
          <line
            x1={446}
            y1={243}
            x2={RIGHT_X - 10}
            y2={243}
            strokeWidth={2}
            style={{ stroke: "var(--chart-3)" }}
            markerEnd="url(#mem-arrow)"
          />
        </g>

        {/* 오른쪽: Native Image 스택 */}
        {nativeStack.map((seg) => (
          <g key={seg.label}>
            <rect
              x={RIGHT_X}
              y={seg.y}
              width={BAR_W}
              height={Math.max(seg.height - 1.5, 4)}
              rx={3}
              style={{
                fill: seg.fill,
                stroke: seg.stroke ?? "none",
                strokeWidth: seg.stroke ? 1 : 0,
              }}
            />
            <text
              x={RIGHT_X + BAR_W / 2}
              y={seg.midY + 4}
              fontSize={11.5}
              fontWeight={seg.textLight ? 600 : 500}
              textAnchor="middle"
              style={{ fill: seg.textLight ? "#ffffff" : "var(--fg)" }}
            >
              {seg.label} ({seg.detail})
            </text>
          </g>
        ))}

        {/* Native limit 256Mi 선 */}
        <line
          x1={RIGHT_X - 10}
          y1={nativeLimitY}
          x2={RIGHT_X + BAR_W + 10}
          y2={nativeLimitY}
          strokeWidth={2}
          strokeDasharray="5 3"
          style={{ stroke: "var(--fg)" }}
        />
        <text x={RIGHT_X + BAR_W + 10} y={nativeLimitY - 6} fontSize={11.5} fontWeight={700} textAnchor="end" className={styles.mono}>
          limit 256Mi
        </text>
        <text x={RIGHT_X + BAR_W + 10} y={nativeLimitY + 15} fontSize={11} textAnchor="end" style={{ fill: "var(--chart-3)" }}>
          57Mi 여유
        </text>

        {/* 하단 요약 라벨 */}
        <text x={LEFT_X + BAR_W / 2} y={334} fontSize={12} textAnchor="middle" style={{ fill: "var(--muted)" }}>
          운영 working set 391Mi (7일 최대 404Mi)
        </text>
        <text x={RIGHT_X + BAR_W / 2} y={334} fontSize={12} textAnchor="middle" style={{ fill: "var(--chart-3)" }} fontWeight={600}>
          운영 working set 최대 123Mi (RSS 80Mi)
        </text>
      </svg>
    </Figure>
  );
}
