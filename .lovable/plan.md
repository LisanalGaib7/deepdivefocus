# Analytics 탭 정리

## 1. "Your focus journey" 서브타이틀 제거
`src/pages/History.tsx:179`
- `<PageHeader title="ANALYTICS" subtitle="Your focus journey" />` → `<PageHeader title="ANALYTICS" />`
- 다른 탭(Priority, Bestiary)과 헤더 톤을 일치시킴.

## 2. Yearly Dive History 카드 통일
`src/features/history/YearlyDepthLog.tsx:238-242`

현재:
- `<h2 className="text-lg font-semibold text-muted-foreground">Yearly Dive History</h2>` — 다른 섹션 제목(`text-sm text-muted-foreground uppercase tracking-wider`)과 완전히 다른 스타일
- 컨테이너: `bg-card ... border border-border` — 다른 카드(`bg-white/5 backdrop-blur-md ... border border-primary/30`)와 톤이 다름

변경:
- 섹션 제목을 다른 차트 카드와 동일한 패턴으로:
  - 카드 내부 `<h2 className="section-label mb-4">Yearly Dive History</h2>` (Weekly Focus / Task Breakdown과 동일하게 카드 안쪽에 배치)
- 컨테이너 클래스를 `bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-primary/30`로 통일
- 바깥 wrapper `space-y-3` 제거 (제목이 카드 안으로 들어가므로)

## 3. 박스 간 간격 정리
`src/pages/History.tsx`

현재 문제:
- `page-shell-inner`는 `space-y-6` (24px)로 전역 간격을 강제
- 그런데 내부에 `<div className="space-y-3">` (Bento Grid) 등 로컬 간격이 섞여있어 리듬이 깨짐
- 특히 Hero → Sub Cards (12px), Sub Cards → Weekly (24px), Weekly → Task Breakdown (24px) — 첫 그룹만 좁고 이후는 넓어서 이질적

변경:
- 모든 Analytics 카드 사이 간격을 **단일 리듬 `gap-4` (16px)** 로 통일
- `<div className="relative">` 내부의 unlocked 컨텐츠를 `<div className="space-y-4">` 단일 컨테이너로 감싸고, 내부의 `<div className="space-y-3">` 및 `grid grid-cols-2 gap-3`를 `gap-4`로 통일
- YearlyDepthLog와 TimeRangeSelector 사이도 동일한 리듬 유지 (현재 `space-y-6` → `space-y-4`로 조정)

## 결과 예시 (ASCII)
```text
┌── ANALYTICS ─────────┐   ← 헤더 (subtitle 없음)
│                       │
├── Yearly Dive Hist ──┤   ← 다른 카드와 동일 톤
│  히트맵                │
├── [Today][Week][Mon] ┤   ← 필터
├── Total Focus Time   ┤
├── [Sessions][AvgSes] ┤   ← 모두 16px 간격
├── Weekly Focus       ┤
├── Task Breakdown     ┤
```

## 파일
- `src/pages/History.tsx` — 헤더 subtitle 제거, wrapper 간격 통일
- `src/features/history/YearlyDepthLog.tsx` — 카드 스타일 & 제목 스타일 통일
