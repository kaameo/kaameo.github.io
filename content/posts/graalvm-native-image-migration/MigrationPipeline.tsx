import Figure from "@/components/Figure";
import styles from "./MigrationPipeline.module.css";

// 전환 과정 절의 그림: 빌드 타임(CI)과 런타임(Smoke 테스트) 두 단계로 나눠, 각각 어디서 어떤 문제가 잡혔는지 보여 준다.

const BUILD_STEPS = [
  { name: "processAot", desc: "prod 프로필·포트 고정" },
  { name: "metadata.json", desc: "리소스 2 · record 5 · 예외 33" },
  { name: "nativeCompile", desc: "sharedLibrary = false" },
  { name: "Dockerfile.native", desc: "ubuntu:24.04 바이너리" },
];

const BUILD_BUGS = [
  {
    title: "① 실행 파일 대신 app.so 생성",
    fix: "루트의 java-library 플러그인 기본값 때문 → sharedLibrary = false 명시",
  },
  {
    title: "② bootJar 메타데이터 경로 충돌",
    fix: "수동 파일과 AOT 생성 파일 경로가 겹침 → 별도 hints 경로로 분리",
  },
];

const RUNTIME_STEPS = [
  { name: "JVM + AOT", desc: "AOT 빈 정의 확인" },
  { name: "macOS Native", desc: "빠른 수정·재확인 (~4분)" },
  { name: "Linux Native", desc: "운영과 동일한 바이너리" },
];

const RUNTIME_BUGS = [
  {
    title: "③ 설정 파일 누락으로 기동 실패",
    fix: "spring.config.import 대상 YAML 2개 → resources에 glob 등록",
  },
  {
    title: "④ 알 수 없는 Kafka 메시지에 listener 정지",
    fix: "ErrorHandlingDeserializer 예외 체인 직렬화 실패 → tracing agent로 33개 타입 등록",
  },
  {
    title: "⑤ 강의 내부 API 호출 500 오류",
    fix: "record JSON 직렬화 누락 → reflection 5개 등록",
  },
];

export default function MigrationPipeline() {
  return (
    <Figure
      title="Native Image 빌드·검증 파이프라인과 단계별로 잡힌 문제 5건"
      caption="기존 JVM 단위 테스트 212개는 한 줄도 고치지 않고 통과했다. 하지만 reflection·리소스·직렬화 누락은 실제 실행 경로를 밟는 smoke 테스트에서만 드러났다."
    >
      <div className={styles.phases}>
        <section className={styles.phase} aria-label="빌드 타임">
          <div className={styles.phaseHead}>
            <div className={styles.phaseTitle}>
              <span className={styles.badge} style={{ background: "var(--chart-1)" }}>
                BUILD
              </span>
              빌드 타임 (AOT 컴파일 · CI)
            </div>
            <span className={styles.phaseMeta}>4 vCPU · 10~14분 · 최대 12GB RAM</span>
          </div>

          <ol className={styles.steps}>
            {BUILD_STEPS.map((s) => (
              <li key={s.name}>
                <span className={styles.stepBox}>
                  <strong>{s.name}</strong>
                  <span>{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className={styles.bugs}>
            {BUILD_BUGS.map((b) => (
              <div key={b.title} className={styles.bug} style={{ borderLeftColor: "var(--chart-2)" }}>
                <span className={styles.bugTitle}>{b.title}</span>
                <span className={styles.bugFix}>{b.fix}</span>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.bridge}>↓ JVM 테스트 212개 통과 ≠ Native 동작 보장 ↓</div>

        <section className={styles.phase} aria-label="런타임 검증">
          <div className={styles.phaseHead}>
            <div className={styles.phaseTitle}>
              <span className={styles.badge} style={{ background: "var(--chart-3)" }}>
                VERIFY
              </span>
              런타임 검증 (동일 Smoke 스크립트 + Tracing Agent)
            </div>
            <span className={styles.phaseMeta}>HTTP · 내부 API · Kafka 발행/소비 · 300건 반복</span>
          </div>

          <ol className={styles.steps}>
            {RUNTIME_STEPS.map((s) => (
              <li key={s.name}>
                <span className={styles.stepBox}>
                  <strong>{s.name}</strong>
                  <span>{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className={styles.bugs}>
            {RUNTIME_BUGS.map((b) => (
              <div key={b.title} className={styles.bug} style={{ borderLeftColor: "var(--chart-4)" }}>
                <span className={styles.bugTitle}>{b.title}</span>
                <span className={styles.bugFix}>{b.fix}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Figure>
  );
}
