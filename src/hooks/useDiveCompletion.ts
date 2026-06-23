import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { hapticsSuccess } from "@/lib/haptics";
import { Creature } from "@/data/creatures";
import { rollForCreature, getPearlValue } from "@/lib/lootSystem";
import { LocalTask } from "@/hooks/useTasks";

interface ProfileLike {
  total_depth?: number | null;
  total_pearls?: number | null;
}

/**
 * Mission-complete flow: reward roll, modal state, persistence, profile sync.
 */
export function useDiveCompletion(deps: {
  selectedTask: LocalTask | undefined;
  saveTimeSpent: (taskId: string, seconds: number) => void;
  addSession: (s: {
    task_name: string;
    duration: number;
    depth_reached: number;
    pearls_earned: number;
    creature_id: string | null;
  }) => Promise<unknown>;
  addCreature: (id: string) => Promise<unknown>;
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
  // Stable deps ref — avoids invalidating callbacks every render, which would
  // recreate `triggerMissionComplete` and force `Index.tsx` effect to refire.
  const depsRef = useRef(deps);
  useEffect(() => {
    depsRef.current = deps;
  });

  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false);
  const [rewardCreature, setRewardCreature] = useState<Creature | null>(null);
  const [completedSessionDepth, setCompletedSessionDepth] = useState(0);
  const [completedSessionDuration, setCompletedSessionDuration] = useState(0);
  const [collectionRefreshKey, setCollectionRefreshKey] = useState(0);

  const triggerMissionComplete = useCallback((currentDepth: number, currentDuration: number) => {
    const {
      selectedTask, saveTimeSpent, addSession, addLocalFocusSession,
      refetchSessions, profile, updateProfile, isAuthenticated, isGuestMode,
    } = depsRef.current;

    const taskName = selectedTask?.text || "Focus Session";
    setCompletedSessionDepth(currentDepth);
    setCompletedSessionDuration(currentDuration);

    const creature = rollForCreature(currentDepth);
    setRewardCreature(creature);

    hapticsSuccess();
    setShowMissionCompleteModal(true);

    void (async () => {
      try {
        if (selectedTask) saveTimeSpent(selectedTask.id, selectedTask.timeSpentInSeconds);

        const basePearls = Math.floor(currentDepth / 10);
        const creatureBonus = creature ? getPearlValue(creature.rarity) : 0;
        const totalPearls = basePearls + creatureBonus;

        if (isAuthenticated && !isGuestMode) {
          await addSession({
            task_name: taskName,
            duration: currentDuration,
            depth_reached: currentDepth,
            pearls_earned: totalPearls,
            creature_id: creature?.id || null,
          });
          if (profile) {
            updateProfile({
              total_depth: (profile.total_depth || 0) + currentDepth,
              total_pearls: (profile.total_pearls || 0) + totalPearls,
            });
          }
        } else {
          if (profile) {
            updateProfile({
              total_pearls: (profile.total_pearls || 0) + totalPearls,
              total_depth: (profile.total_depth || 0) + currentDepth,
            });
          }
          addLocalFocusSession({
            taskId: selectedTask?.id || null,
            taskName,
            duration: currentDuration,
            timestamp: Date.now(),
          });
        }

        await refetchSessions();
      } catch (err) {
        console.error("[MissionComplete] Background save error:", err);
      }
    })();
  }, []);

  const handleMissionCompleteClose = useCallback(async () => {
    const { addCreature, refetchProfile, onAfterClose } = depsRef.current;
    if (rewardCreature) await addCreature(rewardCreature.id);

    setShowMissionCompleteModal(false);
    const reward = rewardCreature;
    setRewardCreature(null);
    onAfterClose();

    setCollectionRefreshKey((k) => k + 1);
    refetchProfile();

    if (reward) {
      toast.success("Creature added to collection!", { description: `${reward.name} saved!` });
    }
  }, [rewardCreature]);

  return {
    showMissionCompleteModal,
    rewardCreature,
    completedSessionDepth,
    completedSessionDuration,
    collectionRefreshKey,
    triggerMissionComplete,
    handleMissionCompleteClose,
  };
}
