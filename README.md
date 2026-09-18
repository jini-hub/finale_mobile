# Finale Case OS v5.0.1

## 가장 쉬운 실행 방법
**`Finale-바로실행.html`을 더블클릭하세요.** CSS, JavaScript, 확정 로고가 파일 하나에 모두 포함되어 있어 별도 서버가 필요 없습니다.

`index.html`도 압축을 푼 폴더 안에서 더블클릭 실행할 수 있도록 ES Module 의존성을 제거했습니다.

# Finale Case OS v5.0

기존 Finale의 녹색·크림 계열 디자인과 확정된 뫼비우스 로고를 유지하면서 기능을 확장한 데모입니다.

## 주요 기능
- 상속 Case 생성/저장/재접속
- 상속인 확인 및 가족관계 Mock 연동
- 안심상속 원스톱 Mock 데이터 연동
- 재산·채무 통합 원장
- 단순승인/한정승인/상속포기 위험진단
- 스마트 문서 자동작성 및 파일 저장
- 부동산 상속등기 진행 엔진
- 상속세 예상계산 및 신고자료 생성
- 무료 Finale Guide(외부 AI API 없이 규칙 기반)
- 유료 전문가 채팅 Mock 결제
- 뒤로가기/앱 종료 후에도 상담방 유지
- 사용자가 '상담 종료'해야 상담 완료
- Android APK 빌드 준비(Capacitor + GitHub Actions)

## 웹 실행
별도 빌드 없이 정적 서버에서 `index.html`을 실행할 수 있습니다.

## 테스트
```bash
npm test
npm run check
```

## Android
GitHub Actions의 `Build Android APK` 워크플로우를 수동 실행하면 APK artifact를 생성하도록 구성되어 있습니다.

> 현재 정부기관 연계, 전자등기/전자신고, PG 결제, 실제 전문가 메시징은 데모 Mock입니다. 실제 사업화 시 각 기관/자격사/결제사업자 연동이 필요합니다.


## 로컬 실행
압축을 푼 뒤 `index.html`을 더블클릭하면 별도 웹서버 없이 실행됩니다. (file:// 실행 지원)
