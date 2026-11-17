---
title: "EC2 두 대짜리 k3s에서 메모리가 모자라 Spring Boot 앱 하나를 GraalVM Native Image로 바꾼 이야기"
date: "2026-11-17"
summary: "JVM 앱이 상시 쓰는 off-heap 메모리를 쪼개 보고, 고객센터 앱 하나를 GraalVM Native Image로 바꿔 메모리 limit을 448Mi에서 256Mi로 낮춘 과정과 트레이드오프를 정리했습니다."
tags: ["Spring Boot", "GraalVM", "JVM", "Kubernetes"]
draft: false
---

## TL;DR

- AWS EC2 두 대(t3.large 8GiB + t3.medium 4GiB)로 만든 k3s 클러스터에 Spring Boot 앱 6개와 데이터·관측성 인프라가 꽉 차 있었다. AI·검색·알림 기능을 더 올려야 했는데, 앱 하나를 띄울 메모리도 남아 있지 않았다.
- 운영 Prometheus로 쪼개 보니 JVM 앱 하나가 **off-heap으로만 280~355MiB를 상시** 쓰고 있었다. 이 글에서 off-heap은 heap을 뺀 프로세스 메모리(RSS − heap committed)를 말한다. Metaspace, 코드 캐시, thread stack·malloc 같은 native 메모리가 여기에 들어간다. 실제 heap 사용은 82~154MiB였다.
- 트래픽이 가장 적은 `customer-support-app` 하나를 **GraalVM Native Image**로 바꿨다. 테스트 코드는 바꾸지 않았다. 기존 JVM 테스트(이 앱 212개, 6개 앱 전체 CI)로 빌드 변경이 JVM 동작을 깨지 않았음을 확인했고, native 동작은 같은 smoke 스크립트를 JVM과 native에 똑같이 돌려 확인했다.
- 결과:
  - **같은 조건(로컬, Serial GC·CPU 2개로 맞춤)**: 메모리 **−44~45%**, 기동 4.3초 → 0.57초
  - **운영**: working set 391Mi(JVM, limit 448Mi) → 최대 123Mi(native, limit 256Mi·`-Xmx128m`, 약 17시간), 기동 23~28초 → **1.1초**. limit을 448Mi에서 256Mi로 낮춰 medium 노드 스케줄러 요청 192Mi를 비웠다.
  - 운영에서 HTTP API, 강의 내부 API 호출, Kafka 발행·받기까지 확인했고, 전환 뒤 30시간 로그에 native 전용 오류는 0건이었다.
- 트레이드 오프: CI가 native 컴파일 10~14분만큼 늘었다. native에서만 드러나는 실행 오류 3가지와 빌드 설정 문제 2가지를 고쳐야 했다. reflection·resource 메타데이터 일부를 사람이 관리해야 한다.

---

## 1. 배경: 어떤 인프라 위에서 돌고 있었나

### 1.1 프로젝트

합방 백엔드는 Gradle 멀티모듈 모놀리스로 시작했다. 지금은 바운디드 컨텍스트마다 독립 Spring Boot 앱으로 나뉘어 있다.

|앱|하는 일|
|---|---|
|member-app|OAuth 로그인, JWT 발급, 회원·역할|
|billing-app|HP 충전·원장·보류·지급·환전, TossPayments|
|appearance-app|출연 요청·모집|
|lecture-app|강의·장바구니·주문·리뷰|
|chat-app|1:1 채팅(WebSocket, Redis Streams·Pub/Sub)|
|customer-support-app|문의·답변·이의 제기 접수|

공통 기술 스택은 다음과 같다.

- Java 25, Spring Boot 4.1.1, Spring Modulith(이벤트 발행 기록)
- Kafka, Redis
- PostgreSQL(인스턴스 하나에 앱마다 database 분리)
- Envoy Gateway(JWT 검증), Resilience4j

### 1.2 AWS 범위: 늘릴 수 없는 두 대

교육 과정에서 받은 AWS 계정이라 범위가 고정돼 있었다. 리소스가 부족하고 더이상 줄일 수 없다고 판단되면 요청하면 됐다. 그래서 메모리 줄여야했다

- EC2 두 대(t3.large 1대, t3.medium 1대), VPC 1개, public subnet 1개, S3 버킷 1개
- CPU credit은 standard 모드다

이 두 대로 k3s 클러스터 하나를 만들었다. 아래는 2026-11-03 기준 limit이다.

```cluster
{
  "title": "EC2 두 대로 만든 k3s 클러스터 (2026-11-03 기준 memory limit)",
  "unit": "Mi",
  "valueLabel": "limit 합계",
  "capacityLabel": "할당 가능",
  "restLabel": "그 밖의 pod·빈 자리",
  "entry": ["인터넷 (HTTPS 443)", "t3.large EIP", "Envoy Gateway proxy"],
  "nodes": [
    {
      "name": "t3.large",
      "details": ["k3s server", "노드 라벨 core-data"],
      "capacity": 7818,
      "groups": [
        { "name": "데이터", "color": 2, "items": [
          { "name": "PostgreSQL", "value": 768 },
          { "name": "Kafka", "value": 700 },
          { "name": "Redis", "value": 64 },
          { "name": "Elasticsearch", "value": 1536 }
        ] },
        { "name": "앱", "color": 1, "items": [
          { "name": "member", "value": 512 },
          { "name": "appearance", "value": 576 },
          { "name": "billing", "value": 448 }
        ] }
      ]
    },
    {
      "name": "t3.medium",
      "details": ["k3s agent", "노드 라벨 app-observe"],
      "capacity": 3832,
      "groups": [
        { "name": "앱", "color": 1, "items": [
          { "name": "lecture", "value": 640 },
          { "name": "customer-support", "value": 448 },
          { "name": "chat", "value": 576 }
        ] },
        { "name": "관측성", "color": 3, "items": [
          { "name": "Prometheus", "value": 416 },
          { "name": "Loki", "value": 256 },
          { "name": "Tempo", "value": 160 },
          { "name": "Grafana", "value": 448 },
          { "name": "Alloy", "value": 192 }
        ] }
      ]
    }
  ],
  "caption": "막대 전체는 노드의 할당 가능 메모리, 색 블록은 pod 하나의 memory limit이다. 회색은 여기 적지 않은 pod(operator·관리 도구 등)와 빈 자리다."
}
```

stateful 워크로드(DB·Kafka·ES)는 large에 고정했다. 앱 일부와 관측성 스택은 medium에 뒀다. dev 브랜치에 병합하면 GitHub Actions가 바뀐 앱의 이미지를 만들어 k3s에 자동으로 배포한다.

### 1.3 이미 빠듯했던 메모리 예산

레포의 자원 예산 문서(`docs/architecture/infrastructure/k3s.md`)는 노드별로 세 가지 숫자를 관리한다. 기준이 서로 달라서 하나씩 설명한다.

|숫자|기준|medium|large|
|---|---|---|---|
|예산 합계|OS·k3s 예상치 + pod limit 합계. "모든 pod가 동시에 limit까지 쓰면"을 가정한다|4,334MiB. 사용 가능 약 3.7GiB를 **약 0.53GiB 초과**|7,582MiB. 사용 가능 약 7.6GiB 대비 **약 200MiB 남음**. 단, 아직 만들지 않은 search-app 448MiB 예약분이 들어 있다|
|할당 가능(allocatable)|kubelet이 pod에 내줄 수 있는 메모리|3,832Mi|7,818Mi|
|request 합계|스케줄러가 pod를 배치할 때 보는 값|3,520Mi(**92%**)|5,274Mi(67%)|

Kubernetes 스케줄러는 request 합계로 pod를 배치한다. 앱 pod는 request와 limit을 같게 두고 있다. 그래서 2026-11-03 기준 medium에는 **312Mi(3,832 − 3,520)보다 큰 pod를 하나도 더 올릴 수 없었다**. large는 스케줄러 기준으로는 여유가 있다. 하지만 예산상 rolling 배포 때 새 pod를 먼저 띄울 공간과 search-app 자리로 잡혀 있다.

---

## 2. 문제: 앱을 더 올려야 한다

최종 프로젝트 범위에는 세 기능이 더 있었다.

- **AI**: 고객센터 FAQ·공지를 근거로 답하는 RAG(OpenAI API 사용)
- **검색**: Elasticsearch(nori 형태소 분석) 기반 통합 검색
- **알림**: 다른 모듈의 이벤트를 받아 회원에게 알리는 기능

Spring Boot 앱 하나는 400~500MiB가 필요하다. 세 개를 따로 띄우면 약 1.3GiB, 하나로 합쳐도 약 0.6GiB가 더 필요했다(추정). medium에는 자리가 없었다. large는 search-app 하나 자리만 예산에 잡혀 있었다.

같은 날 Grafana에 "앱 개요" dashboard(#601)를 만들어 6개 앱을 한 화면에 놓고 보니 상황이 더 분명해졌다.

|앱|limit|7일 최대 working set|사용률|
|---|---|---|---|
|billing|448Mi|448Mi|**100%**|
|lecture|640Mi|589Mi|92%|
|customer-support|448Mi|404Mi|90%|
|member|512Mi|456Mi|89%|
|appearance|576Mi|510Mi|89%|
|chat|576Mi|492Mi|85%|

billing-app은 working set이 limit에 붙어 있었다(RSS 기준 7일 최대 444Mi). Grafana도 448Mi 중 418Mi(93%)까지 올라가 있었다. OOMKilled는 7일 동안 없었다. 그래도 여유가 거의 없어서 둘은 바로 512Mi로 올렸다(#608). 그 결과 남은 공간은 더 줄었다. medium의 request 여유는 248Mi가 됐다.

---

## 3. 원인 분석: JVM 메모리는 어디에 쓰이고 있었나

앱 메모리가 limit의 85~100%에 붙어 있으면 "heap이 크다"고 생각하기 쉽다. 그래서 운영 Prometheus에서 두 종류의 지표를 앱별로 쪼개 봤다. 하나는 Micrometer의 JVM 지표(`jvm_memory_*`), 다른 하나는 cAdvisor의 컨테이너 지표(`container_memory_*`)다.

|앱|limit|heap 상한¹|heap 사용 7일 최대|off-heap²|
|---|---|---|---|---|
|billing|448|261|95|285|
|customer-support|448|261|82|280|
|member|512|298|90|333|
|appearance|576|334|110|318|
|chat|576|334|103|335|
|lecture|640|371|154|355|

(단위 MiB)

1. `-XX:MaxRAMPercentage=60` 기준이다. 448 × 0.6 = 268.8인데 261로 보인다. Serial GC가 보고하는 heap max(`jvm_memory_max_bytes`)에는 survivor 공간 하나가 빠지기 때문이다.
2. RSS − heap committed. 측정 시점의 값이다.

off-heap을 다시 쪼개면 다음과 같다. Metaspace와 코드 캐시는 Micrometer가 `non-heap`으로 보고하는 영역이고, 나머지가 native다.

|영역|크기|정체|
|---|---|---|
|Metaspace(Compressed Class Space 포함)|130~152MiB|클래스 메타데이터. 앱마다 **로드된 클래스가 2.6만~3만 개**다(Spring, Hibernate, Kafka client, Lettuce, Tomcat, springdoc 등). Compressed Class Space(18~21MiB)는 압축 포인터로 가리키는 클래스 메타데이터(Klass) 영역이고, Metaspace 수치에 이미 들어 있다|
|코드 캐시|20~43MiB|JIT가 컴파일한 기계어|
|native(추정)|약 117~163MiB|thread stack(앱마다 60~106개), glibc malloc arena, GC 자료구조, 심볼 테이블 등. RSS − heap committed − non-heap committed로 계산한 추정치다|

이 분해에서 두 가지 결론이 나왔다.

1. **JVM 앱 하나는 off-heap으로만 280~355MiB를 상시 쓴다.** Metaspace와 코드 캐시는 앱이 뜨면 거의 그대로 유지된다. native는 스레드 수와 부하에 따라 조금씩 변한다. 앱을 하나 더 띄울 때마다 이 비용을 다시 낸다.
2. **`-XX:MaxRAMPercentage=60` 설정이 위험하게 잡혀 있었다.** heap 상한과 off-heap을 더하면 6개 앱 모두에서 limit을 76~119MiB 넘었다. billing-app이면 heap 상한 261 + off-heap 285 = 546MiB로, 448Mi limit보다 크다. 트래픽이 늘어 heap이 상한 쪽으로 커지면 cgroup OOMKill 위험이 컸다.

```chart
{
  "title": "heap이 상한까지 차면 6개 앱 모두 limit을 넘는다",
  "unit": "MiB",
  "series": [
    { "name": "heap 사용(7일 최대)" },
    { "name": "heap 상한까지 빈 공간", "track": true },
    { "name": "off-heap" }
  ],
  "rows": [
    { "label": "billing", "values": [95, 166, 285], "limit": 448 },
    { "label": "customer-support", "values": [82, 179, 280], "limit": 448 },
    { "label": "member", "values": [90, 208, 333], "limit": 512 },
    { "label": "appearance", "values": [110, 224, 318], "limit": 576 },
    { "label": "chat", "values": [103, 231, 335], "limit": 576 },
    { "label": "lecture", "values": [154, 217, 355], "limit": 640 }
  ],
  "caption": "heap 상한은 -XX:MaxRAMPercentage=60 기준, off-heap은 RSS − heap committed(측정 시점)다. 막대 끝은 heap이 상한까지 찼을 때의 합이다."
}
```

참고로 JVM은 CPU가 2개 미만이거나 메모리가 1,792MB 미만이면 "server class"가 아니라고 보고 Serial GC를 고른다. 운영 컨테이너는 메모리 조건에 걸려 Serial GC였다(지표 `gc=Copy`, `MarkSweepCompact`). GC 정지 비율은 0%에 가까웠다. GC는 문제가 아니었다.

---

## 4. 선택지 비교

|선택지|효과|문제|
|---|---|---|
|노드 limit만 올리기|당장 OOM 위험은 줄인다|노드에 남은 공간이 없다|
|medium → large로 인스턴스 변경|메모리 +4GiB, 가장 확실하다|AWS 계정이 관리자 소관이라 승인이 필요하다(문의 중)|
|새 기능 3개를 앱 하나(`aux-app`)로 합치기|JVM 고정 비용을 한 번만 낸다(약 1.3GiB → 0.6GiB)|장애 격리와 독립 배포를 잃는다. 별도로 진행하기로 했다|
|JVM 튜닝(heap 상한 고정, `MALLOC_ARENA_MAX`, `-Xss`)|앱당 수십 MiB, 전체 0.4~0.6GiB(추정)|Metaspace 같은 고정 비용은 거의 그대로다|
|**GraalVM Native Image**|Metaspace와 JIT 코드 캐시가 사라진다|빌드가 무겁고, native에서만 깨지는 코드가 생긴다|

Native Image는 빌드할 때 앱 전체를 기계어로 미리 컴파일(AOT)한다. 실행에 필요한 클래스와 객체만 이미지 안에 담는다. 그래서 JVM 고정 비용의 대부분을 차지하던 Metaspace와 JIT 코드 캐시가 없어진다.

문제는 "닫힌 세계(closed world)" 가정이다. 빌드 때 보이지 않는 reflection, 리소스 읽기, 동적 proxy, Java 직렬화는 미리 알려 주지 않으면 실행 중에 실패한다.

그래서 전체 앱에 바로 적용하지 않고, **앱 하나로 먼저 재기로 했다**.

### 왜 customer-support-app인가

- **트래픽이 가장 적다.** 하루 몇 건 수준이라 문제가 생겨도 영향이 작다.
- **외부 연동이 적다.** Kafka 받기 1개, 이벤트 발행 2종, 강의 앱 내부 HTTP 호출 1개가 전부다.
- **그래도 핵심 기술은 다 쓴다.** JPA, Flyway, Kafka, Spring Modulith 이벤트 외부화, Spring Security, 관리 포트 분리, Resilience4j가 모두 들어 있다. 여기서 되면 다른 앱도 판단할 근거가 생긴다.

---

## 5. 적용

### 5.1 Gradle 설정

GraalVM Native Build Tools 플러그인을 적용하면 이 플러그인이 `nativeCompile` task를 만든다. Spring Boot 플러그인은 이 플러그인을 감지해 AOT 처리 task(`processAot`)를 만들고 둘을 연결한다. 플러그인 버전은 Spring Boot 4.1.1 BOM의 `native-build-tools-plugin.version`(1.1.8)에 맞췄다.

```kotlin
// 루트 build.gradle.kts
plugins {
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spring.dependency.management) apply false
    alias(libs.plugins.graalvm.native) apply false
}

// apps/customer-support-app/build.gradle.kts
plugins {
    id("org.springframework.boot")
    id("org.graalvm.buildtools.native")
}
```

여기서 두 가지를 직접 정해야 했다.

**① AOT는 빈 조건을 빌드할 때 굳힌다.** Spring AOT는 `@Profile`, `@ConditionalOnProperty`를 빌드 시점의 설정으로 평가해서, 어떤 빈을 만들지 확정한다. 운영에서만 켜지는 설정이 빌드 때 없으면, 그 빈은 native 이미지에서 사라진다. 이 앱은 운영에서 내부 API 전용 포트(8081)와 actuator 관리 포트(8082)를 따로 연다. 그래서 `processAot`에 운영 조건을 넘겼다.

```kotlin
tasks.named<org.springframework.boot.gradle.tasks.aot.ProcessAot>("processAot") {
    args(
        "--spring.profiles.active=prod",
        "--hapbang.internal-api.port=8081",
        "--management.server.port=8082",
    )
    // 조건 평가 때 풀려야 하는 placeholder에 빌드용 값을 준다. 실제 값은 실행 때 환경 변수로 다시 읽는다.
    environment(mapOf("LECTURE_API_BASE_URL" to "http://lecture-app:8081", /* DB_URL 등 */))
}
```

생성된 AOT 소스(약 300개)를 열어 세 가지가 들어갔는지 확인했다. 관리 포트 context 초기화 코드, 내부 포트 설정, 강의 API client의 빈 정의다.

**② 실행 파일로 만들기.** 루트 빌드 파일은 모든 모듈에 `java-library`를 적용한다. 그런데 Native Build Tools는 `java-library`가 있으면 **공유 라이브러리(`.so`)를 기본값으로** 만든다. 그래서 `sharedLibrary = false`를 직접 줬다. `application` 플러그인을 쓰지 않으므로 `mainClass`도 직접 넘겼다. 이 문제를 찾은 과정은 트러블슈팅 문서에 있다.

```kotlin
graalvmNative {
    binaries.named("main") {
        imageName = "app"
        mainClass = springBoot.mainClass
        sharedLibrary = false
    }
}
```

### 5.2 이미지

JVM 이미지(`eclipse-temurin:25-jre` + jar)는 그대로 두고 `Dockerfile.native`를 따로 만들었다. 실행 파일은 빌드한 러너(ubuntu-24.04)의 glibc에 동적으로 링크된다. 그래서 같은 배포판을 쓴다.

```dockerfile
FROM ubuntu:24.04
RUN useradd --system --uid 10001 app
WORKDIR /app
# artifact로 옮기면 실행 권한이 빠지므로 복사할 때 다시 준다.
COPY --chmod=755 app app
USER app
EXPOSE 8080
ENTRYPOINT ["/app/app"]
```

JVM `Dockerfile`을 남긴 이유는 CI의 이미지 빌드 확인과 로컬 k3d 검증이 jar 기반이기 때문이다. native 전환은 운영 이미지에만 적용했다.

### 5.3 CI/CD

|단계|바뀐 점|
|---|---|
|CI (`ci.yml`)|native 앱(빌드 파일에 플러그인이 있는 앱)은 JVM 테스트를 마친 뒤 `graalvm/setup-graalvm@v1`로 Oracle GraalVM 25를 받는다. 이어서 `nativeCompile`을 돌리고, 실행 파일을 artifact로 올리고, `Dockerfile.native` 이미지 빌드까지 확인한다|
|발행 (`publish.yml`)|dev push 때 publish는 `ci.yml`을 재사용해 **같은 run 안에서** 테스트와 native 컴파일을 다시 한다. 그 run의 실행 파일 artifact로 `Dockerfile.native` 이미지를 만든다. 나머지 앱은 기존대로 jar를 쓴다|

native 컴파일은 GitHub 러너(4 vCPU, 16GB)에서 **10~14분**이 걸렸고, 최대 메모리는 약 12GB였다.

PR CI에서 미리 돌리는 이유가 있다. 발행 workflow는 모든 앱의 빌드가 성공해야 배포한다. 그래서 dev에서 native 빌드가 실패하면 그 push의 **모든 앱 배포가 멈춘다**.

### 5.4 메타데이터: AOT가 모르는 것만 사람이 적는다

GraalVM 빌드 출력을 보면 reflection 등록 타입이 2만 개가 넘는다. 이 정보는 세 곳에서 모인다. Spring Boot AOT, GraalVM Reachability Metadata 저장소, 라이브러리 jar에 들어 있는 메타데이터다. 그래도 우리 코드 특유의 부분은 빠졌다. 그것만 다음 파일에 적었다.

```text
apps/customer-support-app/src/main/resources/
  META-INF/native-image/com.hapbang/customer-support-app-hints/reachability-metadata.json
```

파일의 최상위 키는 `comment`, `reflection`, `resources` 세 개다.

|키|항목|내용|
|---|---|---|
|`resources`|glob 2개|`spring.config.import`로 읽는 `customer-support.yml`, `swagger.yml`|
|`reflection`|일반 5개|발행하는 이벤트 record 2개, 강의 내부 API client가 주고받는 record 3개|
|`reflection`|`"serializable": true` 33개|Kafka 역직렬화 실패를 헤더에 담을 때 Java 직렬화되는 예외 체인|

이 목록을 어떻게 만들었는지가 이번 작업의 대부분이다. 자세한 과정은 트러블슈팅 문서에 있다.

---

## 6. 검증: 테스트는 바꾸지 않고 회귀 테스트를 돌렸다

원칙은 하나였다. **기존 테스트 코드는 한 줄도 바꾸지 않는다.** 다만 기존 테스트는 JVM에서 돈다. 그래서 확인을 두 갈래로 나눴다.

- 기존 테스트: 빌드 설정 변경이 JVM 동작을 깨지 않았는지
- smoke 스크립트: native 동작이 JVM과 같은지

### 6.1 JVM 회귀 테스트

- **customer-support-app:** 테스트 클래스 22개, 테스트 212개가 모두 통과했다(로컬·CI).
- **6개 앱 전체:** 루트 Gradle 설정과 CI workflow를 바꿨기 때문에 CI가 6개 앱 테스트를 모두 다시 돌렸다. 모두 통과했다.
- **환경 문제 한 번:** 로컬에서 212개 중 98개가 실패한 적이 있다. 원인은 Testcontainers의 Ryuk 컨테이너 연결 실패(`Could not connect to Ryuk`)였다. 테스트 DB가 뜨지 않은 환경 문제라 다시 돌리니 모두 통과했다. 테스트를 고쳐서 통과시킨 것이 아니다.

### 6.2 native 동작 확인

reflection·resource 문제는 native에서만 드러난다. 그래서 같은 smoke 스크립트를 세 가지 실행 형태에 똑같이 돌렸다.

1. **JVM + AOT 모드(`-Dspring.aot.enabled=true`):** AOT가 만든 빈 정의로 정상 동작하는지 본다.
2. **macOS에서 빌드한 native 실행 파일:** 빠르게 고치고 다시 보는 용도다(로컬 빌드 약 4분).
3. **CI가 만든 linux 실행 파일(linux/amd64 컨테이너):** 운영과 같은 바이너리로 확인한다.

인프라는 로컬에 임시로 띄운 PostgreSQL 18, Redis 8, Kafka 4.2.1 컨테이너였다. 개발용 공용 DB는 건드리지 않았다.

|영역|확인 항목|
|---|---|
|HTTP|문의 등록 201, 내 목록·상세 200, 관리자 목록 200, 답변 등록 201, 권한 없음 403, 미인증 401, 입력 검증 400, 내부 포트에서 외부 API 404, health·Prometheus|
|Kafka 받기|강의 이벤트를 정상 처리한다. 모르는 타입·깨진 JSON·타입 불일치 메시지는 DLT로 가고, listener는 계속 동작한다|
|이의 제기 흐름|강의 내부 API(파이썬 stub)로 접수 → 실패분은 재시도 batch가 다시 접수 → 관리자 판단·철회 → `customersupport.events.v1`에 발행(key `inquiry:N`, 헤더 eventType·eventVersion·`__TypeId__`, JSON 본문) → Modulith 발행 기록 완료·archive|
|반복 요청|목록 조회 300건|

이 smoke가 native에서만 나는 실행 오류 3가지를 찾았다. 빌드 설정 문제 2가지는 CI가 찾았다.

|#|문제|찾은 곳|
|---|---|---|
|1|빌드 결과가 실행 파일이 아니라 공유 라이브러리(`app.so`)|CI|
|2|직접 만든 메타데이터 파일이 AOT 생성 파일과 경로가 겹쳐 `bootJar` 실패|CI|
|3|`spring.config.import` 설정 파일이 없어 기동 실패|smoke(linux 실행 파일)|
|4|모르는 Kafka 메시지 하나에 listener container가 멈춤|smoke(macOS 실행 파일)|
|5|강의 내부 API 호출에서 record 직렬화 실패(500)|smoke(macOS 실행 파일)|

고친 뒤에는 세 실행 형태 모두 같은 결과가 나왔고, `UnsupportedFeatureError`는 0건이었다.

---

## 7. 결과

### 7.1 같은 조건 비교 (로컬)

로컬에서 잰 값이라 링크는 없다. 같은 측정을 다시 하는 명령은 트러블슈팅 문서 부록 D에 있다.

macOS arm64에서 같은 jar·실행 파일, 같은 인프라, 같은 작업으로 쟀다. JVM은 운영 컨테이너와 조건을 맞췄다.

- heap 상한: `-XX:MaxRAM=448m -XX:MaxRAMPercentage=60`
- GC와 CPU: `-XX:+UseSerialGC -XX:ActiveProcessorCount=2`. 로그에서 `Using Serial`을 확인했다.

native에도 `-XX:ActiveProcessorCount=2`를 줬다.

|지표|JVM|native|차이|
|---|---|---|---|
|기동|4.3초|0.57초|약 1/7|
|RSS, 기동 20초 뒤|379Mi|208Mi|−45%|
|RSS, 작업 직후|413Mi|231Mi|−44%|
|RSS, 60초 idle 뒤|415Mi|233Mi|−44%|

처음에는 GC·CPU 조건을 맞추지 않고 쟀다. 그때는 JVM 390/419/415Mi, native 210/236/208Mi로 차이가 44~50%였다. 리뷰에서 "로컬 JVM은 CPU가 많아 G1을 골랐을 수 있다"는 지적을 받고 조건을 맞춰 다시 쟀다. 결과는 큰 차이가 없었다.

linux/amd64 컨테이너로도 쟀다(JVM 446Mi, native 221~264Mi). 하지만 맥에서 amd64를 Rosetta로 번역해 돌린 값이라 비교에 쓰지 않았다. JVM은 그 환경에서 기동이 38초로 늘었다. 번역 환경의 영향으로 추정하지만 원인을 나눠 측정하지는 않았다.

### 7.2 운영

2026-11-04 09:32 KST에 배포했다([배포 run](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41744360052/job/126301949125), [이슈 #609 운영 결과 댓글](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/609#issuecomment-6619202859)). 아래 값은 Prometheus에서 읽었다(쿼리는 "근거 링크").

|지표|JVM|native|
|---|---|---|
|working set|391Mi(배포 직전, 하루 넘게 돈 pod) / 7일 최대 404Mi|120~129Mi(배포 1~12분 뒤) / 3시간 최대 142Mi|
|기동(`application_ready_time_seconds`)|22.9~27.8초(최근 3일 JVM pod들)|1.10~1.16초|
|재시작|-|0|

**측정의 한계.** 두 값은 측정 시점이 다르다. JVM은 오래 돈 pod이고, native는 막 뜬 pod다. 갓 뜬 JVM도 몇 분 동안은 이보다 낮다. 이 앱은 예전에 384Mi limit에서 기동 5분 뒤 RSS가 353Mi였다. 그래서 최종 판단은 native를 하루 이상 돌린 최대치로 한다. 같은 조건에서 잰 차이는 7.1의 44~45%다.

medium 노드 전체 사용량은 2,894Mi(75%, 11-03)에서 2,667Mi(69%, 11-04 09:44)로 내려갔다. 다만 이 배포로 6개 앱이 모두 재시작됐다. 같은 노드의 lecture·chat도 막 뜬 JVM이라 평소보다 메모리가 적다. 그래서 노드 전체 감소분을 모두 native 효과로 볼 수는 없다.

### 7.3 실제 요청으로 확인한 것

배포 직후에는 고객센터 운영 트래픽이 하루 몇 건이라, API와 이벤트가 운영에서 실제로 도는지는 아직 알 수 없었다. 프론트에서 직접 요청을 보내 하나씩 확인했다.

|흐름|시각(UTC)|근거|결과|
|---|---|---|---|
|문의 등록·목록|11-04 05:25~05:26|Envoy access log, 앱 HTTP 지표|등록 201 ×10(5~60ms), 목록 200 ×11(첫 요청 401ms, 이후 4~15ms), 앱 로그 오류 0|
|이의 제기 접수(강의 내부 API 호출)|11-04 07:18~07:21|`http_client_requests_seconds`|200 ×3. 같은 주문 항목을 반복해 보낸 409 ×86(`OBJECTION_ALREADY_FILED`)도 정상 처리. native에서만 500이 나던 record 직렬화가 운영에서 동작|
|관리자 판단 → 이벤트 발행·받기|11-04 08:24|`spring_kafka_template_seconds`, `spring_kafka_listener_seconds`|고객센터가 `customersupport.events.v1`에 2건 발행 → lecture-app이 받아 처리 → 고객센터가 `lecture.events.v1`에서 결과 2건 처리. 모두 `error=none`|

로그는 Loki로 봤다. native 전환 뒤 30시간 동안 customer-support-app 로그에 `UnsupportedFeatureError`, listener 정지, DLT, `OutOfMemoryError`, ERROR가 하나도 없었다. 같은 Loki에서 기동 시간을 보면 JVM은 24.8~27.7초(11-03), native는 1.10~1.16초였다.

### 7.4 memory limit을 256Mi로 낮추다 (#672)

배포 뒤 약 5시간 실측을 근거로 request와 limit을 함께 448Mi에서 256Mi로 낮췄다. 스케줄러는 request로 자리를 계산하므로, limit만 낮추면 자리가 생기지 않는다.

|지표(native, 448Mi, 약 5시간)|최대|
|---|---|
|working set|142 / 174Mi(pod 2개, page cache 포함)|
|RSS|110 / 111Mi|
|page cache(실행 파일 매핑 47Mi 포함)|69Mi|
|heap 사용 / committed|82~84Mi / 약 82Mi|

처음에 "native는 heap도 작다"고 생각했는데, heap 최대는 JVM 때(82Mi)와 거의 같았다. 줄어든 것은 off-heap(Metaspace·JIT 코드 캐시·native)이었다.

**heap 상한을 같이 정해야 했다.** 빌드 출력에는 `Garbage collector: Serial GC (max heap size: 80% of RAM)`라고 나온다. heap 상한 기본값이 메모리의 80%라, 256Mi면 약 205Mi다. off-heap을 더하면 limit을 넘을 수 있다. ConfigMap에 있던 `JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=60`은 native가 읽지 않았다. 로컬에서 직접 시험했다.

|방법|결과(`-XX:+PrintGC`)|
|---|---|
|환경 변수 `JAVA_TOOL_OPTIONS=-Xmx24m`|GC 0회. 무시됨|
|실행 인자 `-Xmx24m`|기동 0.07초 안에 GC 10회. 적용됨|

그래서 운영 overlay의 Deployment `args`로 `-Xmx128m`(관측 최대의 약 1.5배)을 줬다. 로컬 k3d는 이 앱도 JVM 이미지로 띄우므로 base 설정(448Mi, `JAVA_TOOL_OPTIONS`)은 그대로 뒀다.

|256Mi·`-Xmx128m` 적용 뒤|1시간 15분|약 17시간|
|---|---|---|
|재시작|0|0|
|working set 최대|108Mi|123Mi(limit의 48%)|
|RSS 최대|78Mi|80Mi|
|heap 최대|48.5Mi|52Mi(상한의 41%)|

medium 노드의 스케줄러 요청 합계는 이 변경으로 192Mi 줄었다(3,712 → 3,520Mi, 할당 가능 3,832Mi의 96% → 92%).

![customer-support-app 메모리 할당량: JVM 448MiB → Native Image 256MiB로 낮춰 노드에 192MiB 확보(request·limit 기준)](/posts/graalvm-native-image-migration/native-image-memory.png)

### 7.5 결정: 넓히지 않고 한 앱만 유지한다

customer-support-app은 native로 유지하고, 다른 앱으로 넓히는 것은 보류했다(2026-11-04). 넓히면 앱마다 CI가 10~14분 늘고, 앱마다 메타데이터 확인(smoke 실행과 tracing agent)을 다시 해야 한다. JVM 튜닝(#610)으로 얼마나 줄어드는지 먼저 보고 다시 정한다. 새로 만드는 aux-app은 JVM으로 띄운다.

---

## 8. 트레이드오프: JVM에서 Native Image로 바꾸며 얻은 것과 잃은 것

메모리만 보면 native가 좋다. 하지만 빌드·개발·운영·관측 전반에서 비용이 생긴다. 이번에 실제로 겪거나 잰 것을 기준으로 정리한다. 재지 않은 것은 "재지 않음"이라고 적었다.

### 8.1 한눈에 보기

|영역|JVM (이전)|Native Image (이후)|판단|
|---|---|---|---|
|실행 메모리|RSS 379~415Mi(로컬, 같은 조건) / 운영 391Mi(limit 448Mi)|RSS 208~233Mi / 운영 최대 123Mi(limit 256Mi, 약 17시간)|**얻음**: 같은 조건 −44~45%, limit −192Mi|
|기동 시간|운영 22.9~27.8초|운영 1.10~1.16초|**얻음**|
|컨테이너 이미지(압축, amd64)|204.5MiB(9 layer, `sha-265cee7b`)|144.3MiB(4 layer, `sha-821abc2d`)|**얻음**: 내려받는 양 −29%. `docker manifest inspect -v`로 GHCR에서 확인|
|CI 시간(이 앱 job)|테스트+jar 약 2분, job 3분 안팎|job 14~18분(native 컴파일 10~14분 추가)|**잃음**|
|CI 러너 메모리|Gradle 테스트 수준|native 컴파일 최대 11.6~12.2GB(러너 16GB)|**잃음**: 여유가 작다|
|로컬 개발 반복|jar 빌드 수십 초|native 빌드 약 4분(macOS, 최대 9.4GB)|**잃음**: 평소 개발은 JVM으로 한다|
|런타임 유연성|프로필·조건을 실행 때 바꿀 수 있다|빈 구성이 빌드 때 굳는다(prod)|**잃음**|
|동적 기능|reflection·리소스·직렬화가 그냥 된다|빌드 때 알려 줘야 한다(메타데이터)|**잃음**: 사람이 관리|
|최고 처리량|JIT가 실행 중 최적화|미리 컴파일, 실행 중 최적화 없음|**잃을 수 있음**: 재지 않음|
|관측·진단|GC·non-heap 지표, JFR, heap dump, JVM 옵션|GC pause·non-heap 지표 없음, JFR 일부|**잃음**|
|이식성|같은 jar가 어떤 OS·CPU의 JVM에서도 돈다|빌드한 OS·CPU·glibc 전용 실행 파일|**잃음**|

### 8.2 빌드 시간과 빌드 자원

가장 크게 체감한 비용이다.

|항목|값|출처|
|---|---|---|
|native 컴파일(CI, 4 vCPU)|11분 14초 / 13분 58초 / 10분 24초|CI 로그 `Finished generating`: [1차](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41588071359/job/125758375245), [2차](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41590255375/job/125765684968), [최종](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41601254591/job/125800510305)|
|native 컴파일(로컬 macOS arm64)|3분 51초|로컬 Gradle(링크 없음)|
|JVM 테스트 + jar(CI)|1분 54초|[1차 CI job](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41588071359/job/125758375245)의 `테스트·jar 빌드` 단계|
|이 앱 CI job 전체|약 14~18분|예: [11-04 dev run](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41744360052/job/126293709822) 00:07:39 → 00:25:47 UTC|
|native 컴파일 최대 메모리|CI 11.65~12.19GB, 로컬 9.38GB|빌드 출력 `Peak RSS`(위 CI 링크)|
|native 컴파일 단계별(첫 빌드)|분석 164초, 메서드 컴파일 342초, 기타|[1차 CI](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41588071359/job/125758375245) 빌드 출력 `[2/8]`~`[8/8]`|

이 시간이 실제로 어떤 영향을 주는지는 다음과 같다.

- **PR 대기 시간이 늘었다.** customer-support-app이나 공용 모듈(`common/*`, 루트 Gradle 설정)이 바뀌는 PR은 CI가 이 앱 job을 기다려야 끝난다. 다른 앱 job은 4~6분이면 끝나는데, 이 job만 14~18분이다.
- **배포가 늦어졌다.** dev push의 publish run이 CI를 재사용하므로, native 컴파일이 배포 경로에 그대로 들어간다. 이번에는 다른 PR이 연달아 병합되면서 뒤 run이 native 컴파일을 다시 거친 뒤에 배포했다.
- **러너 메모리 여유가 작다.** GitHub 러너는 16GB인데 컴파일이 최대 12GB를 쓴다. 의존성이 늘면 메모리 부족으로 빌드가 실패할 수 있다. 그러면 `-J-Xmx`로 빌드 메모리를 제한하거나 더 큰 러너를 써야 한다.
- **실패하면 배포 전체가 멈춘다.** publish의 배포 단계는 모든 앱의 빌드가 성공해야 돈다. native 빌드가 실패하면 6개 앱 모두 그 push에서 배포되지 않는다. 그래서 PR CI에서 native를 미리 빌드하게 했고, 그만큼 PR CI가 길어졌다.
- **캐시 효과가 적다.** Gradle 캐시는 컴파일 결과를 재사용하지만, native 컴파일은 매번 처음부터 한다. 문서만 바꾼 커밋도 이 앱이 테스트 대상이 되면 14분을 다시 쓴다.

### 8.3 개발과 유지보수

- **빌드 시점에 굳는 설정.** AOT가 prod 프로필과 운영 포트 조건으로 빈을 만든다. 그래서 같은 실행 파일을 로컬 프로필로 띄울 수 없다. native로 돌리려면 운영과 같은 환경 변수와 인프라(DB·Kafka·Redis)가 필요하다. 평소 로컬 개발과 테스트는 JVM으로 하고, native는 확인할 때만 빌드한다.
- **메타데이터를 사람이 관리한다.** 다음 변경을 하면 hints 파일도 고쳐야 한다. 빠지면 **JVM 테스트는 통과하고 운영 native에서만** 실패한다.
  - 앱 밖(`common/shared`) record를 JSON으로 주고받는다
  - 새 이벤트를 발행한다
  - `spring.config.import` 파일을 더한다
  - 새 Kafka listener를 `ErrorHandlingDeserializer`로 만든다
- **JVM 테스트로는 native를 보장하지 못한다.** Native Build Tools의 `nativeTest`(테스트를 native로 컴파일해 실행)는 아직 CI에 넣지 않았다. 테스트까지 native로 컴파일하면 CI가 또 10분 이상 늘어서다. 지금은 사람이 smoke 스크립트를 돌려야 한다. 이 부분은 자동화되지 않은 위험으로 남아 있다.
- **이 앱만 빌드 방식이 다르다.** Dockerfile이 두 개(JVM용·native용)이고, CI·publish에 native 분기가 생겼다. 팀원이 이 앱만 다른 이유를 알아야 한다.
- **오류가 실행 중에, 그것도 특정 경로에서만 난다.** 이번에 찾은 실행 오류 3가지는 모두 특정 기능을 지나갈 때만 났다(기동, 모르는 Kafka 메시지, 이의 제기 접수). 기능 확인을 빠뜨리면 운영에서 처음 드러난다.

### 8.4 운영과 관측

- **잃은 지표.** GC pause(`jvm_gc_pause_seconds`)가 없고 non-heap은 0으로 나온다. heap max는 −1이다. Grafana JVM dashboard에서 이 앱만 GC·non-heap 패널이 비어 있다. heap 사용량과 컨테이너 working set은 정상으로 나온다.
- **진단 도구 제약.** JFR은 일부 이벤트만 지원해서, 계획했던 JFR·JMC 분석은 JVM 앱으로 한다. `JAVA_TOOL_OPTIONS`는 native 실행 파일이 읽지 않는다(7.4에서 직접 확인). Java agent도 쓸 수 없는 것으로 알고 있다. 그래서 heap 상한은 실행 인자 `-Xmx`로 정한다.
- **처리량은 재지 않았다.** JIT가 없어서, 오래 돌며 최적화되는 JVM보다 최고 처리량이 낮을 수 있다. 빌드 출력도 "PGO(Profile-Guided Optimization)와 G1 GC를 쓰면 처리량이 좋아진다"고 권한다. 이 앱은 하루 몇 건이라 차이가 드러나지 않았다. 트래픽이 많은 앱으로 넓히려면 부하 측정(k6)이 먼저다.
- **GC 선택지.** 지금은 Serial GC다(빌드 출력 `Garbage collector: Serial GC (max heap size: 80% of RAM)`). G1은 Oracle GraalVM에서 빌드 옵션(`--gc=G1`)으로 고를 수 있지만 쓰지 않았다.
- **기동이 빨라진 효과.** medium 노드의 앱은 새 pod를 먼저 띄울 공간이 없어서, 기존 pod를 내린 뒤 새 pod를 띄운다(`maxSurge: 0`). 배포 때마다 기동 시간만큼 서비스가 멈춘다. JVM은 그 시간이 23~28초였고 native는 1초 남짓이다. 다만 probe 주기 때문에 실제 중단 시간은 기동 시간보다 길다. 재지는 않았다.
- **Flyway WARN 로그.** 기동 때마다 `Unable to scan location: /db/migration (unsupported protocol: resource)`가 남는다. 동작에는 영향이 없지만, 처음 보는 사람은 오류로 오해할 수 있다.

### 8.5 이식성과 이미지

- **CPU·OS 전용 실행 파일.** CI는 linux/amd64용, 로컬 맥은 macOS/arm64용 실행 파일을 따로 만든다. jar처럼 한 번 빌드해 어디서나 돌릴 수 없다. 운영과 같은 바이너리를 맥에서 돌리려면 Rosetta 번역을 거쳐야 하고, 그러면 측정값을 쓸 수 없다.
- **CPU 기능 수준.** 빌드 로그상 x86-64-v3(AVX2 이상)로 컴파일된다. EC2 t3(Intel Xeon)는 지원하지만, 더 오래된 CPU로 옮기면 빌드 옵션(`-march`)을 바꿔야 한다.
- **glibc에 묶인다.** 실행 파일이 빌드한 러너(ubuntu 24.04)의 glibc에 동적 링크된다. 런타임 이미지도 ubuntu 24.04로 맞췄다. 러너 이미지가 바뀌면 런타임 이미지도 같이 바꿔야 한다.
- **실행 파일 크기.** 약 311MB다(코드 영역 153MB, image heap 144MB). 쓰지 않는 AWT(`java.desktop`)도 딸려 들어온다. 그래도 JDK가 빠져서 컨테이너 이미지는 JVM보다 작다(압축 144MiB vs 205MiB).

### 8.6 라이선스와 공급망

- **GraalVM 배포판.** CI와 로컬 모두 Oracle GraalVM 25를 쓴다(`graalvm/setup-graalvm@v1`, `distribution: graalvm`). Oracle GraalVM은 GraalVM Free Terms and Conditions(GFTC)로 배포된다. 이번에는 라이선스 조건을 따로 검토하지 않았다. 확인이 필요하다. 오픈소스 라이선스가 필요하면 GraalVM Community Edition으로 바꿀 수 있다. 그 경우 G1 GC와 PGO는 쓸 수 없다.
- **외부 의존이 늘었다.** CI가 GitHub Action으로 GraalVM을 내려받고, Gradle 플러그인을 Maven Central에서 받는다. 이번에도 플러그인 내려받기 실패로 CI가 한 번 실패했다.

### 8.7 그래서 어디에 쓰나

|이런 앱이면 native가 맞는다|이런 앱이면 JVM이 낫다|
|---|---|
|트래픽이 적고 메모리가 귀하다|트래픽이 많아 최고 처리량이 중요하다|
|자주 재시작되거나 빨리 떠야 한다|JFR·heap dump 같은 진단이 자주 필요하다|
|reflection·동적 기능을 적게 쓴다|새 기능을 자주 붙인다(Spring AI, 새 client 등)|
|바뀌는 일이 적다(CI 비용을 덜 낸다)|매일 여러 번 바뀐다|

customer-support-app은 왼쪽에 가깝다. 새로 만드는 `aux-app`(AI·검색·알림)은 오른쪽에 가까워서 JVM으로 띄우기로 했다.

---

## 9. 배운 것

1. **메모리가 모자라면 먼저 쪼개 본다.** "heap을 줄이자"가 첫 반응이었다. 실측해 보니 heap은 상한의 1/3 정도만 쓰고 있었고, 문제는 off-heap의 상시 비용이었다. Prometheus에 `jvm_memory_*`와 cAdvisor 지표가 이미 있어서 빠르게 판단할 수 있었다.
2. **작은 컨테이너에서 `MaxRAMPercentage`는 위험하다.** 비율로 정한 heap 상한은 off-heap 비용을 고려하지 않는다. 448Mi 컨테이너에서 60%면 heap 상한과 off-heap 비용의 합이 이미 limit을 넘는다.
3. **Native Image 문제는 대부분 "빌드 때 몰랐던 것"이다.** 설정 파일 import, record 직렬화, 예외의 Java 직렬화 모두 JVM에서는 아무 문제가 없었다. 이 문제를 잡은 건 테스트 코드보다 **실제 경로를 지나가는 smoke 스크립트**와 **GraalVM tracing agent**였다.
4. **빌드 도구의 기본값을 의심한다.** "실행 파일이 아니라 `.so`가 나온다"는 문제는 문서가 아니라 Native Build Tools 소스 한 줄에서 원인을 찾았다. `java-library` 플러그인이 있으면 `sharedLibrary` 기본값이 true였다.
5. **한 앱으로 먼저 잰다.** 6개 앱을 한꺼번에 바꿨다면 같은 문제가 앱마다 다른 모양으로 나타났을 것이다. 가장 영향이 작은 앱에서 측정값과 문제 목록을 얻으니, 나머지 앱으로 넓힐지 판단할 근거가 생겼다.
6. **비교는 조건을 맞춰서 한다.** 아키텍처 번역(Rosetta)을 거친 측정, 측정 시점이 다른 운영 값, GC 종류가 다를 수 있는 로컬 JVM은 숫자를 부풀리거나 줄인다. 이번 글의 숫자는 리뷰를 거쳐 조건을 맞춘 값으로 다시 정리했다.
7. **설정이 실제로 먹는지 확인한다.** native로 바꾸고도 heap 상한을 `JAVA_TOOL_OPTIONS`로 준다고 믿고 있었다. 작은 값(`-Xmx24m`)을 넣고 GC 로그를 보는 30초짜리 실험으로, 이 설정이 처음부터 무시되고 있었다는 것을 알았다. 한 시점 지표(heap 20Mi)를 최대치로 착각한 것도 같은 종류의 실수였다. 5시간 최대는 84Mi였다.

---

## 10. 다음 단계

- customer-support-app은 256Mi·`-Xmx128m`로 운영 중이다. 자리가 더 필요하면 192Mi까지 낮출 수 있다(약 17시간 최대 working set 123Mi).
- JVM으로 남는 앱들은 heap 상한을 비율 대신 앱별 `-Xmx`로 바꾼다. native 메모리를 줄이는 옵션(`MALLOC_ARENA_MAX=2`, `-Xss512k`, `ReservedCodeCacheSize`)도 시험한다(#610, 나중에). 그 결과를 보고 Native Image를 다른 앱으로 넓힐지 다시 정한다.
- 새 기능(AI·검색·알림)은 JVM 앱 하나(`aux-app`)로 띄운다. native는 적용하지 않기로 했다. Spring AI·OpenAI client·Elasticsearch client·WebSocket이 한꺼번에 들어가서, native 문제와 새 기능 문제가 섞이기 쉽기 때문이다.
- medium 노드를 t3.large로 바꾸는 것은 관리자 승인 결과에 따라 정한다.

## 부록: 재현에 쓴 명령

```bash
# 로컬 GraalVM (macOS)
mise install java@oracle-graalvm-25.0.5
export GRAALVM_HOME=~/.local/share/mise/installs/java/oracle-graalvm-25.0.5/Contents/Home
./gradlew :customer-support-app:nativeCompile        # 약 4분, 최대 메모리 약 9.4GB

# JVM에서 AOT 모드로 실행 (AOT가 만든 빈 정의 확인)
# 빌드 때 prod 프로필이 굳어 있으므로 DB·Kafka·Redis와 운영 환경 변수가 있어야 뜬다(트러블슈팅 문서 부록 D)
java -Dspring.aot.enabled=true -jar apps/customer-support-app/build/libs/app.jar

# 빠진 메타데이터를 찾는 tracing agent
$GRAALVM_HOME/bin/java -agentlib:native-image-agent=config-output-dir=agent-out \
  -Dspring.aot.enabled=true -jar apps/customer-support-app/build/libs/app.jar
# 두 번째 실행부터 결과를 합칠 때는 config-merge-dir=agent-out

# 같은 조건 JVM 측정
java -XX:+UseSerialGC -XX:ActiveProcessorCount=2 -XX:MaxRAM=448m -XX:MaxRAMPercentage=60 \
  -jar apps/customer-support-app/build/libs/app.jar

# 운영 메모리·기동 비교 (Prometheus)
container_memory_working_set_bytes{pod=~"customer-support-app-.*", container="app"}
application_ready_time_seconds{app_kubernetes_io_name="customer-support-app"}
```

## 근거 링크

|근거|링크|무엇을 보면 되나|
|---|---|---|
|PR #628 (Native Image 시험)|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/628](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/628)|변경 파일 9개, 본문의 테스트·측정 표|
|병합 커밋 `821abc2d`|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/commit/821abc2d40ac3491548f1a7499d1dc935e9aaaf6](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/commit/821abc2d40ac3491548f1a7499d1dc935e9aaaf6)|최종 변경|
|이슈 #609 운영 결과 댓글|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/609#issuecomment-6619202859](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/609#issuecomment-6619202859)|배포 직후 운영 working set·heap·기동|
|이슈 #608 / PR #612 (limit 상향)|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/608](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/608) / [https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/612](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/612)|billing·Grafana 7일 최대 메모리|
|이슈 #601 / PR #605 (앱 개요 dashboard)|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/601](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/601) / [https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/605](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/605)|앱별 메모리 비교 화면|
|CI 1차 `45d11208`: `app.so`, 11분 14초, Peak RSS 12.19GB|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41588071359/job/125758375245](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41588071359/job/125758375245)|`native 실행 파일 빌드` 단계 로그|
|CI 2차 `c9c85343`: 여전히 `app.so`, 13분 58초|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41590255375/job/125765684968](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41590255375/job/125765684968)|〃|
|CI 3차 `97373b5e`: 실행 파일 `app` 생성|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41594048331/job/125777189015](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41594048331/job/125777189015)|`Generating 'app' (executable)`|
|CI `aea5bca5`: `bootJar` 중복 실패|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41596850376/job/125786164503](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41596850376/job/125786164503)|`테스트·jar 빌드` 단계|
|CI `a20d350c`: 최종 빌드 10분 24초, 328.08MB, Peak RSS 11.95GB|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41601254591/job/125800510305](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41601254591/job/125800510305)|6개 앱 통과, native 빌드 출력|
|CI `962957d3` 1차 시도: 플러그인 해석 실패|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41603596455/job/125808172264](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41603596455/job/125808172264) (structure), [https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41603596455/job/125808172221](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41603596455/job/125808172221) (appearance)|`Plugin ... was not found`|
|〃 재실행(2차 시도) 통과|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41603596455/attempts/2](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41603596455/attempts/2)|모든 job 성공|
|publish `821abc2d`: 배포 건너뜀|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41744355976/job/126299334828](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41744355976/job/126299334828)|`dev 최신 커밋이 아니라 배포하지 않습니다`|
|publish `b0731110`: 실제 배포|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41744360052/job/126301949125](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41744360052/job/126301949125)|6개 앱 배포, customer-support native 이미지|
|〃 customer-support CI job(약 18분)|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41744360052/job/126293709822](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/actions/runs/41744360052/job/126293709822)|job 시작·끝 시각|
|이슈 #672 / PR #673 (256Mi·`-Xmx128m`)|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/672](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/672) / [https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/673](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/673)|5시간 실측, `JAVA_TOOL_OPTIONS` 시험|
|PR #685 (확대 보류 결정, #609 닫음)|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/685](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/685)|결정과 1시간 결과|
|이슈 #691 / PR #692 (운영 검증 결과를 문서 9개에 반영)|[https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/691](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/691) / [https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/692](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/692)|이벤트 흐름, 17시간 관찰, Loki 30시간|

- GitHub Actions 로그는 보존 기간(기본 90일)이 지나면 지워진다. 숫자는 이 문서에 옮겨 두었다.
- 로컬 측정(macOS·linux 컨테이너)은 링크가 없다. 같은 값을 다시 얻는 명령은 트러블슈팅 문서 부록 D에 있다.
- 운영 메모리·기동 수치는 Prometheus 값이다. Grafana `합방` 폴더의 "앱 개요"(`/grafana/d/hapbang-apps`)와 "JVM·Spring Boot"(`/grafana/d/hapbang-jvm`) dashboard에서 볼 수 있다(로그인 필요). 쿼리는 아래와 같다.

```promql
# working set (JVM·native 비교)
container_memory_working_set_bytes{namespace="hapbang-prod", pod=~"customer-support-app-.*", container="app"}
# 기동 시간
application_ready_time_seconds{app_kubernetes_io_name="customer-support-app"}
# heap 사용·상한
sum by (area) (jvm_memory_used_bytes{app_kubernetes_io_name="customer-support-app"})
sum (jvm_memory_max_bytes{app_kubernetes_io_name="customer-support-app", area="heap"})
```

## 관련 이슈·PR

- [#601](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/601)(앱 개요 dashboard)
- [#608](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/608)·[#612](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/612)(limit 상향)
- [#609](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/609)·[#628](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/628)(Native Image 시험)
- [#610](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/610)(JVM 튜닝, 예정)
