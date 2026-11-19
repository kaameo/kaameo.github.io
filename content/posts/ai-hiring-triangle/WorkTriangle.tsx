import Figure from "@/components/Figure";
import styles from "./WorkTriangle.module.css";

// "삼각형 모델" 절의 그림: 대리 높이에서 θ로 내린 삼각형과, 같은 θ로 과장 높이에서 내린 점선 삼각형.
// 이 글에서만 쓰는 그림이라 공용 컴포넌트로 만들지 않고 글 폴더에 둔다. 색은 CSS 변수라 테마 토글을 따라간다.

const AXIS_X = 90; // 세로축(숙련도)의 x
const AXIS_END = 620; // 가로축 화살표 끝의 x
const BASE_Y = 380; // 가로축(오너십 범위)의 y
const APEX_X = 390; // 꼭짓점의 x
const STEP = 56; // 직급 한 칸의 높이
const HALF_TAN = 0.65; // tan(θ/2). 두 삼각형이 같은 θ를 쓴다.
const ARC_R = 28; // θ를 표시하는 호의 반지름

const LEVELS = ["사원", "대리", "과장", "차장", "부장"] as const;
type Level = (typeof LEVELS)[number];

const ACCENT = "var(--chart-1)";
const muted = { fill: "var(--muted)" };
const ARROW = "work-triangle-arrow";

const round = (n: number) => Math.round(n * 100) / 100;
const levelY = (level: Level) => BASE_Y - STEP * (LEVELS.indexOf(level) + 1);

// 그 직급 높이의 꼭짓점에서 θ로 내린 삼각형. left·right는 밑변(오너십 범위)의 양 끝 x다.
function triangle(level: Level) {
  const y = levelY(level);
  const half = (BASE_Y - y) * HALF_TAN;
  return { y, left: round(APEX_X - half), right: round(APEX_X + half) };
}

type Triangle = ReturnType<typeof triangle>;
const points = (t: Triangle) => `${t.left},${BASE_Y} ${APEX_X},${t.y} ${t.right},${BASE_Y}`;

const daeri = triangle("대리");
const gwajang = triangle("과장");

// θ 호의 양 끝: 꼭짓점에서 두 변을 따라 ARC_R만큼 내려간 점
const arcDx = round(ARC_R * Math.sin(Math.atan(HALF_TAN)));
const arcDy = round(ARC_R * Math.cos(Math.atan(HALF_TAN)));
const arc = `M${round(APEX_X - arcDx)} ${round(daeri.y + arcDy)}A${ARC_R} ${ARC_R} 0 0 0 ${round(APEX_X + arcDx)} ${round(daeri.y + arcDy)}`;

const ALT =
  "숙련도 h, 레버리지 θ로 그린 업무 삼각형. 대리 높이에서 내린 삼각형과 같은 θ로 과장 높이에서 내린 점선 삼각형을 겹쳐 그렸고, 과장 쪽이 밑변(오너십 범위)도 넓이(업무 총량)도 더 크다.";

export default function WorkTriangle() {
  return (
    <Figure
      title="같은 θ라도 숙련도가 높을수록 오너십 범위와 업무 총량이 커진다"
      caption="h = 숙련도 · θ = 레버리지 · 밑변 = 오너십 범위 · 넓이 = 업무 총량"
    >
      {/* 글자는 fill="currentColor"로 본문 글자색(--fg)을 따른다. */}
      <svg className={styles.svg} width={616} height={352} viewBox="24 70 616 352" fill="currentColor" role="img" aria-label={ALT}>
        <defs>
          <marker id={ARROW} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" style={muted} />
          </marker>
        </defs>

        {/* 대리·과장 높이 안내선 */}
        <g strokeWidth={1} strokeDasharray="4 4" style={{ stroke: "var(--line)" }}>
          {[daeri, gwajang].map((t) => (
            <line key={t.y} x1={AXIS_X} y1={t.y} x2={APEX_X} y2={t.y} />
          ))}
        </g>

        {/* 축 */}
        <g strokeWidth={1.5} fill="none" style={{ stroke: "var(--muted)" }}>
          <line x1={AXIS_X} y1={BASE_Y} x2={AXIS_X} y2={88} markerEnd={`url(#${ARROW})`} />
          <line x1={AXIS_X} y1={BASE_Y} x2={AXIS_END} y2={BASE_Y} markerEnd={`url(#${ARROW})`} />
        </g>
        <text x={100} y={96} fontSize={12} style={muted}>
          숙련도 (h)
        </text>
        <text x={AXIS_END} y={BASE_Y + 30} fontSize={12} textAnchor="end" style={muted}>
          오너십 범위
        </text>

        {/* 직급 눈금. 기준인 대리만 진하게 쓴다. */}
        <g fontSize={13} textAnchor="end">
          {LEVELS.map((level) => (
            <text key={level} x={78} y={levelY(level) + 4} {...(level === "대리" ? { fontWeight: 700 } : { style: muted })}>
              {level}
            </text>
          ))}
        </g>

        {/* 과장 삼각형 (같은 θ) */}
        <polyline points={points(gwajang)} fill="none" strokeWidth={1.5} strokeDasharray="5 4" style={{ stroke: "var(--muted)" }} />
        <text x={round(gwajang.right + 7)} y={BASE_Y - 14} fontSize={12} style={muted}>
          과장 (같은 θ)
        </text>

        {/* 대리 삼각형 */}
        <polygon points={points(daeri)} fillOpacity={0.14} strokeWidth={2} strokeLinejoin="round" style={{ fill: ACCENT, stroke: ACCENT }} />
        <path d={arc} fill="none" strokeWidth={1.5} style={{ stroke: ACCENT }} />
        <text x={APEX_X} y={daeri.y + 48} fontSize={13} fontWeight={700} textAnchor="middle">
          θ
        </text>
        <text x={APEX_X} y={BASE_Y - 20} fontSize={12} textAnchor="middle">
          업무 총량
        </text>
        <circle cx={APEX_X} cy={daeri.y} r={4.5} style={{ fill: ACCENT }} />

        {/* 대리의 오너십 범위 */}
        <g strokeWidth={2.5} strokeLinecap="round" style={{ stroke: ACCENT }}>
          <line x1={daeri.left} y1={BASE_Y} x2={daeri.right} y2={BASE_Y} />
          <line x1={daeri.left} y1={BASE_Y - 7} x2={daeri.left} y2={BASE_Y + 7} />
          <line x1={daeri.right} y1={BASE_Y - 7} x2={daeri.right} y2={BASE_Y + 7} />
        </g>
        <text x={APEX_X} y={BASE_Y + 30} fontSize={12} textAnchor="middle">
          대리의 오너십 범위
        </text>
      </svg>
    </Figure>
  );
}
