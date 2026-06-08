# 진단 리포트 — SUBSCRIPTION_ENABLED 비활성화 이후 코드베이스 점검

코드 수정 없음. 관찰 + 제안만.

## 발견 사항


| 우선순위     | 영역     | 위치                                                                       | 문제                                                                                                      | 왜 중요한지                                                                                              | 제안                                                                                                                                              |
| -------- | ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **High** | 유지보수   | `src/pages/Index.tsx:956, 962`                                           | `<Input>`/`<Button>`의 `disabled={tasks.length >= TIMER_CONFIG.MAX_TASKS}`가 플래그와 무관하게 항상 10개 캡을 강제함      | `MAX_TASKS=10`은 원래 무료 한도가 아니라 "전체 상한"이지만, 플래그 OFF의 의도("제한 없음")와 충돌. 사용자가 10개 넘기면 조용히 막힘, 에러 메시지도 없음 | `disabled`도 `SUBSCRIPTION_ENABLED && ...`로 게이트하거나 `MAX_TASKS`를 의미 단위로 분리(`HARD_CAP` vs `FREE_LIMIT`)                                            |
| **High** | 유지보수   | `src/pages/Index.tsx:426, 433, 440`                                      | 같은 파일 안에 게이트 패턴이 3가지 — ① `isPro` 분기, ② `!isPro && ...`, ③ `!SUBSCRIPTION_ENABLED                        | &nbsp;                                                                                              | ...`. 플래그 ON 복원 시 의미가 미묘하게 달라짐                                                                                                                  |
| **High** | 유지보수   | `src/hooks/useProStatus.ts:13-17, 76-80`                                 | 내부 `isPro` state는 false 유지하지만 반환은 `effectiveIsPro=true`. `rawIsPro`도 같이 노출 → 호출부가 둘 중 무엇을 써야 할지 불명확     | 신규 코드가 `rawIsPro`를 잘못 참조하면 플래그 OFF 상태에서 paywall이 살아남음. 플래그 의미가 hook 안에서 "두 가지 진실"로 갈라짐              | `rawIsPro` 노출 제거하거나 명시적으로 `__internal_rawIsPro`로 마킹. Admin 페이지처럼 정말 필요한 곳만 별도 hook(`useRawProStatus`)로 분리                                       |
| **High** | 마이그레이션 | `src/hooks/useProStatus.ts` + 호출부 전부                                     | Pro 게이트가 "체크리스트 수"라는 의미와 강하게 결합. 향후 Pro 가치 제안은 "AI 분석 리포트"인데 동일한 `isPro` 한 플래그로 모든 기능을 켜고 끔             | AI 리포트만 Pro로 풀고 기존 한도는 영구 해제하고 싶을 때, 단일 boolean으로는 표현 불가. 결국 마이그레이션 시 모든 호출부를 다시 수정                 | 지금부터 `useProEntitlements()` 형태로 capability 단위 반환(`{ unlimitedTasks, aiReports, fullAnalytics }`). 내부적으로는 같은 `isPro` 기반이라도 호출부가 capability로 말하도록 |
| **High** | 마이그레이션 | DB `pro_subscriptions` + `plan_type` enum (`monthly/yearly/lifetime`)    | 플랜 종류가 enum으로 박혀 있어 "AI Pro" 같은 새 SKU를 추가하려면 enum ALTER 필요. enum 값 추가 자체는 비파괴지만 제거/변경은 파괴적              | 향후 SKU 다양화(예: AI-only, AI+limits) 시 enum이 발목                                                        | 새 SKU는 enum 추가만 하면 되도록 호출부에서 enum값을 `switch` 전수 매칭 금지. `features` jsonb 컬럼 또는 별도 `plan_features` 테이블 도입 검토                                      |
| Medium   | 유지보수   | `src/features/monetization/PricingModal.tsx`, `UpgradeRequiredModal.tsx` | 임포트는 살아 있지만 렌더 분기가 모두 `SUBSCRIPTION_ENABLED &&`로 가려져 사실상 dead import. 번들 트리쉐이킹은 되지만 IDE/검색상 "사용 중"으로 보임 | 6개월 뒤 누군가가 "안 쓰는 컴포넌트네" 하고 지울 위험. 또한 카피/가격 문구가 stale 되어도 모름                                         | 파일 상단에 `// FLAG: SUBSCRIPTION_ENABLED — gated import, do not delete` 헤더 + `src/features/monetization/README.md`에 재활성화 체크리스트                     |
| Medium   | 유지보수   | 플래그 정의 `src/config/featureFlags.ts`                                      | 단일 boolean. 환경변수 연동 없음 → QA가 프로덕션에서 임시로 켜보기 어려움                                                         | "조용한 dogfood" 또는 단계적 롤아웃 불가. 모든 변경이 코드 배포를 요구                                                       | `import.meta.env.VITE_SUBSCRIPTION_ENABLED` fallback + 추후 사용자별 override(`localStorage`/원격 컨피그) 여지 남김                                            |
| Medium   | 유지보수   | `src/pages/AdminSubscriptions.tsx`                                       | Admin 페이지는 플래그와 무관하게 항상 `pro_subscriptions` 읽고 PRO 부여 UI 노출                                             | 의도일 수 있으나 명시 주석 없음. 신규 개발자가 "왜 여기는 안 가렸지?" 혼동                                                       | 파일 상단 주석: "Admin tooling — always on, bypasses SUBSCRIPTION_ENABLED by design"                                                                  |
| Medium   | 마이그레이션 | `useProStatus` localStorage 키 `deepdive_pro_status`                      | 플래그 OFF여도 과거 ON 시절 값이 사용자 브라우저에 남아 있을 수 있음. 현재는 무시되지만, 플래그 재활성화 순간 즉시 "Pro"로 인식                         | 무료 사용자가 갑자기 Pro 권한 얻거나 결제 안 했는데 paywall 우회 가능                                                       | 플래그 재활성화 시 마이그레이션 1회 실행해서 localStorage 키 무효화. 또는 키 버저닝(`deepdive_pro_status_v2`)                                                                |
| Medium   | 마이그레이션 | `pro_subscriptions` 컬럼 `ends_at` 기본값                                     | 현재 컬럼 정의/RLS 확인 필요(추측). lifetime 플랜이 어떻게 만료 없이 표현되는지 코드 상 명확치 않음                                        | lifetime이 `ends_at=먼 미래`로 hack되어 있으면 시계 의존 → 향후 환불/재발급 시 꼬임                                         | `is_user_pro` RPC가 `plan_type='lifetime'` OR `ends_at>now()` 형태로 명시되도록 (현 함수는 `ends_at>now()`만 본다 → lifetime도 사실상 만료일에 의존 중)                    |
| Medium   | 유지보수   | 한도 상수 분산                                                                 | `FREE_TASK_LIMIT`(Index.tsx 추정), `TIMER_CONFIG.MAX_TASKS`(gameConfig), `PLAN_CONFIG`(PricingModal) 세 곳  | 가격/한도 변경 시 3곳 동기화 누락 위험. 마케팅 카피와 실제 enforce 값 어긋남                                                   | `src/config/limits.ts` 단일 파일로 통합, PricingModal 카피도 그 상수에서 파생                                                                                    |
| Low      | 유지보수   | `useProStatus.ts` `setLoading(SUBSCRIPTION_ENABLED)` 초기값                 | 플래그 OFF면 loading=false로 시작 → 의도 맞음. 하지만 `useEffect`가 여전히 `checkProStatus` 호출 → no-op이지만 함수 호출 발생        | 무해. 단지 일관성                                                                                          | 플래그 OFF면 effect 자체 스킵                                                                                                                           |
| Low      | 유지보수   | 타입                                                                       | `(supabase.auth as any).getSession()` 사용. 프로젝트 메모리상 의도된 우회지만 Pro 로직처럼 권한과 직결된 곳에 `any`는 위험              | 인증/구독은 가장 보수적으로 타입을 강제할 영역                                                                          | 이 한 곳만 정식 `Session` 타입으로 좁히기                                                                                                                    |
| Low      | 마이그레이션 | Stripe/Paddle 등 결제 provider 미연동                                          | 현재는 PricingModal이 `onActivatePro` 콜백으로 localStorage만 토글. 실제 결제 결합점이 아예 없음                               | 좋은 신호(=결합도 낮음). 단, 재활성화 시 결제 도입 위치가 코드상 분명치 않음                                                      | `src/features/monetization/checkout.ts` 같은 빈 어댑터 인터페이스를 미리 두고 모달이 그것만 의존하게                                                                      |
| Low      | 마이그레이션 | History.tsx blur paywall                                                 | `["month","year","all"].includes(timeRange)` 하드코딩                                                       | 향후 AI 리포트가 "특정 차트만 Pro"가 될 때 같은 패턴 반복 → 분산                                                          | timeRange/차트 별 capability 매핑 테이블                                                                                                                |


## 가장 먼저 손대야 할 3가지

1. **Index.tsx의 `MAX_TASKS` 하드 disabled 처리** — 플래그 OFF 의도와 정면충돌(사용자에게 영향). 즉시 수정 가치 가장 큼.
2. `**useProEntitlements()` capability 추상화 도입** — 향후 AI 리포트만 Pro로 풀 때 호출부 재수정을 막는 단 하나의 구조적 투자.
3. **한도/SKU 단일 출처화(`config/limits.ts` + PricingModal 카피 파생) + localStorage 키 버저닝** — 재활성화 D-day에 가장 흔히 터지는 두 가지 사고(카피 불일치, 권한 누수) 동시에 차단.

## 확인이 필요한 질문 (추측 포함)

- (추측) `FREE_TASK_LIMIT` 상수는 `Index.tsx` 또는 그 근처에 정의되어 있다고 추정 — 진짜 단일 정의인지, PricingModal의 표시 숫자와 같은 값인지 확인 필요.
- AdminSubscriptions 페이지를 플래그 OFF 동안에도 운영 가능하게 두는 것이 의도된 정책인가? (지금은 묵시적)
- `pro_subscriptions.ends_at`의 기본값/lifetime 처리 방식 — 마이그레이션 안전성 평가에 필요.
- 향후 AI 리포트가 "기존 한도 부활 + AI" 묶음인지, "AI 단독 Pro"인지 — capability 설계 방향 결정.
- 결제 provider(Stripe/Paddle/IAP) 선택 시점 — Capacitor 모바일 배포 시 Apple/Google IAP 의무 여부가 구조에 큰 영향.

&nbsp;

# 작업 지시

이전에 네가 작성한 진단 리포트(SUBSCRIPTION_ENABLED 비활성화 점검)를 검토했고,

일부 우선순위와 처방을 수정했어. 아래 지침대로 진행해줘.

"지금 할 것"만 코드를 수정하고, "미룰 것 / 결정 대기"는 손대지 마.

# 먼저 — 비즈니스 결정 대기 (코드 수정 금지, 나에게 질문할 것)

- 향후 Pro의 정체가 아직 안 정해졌음:

  (A) "기존 한도 부활 + AI 리포트" 묶음인지

  (B) "AI 리포트 단독 Pro, 기존 한도는 영구 해제"인지

- 이 답이 capability 구조를 결정하므로, 결정 전에는 useProEntitlements() 같은

  capability 추상화를 "구현"하지 마. (아래 3번 참고)

- 진행 전에 이 질문을 먼저 나에게 확인해줘.

# 지금 할 것 (실제 코드 수정 OK)

## 1. MAX_TASKS 의미 분리 (User-facing 버그)

- 현재 disabled={tasks.length >= TIMER_CONFIG.MAX_TASKS}가 플래그와 무관하게 10개를 막음.

- MAX_TASKS를 플래그 뒤로 게이트하지 마. 대신 의미를 분리해:

  - HARD_CAP: 성능/UX상 진짜 상한 (플래그와 무관하게 항상 적용)

  - FREE_LIMIT: 구독으로 푸는 무료 한도 (SUBSCRIPTION_ENABLED일 때만 enforce)

- 둘 중 어느 의미인지 모호하면 추측하지 말고 물어봐.

- 한도 초과 시 조용히 막지 말고 사용자에게 보이는 안내를 둘 것.

## 2. 한도/SKU 단일 출처화

- src/config/limits.ts 하나로 통합 (FREE_TASK_LIMIT, TIMER_CONFIG.MAX_TASKS,

  PLAN_CONFIG에 흩어진 값들).

- PricingModal의 표시 카피도 이 상수에서 파생되게 해서, 마케팅 숫자와 실제 enforce

  값이 영원히 일치하도록.

## 3. capability 추상화 — "자리"만, 구현은 미룸

- useProEntitlements()를 지금 전면 도입하지 마.

- 대신 빈 인터페이스/타입 자리만 만들어 두고(예: ProEntitlements 타입 정의),

  실제 capability 분기는 위 비즈니스 결정 후에 채우도록 TODO 주석으로 표시.

- rawIsPro는 외부 노출 제거하거나 __internal_rawIsPro로 마킹 (이건 지금 해도 됨).

## 4. 게이트된 코드 보존 표시

- PricingModal.tsx, UpgradeRequiredModal.tsx 등 플래그로 가려진 파일 상단에:

  // FLAG: SUBSCRIPTION_ENABLED — gated, DO NOT DELETE

- src/features/monetization/[README.md](http://README.md)에 "재활성화 체크리스트" 작성.

- AdminSubscriptions.tsx 상단에 의도 주석:

  "Admin tooling — always on, bypasses SUBSCRIPTION_ENABLED by design"

# 보안 — 재활성화 전제조건 (지금은 설계/문서화, High)

- 현재 Pro 권한이 localStorage(deepdive_pro_status)로만 판정됨 = 사용자가 직접

  세팅해서 우회 가능. 키 버저닝(_v2)은 과거 값만 비울 뿐 이 우회를 못 막음.

- 따라서 재활성화 시 다음을 반드시 만족하도록 설계하고 README에 명시:

  - 권한의 진실 소스(source of truth)는 서버(pro_subscriptions + is_user_pro RPC)뿐.

    localStorage는 캐시까지만, 절대 판정 근거로 쓰지 않음.

  - RLS로 사용자가 자기 pro_subscriptions 행을 직접 write/update 못 하게 막혀 있는지

    확인하고, 안 막혀 있으면 그 정책을 추가.

  - is_user_pro RPC가 plan_type='lifetime' OR ends_at>now() 형태로 lifetime을

    명시 처리하는지 확인 (현재는 ends_at>now()만 봄 → lifetime이 만료일에 의존).

- 위 항목 중 "확인"이 필요한 부분은 현재 RLS/RPC 정의를 읽어서 상태를 보고해줘.

# 검증 (지금 추가)

- 플래그 ON 상태에서 ① 한도 enforce ② paywall 렌더 ③ 권한 판정이 의도대로 동작하는지

  확인하는 최소 테스트(스냅샷 또는 통합)를 추가해줘. 재활성화를 수동 클릭에만

  의존하지 않도록.

# 미룰 것 (지금 절대 건드리지 마)

- plan_type enum → features jsonb 전환 (SKU 다양화 확정 후)

- 결제 provider(Stripe/Paddle/IAP) 어댑터 — 단, checkout.ts 같은 빈 인터페이스 자리만

  남기는 건 OK

- History.tsx capability 매핑 테이블 (capability 구조 확정 후)

# 작업 후 보고

- "지금 할 것"에서 수정한 파일/내용 목록

- 보안 항목에서 읽어본 RLS/RPC의 실제 상태 (막혀 있음/안 막혀 있음)

- 비즈니스 결정(A/B) 대기로 멈춘 항목 명시