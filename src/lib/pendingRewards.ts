/**
 * Pending reward queue — survives network failures and app restarts.
 *
 * When `award_session_rewards` RPC fails (offline, server hiccup), we stash
 * the payload here. On next app boot (or next successful dive) we replay it
 * so the user never silently loses a focus session.
 */
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJSON, writeJSON } from "@/lib/storage/safeStorage";

export interface PendingReward {
  id: string;            // local uuid for dedupe
  task_name: string;
  duration: number;
  depth: number;
  pearls: number;
  creature_id: string | null;
  queued_at: number;     // Date.now() when first failed
  attempts: number;      // retry counter
}

const KEY = STORAGE_KEYS.pendingRewards;

export const readPendingRewards = (): PendingReward[] =>
  readJSON<PendingReward[]>(KEY, []);

export const enqueuePendingReward = (
  reward: Omit<PendingReward, "id" | "queued_at" | "attempts">,
): PendingReward => {
  const queue = readPendingRewards();
  const entry: PendingReward = {
    ...reward,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    queued_at: Date.now(),
    attempts: 0,
  };
  queue.push(entry);
  writeJSON(KEY, queue);
  return entry;
};

export const removePendingReward = (id: string) => {
  const queue = readPendingRewards().filter((r) => r.id !== id);
  writeJSON(KEY, queue);
};

export const bumpPendingAttempt = (id: string) => {
  const queue = readPendingRewards().map((r) =>
    r.id === id ? { ...r, attempts: r.attempts + 1 } : r,
  );
  writeJSON(KEY, queue);
};

export const hasPendingRewards = () => readPendingRewards().length > 0;
