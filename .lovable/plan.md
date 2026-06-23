# Add 6 New Creatures to Bestiary

## 1. `src/data/creatures.ts` — Add 6 entries

| id | name | icon | minDepth | rarity | traits | 배치 위치 |
|---|---|---|---|---|---|---|
| clownfish | Clownfish | Fish | 10 | Common | ["Vibrant","Symbiotic"] | sardine 뒤 |
| pufferfish | Pufferfish | CircleDot | 90 | Uncommon | ["Inflatable","Toxic"] | Tier 1 끝 |
| nautilus | Nautilus | Shell | 200 | Uncommon | ["Ancient","Spiral"] | turtle 근처 |
| mantis_shrimp | Mantis Shrimp | Bug | 320 | Rare | ["Striker","Colorful"] | octopus 뒤 |
| barreleye | Barreleye | ScanEye | 680 | Rare | ["Transparent","Observant"] | giant_isopod 뒤 |
| vampire_squid | Vampire Squid | Ghost | 820 | Epic | ["Eerie","Cloaked"] | giant_squid 뒤 |

## 2. `src/components/common/PixelCreature.tsx`

- 6개 `GridData` 함수 추가 (사용자가 첨부한 grid/colorMap/glowColor 그대로)
- `getCreatureData` switch에 6개 case 추가
- 애니메이션 클래스: clownfish/pufferfish/mantis_shrimp → `swim`, nautilus/vampire_squid → `float`, barreleye → `float`

## 3. 검증

- 빌드 통과 확인
- Bestiary(도감)에서 6개 신규 카드 잠금/해제 표시 확인
- MissionCompleteModal에서 픽셀 아트 정상 렌더 확인

## 참고

- 동일 rarity 내 종 수가 늘면 드롭 확률이 종별로 희석됨 (예: Tier 1 Uncommon에 pufferfish 추가 시 기존 종들 ~12% 감소)
- DB `user_creatures.creature_id`는 free-form text라 마이그레이션 불필요
