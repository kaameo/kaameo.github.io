import Figure from "@/components/Figure";
import styles from "./TradeoffBoard.module.css";

// 트레이드오프 절의 2단 비교 보드: 런타임에서 얻은 것과 빌드·개발·운영에서 잃은 것을 나란히 정리한다.

const GAINS = [
  {
    title: "실행 메모리 대폭 절감",
    desc: "동일 조건 RSS −44~45%, 운영 limit 448 → 256Mi로 낮춰 노드 request 192Mi 확보",
  },
  {
    title: "빠른 기동 속도",
    desc: "운영 기동 23~28초 → 1.1초. 여유 공간이 없어 maxSurge: 0으로 배포하는 노드의 중단 시간 축소",
  },
  {
    title: "가벼운 컨테이너 이미지",
    desc: "JRE가 빠져 압축 이미지 204.5 → 144.3MiB(−29%), 레이어 9 → 4개로 단축",
  },
];

const COSTS = [
  {
    title: "무거운 CI 빌드와 러너 메모리",
    desc: "이 앱 job만 13~18분(다른 앱 3~6분), Peak RSS 12.2GB(러너 16GB). 빌드 실패 시 6개 앱 배포가 함께 멈춤",
  },
  {
    title: "빌드 시점에 굳는 설정",
    desc: "prod 프로필과 포트 조건이 AOT에서 고정돼 로컬 실행 불가. 평소 개발은 JVM으로 병행",
  },
  {
    title: "수동 메타데이터와 검증 공백",
    desc: "새 record·이벤트·설정 파일 추가 시 hints 누락 위험. JVM 테스트는 통과하고 운영 native에서만 실패",
  },
  {
    title: "관측·진단 도구 제약",
    desc: "GC pause·non-heap 지표 부재, JFR 제한, JAVA_TOOL_OPTIONS 무시. 최고 처리량(JIT 부재)은 미측정",
  },
  {
    title: "OS · CPU · glibc 종속",
    desc: "빌드한 러너(ubuntu 24.04 · x86-64-v3) 전용 바이너리. 로컬 macOS 빌드와 운영 바이너리가 다름",
  },
];

export default function TradeoffBoard() {
  return (
    <Figure
      title="JVM에서 Native Image로 바꾸며 얻은 것과 잃은 것"
      caption="런타임 자원은 확실히 줄었지만, 그 비용이 CI 빌드 시간·개발 피드백·관측성으로 옮겨 갔다."
    >
      <div className={styles.cols}>
        <div className={styles.col} style={{ borderTopColor: "var(--chart-3)" }}>
          <div className={styles.colHead} style={{ color: "var(--chart-3)" }}>
            <span>얻은 것 (런타임)</span>
            <span>3가지</span>
          </div>
          <ul className={styles.list}>
            {GAINS.map((item) => (
              <li key={item.title}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemDesc}>{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col} style={{ borderTopColor: "var(--chart-2)" }}>
          <div className={styles.colHead} style={{ color: "var(--chart-2)" }}>
            <span>잃은 것 (빌드 · 개발 · 운영)</span>
            <span>5가지</span>
          </div>
          <ul className={styles.list}>
            {COSTS.map((item) => (
              <li key={item.title}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemDesc}>{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Figure>
  );
}
