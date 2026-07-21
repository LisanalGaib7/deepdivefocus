import type { LocalTask, Task } from "@/hooks/useTasks";

/** Local calendar date in YYYY-MM-DD (respects the user's timezone). */
export const getTodayLocal = (now: Date = new Date()): string => {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};

/** True when the task's last_active_date is not today (i.e. crossed midnight). */
export const isTaskStale = (
  task: Pick<LocalTask, "lastActiveDate"> | Pick<Task, "last_active_date">,
  today: string
): boolean => {
  const last =
    "lastActiveDate" in task ? task.lastActiveDate : task.last_active_date;
  return last !== today;
};

/**
 * Guest-mode / local reset: if stale, zero out time, un-complete, and stamp today.
 * Pure — always returns a new object when a reset occurs.
 */
export const resetLocalTaskIfStale = (
  task: LocalTask,
  today: string
): LocalTask => {
  if (!isTaskStale(task, today)) return task;
  return {
    ...task,
    timeSpentInSeconds: 0,
    isCompleted: false,
    lastActiveDate: today,
  };
};

/** Map a DB row to LocalTask, applying midnight reset when stale. */
export const dbTaskToLocal = (dbTask: Task, today: string): LocalTask => {
  const stale = isTaskStale(dbTask, today);
  return {
    id: dbTask.id,
    text: dbTask.title,
    isCompleted: stale ? false : dbTask.is_completed,
    timeSpentInSeconds: stale ? 0 : dbTask.time_spent_seconds,
    lastActiveDate: stale ? today : dbTask.last_active_date || today,
    sortOrder: dbTask.sort_order ?? 0,
    urgency: dbTask.urgency,
    impact: dbTask.impact,
    effortMinutes: dbTask.effort_minutes,
  };
};
