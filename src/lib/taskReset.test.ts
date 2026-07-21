import { describe, it, expect } from "vitest";
import {
  getTodayLocal,
  isTaskStale,
  resetLocalTaskIfStale,
  dbTaskToLocal,
} from "./taskReset";
import type { LocalTask, Task } from "@/hooks/useTasks";

const makeLocal = (overrides: Partial<LocalTask> = {}): LocalTask => ({
  id: "t1",
  text: "Focus",
  isCompleted: true,
  timeSpentInSeconds: 1800,
  lastActiveDate: "2026-07-20",
  sortOrder: 0,
  urgency: null,
  impact: null,
  effortMinutes: null,
  ...overrides,
});

const makeDb = (overrides: Partial<Task> = {}): Task => ({
  id: "t1",
  user_id: "u1",
  title: "Focus",
  is_completed: true,
  time_spent_seconds: 1800,
  last_active_date: "2026-07-20",
  sort_order: 0,
  urgency: null,
  impact: null,
  effort_minutes: null,
  created_at: "2026-07-20T00:00:00Z",
  updated_at: "2026-07-20T00:00:00Z",
  ...overrides,
});

describe("getTodayLocal", () => {
  it("formats as YYYY-MM-DD with zero padding using local time", () => {
    // Jan 3rd local — must be "2026-01-03", not "2026-1-3"
    expect(getTodayLocal(new Date(2026, 0, 3, 15, 0, 0))).toBe("2026-01-03");
  });

  it("uses local calendar day even near UTC midnight", () => {
    // 2026-07-21 at 23:30 local — still today locally regardless of UTC offset
    const d = new Date(2026, 6, 21, 23, 30, 0);
    expect(getTodayLocal(d)).toBe("2026-07-21");
  });
});

describe("isTaskStale", () => {
  it("returns true when lastActiveDate is a previous day", () => {
    expect(isTaskStale(makeLocal({ lastActiveDate: "2026-07-20" }), "2026-07-21")).toBe(true);
  });

  it("returns false when lastActiveDate matches today", () => {
    expect(isTaskStale(makeLocal({ lastActiveDate: "2026-07-21" }), "2026-07-21")).toBe(false);
  });

  it("works with DB-shaped rows (last_active_date)", () => {
    expect(isTaskStale(makeDb({ last_active_date: "2026-07-21" }), "2026-07-21")).toBe(false);
    expect(isTaskStale(makeDb({ last_active_date: null }), "2026-07-21")).toBe(true);
  });
});

describe("resetLocalTaskIfStale", () => {
  it("resets isCompleted, timeSpentInSeconds and stamps today when stale", () => {
    const stale = makeLocal({
      isCompleted: true,
      timeSpentInSeconds: 3600,
      lastActiveDate: "2026-07-20",
    });
    const reset = resetLocalTaskIfStale(stale, "2026-07-21");
    expect(reset.isCompleted).toBe(false);
    expect(reset.timeSpentInSeconds).toBe(0);
    expect(reset.lastActiveDate).toBe("2026-07-21");
  });

  it("preserves priority fields and identity on reset", () => {
    const stale = makeLocal({
      urgency: 4,
      impact: 5,
      effortMinutes: 30,
      sortOrder: 2,
    });
    const reset = resetLocalTaskIfStale(stale, "2026-07-21");
    expect(reset.urgency).toBe(4);
    expect(reset.impact).toBe(5);
    expect(reset.effortMinutes).toBe(30);
    expect(reset.sortOrder).toBe(2);
    expect(reset.id).toBe(stale.id);
    expect(reset.text).toBe(stale.text);
  });

  it("returns the original object untouched when already on today", () => {
    const fresh = makeLocal({
      isCompleted: true,
      timeSpentInSeconds: 900,
      lastActiveDate: "2026-07-21",
    });
    const result = resetLocalTaskIfStale(fresh, "2026-07-21");
    expect(result).toBe(fresh); // referential equality — no needless copy
    expect(result.isCompleted).toBe(true);
    expect(result.timeSpentInSeconds).toBe(900);
  });
});

describe("dbTaskToLocal", () => {
  it("resets completion and time when the DB row is stale", () => {
    const local = dbTaskToLocal(
      makeDb({
        is_completed: true,
        time_spent_seconds: 5400,
        last_active_date: "2026-07-20",
      }),
      "2026-07-21"
    );
    expect(local.isCompleted).toBe(false);
    expect(local.timeSpentInSeconds).toBe(0);
    expect(local.lastActiveDate).toBe("2026-07-21");
  });

  it("keeps completion and time when the DB row is from today", () => {
    const local = dbTaskToLocal(
      makeDb({
        is_completed: true,
        time_spent_seconds: 1200,
        last_active_date: "2026-07-21",
      }),
      "2026-07-21"
    );
    expect(local.isCompleted).toBe(true);
    expect(local.timeSpentInSeconds).toBe(1200);
    expect(local.lastActiveDate).toBe("2026-07-21");
  });

  it("treats a null last_active_date as stale and stamps today", () => {
    const local = dbTaskToLocal(
      makeDb({ is_completed: true, time_spent_seconds: 60, last_active_date: null }),
      "2026-07-21"
    );
    expect(local.isCompleted).toBe(false);
    expect(local.timeSpentInSeconds).toBe(0);
    expect(local.lastActiveDate).toBe("2026-07-21");
  });

  it("maps priority fields verbatim (effort_minutes -> effortMinutes)", () => {
    const local = dbTaskToLocal(
      makeDb({ urgency: 3, impact: 4, effort_minutes: 60, last_active_date: "2026-07-21" }),
      "2026-07-21"
    );
    expect(local.urgency).toBe(3);
    expect(local.impact).toBe(4);
    expect(local.effortMinutes).toBe(60);
  });
});
