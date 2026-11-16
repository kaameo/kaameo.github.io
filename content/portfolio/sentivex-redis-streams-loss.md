---
title: "에러 로그 없이 유실된 수집 작업 80,375건의 원인 규명과 재발 방지"
project: sentivex
order: 2
---

## 문제 상황

![작업 유실 문제](/portfolio/redis-streams-loss-problem.png)

수집 결과마다 추가 조회 작업을 생성해 Redis Streams에 넣고, Worker가 이를 꺼내 처리하는 구조였습니다. 수집 작업이 단시간에 몰린 뒤 일부 작업이 Worker에 전달되지 않았고, DB에는 실행이 시작되지 않은 `queued` 상태의 기록 80,375건이 남았습니다. 원인을 설명하는 에러 로그도 없었습니다.

## 접근 방식

![작업 유실 해결](/portfolio/redis-streams-loss-solution.png)

- Redis Stream은 비었지만 미전달 작업 수(consumer group lag)와 DB의 미시작 작업 수는 모두 80,375건이었습니다. 이를 단서로 Worker가 읽기 전 메시지가 사라지는 경로를 조사했습니다.
- Stream 길이가 MAXLEN 1,000을 넘으면서 Worker에 전달되지 않은 메시지가 삭제됐습니다. DB 실행 기록과 lag는 그대로 남아 있었습니다.
- 큐 상한 확대만으로는 처리량 부족을 해결할 수 없어, Worker HPA의 최소 replica를 2개에서 5개로 높였습니다. 증설 중 쌓이는 작업을 수용하도록 MAXLEN도 1,000에서 100,000으로 늘렸습니다.
- Stream 길이, consumer group lag, `queued` 최장 대기 시간 메트릭과 알림으로 적체를 감지했습니다. 10분 이상 시작되지 않은 실행 기록은 `timed_out`으로 전환하고, 해당 구간은 다음 주기에 다시 수집하도록 했습니다.

## 해결 및 성과

- 마지막 배포 후 약 5일간 오케스트레이터의 작업 투입 건수와 Worker 처리 건수가 각각 45,701건으로 일치했습니다. Consumer group lag도 0으로 유지돼, 해당 기간 큐 유실 0건을 확인했습니다.
- 장시간 시작되지 않은 실행 기록을 자동 회수하도록 바꿔, 해당 기록을 수동으로 정리할 필요를 줄였습니다.
