## Barreleye 48x48 — 레퍼런스 이미지 1:1 트레이싱

업로드한 이미지가 이미 픽셀 아트이므로, Python(PIL)으로 이미지를 분석해 48x48 그리드로 다운샘플링하고 색상을 양자화한 뒤 그대로 `barreleye()` 함수에 반영.

### 작업
1. **이미지 분석** (`/mnt/user-uploads/image-8.png`)
   - PIL로 픽셀 단위 분석, 원본 픽셀 셀 크기 추정 후 48x48로 리샘플
   - 색상을 5~7개로 클러스터링: 배경(투명), 다크 갈색 몸체, 더 어두운 외곽/지느러미, 돔 블루, 그린 동공, 다크 그린 망막, (선택) 하이라이트
   - 결과를 `grid: number[][]` + `colorMap`으로 변환

2. **`src/components/common/PixelCreature.tsx` 수정**
   - `barreleye()`를 `size: 48`과 새 그리드로 교체
   - colorMap은 레퍼런스에서 추출한 실제 색상 사용
   - `GridData.size`와 동적 `viewBox`는 이미 지원됨 → 추가 변경 불필요

3. **검증**
   - Bestiary에서 시각 비교, 필요하면 몇 픽셀 수동 보정

### 그대로 두는 것
- 다른 크리쳐, 컬렉션 레이아웃, glowColor 시스템, 애니메이션
