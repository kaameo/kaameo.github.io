import Figure from "@/components/Figure";
import styles from "./DecisionQuadrant.module.css";

// 결정 절의 2x2 사분면 SVG: 변경 빈도·동적 기능(가로축)과 트래픽·진단 중요도(세로축)로 각 앱의 런타임 선택을 보여 준다.

const PLOT = { left: 86, right: 644, top: 34, bottom: 296 };
const MID_X = (PLOT.left + PLOT.right) / 2; // 365
const MID_Y = (PLOT.top + PLOT.bottom) / 2; // 165

type AppPoint = {
  name: string;
  note: string;
  x: number;
  y: number;
  runtime: "native" | "jvm";
  align?: "start" | "middle" | "end";
};

const APPS: AppPoint[] = [
  { name: "customer-support", note: "Native 유지", x: 200, y: 232, runtime: "native", align: "middle" },
  { name: "appearance", note: "JVM", x: 196, y: 124, runtime: "jvm", align: "middle" },
  { name: "member", note: "JVM", x: 300, y: 92, runtime: "jvm", align: "middle" },
  { name: "billing", note: "결제 · JFR 중요", x: 446, y: 90, runtime: "jvm", align: "middle" },
  { name: "lecture", note: "주문·강의", x: 576, y: 100, runtime: "jvm", align: "middle" },
  { name: "chat", note: "WebSocket", x: 510, y: 138, runtime: "jvm", align: "middle" },
  { name: "aux-app (신규)", note: "AI · 검색 · 알림", x: 526, y: 226, runtime: "jvm", align: "middle" },
];

const ALT =
  "변경 빈도·동적 기능(가로축)과 트래픽·진단 중요도(세로축)로 그린 2x2 결정 사분면. 왼쪽 아래 Native Image 적합 구역에는 customer-support 앱만 놓이고, 트래픽과 진단이 중요한 billing, lecture, chat, member, appearance와 Spring AI·ES 클라이언트가 들어가는 신규 aux-app은 모두 JVM 구역에 남겼다.";

export default function DecisionQuadrant() {
  return (
    <Figure
      title="앱별 런타임 결정: customer-support 하나만 Native로 남겼다"
      caption="좌표는 운영 트래픽·진단 필요도와 변경 빈도를 바탕으로 한 정성적 위치다."
    >
      <svg className={styles.svg} width={680} height={340} viewBox="0 0 680 340" fill="currentColor" role="img" aria-label={ALT}>
        {/* Native 적합 구역(좌하단) 강조 배경 */}
        <rect
          x={PLOT.left}
          y={MID_Y}
          width={MID_X - PLOT.left}
          height={PLOT.bottom - MID_Y}
          style={{ fill: "var(--chart-3)", fillOpacity: 0.08 }}
        />

        {/* 외곽선과 십자 기준선 */}
        <rect
          x={PLOT.left}
          y={PLOT.top}
          width={PLOT.right - PLOT.left}
          height={PLOT.bottom - PLOT.top}
          rx={6}
          fill="none"
          strokeWidth={1}
          style={{ stroke: "var(--line)" }}
        />
        <line x1={MID_X} y1={PLOT.top} x2={MID_X} y2={PLOT.bottom} strokeWidth={1} strokeDasharray="4 4" style={{ stroke: "var(--line)" }} />
        <line x1={PLOT.left} y1={MID_Y} x2={PLOT.right} y2={MID_Y} strokeWidth={1} strokeDasharray="4 4" style={{ stroke: "var(--line)" }} />

        {/* 사분면 라벨 */}
        <text x={PLOT.left + 14} y={PLOT.top + 22} fontSize={11.5} fontWeight={600} style={{ fill: "var(--muted)" }}>
          JVM 유지 · 튜닝 우선
        </text>
        <text x={PLOT.right - 14} y={PLOT.top + 22} fontSize={11.5} fontWeight={600} textAnchor="end" style={{ fill: "var(--muted)" }}>
          JVM 유지 (처리량 · 진단 중요)
        </text>
        <text x={PLOT.left + 14} y={PLOT.bottom - 12} fontSize={12} fontWeight={700} style={{ fill: "var(--chart-3)" }}>
          Native Image 적합 (저트래픽 · 변경 적음)
        </text>
        <text x={PLOT.right - 14} y={PLOT.bottom - 12} fontSize={11.5} fontWeight={600} textAnchor="end" style={{ fill: "var(--muted)" }}>
          JVM 선택 (새 기능 · 동적 라이브러리 집중)
        </text>

        {/* 앱 점과 라벨 */}
        {APPS.map((app) => {
          const isNative = app.runtime === "native";
          const color = isNative ? "var(--chart-3)" : "var(--chart-1)";
          return (
            <g key={app.name}>
              {isNative && (
                <circle cx={app.x} cy={app.y} r={12} style={{ fill: color, fillOpacity: 0.16 }} />
              )}
              <circle cx={app.x} cy={app.y} r={isNative ? 6 : 5} style={{ fill: color }} />
              <text
                x={app.x}
                y={app.y - 12}
                fontSize={isNative ? 13 : 12}
                fontWeight={isNative ? 700 : 600}
                textAnchor={app.align ?? "middle"}
                style={{ fill: isNative ? "var(--chart-3)" : "var(--fg)" }}
              >
                {app.name}
              </text>
              <text
                x={app.x}
                y={app.y + 19}
                fontSize={11}
                textAnchor={app.align ?? "middle"}
                style={{ fill: "var(--muted)" }}
              >
                {app.note}
              </text>
            </g>
          );
        })}

        {/* 축 제목 */}
        <text x={MID_X} y={326} fontSize={12} textAnchor="middle" style={{ fill: "var(--muted)" }}>
          ← 변경 빈도 · 동적 기능 낮음 &nbsp;&nbsp;|&nbsp;&nbsp; 변경 빈도 · 외부 라이브러리 높음 →
        </text>
        <text
          x={28}
          y={MID_Y}
          fontSize={12}
          textAnchor="middle"
          transform={`rotate(-90 28 ${MID_Y})`}
          style={{ fill: "var(--muted)" }}
        >
          트래픽 · 진단(JFR/GC) 중요도 →
        </text>
        <text x={74} y={PLOT.top + 10} fontSize={11} textAnchor="end" style={{ fill: "var(--muted)" }}>
          높음
        </text>
        <text x={74} y={PLOT.bottom - 4} fontSize={11} textAnchor="end" style={{ fill: "var(--muted)" }}>
          낮음
        </text>
      </svg>
    </Figure>
  );
}
