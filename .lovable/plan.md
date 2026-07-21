# Design Review & System Unification

30년차 UX 방법론 요약: **먼저 시스템을 정하고, 그 다음 페이지를 시스템에 맞춘다.** 지금 앱은 페이지별로 각자 결정을 내려서 어긋난 상태 — Focus는 gradient-ocean text에 sm→6xl 반응형, 나머지 탭은 `text-4xl hud-glow-title` 고정, Auth만 `tracking-[0.3em]` 등. 아래는 리뷰 결과와 처방입니다.

## 진단 (파일:라인으로 확인된 것만)

**1) 헤더 타이포 불일치**
- `Priority/History/Collection`: `text-4xl font-bold tracking-widest hud-glow-title` (일관)
- `Auth`: `text-4xl md:text-5xl tracking-[0.3em]` — trackings값이 다름
- `Index.tsx:350` Focus 화면 제목: `text-3xl..lg:text-6xl bg-gradient-ocean bg-clip-text` — 완전히 다른 브랜딩
- `Index.tsx:410` dive 큰 수치: `text-4xl md:text-5xl drop-shadow-[...rgba(255,255,255,...)]` — 테마 무시 하드코딩 그림자

**2) 수치 판독값(숫자) 규격 없음**
- History의 큰 시간 숫자는 `text-3xl md:text-4xl font-bold` + `text-primary/80` 접미사
- Priority 순위 배지는 `h-9 w-9 font-robotic`
- Focus dive 큰 숫자는 `text-4xl..5xl font-extrabold`
- 셋 다 "메인 판독값"인데 크기·굵기·색이 다 다름. `font-mono`(JetBrains Mono) 등록해놓고 실제 숫자엔 `font-robotic`을 쓰는 곳도 섞여 있음.

**3) 섹션 헤더/서브라벨 규격 없음**
- Priority: `text-xs uppercase tracking-widest text-primary font-bold`
- History: `text-xs uppercase tracking-widest text-muted-foreground`
- Collection: 서브라벨 없음 (subtitle이 `font-mono`)
- 같은 역할인데 색·굵기가 매번 다름.

**4) 페이지 컨테이너 규격 없음**
- Collection: `max-w-2xl mx-auto px-4 py-8 pb-28 space-y-6` + radial gradient 배경 2겹
- History: 자체 `px-4 py-8` (배경 없음)
- Priority: 자체 padding
- Auth: 자체 padding
- pb-28로 하단 nav 여백 확보하는 곳/안 하는 곳 섞임 → 하단 잘림 잠재 버그.

**5) 상태 문구(빈 상태·로딩) 스타일 제각각**
- Loading: `animate-pulse text-primary font-robotic tracking-widest` (History/Collection/Admin은 통일, Auth·Index는 다름)
- Empty: Priority는 3종 상태 문구가 각기 다른 폰트/색

**6) 하드코딩 잔재 (테마 미반응)**
- `Index.tsx:410` `drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]` — sage/rose에서도 흰빛 유지됨
- `Index.tsx:350` `bg-gradient-ocean` — 다른 4개 테마와 무관한 이름/색

**7) BottomNav 대비 콘텐츠 여백**
- BottomNav는 `fixed bottom-0 pb-safe`, 카드가 nav 뒤로 겹치는 페이지가 있음 (일관된 `pb-28 pb-safe` 없음).

---

## 처방: 공용 디자인 시스템 확립 → 페이지 이관

### A. 토큰/유틸리티 확정 (`src/index.css` + `tailwind.config.ts`)

새 유틸리티 클래스 추가 (한 곳에서 정의, 페이지는 클래스만 씀):

- `.page-shell` — `min-h-screen bg-background px-4 pt-6 pb-28 max-w-2xl mx-auto` (모든 탭 컨테이너 규격, pb-28로 BottomNav 안전)
- `.page-header` — 페이지 h1 규격: `text-3xl font-robotic font-bold uppercase tracking-[0.2em] text-primary hud-glow-title`
- `.page-subtitle` — h1 밑 서브라벨: `mt-1 text-xs font-mono tracking-widest text-muted-foreground uppercase`
- `.section-label` — 카드/그룹 위 소제목: `text-[11px] uppercase tracking-widest text-muted-foreground font-robotic`
- `.readout-xl` — 큰 수치 판독값: `font-mono tabular-nums text-4xl font-bold text-primary`
- `.readout-md` — 중간 수치: `font-mono tabular-nums text-2xl font-semibold text-primary`
- `.state-loading` — 로딩 텍스트 통일
- `.state-empty` — 빈 상태 텍스트 통일

숫자엔 무조건 `font-mono` + `tabular-nums` (판독값 정렬), 라벨엔 `font-robotic` — 역할 분리 확정.

### B. 공통 페이지 헤더 컴포넌트

`src/components/common/PageHeader.tsx` 신규 (props: `title`, `subtitle?`, `right?`) — Priority/History/Collection/Auth 모두 사용. h1 스타일 재발명 금지.

### C. 페이지별 이관 (기능/데이터 로직 무변경)

1. **Focus (`Index.tsx` 350줄대 히어로 + 410줄대 큰 수치)**
   - `bg-gradient-ocean` 제목 → `.page-header` 규격으로 교체 (테마 대응됨)
   - 하드코딩된 흰빛 `drop-shadow`, 반응형 6xl 제거 → `.readout-xl`

2. **Priority (`src/pages/Priority.tsx`)**
   - h1 → `<PageHeader>` 사용, 인라인 `text-4xl` 제거
   - `SectionTitle` 컴포넌트를 `.section-label` 유틸리티로 대체
   - 순위 배지 숫자 `font-robotic` → `font-mono tabular-nums`
   - 3종 빈 상태 문구 → `.state-empty` 통일

3. **History (`src/pages/History.tsx`)**
   - h1 → `<PageHeader title="ANALYTICS" subtitle="Your focus journey">` 
   - 큰 시간 숫자(141/156/160/169줄대) → `.readout-xl` + 접미사 h/m는 `text-xl text-primary/60` 정규화
   - 섹션 소제목(224줄대) → `.section-label`
   - 로딩(141) → `.state-loading`

4. **Collection (`src/pages/Collection.tsx`)**
   - 컨테이너를 `.page-shell`로 (radial gradient 배경 2겹은 유지하되 컨테이너 밖으로 분리)
   - h1 → `<PageHeader>` 
   - 서브라벨 "SPECIMENS CATALOGUED n/total" → `.page-subtitle` + 카운터는 `font-mono tabular-nums`
   - 카드 내부: rarity badge/pearl 카운터는 이미 mono 사용 중 → 유지

5. **Auth (`src/pages/Auth.tsx`)**
   - h1 → `<PageHeader>` (tracking 0.3em → 0.2em로 시스템 값 사용)
   - 로딩 상태 → `.state-loading`
   - 폼 필드/버튼은 이번 스코프 밖 (요청: 카드·헤더 중심)

6. **BottomNav 여백 안전화**
   - 모든 페이지가 `.page-shell` 쓰면 `pb-28` 자동 확보 → 잘림 버그 원천 제거

### D. 검증
- 5개 테마(ocean/sage/rose/lavender/mono)에서 4개 탭 스크린샷 회귀 확인 — 하드코딩 흰빛/블루가 다른 테마에서도 정상 재염색되는지.
- Playwright로 iPhone 393px + iPad 768px 두 뷰포트에서 잘림 없는지.

---

## 안 하는 것 (스코프 밖)
- 정보구조/기능 변경 없음. 카피 문구, 데이터 계산, 라우팅, 컴포넌트 분해 그대로.
- 차트 내부 스타일(Recharts), 픽셀 크리쳐, PricingModal/EngineeringBayModal 내부 — 별도 턴에서.
- 다크→라이트 모드 전환. 계속 다크.

## 산출물
새 파일 2개: `PageHeader.tsx`, 유틸리티 클래스 블록 (index.css 추가). 수정 파일 5개: Index/Priority/History/Collection/Auth. 총 클래스 치환 중심의 저위험 변경.

## Technical Details
- 유틸 클래스는 `@layer utilities`에 추가해 Tailwind purge 대상 포함.
- `font-mono`는 이미 `tailwind.config.ts`에 JetBrains Mono로 등록됨(과거 턴). `tabular-nums`는 Tailwind 기본 유틸.
- `PageHeader`는 순수 presentational, memo화 필요 없음.
- 기존 `.hud-glow-title`는 그대로 재사용 (5개 테마 `--hud-glow` 이미 정의됨).
