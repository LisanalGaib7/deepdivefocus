import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { hapticsSuccess } from "@/lib/haptics";
import { Creature } from "@/data/creatures";
import { rollForCreature, getPearlValue } from "@/lib/lootSystem";
import { LocalTask } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJSON, writeJSON } from "@/lib/storage/safeStorage";
import {
  enqueuePendingReward,
  removePendingReward,
  bumpPendingAttempt,
  readPendingRewards,
  type PendingReward,
} from "@/lib/pendingRewards";

interface ProfileLike {
  total_depth?: number | null;
  total_pearls?: number | null;
}

const MAX_RETRY_ATTEMPTS = 5;

/**
 * Mission-complete flow.
 *
 * Server-side contract: a single `award_session_rewards` RPC atomically writes
 * the focus_session, increments profile totals, and unlocks the creature in the
 * collection. The client never mutates total_pearls / total_depth directly
 * (a DB trigger blocks that to prevent tampering and cross-device race loss).
 *
 * Resilience: if the RPC fails (offline, server hiccup), the payload is queued
 * in localStorage and replayed automatically on the next mission complete or
 * app boot. The user sees a clear toast either way — never silent data loss.
 */
export function useDiveCompletion(deps: {
  selectedTask: LocalTask | undefined;
  saveTimeSpent: (taskId: string, seconds: number) => Promise<void> | void;
  addLocalFocusSession: (s: {
    taskId: string | null;
    taskName: string;
    duration: number;
    timestamp: number;
  }) => void;
  refetchSessions: () => Promise<unknown> | void;
  refetchProfile: () => void;
  profile: ProfileLike | null;
  updateProfile: (patch: Partial<ProfileLike>) => void;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  onAfterClose: () => void; // reset timer + exit fullscreen
}) {
  const depsRef = useRef(deps);
  useEffect(() => {
    depsRef.current = deps;
  });

  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false);
  const [rewardCreature, setRewardCreature] = useState<Creature | null>(null);
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [completedSessionDepth, setCompletedSessionDepth] = useState(0);
  const [completedSessionDuration, setCompletedSessionDuration] = useState(0);
  const [collectionRefreshKey, setCollectionRefreshKey] = useState(0);

  /**
   * Server call — wraps `award_session_rewards` RPC.
   * Returns null on success, an Error on failure.
   */
  const callAwardRPC = useCallback(
    async (payload: {
      task_name: string;
      duration: number;
      depth: number;
      pearls: number;
      creature_id: string | null;
    }): Promise<Error | null> => {
      const { error } = await supabase.rpc("award_session_rewards", {
        p_task_name: payload.task_name,
        p_duration: payload.duration,
        p_depth: payload.depth,
        p_pearls: payload.pearls,
        p_creature_id: payload.creature_id,
      });
      return error ? new Error(error.message) : null;
    },
    [],
  );

  /** Replay any queued payloads that previously failed. Idempotent. */
  const flushPendingRewards = useCallback(async () => {
    const queue = readPendingRewards();
    if (queue.length === 0) return;

    let recovered = 0;
    for (const entry of queue) {
      if (entry.attempts >= MAX_RETRY_ATTEMPTS) continue;
      const err = await callAwardRPC({
        task_name: entry.task_name,
        duration: entry.duration,
        depth: entry.depth,
        pearls: entry.pearls,
        creature_id: entry.creature_id,
      });
      if (err) {
        bumpPendingAttempt(entry.id);
      } else {
        removePendingReward(entry.id);
        recovered++;
      }
    }
    if (recovered > 0) {
      toast.success(
        recovered === 1
          ? "Recovered 1 unsaved dive from earlier."
          : `Recovered ${recovered} unsaved dives from earlier.`,
      );
      depsRef.current.refetchSessions();
      depsRef.current.refetchProfile();
    }
  }, [callAwardRPC]);

  // Boot-time recovery: replay any pending rewards once auth is ready.
  useEffect(() => {
    if (deps.isAuthenticated && !deps.isGuestMode) {
      void flushPendingRewards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps.isAuthenticated, deps.isGuestMode]);

  /** Guest-mode collection check (auth mode pre-queries DB). */
  const checkIsNewDiscovery = useCallback(
    async (creatureId: string, isGuest: boolean): Promise<boolean> => {
      if (isGuest) {
        const owned = readJSON<string[]>(STORAGE_KEYS.guestCreatures, []);
        return !owned.includes(creatureId);
      }
      const { data } = await supabase
        .from("user_creatures")
        .select("id")
        .eq("creature_id", creatureId)
        .maybeSingle();
      return !data;
    },
    [],
  );

  const triggerMissionComplete = useCallback(
    (currentDepth: number, currentDuration: number) => {
      const {
        selectedTask,
        saveTimeSpent,
        addLocalFocusSession,
        refetchSessions,
        profile,
        updateProfile,
        isAuthenticated,
        isGuestMode,
      } = depsRef.current;

      const taskName = selectedTask?.text || "Focus Session";
      setCompletedSessionDepth(currentDepth);
      setCompletedSessionDuration(currentDuration);

      const creature = rollForCreature(currentDepth);
      setRewardCreature(creature);
      setIsNewDiscovery(false); // will be set asynchronously below

      hapticsSuccess();
      setShowMissionCompleteModal(true);

      const basePearls = Math.floor(currentDepth / 10);
      const creatureBonus = creature ? getPearlValue(creature.rarity) : 0;
      const totalPearls = basePearls + creatureBonus;

      void (async () => {
        try {
          // Local task time is the same write in both modes — do it first so
          // task list reflects the dive even if reward write later fails.
          if (selectedTask) {
            try {
              await Promise.resolve(
                saveTimeSpent(selectedTask.id, selectedTask.timeSpentInSeconds),
              );
            } catch (e) {
              console.error("[MissionComplete] saveTimeSpent failed:", e);
            }
          }

          // Determine "NEW DISCOVERY" status before any write so the badge
          // reflects the true state at dive end.
          if (creature) {
            const newDiscovery = await checkIsNewDiscovery(
              creature.id,
              isGuestMode || !isAuthenticated,
            );
            setIsNewDiscovery(newDiscovery);
          }

          if (isAuthenticated && !isGuestMode) {
            // ----- Auth path: single atomic RPC -----
            const rpcErr = await callAwardRPC({
              task_name: taskName,
              duration: currentDuration,
              depth: currentDepth,
              pearls: totalPearls,
              creature_id: creature?.id ?? null,
            });

            if (rpcErr) {
              // Queue + tell user. Will retry automatically.
              enqueuePendingReward({
                task_name: taskName,
                duration: currentDuration,
                depth: currentDepth,
                pearls: totalPearls,
                creature_id: creature?.id ?? null,
              });
              toast.error("Couldn't save your dive — it's queued and will retry automatically.", {
                duration: 6000,
              });
              console.error("[MissionComplete] RPC failed, queued for retry:", rpcErr);
            } else {
              // Opportunistically drain older pending entries while we're online.
              void flushPendingRewards();
            }
          } else {
            // ----- Guest path: local-only -----
            if (profile) {
              updateProfile({
                total_pearls: (profile.total_pearls || 0) + totalPearls,
                total_depth: (profile.total_depth || 0) + currentDepth,
              });
            }
            addLocalFocusSession({
              taskId: selectedTask?.id ?? null,
              taskName,
              duration: currentDuration,
              timestamp: Date.now(),
            });
            // Persist creature into guest collection NOW (not on modal close),
            // so closing the app abruptly never loses the reward.
            if (creature) {
              const owned = readJSON<string[]>(STORAGE_KEYS.guestCreatures, []);
              if (!owned.includes(creature.id)) {
                writeJSON(STORAGE_KEYS.guestCreatures, [...owned, creature.id]);
              }
            }
          }

          await refetchSessions();
        } catch (err) {
          console.error("[MissionComplete] Unexpected error:", err);
          toast.error("Something went wrong saving your dive.");
        }
      })();
    },
    [callAwardRPC, checkIsNewDiscovery, flushPendingRewards],
  );

  const handleMissionCompleteClose = useCallback(async () => {
    const { refetchProfile, onAfterClose } = depsRef.current;

    setShowMissionCompleteModal(false);
    const reward = rewardCreature;
    const wasNew = isNewDiscovery;
    setRewardCreature(null);
    setIsNewDiscovery(false);
    onAfterClose();

    setCollectionRefreshKey((k) => k + 1);
    refetchProfile();

    if (reward && wasNew) {
      toast.success("Creature added to collection!", {
        description: `${reward.name} saved!`,
      });
    }
  }, [rewardCreature, isNewDiscovery]);

  return {
    showMissionCompleteModal,
    rewardCreature,
    isNewDiscovery,
    completedSessionDepth,
    completedSessionDuration,
    collectionRefreshKey,
    triggerMissionComplete,
    handleMissionCompleteClose,
  };
}
