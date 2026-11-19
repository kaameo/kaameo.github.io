import Figure from "@/components/Figure";
import styles from "./Cycle.module.css";

// 글 첫머리의 그림: 티켓 하나가 계획·테스트·리뷰 세 고리를 지나 병합되고, 배포 확인 뒤 다음 티켓으로 돌아오는 흐름.
// 고리마다 위쪽 호가 해 보는 일, 오른쪽 틈이 통과 조건(나가는 화살표), 아래쪽 호가 통과하지 못했을 때 돌아가는 길이다.
// 하는 사람에 따라 색을 나눈다: 개발자(나)는 --chart-1, AI(Claude Code, CI의 Claude 리뷰)는 --chart-2. 이 글에서만 쓰는 그림이라 글 폴더에 둔다.

const CY = 110; // 고리 중심의 y
const R = 56; // 고리 반지름
const GAP = 10; // 고리 왼쪽(들어오는 곳)과 오른쪽(나가는 곳)에 남기는 틈의 절반(도)
const RETURN_Y = 236; // 다음 티켓으로 돌아오는 선의 y
const START = { x: 8, w: 56, h: 40 }; // "이슈" 상자
const START_CX = START.x + START.w / 2;
const EXIT_X = 652; // 마지막 고리에서 나와 아래로 꺾는 x

type Actor = "dev" | "ai";
const ACTORS: Record<Actor, { name: string; color: string; arrow: string }> = {
  dev: { name: "개발자", color: "var(--chart-1)", arrow: "cycle-arrow-dev" },
  ai: { name: "AI", color: "var(--chart-2)", arrow: "cycle-arrow-ai" },
};
const NEUTRAL_ARROW = "cycle-arrow";

type Step = { label: string; by: Actor };
type Loop = {
  cx: number;
  name: string;
  run: Step; // 위쪽 호: 한 번 해 보는 일
  retry: Step; // 아래쪽 호: 통과하지 못했을 때 하는 일
  pass: Step; // 나가는 화살표: 통과 조건
};

const LOOPS: Loop[] = [
  {
    cx: 160,
    name: "계획",
    run: { label: "플랜·질문", by: "ai" },
    retry: { label: "답·되묻기", by: "dev" },
    pass: { label: "승인", by: "dev" },
  },
  {
    cx: 350,
    name: "테스트",
    run: { label: "실패 → 통과", by: "ai" },
    retry: { label: "다음 테스트", by: "ai" },
    pass: { label: "PR", by: "ai" },
  },
  {
    cx: 540,
    name: "리뷰",
    run: { label: "CI 리뷰", by: "ai" },
    retry: { label: "수정·답글", by: "ai" },
    pass: { label: "병합", by: "dev" },
  },
];

const round = (n: number) => Math.round(n * 10) / 10;

// 고리 위의 점. 각도는 화면 기준이라 0°가 오른쪽, 90°가 아래쪽이다.
function point(cx: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return `${round(cx + R * Math.cos(rad))} ${round(CY + R * Math.sin(rad))}`;
}

// 시계 방향 호. from에서 to까지 각도가 늘어나는 쪽으로 그린다.
const arc = (cx: number, from: number, to: number) => `M${point(cx, from)}A${R} ${R} 0 0 1 ${point(cx, to)}`;

// 하는 사람 색으로 칠한 선·글자 속성
const stroke = (by: Actor) => ({ style: { stroke: ACTORS[by].color }, markerEnd: `url(#${ACTORS[by].arrow})` });
const label = (by: Actor) => ({ fontWeight: 600, style: { fill: ACTORS[by].color } });

const ALT =
  "티켓 하나가 지나는 흐름. 이슈에서 시작해 계획, 테스트, 리뷰 세 고리를 차례로 돈다. 계획은 AI가 플랜과 질문을 내고 개발자가 답하거나 되물으며 돌다가 개발자가 승인하면 나간다. 테스트는 AI가 실패하는 테스트를 통과시키며 단계마다 돌고 다 끝나면 PR을 만든다. 리뷰는 CI의 AI 리뷰 지적을 AI가 수정하고 답글을 달며 돌다가 개발자가 병합하면 나간다. 병합 뒤에는 개발자가 배포된 운영에서 확인하고 이슈를 닫은 뒤 다음 이슈로 돌아온다.";

export default function Cycle() {
  const last = LOOPS[LOOPS.length - 1];
  return (
    <Figure className={styles.cycle} title="하나의 이슈 티켓이 병합되기까지의 과정">
      <ul className={styles.legend}>
        {Object.values(ACTORS).map((a) => (
          <li key={a.name} style={{ color: a.color }}>
            <span className={styles.swatch} style={{ background: a.color }} aria-hidden="true" />
            {a.name}
          </li>
        ))}
      </ul>

      {/* 글자는 fill="currentColor"로 본문 글자색(--fg)을 따른다. */}
      <svg className={styles.svg} width={680} height={232} viewBox="0 16 680 232" fill="currentColor" role="img" aria-label={ALT}>
        <defs>
          {[
            { id: NEUTRAL_ARROW, color: "var(--muted)" },
            ...Object.values(ACTORS).map((a) => ({ id: a.arrow, color: a.color })),
          ].map(({ id, color }) => (
            <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" style={{ fill: color }} />
            </marker>
          ))}
        </defs>

        <g fill="none" strokeWidth={1.5}>
          {/* 시작: 이슈 */}
          <rect x={START.x} y={CY - START.h / 2} width={START.w} height={START.h} rx={8} style={{ stroke: "var(--muted)" }} />
          <line
            x1={START.x + START.w + 2}
            y1={CY}
            x2={LOOPS[0].cx - R - 3}
            y2={CY}
            style={{ stroke: "var(--muted)" }}
            markerEnd={`url(#${NEUTRAL_ARROW})`}
          />

          {LOOPS.map((loop, i) => {
            const next = LOOPS[i + 1];
            return (
              <g key={loop.name}>
                {/* 위쪽 호: 해 본다. 아래쪽 호: 통과하지 못하면 돌아간다. */}
                <path d={arc(loop.cx, 180 + GAP, 360 - GAP)} {...stroke(loop.run.by)} />
                <path d={arc(loop.cx, GAP, 180 - GAP)} {...stroke(loop.retry.by)} />
                {/* 다음 고리로 나가는 화살표. 마지막 고리는 아래 돌아오는 선이 맡는다. */}
                {next && <line x1={loop.cx + R + 3} y1={CY} x2={next.cx - R - 3} y2={CY} {...stroke(loop.pass.by)} />}
              </g>
            );
          })}

          {/* 병합 → 배포 확인 → 이슈 닫기 → 다음 이슈 */}
          <polyline
            points={`${last.cx + R + 3},${CY} ${EXIT_X},${CY} ${EXIT_X},${RETURN_Y} ${START_CX},${RETURN_Y} ${START_CX},${CY + START.h / 2 + 3}`}
            strokeLinejoin="round"
            {...stroke(last.pass.by)}
          />
        </g>

        <g fontSize={13} textAnchor="middle">
          <text x={START_CX} y={CY + 5} fontSize={14}>
            이슈
          </text>

          {LOOPS.map((loop, i) => {
            const next = LOOPS[i + 1];
            const passX = next ? (loop.cx + next.cx) / 2 : (loop.cx + R + EXIT_X) / 2;
            return (
              <g key={loop.name}>
                <text x={loop.cx} y={CY - R - 12} {...label(loop.run.by)}>
                  {loop.run.label}
                </text>
                <text x={loop.cx} y={CY + R + 22} {...label(loop.retry.by)}>
                  {loop.retry.label}
                </text>
                <text x={passX} y={CY - 10} {...label(loop.pass.by)}>
                  {loop.pass.label}
                </text>
                <text x={loop.cx} y={CY + 5} fontSize={15} fontWeight={700}>
                  {loop.name}
                </text>
              </g>
            );
          })}

          <text x={(START_CX + EXIT_X) / 2} y={RETURN_Y - 10} {...label(last.pass.by)}>
            배포 뒤 운영에서 확인 → 이슈 닫기 → 다음 이슈
          </text>
        </g>
      </svg>
    </Figure>
  );
}
