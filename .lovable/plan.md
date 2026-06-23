# 전체 코드 리팩토링 플랜 — 진행 현황

> 30년차 방법론 기반의 5단계 리팩토링. 행위 보존을 우선하며 작은 PR 단위로 진행.

## ✅ 완료 (이번 세션)

### Phase 1 — Quick wins (완료)
- `console.log` 9건 제거 / `logger` 래퍼 통합
- `src/lib/sessionStorage.ts` 죽은 mock 데이터 로직 제거
- `Creature.pearls` 잔재 제거

### Phase 2 — Feature flag 단일화 (완료)
- `src/features/monetization/gating.ts` 신설 (`useTaskGating`, `useHistoryRangeLock`, `useMonetizationUI`)
- `Index.tsx` / `History.tsx`의 `SUBSCRIPTION_ENABLED && !isPro` 분기 → 훅 호출로 치환
- `HARD_CAP_TASKS`(성능 한계) vs `LEGACY_FREE_TASK_LIMIT`(구독 한계) 분리

### Phase 4 — 타입 안전성 (완료)
- `useAuth.ts`: `supabase.auth as any` 제거, `User`/`Session` 정식 타입 사용
- `useProStatus.ts`: `as any` 제거, `logger` 통합
- `useTasks.ts`: 4건의 `as any` 제거 (Supabase types 재생성됨)
- `useFullscreen.ts`: vendor prefix를 `FullscreenElement`/`FullscreenDocument` 타입으로 격리, webkit 이벤트 청취 추가
- `Index.tsx`: `creature.rarity as any` 제거
- 남은 `as any`: 1건 (`Recharts as any` — 메모리에 명시된 의도적 concession)

### Phase 5 — 보안 (Step A 완료)
- DB 마이그레이션:
  - `app_role` enum (`admin`, `user`) 신설
  - `public.user_roles` 테이블 + RLS 정책 (자기 역할만 조회, 관리자만 부여/회수)
  - `public.has_role(uuid, app_role)` security definer 함수
  - 기존 admin 계정을 `user_roles`에 자동 시드
  - `is_admin()` 함수가 `user_roles` 우선 + 이메일 fallback (락아웃 방지용 임시)
- 프론트:
  - `src/hooks/useIsAdmin.ts` 신설 (서버 `is_admin()` RPC 호출)
  - `AdminSubscriptions.tsx`에서 `ADMIN_EMAIL` 상수 + 이메일 비교 가드 제거 → `useIsAdmin` 사용
  - 클라이언트에서 이메일 하드코딩 완전 제거

### Phase 3 — Index.tsx 분해 (부분)
- `src/hooks/useUpgradeLevels.ts` 추출 (engine/hull 영속화 — ~14줄 감소)

## 🚧 남은 작업 (다음 세션 권장)

### ✅ Phase 5 — Step B (감사 완료)
- `pro_subscriptions` RLS 감사: RLS 활성, INSERT/UPDATE에 `is_admin()` 강제, DELETE 정책 없음(거부), SELECT는 admin 또는 본인. 클라이언트 권한상승 불가.

### ✅ Phase 3 — Index.tsx 분해 (완료)
- 1,185 → 435줄 (-63%)
- 추출: `useDiveTimer`, `useDiveCompletion`, `useTaskHandlers`, `useUpgradeLevels`, `TopBar`, `DiveGauge`, `DiveTimeCard`, `MissionObjectivePanel`, `AmbientSoundMixer`
- Index는 이제 orchestration + 모달 wiring만 담당


### ✅ Phase 5 — 스토리지 추상화 (완료)
- `src/lib/storage/keys.ts` — `STORAGE_KEYS` 단일 출처 (8개 키)
- `src/lib/storage/safeStorage.ts` — SSR-safe + 예외-safe 래퍼 (`readJSON`/`writeJSON`/`readString`/`writeString`/`removeKey`)
- 마이그레이션 완료: `sessionStorage.ts`, `lootSystem.ts`, `useTasks.ts`, `useUpgradeLevels.ts`, `useUserCreatures.ts`, `useDeepDiveAudio.ts`, `useProStatus.ts`, `ThemeContext.tsx`
- `main.tsx`는 의도적으로 인라인 유지 (boot script, FOUC 방지용)


## 🔒 보안 메모

- 클라이언트에서 admin 가드는 UX용일 뿐이며, 모든 admin 변이(grant/revoke Pro 등)는
  `pro_subscriptions` 테이블의 RLS 정책으로 서버 측에서 강제되어야 한다.
  현재 `pro_subscriptions`의 정책이 admin-only 작성을 강제하는지 확인 필요 (다음 세션).
- `is_admin()`의 이메일 fallback은 임시 안전망이며, `user_roles` 시드 동작 확인 후 제거.

## 비목표

- UI/디자인 시스템 변경
- 게임 밸런스 변경
- 신규 기능 추가
- shadcn `components/ui/*` 수정
