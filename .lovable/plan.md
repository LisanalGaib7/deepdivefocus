# 전체 코드 리팩토링 플랜

## 진단 요약

| 신호 | 현황 | 위험도 |
|---|---|---|
| `src/pages/Index.tsx` 1,207줄 단일 파일 | 타이머/태스크/다이브/세션/모달이 한 컴포넌트에 응집 | **High** |
| `src/pages/History.tsx` 485줄 + `Recharts as any` | 차트 로직 + Pro 게이팅 + 데이터 가공 혼재 | High |
| `as any` 11곳 (Supabase 7, Recharts 1, fullscreen 3) | 타입 우회로 런타임 사고 가능 | High |
| feature flag 흩어짐 | `SUBSCRIPTION_ENABLED` 직접 체크가 Index/History에 8곳 | Medium |
| 직접 `localStorage` 호출 10개 파일에 32회 | guest/legacy 데이터 키 산재, 마이그레이션 어려움 | Medium |
| `console.log` 29회 | 프로덕션 노출, 일부는 sensitive 데이터 가능 | Medium |
| `Creature.pearls` 같은 죽은 잔재 | 방금 정리한 패턴 — 다른 곳도 존재 의심 | Medium |
| `is_admin()` 하드코딩 이메일 | DB 함수에 `aaaehgus@gmail.com` 박혀 있음 | **보안 High** |
| 보안 스캐너 미수행 | RLS/GRANT 현황 미확인 | 확인 필요 |

## 원칙 (30년차 방법론)

1. **작은 PR 단위로 쪼개 머지** — 한 번에 전부 갈아엎지 않음
2. **행위 보존 리팩토링 우선, 기능 변경은 분리**
3. **타입을 좁히는 변경부터** — `as any` 제거가 가장 ROI 큼
4. **롤백 가능성 보장** — 각 단계는 독립 커밋, 빌드 그린 유지
5. **테스트 부재 코드는 "관찰 가능한 동작"을 기준선으로** — 사전에 Playwright로 핵심 플로우 스냅샷

## 단계별 실행 (5 phases)

### Phase 1 — Quick wins / 죽은 코드 (저위험, 즉시)
- 옛 잔재 일괄 제거: `Creature.pearls` 패턴처럼 사용처 없는 필드/유틸 탐색 및 삭제
- `console.log` 29건 정리: 디버그용은 제거, 의미 있는 건 `logger` 래퍼로 통일
- `TODO` 정리, 주석화된 죽은 코드 제거
- 결과: ~200~400줄 감소, 행위 무변경

### Phase 2 — Feature flag 단일화 (구독 재오픈 대비)
- `src/features/monetization/gating.ts` 신설:
  - `useTaskLimit()`, `useCanAccessHistoryRange(range)`, `useCanExport()` 등 **capability hook**
  - 내부에서 `SUBSCRIPTION_ENABLED + isPro + entitlements` 조합
- `Index.tsx`/`History.tsx`의 8개 `SUBSCRIPTION_ENABLED && !isPro` 분기 → 훅 호출로 치환
- AI 리포트 추가 시 capability 한 줄만 추가하면 끝나는 구조 확보

### Phase 3 — Index.tsx 분해 (1207 → ~300줄)
하위 컴포넌트/훅으로 추출:
```
src/features/dive/
  useDiveSession.ts        # depth/oxygen/타이머 state machine
  DiveHUD.tsx              # 60-segment ring + 타이머 UI
  DiveControls.tsx         # start/pause/abort
src/features/tasks/
  TaskPanel.tsx            # 목록 + 추가 + 정렬
  useActiveTask.ts
src/pages/Index.tsx        # orchestration only
```
- 도출된 비즈니스 로직은 순수 함수로 추출 → 단위 테스트 가능

### Phase 4 — 타입 안전성 / Supabase 정합
- `supabase/types.ts` 재생성 트리거 후 `useTasks.ts` `as any` 5건 제거
- `useAuth.ts`/`useProStatus.ts`의 `supabase.auth as any` → 정식 타입 사용
- `Recharts as any` → 명시적 import 또는 타입 선언 파일
- fullscreen vendor prefix → 별도 `lib/fullscreen.ts`에 격리, `as any` 1회만 허용

### Phase 5 — 스토리지 & 보안
- `lib/storage/` 추상화:
  - `creatureStore`, `themeStore`, `audioPrefsStore`
  - guest ↔ user 마이그레이션 단일 진입점
  - localStorage 키 상수화 (`STORAGE_KEYS`)
- **보안 강화**:
  - `is_admin()` 이메일 하드코딩 → `user_roles` 테이블 + `app_role` enum 로 이관 (프로젝트 규칙대로)
  - `supabase--linter` + `security--run_security_scan` 실행, RLS/GRANT 갭 메움
  - `pro_subscriptions` 클라이언트 조작 가능 표면 점검

## 사전 확인 질문

코드 손대기 전 정해야 할 것:

1. **범위 합의** — 5개 Phase 전부 가나요, 아니면 Phase 1~2(저위험)만 먼저?
2. **`is_admin()` 이메일 하드코딩**을 `user_roles` 테이블로 이관해도 되나요? (DB 마이그레이션 동반)
3. **테스트 인프라** — 현재 자동화 테스트 없음. 핵심 플로우(다이브 시작/완료, 태스크 CRUD, Pro 분기) Playwright 스모크 테스트를 Phase 0으로 추가할까요?
4. **Phase 3 (Index.tsx 분해)는 diff가 큼** — 별도 작업 세션으로 분리할지, 같이 갈지?

## 비목표 (이번엔 안 건드림)

- UI/디자인 시스템 변경 (`Orbitron`, 테마, HUD 미관 등)
- 게임 밸런스 (진주값, 깊이 공식, drop weight)
- 신규 기능 (AI 리포트 등)
- shadcn `components/ui/*` 수정 (자동 생성 영역)

## 권장 진행 순서

**Phase 1 → Phase 2 → (보안 핫픽스: is_admin)** 까지를 1차 배치로 묶고,
Phase 3~5는 결과 확인 후 별도 세션으로 진행하는 게 안전합니다.
