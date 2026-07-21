import type { LocalTask } from "@/hooks/useTasks";

export const getPriorityScore = (
  t: Pick<LocalTask, "urgency" | "impact">
): number | null => {
  if (t.urgency == null || t.impact == null) return null;
  return t.urgency * t.impact;
};

/**
 * Sort tasks by priority (urgency × impact) desc.
 * Ties break by effortMinutes asc (null treated as +∞).
 * Unscored tasks (priority == null) always go last, preserving their input order.
 */
export const sortByPriority = <T extends Pick<LocalTask, "urgency" | "impact" | "effortMinutes">>(
  tasks: T[]
): T[] => {
  return [...tasks].sort((a, b) => {
    const pa = getPriorityScore(a);
    const pb = getPriorityScore(b);

    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;

    if (pa !== pb) return pb - pa;

    const ea = a.effortMinutes ?? Number.POSITIVE_INFINITY;
    const eb = b.effortMinutes ?? Number.POSITIVE_INFINITY;
    return ea - eb;
  });
};
