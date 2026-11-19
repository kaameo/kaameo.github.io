---
title: "GraalVM Native Image로 고객센터 앱 메모리 할당량 43% 절감"
project: hapbang
order: 2
---

## 문제 상황

EC2 2대로 구성한 k3s 환경에서 기존에 계획했던 앱을 추가로 배포해야 했지만, 실행 중인 앱과 관측 도구의 메모리 할당량이 노드 용량 대부분을 차지하고 있었습니다. 인스턴스를 늘리지 않고 배포 공간을 확보하기 위해 기존 앱의 메모리 할당량을 줄여야 했습니다.

## 접근 방식

![고객센터 앱 메모리 할당량: JVM 448MiB → Native 256MiB, 배치 여유 192MiB 확보. requests와 limit 기준](/portfolio/native-image-memory.png)

- 트래픽과 외부 연동이 적어 서비스 영향이 가장 작을 고객센터 앱을 Native Image로 시험 전환하고, 호환성과 절감 효과를 바탕으로 확대 여부를 판단했습니다.
- JVM 테스트와 별도로 Native 실행 파일에서 HTTP API와 Kafka 소비/발행을 검증했습니다. 직렬화 메타데이터 누락으로 Kafka listener가 멈추는 문제는 tracing agent로 필요한 타입을 찾아 등록했습니다.
- 운영 5시간 동안 관측한 heap 최대 약 84MiB를 바탕으로 heap 상한을 128MiB로 정했습니다. heap 밖 메모리와 page cache를 포함한 예산을 약 227MiB로 잡아, requests와 limit을 256MiB로 설정했습니다.

## 해결 및 성과

| 항목 | 운영 측정 결과 | 측정 조건 |
| --- | --- | --- |
| 메모리 requests/limit | 각각 448 → 256MiB | 고객센터 앱 운영 overlay |
| 컨테이너 메모리(working set) | JVM 배포 직전 391MiB / Native 약 17시간 최대 123MiB | JVM은 하루 이상 실행된 Pod, Native는 limit 256MiB, heap 상한 128MiB 적용 후 관측 |
| 기동 시간 | JVM 23~28초 → Native 1.10~1.16초 | Prometheus `application_ready_time_seconds` |

노드 requests 합계를 3,712 → 3,520MiB로 줄여 배치 여유 192MiB를 확보했습니다. 사용량은 관측 시간과 부하 조건이 달라 감소율로 환산하지 않았습니다.

- CI에 Native 컴파일 10~14분과 앱별 메타데이터 보완/검증 부담이 추가돼 고객센터만 Native로 유지했습니다.
- 다른 앱은 JVM heap 상한과 할당량을 조정하고, 두 방식으로 확보한 자원으로 계획했던 검색/알림 등을 담당할 앱을 배포했습니다.

## 참고

- [native-image.md](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/blob/dev/docs/architecture/infrastructure/native-image.md)
- [이슈 #609](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/609)
- [적용 PR #628](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/628)
- [메모리 조정 PR #673](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/673)
- [운영 검증 PR #692](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/692)
- [확대 보류 PR #685](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/685)
