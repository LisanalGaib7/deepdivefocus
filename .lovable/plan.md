## Barreleye 32x32 테스트 계획

배럴아이 한 마리만 32x32로 새로 그려서 기존 16x16 시스템과 공존시키는 테스트.

### 변경 사항

**1. `src/components/common/PixelCreature.tsx`**
- `GridData` 타입에 옵셔널 `size?: number` 필드 추가 (기본 16)
- `barreleye()` 함수를 32x32 그리드로 새로 작성, `size: 32` 명시
  - 첨부 이미지 참고: 옆모습, 다크 적갈색 몸체, 머리 위 투명 돔(파란빛), 큰 형광 그린 눈, 꼬리/지느러미 디테일 강화
  - colorMap: 1=다크 갈색(body), 2=돔(연블루), 3=형광 그린(eyes), 4=어두운 지느러미, 5=하이라이트
- 렌더링 부분에서 `size` 읽어서 `viewBox="0 0 {size} {size}"` 동적 설정

### 그대로 두는 것
- 다른 16종 크리쳐 (자동 업스케일 X, 변경 X)
- Collection 그리드 셀 크기, 모달 레이아웃 — `viewBox`만 바뀌므로 시각 크기 동일
- glowColor, 애니메이션 클래스

### 확인 방법
Bestiary에서 Barreleye 슬롯 시각 비교. 만족스러우면 나머지도 같은 방식으로 점진적 마이그레이션, 별로면 16x16 디자인으로 롤백.
