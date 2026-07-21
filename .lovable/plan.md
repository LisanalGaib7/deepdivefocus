## Scope

Remove the "Pressure Collapse" descent overlay only. Keep the redesigned Mission Complete modal (session log panel, sonar reveal). Then implement three motion/immersion upgrades.

---

## 1. Revert DescentCeremony

- Delete `src/features/timer/DescentCeremony.tsx`.
- In `src/pages/Index.tsx`: remove the import and the `<DescentCeremony … />` render at the bottom.
- Leave `timer.isDiveTransition` in place (still used by `DeepSeaAmbience`) and leave `MissionCompleteModal` untouched.

---

## 2. Tab / Screen Transition Motion

Goal: switching between Focus / Priority / Analytics / Bestiary feels like a single fluid HUD instead of a hard swap.

- New wrapper `src/components/common/TabTransition.tsx`:
  - Uses `AnimatePresence` + `motion.div` (framer-motion, already in deps — verify; if missing, add).
  - Keyed by `activeTab`. Enter: opacity 0 → 1, `translateY(6px) → 0`, `filter: blur(6px) → 0`, 260ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Exit: mirror, 180ms.
  - Respects `prefers-reduced-motion` (falls back to instant).
- `Index.tsx`: wrap the tab-switch block (the `activeTab === "history" ? … : …` tree) in `<TabTransition activeKey={activeTab}>`.
- Bottom-nav tap: add a subtle 120ms scale/opacity press on the active icon (in `BottomNav.tsx`) so the transition feels initiated by touch, not by React.

---

## 3. Focus Mode UI Auto-Fade (Immersion)

Goal: while `isRunning`, non-essential chrome dims/hides so only the gauge, task name, and oxygen remain.

- Add `focus-dim` utility in `src/index.css`: `opacity .35; transition: opacity 600ms ease; &:hover, &:focus-within { opacity: 1 }`.
- In `Index.tsx` (focus tab body) when `isRunning`:
  - Apply `focus-dim` to: `TopBar`, `DiveTimeCard`, `AmbientSoundMixer`, `BottomNav`.
  - Keep at full opacity: `DiveGauge`, `OxygenBar`, selected task name, Play/Pause + Reset buttons.
- `BottomNav.tsx`: accept optional `dimmed?: boolean` prop; when true, wrap in the same fade utility and reduce nav background alpha.
- After 4s of no pointer/touch activity while `isRunning`, add a deeper `focus-dim-deep` (opacity .15) via a small `useIdleWhileRunning` hook (`src/hooks/useIdleWhileRunning.ts`). Any pointermove/touchstart/keydown resets to `focus-dim`. Ends immediately when `isRunning` flips false.
- Respect `prefers-reduced-motion`: skip the deep-idle stage; keep only the static `focus-dim` level.

---

## 4. Dive Start/End Ceremony + Creature Unlock Modal

Replacement for the removed pressure overlay — quieter, more "Instrument Panel".

### Start (dive begin, ~900ms, non-blocking)
- New `src/features/timer/DiveIgnition.tsx`:
  - Thin horizontal sweep line across the gauge (single hairline, primary color, 700ms translateX with slight blur trail).
  - Gauge tick marks briefly brighten then settle (CSS class toggled on `DiveGauge` root).
  - Haptic: `hapticsLight` on start.
- Triggered from `Index.tsx` via `timer.isDiveTransition` for a short window; overlay sits *behind* the gauge, no fullscreen takeover, no numeric readout, no hull-stress bar.

### End (dive complete, before modal)
- ~500ms "surface" cue: `DeepSeaAmbience` fades bubbles out, gauge ring pulses once, then `MissionCompleteModal` opens (existing redesign stays).
- Add a small delay in `useDiveCompletion.triggerMissionComplete` so the surface cue plays before the modal (guarded by `prefers-reduced-motion`).

### Creature Unlock Modal polish (inside existing `MissionCompleteModal`)
- Staged reveal timeline (framer-motion or CSS keyframes):
  1. 0ms: panel fades in.
  2. 200ms: sonar ring expands (already added) + creature scales 0.85 → 1 with slight blur clear.
  3. 500ms: rarity label types in (Orbitron, letter-spaced).
  4. 700ms: pearl count counts up from 0 to earned value (250ms tween).
  5. 900ms: CTA button fades in.
- Skip staging entirely under `prefers-reduced-motion` (all appear at once).

---

## Technical Notes

- Framer Motion: confirm presence in `package.json`; if absent, add `framer-motion`.
- New files: `TabTransition.tsx`, `DiveIgnition.tsx`, `useIdleWhileRunning.ts`.
- Modified: `Index.tsx`, `BottomNav.tsx`, `DiveGauge.tsx` (tick brighten class), `MissionCompleteModal.tsx` (staged timeline), `useDiveCompletion.ts` (surface delay), `index.css` (focus-dim utilities + surface keyframe).
- Deleted: `DescentCeremony.tsx`.
- Accessibility: every new motion path checks `prefers-reduced-motion`. Auto-fade never hides interactive controls — only lowers opacity, and hover/focus restores instantly.

---

## Out of Scope

- Onboarding "Training Dive".
- TopBar → bottom-sheet menu (one-hand reach) — separate track.
- Any pixel-art or gameConfig changes.
