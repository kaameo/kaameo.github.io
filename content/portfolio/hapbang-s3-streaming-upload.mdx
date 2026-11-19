---
title: "S3 직접 업로드가 막힌 환경에서 2GB 영상을 서버 경유 스트리밍으로"
project: hapbang
order: 3
---

## 문제 상황

외부 PC에서 Presigned PUT으로 S3에 직접 업로드하면 작은 파일도 403으로 거절됐습니다. 프로필 사진을 포함한 파일 업로드 기능을 사용할 수 없었습니다. 같은 URL을 EC2에서 호출하면 성공했지만, 조직 정책 원문을 조회하거나 변경할 권한이 없어 정확한 제한 원인을 확인하지 못했습니다.

## 접근 방식

![업로드 경로 전후 비교: 외부 PC의 S3 직접 PUT은 403. 서버 경유 방식은 브라우저 → Envoy Gateway → 백엔드 → S3로 본문을 버퍼링 없이 전달하고, DB 트랜잭션 밖에서 전송하며 앱별 동시 업로드를 20개로 제한](/portfolio/hapbang-s3-upload-before-after.png)

- 현재 권한에서 업로드가 가능한 EC2를 경유하도록 바꿨습니다. 2GB 본문을 메모리에 모으지 않고 S3로 스트리밍하고, DB 트랜잭션은 권한과 파일 정보 검증, 완료 상태 변경에만 짧게 사용했습니다.
- Envoy는 업로드 경로에만 버퍼링을 끄고 장시간 전송을 허용했습니다. 일반 API의 제한은 유지하고, 앱에서 2GB 상한을 검사했습니다.
- 서버 네트워크와 요청 스레드를 점유하는 비용이 생겨 앱 인스턴스별 동시 업로드를 20개로 제한하고, 초과하면 본문을 읽기 전에 503으로 거절했습니다. 되감을 수 없는 입력 스트림의 SDK 자동 재시도는 끄고, 실패 시 클라이언트가 처음부터 재업로드하도록 했습니다.

## 해결 및 성과

| 항목 | 결과 | 측정 조건 |
| --- | --- | --- |
| 운영에서 2GB 영상 업로드 | 성공, 8분 17초 | 외부 PC → Envoy → lecture-app → S3, 단일 파일 |
| 업로드 중 앱 메모리 | +6.7MiB | working set 630.2 → 636.9MiB, limit 704MiB, Prometheus 약 1분 간격 수집 |

운영 단일 업로드에서 2GB 파일을 컨테이너 메모리 한도 안에서 처리하고, heap 사용도 업로드 전과 같은 범위임을 확인했습니다.

## 참고

- [이슈 #106](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/issues/106)
- [스트리밍 업로드 PR #110](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/110)
- [OOM 차단 PR #117](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/117)
- [Envoy PR #407](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/407)
- [동시 업로드 제한 PR #702](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/pull/702)
- [s3.md](https://github.com/prgrms-be-adv-devcourse/beadv8_8_LMS_BE/blob/dev/docs/deploy/s3.md)
