---
title: 가계부 API
company: side
type: project
order: 1
period: 2026.02 – 2026.05
tech: [Spring Boot, JPA, Docker]
highlights:
  - 카드 결제 문자를 파싱해 지출을 분류하는 REST API 서버, 1인 개발
  - 카드사별 파서를 전략 패턴으로 분리해 새 카드사를 기존 코드 수정 없이 추가
  - "[숫자로 보이는 성과. 예: 지원 카드사 0곳, 파싱 성공률 00%]"
github: https://github.com/kaameo
---

## 배경

매달 카드 명세서를 엑셀로 옮겨 가계부를 정리했는데, 결제 알림 문자에 필요한 정보가 이미 다 들어 있었습니다.

- 카드사마다 문자 형식이 달라 정규식 하나로는 처리할 수 없었습니다.
- 같은 가맹점도 결제 수단에 따라 이름이 다르게 찍혔습니다.

## 성과

- [가계부 정리에 쓰던 시간 변화. 예: 월 0시간 → 0분]
- [지원 카드사 수, 처리한 결제 건수]

## 설계 및 구현

새 카드사가 늘어나도 기존 코드를 건드리지 않는 것을 가장 먼저 정했습니다.

```java
public interface PaymentSmsParser {
    boolean supports(String message);
    Payment parse(String message);
}
```

## 운영

- 카드사별 실제 문자 샘플로 파서 테스트를 만들어 새 형식이 들어와도 회귀를 막았습니다.
- Docker Compose로 로컬과 서버 환경을 맞췄습니다.
