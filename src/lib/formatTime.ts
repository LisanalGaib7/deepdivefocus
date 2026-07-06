/**
 * Time-formatting helpers. Consolidated from ad-hoc inline formatters
 * previously duplicated in Index, DiveGauge and MissionCompleteModal.
 *
 * Each function has a distinct output shape — pick by call site:
 *   - formatShortDuration(90)  → "1m"       (compact today-summary)
 *   - formatMmSs(90)           → "01:30"    (timer countdown)
 *   - formatMinutesSeconds(90) → "1m 30s"   (mission recap)
 */

/** Compact: seconds under 60 → "45s", otherwise floor to minutes → "12m". */
export const formatShortDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
};

/** Zero-padded mm:ss for countdown timers. */
export const formatMmSs = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/** Human-readable "12m 30s" for session summaries. */
export const formatMinutesSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};
