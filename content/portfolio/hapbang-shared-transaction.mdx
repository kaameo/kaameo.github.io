---
title: "MSA 분리를 위한 서비스 간 공유 트랜잭션 의존 제거"
project: hapbang
order: 1
---

## 문제 상황

주문/취소/HP 반환/지급과 이의 제기 접수/판단/철회 등 7개 업무 흐름은 모듈 간 공유 트랜잭션에 의존했습니다. 서비스 분리 후에는 함께 커밋하거나 롤백할 수 없어, 호출만 HTTP로 바꾸면 포인트(HP) 이동과 주문 상태가 불일치할 수 있었습니다.

## 접근 방식

![공유 트랜잭션 분리 전후: 주문과 HP 작업 저장 → 트랜잭션 밖 HTTP 호출 → billing의 HP 보류 → 주문 결과 반영. 응답 유실은 같은 요청 ID로 재시도하고 일부 거절은 성공한 보류를 보상 반환](/portfolio/hapbang-shared-tx-before-after.png)

- HP 이동과 이의 제기 접수는 처리 결과와 거절 사유를 즉시 알려야 하므로 내부 HTTP로 호출했습니다. 접수 후에는 HP 지급이 중단돼 있으므로, 관리자의 인정/기각 결정과 사용자 철회는 Kafka 이벤트로 비동기 처리했습니다.
- 업무 상태와 HP 이동 요청을 같은 트랜잭션에 저장한 뒤, 커밋 후 트랜잭션 밖에서 HTTP를 호출했습니다. 결과는 별도 트랜잭션에 반영하고, HP 이동이 확인된 뒤에만 주문을 완료했습니다.
- 응답 유실로 처리 여부를 모르면 같은 요청 ID로 재시도하고, 일부 보류가 거절되면 성공분만 보상 반환했습니다. Kafka 이벤트는 Spring Modulith 발행 기록에 남겨 미완료 건을 매분 재발행했습니다.
- 같은 업무에는 주문 항목 ID 등 업무 키를 요청 ID로 사용해 재시도 시 중복 처리를 막았습니다. 강의가 받는 이의 제기 요청은 ID와 내용 해시를 저장해 같은 요청에는 기존 결과를 반환하고, 같은 ID의 다른 내용은 충돌로 거절했습니다.

## 해결 및 성과

- 7개 업무 흐름을 내부 HTTP와 이벤트 기반 연동으로 전환해 공유 트랜잭션 의존을 제거하고, 모든 앱의 단독 기동을 확인했습니다.
- 응답 유실 후 재시도로 구매가 완료되고, 일부 보류 거절 시 성공분만 반환되는 테스트로 검증했습니다. HTTP 호출이 로컬 트랜잭션 밖에서 실행되는지와 명령 재전송의 멱등성, 동일 ID의 내용 충돌 거절도 검증했습니다.
- 트레이드오프로 ‘처리 중’ 상태가 추가됐고, 재시도 한도를 초과한 건은 관리자 복구가 필요합니다.

## 참고

- [전환 설계 보고서](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/blob/dev/docs/lecture/bounded-context-http-migration-meeting-report.md)
- [이슈 #271](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/271)
- [PR #406](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/406)
- [PR #415](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/415)
- [PR #427](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/427)
- [PR #525](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/525)
- [PR #869](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/869)
