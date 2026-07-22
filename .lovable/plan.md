# 마무리 4종 세트 실행 계획

## 1) 탭 전환 애니메이션 통일

현재 `TabTransition`은 fade + translateY(6px) + blur(6px)를 결합한 260ms 애니메이션이다. Focus 탭에 들어올 때의 순수 fade-in 느낌과 미묘하게 다르다.

- `src/index.css`의 `@keyframes tab-in`에서 `transform`/`filter`를 제거하고 opacity 트랜지션만 남긴다.
- 지속 시간은 240ms, easing은 `cubic-bezier(0.22, 1, 0.36, 1)` 유지.
- 4개 탭(Focus / Priority / History / Collection) 모두 동일한 fade-in 사용 — `TabTransition` 래퍼는 그대로 두고 CSS만 갈아낌.
- `prefers-reduced-motion` 분기는 유지.

## 3) 온보딩: 3스텝 코치마크 오버레이

첫 로그인 후 1회만 재생. 실제 다이브를 강제하지 않고 실 UI 위에 스포트라이트를 얹는다.

- 새 파일: `src/features/onboarding/TrainingDive.tsx`
  - 반투명 백드롭 + 대상 요소를 감싸는 사각/원형 스포트라이트 홀
  - 하단 툴팁 카드: 헤더(step 1/3), 설명 1–2줄, `Next` / `Skip` 버튼
  - 3스텝 순서:
    1. **다이브 시작** → Dive Gauge 중앙 Play 버튼 하이라이트, "Tap to descend. Your focus becomes depth."
    2. **진주** → Mission Complete 예시 or Pearl 배지 하이라이트, "Complete dives to earn Golden Pearls."
    3. **우선순위** → BottomNav의 Priority 탭 하이라이트, "Rank tasks by urgency and impact before diving."
- 새 파일: `src/hooks/useOnboarding.ts`
  - `localStorage` 키 `onboarding.trainingDive.completed.v1` 관리
  - Supabase 사용자의 경우 별도 필드는 안 만들고 localStorage로 충분 (기기 단위 튜토리얼).
- 진입점: `src/pages/Index.tsx`에서 마운트 후 tasks/creatures 초기 로드 완료 & 플래그 미설정이면 렌더.
- Skip / 완료 시 즉시 플래그 저장, 이후 렌더 안 됨.
- `prefers-reduced-motion`: 스포트라이트 확대 애니메이션 대신 즉시 표시.
- 텍스트 전부 영어(글로벌 타겟 규칙).

## 4) TopBar → 단일 햄버거 + 바닥 시트

- `src/features/dive/TopBar.tsx` 리팩토링:
  - 우측 5개 아이콘(Fullscreen / Sound / Engineering / Guide / Logout) 제거.
  - 대신 `Menu`(lucide) 아이콘 단 하나. 좌측 PRO 배지는 그대로.
  - 클릭 시 shadcn `Sheet` (side="bottom") 오픈.
- 새 파일: `src/features/dive/TopBarSheet.tsx`
  - 항목 리스트(각 항목 min-h-14 = 56px, WCAG AA 탭 타겟 44×44 이상 충족):
    - Toggle Fullscreen (아이콘/라벨 상태에 따라 전환)
    - Toggle Sound
    - Engineering Bay (기존 `onOpenEngineeringBay`)
    - Guidebook (기존 `GuidebookModal` 트리거를 시트 안에서 열도록 재구성 — 시트 안에서 다른 모달을 열 때 시트는 자동 닫힘)
    - Log out (destructive 스타일)
  - 바닥 안전 영역(`pb-safe`) 포함.
- 접근성:
  - 햄버거 버튼 `aria-label="Open menu"`, `aria-expanded`, `aria-controls`.
  - 시트 내부 각 액션은 실제 `<button>`, 라벨 + 아이콘 조합, `min-h-14 min-w-11`.
  - `prefers-reduced-motion` 시 시트 슬라이드 대신 즉시 표시 (Radix가 이미 기본 지원 — 별도 처리 불필요, 검증만).
- `Index.tsx`의 TopBar props 시그니처는 유지(내부만 변경).
- Fullscreen 상태와 관계없이 항상 접근 가능 (몰입 모드에서도 `focus-dim` 대상에 포함되어 자동 페이드).

## 검증

- 4개 탭을 순차 전환 → 모두 동일한 fade-in만 재생되는지.
- 다크 배경에서 h1 / gauge / active tab / PRO / mission-complete 다섯 곳에만 광원이 남았는지 스크린샷 확인.
- 첫 로그인 시 코치마크 3스텝 → Skip 후 재로그인해도 재출현 안 함.
- 모바일 375×667에서 햄버거 시트 항목 각각 44px 이상 탭 타겟.
- Reduced motion 설정 시 fade / 코치마크 확대 / 시트 슬라이드 모두 즉시 표시.

## 변경 파일 요약

- 수정: `src/index.css`, `src/features/dive/TopBar.tsx`, `src/pages/Index.tsx`, `src/features/dive/AmbientSoundMixer.tsx` 인접 스타일, `src/pages/Priority.tsx` / `Collection.tsx` / `History.tsx`의 세컨더리 글로우 정리, TopBar 관련 toast 클래스.
- 신규: `src/features/dive/TopBarSheet.tsx`, `src/features/onboarding/TrainingDive.tsx`, `src/hooks/useOnboarding.ts`.