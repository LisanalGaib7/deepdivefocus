# Apple Design Award 관점 UX/UI 리뷰

Submarine HUD 컨셉과 핵심 아이디어(잠수함 몰입 + 진주/도감/포커스)는 그대로 유지하되, ADA 심사 기준(Craft / Delight / Depth / Inclusivity)에 비춘 **구조적 재정비 이슈 리스트**입니다. 구현은 별도 승인 후 진행.

ADA 심사 렌즈 (내재화한 기준)
- **Craft**: 픽셀 단위 정합, 타이포·간격의 리듬, 모션의 물리적 신뢰감
- **Delight**: 예상보다 한 뼘 더 나아간 순간, 감각적 피드백
- **Depth**: 표면이 아닌 정보 위계 · 상태 전이의 명료함
- **Inclusivity**: Reduced Motion, VoiceOver, 대비, 국제화

---

## 🔴 HIGH — 지금 손대야 할 것 (컨셉 강화형)

### H1. "Dive" 순간의 연출 부재
Focus 탭에서 타이머 시작 → 종료가 상태 변화일 뿐, **잠수라는 서사**가 없습니다.
- **문제**: 시작 시 즉시 카운트다운, 종료 시 즉시 모달. 컨셉과 UX가 분리됨.
- **개선 방향**:
  - 시작: 800–1200ms의 "hatch close → descent" 트랜지션 (기존 UI가 아래로 밀리며 계기판만 남는 압축감).
  - 진행 중: 배경 노이즈/버블/수압 게이지가 시간에 따라 아주 미묘하게 심화 (10분마다 톤 다운).
  - 종료: 결과 모달 대신 "ascent" 시퀀스 → 진주가 수면 위로 떠오르는 1회성 연출.
- **Reduced Motion**: 트랜지션 대신 페이드만.

### H2. 하단 4탭 아이콘·라벨의 정보 위계 혼재
- **문제**: Focus / Priority / Bestiary / Analytics 4개 탭이 **모두 동일 크기·동일 강조**. Focus는 이 앱의 심장인데 시각적 우선순위가 없음.
- **개선**: 중앙 Focus를 살짝 융기(FAB 스타일 or 지름 +6, 링 글로우) — Instagram/Threads/Halide가 쓰는 "primary action anchor" 패턴. 컨셉과도 맞음(dive는 중앙에서 시작).

### H3. 페이지 헤더의 반복 = 위계 소실
- **문제**: 모든 탭 상단에 동일 크기 Orbitron 대문자 헤더 + hud-glow. 4개 탭이 다 "제목이 주인공"이라 어느 하나 강조되지 않음.
- **개선**:
  - Focus: 헤더 제거하거나 매우 작게(uppercase eyebrow 10px) — 계기판이 주인공.
  - Priority/History/Collection: 헤더 유지하되 subtitle 슬롯 대신 **오른쪽에 상태 요약 칩** (예: "3 missions · 42m today").
  - 페이지 진입 시 헤더에 8px translateY + fade-in (60ms) — 미묘한 arrival 모션.

### H4. Auth 화면의 톤·컨셉 불일치 지점
현재 캡처 확인 결과:
- 앵커 로고가 정적. Dive 컨셉이면 로고에 **아주 느린 부유(2s ease-in-out, ±3px)** 모션.
- "PILOT AUTHENTICATION" · "COMM FREQUENCY" 등 라벨은 컨셉에 맞지만, 그 아래 실제 입력 UX는 shadcn 기본. **caret color, focus 링, error state**가 HUD 팔레트로 안 맞춰짐.
- "CONTINUE AS GUEST (DEMO MODE)" — 텍스트 링크로 처리돼 위계상 3순위인데 시각적으로 강조도 약도 아닌 애매한 중간.
- **개선**: Guest는 secondary ghost 버튼으로, 로고 미세 부유, 입력 focus 시 링 대신 좌측 브래킷 `[ ]`이 확장.

### H5. 진주(reward) 등장의 물리감 부재
진주는 이 앱의 통화이자 델라이트 포인트인데, 획득 시 카운터가 그냥 숫자만 오름.
- **개선**: 획득 시 (a) 진주 아이콘이 하단 TopBar 카운터로 **arc 궤적**을 그리며 흡수, (b) 카운터 값이 count-up 이징(0.6s), (c) 옵션 tick 사운드/haptic light. ADA 수상작 공통 요소.

### H6. Empty state가 정보만 있고 캐릭터가 없음
- Priority "All tasks completed for today", Collection의 잠금 카드, History의 데이터 없는 날 — 텍스트만 있음.
- **개선**: 컨셉 세계관에서 나온 마이크로 카피 + 정지 이미지 대신 **PixelCreature 실루엣의 극저채도 애니메이션** (예: 빈 도감 = 어둠 속에 지나가는 그림자).

---

## 🟡 MEDIUM — 다음 단계 (정제형)

### M1. 타이포그래피 시스템 정리
- Orbitron / JetBrains Mono / (본문 Inter 계열) 3종 사용 중이지만, **크기·행간 스케일이 페이지마다 다름**.
- **개선**: `text-display / text-title / text-readout / text-body / text-caption / text-eyebrow` 6단 스케일을 index.css에 정의. line-height는 display 1.05, body 1.5로 고정.

### M2. 간격 리듬 (spacing scale)
- Tailwind 기본 스케일을 그대로 쓰다 보니 4/6/8/12/16이 혼재.
- **개선**: 4·8·12·20·32의 **5단 리듬**으로 축소, PageHeader·카드·섹션 사이는 20 또는 32만 허용.

### M3. 모달의 등장·해제 패턴 불일치
Guidebook / Engineering Bay / Pricing / UpgradeRequired 각각 트랜지션이 다름.
- **개선**: 모든 모달을 **하단→위 슬라이드 220ms cubic-bezier(.2,.9,.3,1) + 배경 blur 8px**로 통일. 잠수함 계기판을 꺼내는 감각.

### M4. Bestiary(Collection) 그리드의 발견 UX
현재 잠금/해금 카드가 균일 그리드. 컬렉션의 즐거움은 "다음 것을 상상하는 순간"인데 잠금 카드가 너무 정보 없음.
- **개선**:
  - 최근 해금은 상단에 크게 1장 pin (magazine 스타일).
  - 잠금 카드에 힌트: "심해 400m 이상에서 목격", "총 12회 dive 후 조우 가능" 등 서사 태그.
  - hover/press 시 카드가 **아주 살짝 tilt** (max 4deg, mouse only).

### M5. History 히트맵의 인터랙션 빈약
연간 heatmap의 셀이 클릭에 반응 안 함(추정).
- **개선**: 셀 탭 → 그날의 dive 요약 tooltip/시트. Apple Fitness의 링 상세 시트 패턴.

### M6. Priority 화면의 점수 입력 UX
5단 세그먼트 버튼 3줄 = 인지 부하 큼. 태스크가 5개면 15번 탭.
- **개선**:
  - 신규 태스크 추가 시 기본값(3/3/25m) 즉시 세팅 → 나중에 편집.
  - 상세 편집은 태스크 카드 press-and-hold 시 시트로 분리.
  - 점수 변경 시 리스트 재정렬을 **FLIP 애니메이션** (layout animation)으로.

### M7. Engineering Bay의 업그레이드 피드백
현재 구매 시 상태만 바뀜.
- **개선**: 구매 확정 시 카드가 **rivet 조이는 듯한 220ms scale(1→1.04→1) + border-glow pulse 1회**. "물리적으로 무언가 장착됐다" 감각.

### M8. Theme Switcher의 프리뷰 부재
5개 테마 전환 시 즉시 반영되나, **선택 전 미리보기가 없음**.
- **개선**: 스위처를 sheet로 확장, 각 테마 옵션에 12px 미니 HUD 프리뷰(계기판 링 + 진주). 선택 확정 시 전체 UI가 **300ms crossfade** (현재는 급전환일 것).

---

## 🟢 LOW — 마감 품질 (polish)

- **L1. Focus 계기판 링 애니메이션**: 60-segment tick이 초 단위로 켜질 때 각 tick에 20ms의 미세 스케일 튀김 추가.
- **L2. Skeleton 대신 shimmer**: 데이터 로딩 시 shadcn 기본 Skeleton → HUD 톤 shimmer(수중 광선).
- **L3. 숫자 트랜지션**: 모든 카운터(진주, 총 시간, 오늘 focus)에 tabular-nums + count-up 이징 통일.
- **L4. Toast 위치·톤**: 현재 화면 상단 알림이 하단 네비와 안 어울림. 하단 nav 위 8px 지점으로 이동, 220ms slide-up.
- **L5. Focus states**: 키보드 tab 이동 시 focus outline이 shadcn 기본. HUD 브래킷(`[ ]`) 스타일로 커스텀.
- **L6. Guidebook 모달 타이포**: 본문이 너무 균일. 챕터 제목/설명/코드 예시의 3단 위계 명확화.
- **L7. Haptics 지도**: 현재 4단이지만 어떤 액션에 어떤 강도인지 문서/일관성 재확인 (dive start=medium, pearl gain=light, upgrade=heavy 등).
- **L8. Accessibility 감사**: PixelCreature에 aria-label, 모든 진주 카운터에 aria-live="polite", Reduced Motion 미디어쿼리 실제 반응.
- **L9. 국제화 준비**: 하드코딩된 영문 카피를 constants로 추출 (아직 다국어 아니지만 훅만 걸어두기).
- **L10. 로고 · 앱 아이콘**: Auth의 앵커+기어 로고가 앱 브랜딩 이상으로 사용되지 않음. TopBar에 12px 미니 로고, splash와 통일.

---

## 산출물 · 다음 단계

이 문서 자체가 **우선순위 이슈 리스트**이며, 별도 코드 변경은 없습니다.

승인 시 제안 순서:
1. **H1 + H2 + H5** — 컨셉의 심장(dive 순간·중앙 앵커·진주 물리감)부터
2. **H3 + H6 + M3** — 페이지 위계·모달·empty state 정리
3. **M1 + M2** — 타이포·간격 스케일 (전 페이지 파급 큼)
4. 나머지 M / L 순차

## 참고 · 사각지대

- 리뷰는 코드와 Auth 스크린샷, memory에 축적된 디자인 결정을 근거로 함. 인증 후 4개 탭 실물 캡처는 이번엔 세션 유지 실패로 확보 못함 → 구현 단계 진입 시 각 이슈별로 실 캡처로 재검증 필요.
- 성능·데이터 로직은 이번 스코프에서 제외 (요청 = UX/UI).
