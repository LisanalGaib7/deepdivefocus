import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { hapticsWarning } from "@/lib/haptics";
import { formatShortDuration } from "@/lib/formatTime";
import { supabase } from "@/integrations/supabase/client";


// Common components
import BottomNav, { type BottomTab } from "@/components/common/BottomNav";


// Feature components
import { EngineeringBayModal } from "@/features/hangar";
import { UpgradeRequiredModal, PricingModal } from "@/features/monetization";

// Timer feature components
import DeepSeaAmbience from "@/features/timer/DeepSeaAmbience";
import OxygenBar from "@/features/timer/OxygenBar";
import EmergencyModal from "@/features/timer/EmergencyModal";
import MissionCompleteModal from "@/features/timer/MissionCompleteModal";

// Dive feature components (Phase 3 decomposition)
import TopBar from "@/features/dive/TopBar";
import DiveGauge from "@/features/dive/DiveGauge";
import DiveTimeCard from "@/features/dive/DiveTimeCard";
import AmbientSoundMixer from "@/features/dive/AmbientSoundMixer";
import MissionObjectivePanel from "@/features/dive/MissionObjectivePanel";

// Pages
import History from "@/pages/History";
import Collection from "@/pages/Collection";
import Priority from "@/pages/Priority";


// Hooks & Data
import { useAuthContext } from "@/contexts/AuthContext";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { useSessionStats } from "@/hooks/useSessionStats";
import { useUserCreatures } from "@/hooks/useUserCreatures";
import { useGamification } from "@/hooks/useGamification";
import { useDeepDiveAudio } from "@/hooks/useDeepDiveAudio";
import { useTasks, LocalTask } from "@/hooks/useTasks";
import { useSortMode } from "@/hooks/useSortMode";
import { sortByPriority, getPriorityScore } from "@/lib/priority";

import { getUpgradeCost } from "@/constants/gameConfig";
import { useProStatus } from "@/hooks/useProStatus";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useUpgradeLevels } from "@/hooks/useUpgradeLevels";
import { useDiveTimer } from "@/hooks/useDiveTimer";
import { useDiveCompletion } from "@/hooks/useDiveCompletion";
import { useTaskHandlers } from "@/hooks/useTaskHandlers";
import { useTaskGating, useMonetizationUI } from "@/features/monetization/gating";




const Index = () => {
  const { signOut, profile, updateProfile, refetchProfile, isGuestMode, isAuthenticated } = useAuthContext();
  const { isPro, activatePro } = useProStatus();
  const taskGating = useTaskGating();
  const monetizationUI = useMonetizationUI();
  // NOTE: addSession / addCreature are no longer used here — the
  // award_session_rewards RPC inside useDiveCompletion handles both atomically.
  const { todayMinutes, getTaskTodayMinutes, refetch: refetchSessions, addLocalFocusSession } = useSessionStats();
  const {
    tasks,
    addTask,
    updateTask,
    updateTaskScores,
    deleteTask,
    incrementTimeSpent,
    saveTimeSpent,
    reorderTasks,
  } = useTasks();
  const { sortMode, setSortMode } = useSortMode();


  // Audio hook - manages all sound playback
  const { sounds, toggleSound, playCompletionSound, activeSoundsCount, isSoundEnabled, toggleSoundEnabled } = useDeepDiveAudio();
  const { isFullscreen, showOverlay, toggleFullscreen, exitFullscreen } = useFullscreen();
  const [activeTab, setActiveTab] = useState<BottomTab>("focus");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showEngineeringBay, setShowEngineeringBay] = useState(false);
  const [showUpgradeRequired, setShowUpgradeRequired] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Persistent upgrade levels (localStorage for both guest & auth).
  const { engineLevel, setEngineLevel, hullLevel, setHullLevel } = useUpgradeLevels();

  // Refs used to break circular dependencies between the timer / task / completion / gamification hooks.
  const isRunningRef = useRef(false);
  const completionRef = useRef<{ triggerMissionComplete: (d: number, s: number) => void } | null>(null);
  const gamificationRef = useRef<{ depth: number; elapsedSeconds: number }>({ depth: 0, elapsedSeconds: 0 });

  // Task state + handlers (Phase 3 final extraction)
  const taskHandlers = useTaskHandlers({
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getIsRunning: () => isRunningRef.current,
    taskGating,
    onHitFreeLimit: () => setShowUpgradeRequired(true),
  });
  const { selectedTaskId, selectedTask } = taskHandlers;


  // Timer (Phase 3.5 hook extraction)
  const timer = useDiveTimer({
    selectedTaskId,
    incrementTimeSpent,
    onComplete: () => {
      playCompletionSound();
      completionRef.current?.triggerMissionComplete(
        gamificationRef.current.depth,
        gamificationRef.current.elapsedSeconds,
      );
    },
  });
  const { isRunning } = timer;
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);


  const { depth, oxygen, isEmergency, elapsedSeconds, isAtMaxDepth, maxDepth, resetDive } = useGamification({
    isDiving: isRunning,
    engineLevel,
    hullLevel,
  });
  useEffect(() => {
    gamificationRef.current = { depth, elapsedSeconds };
  }, [depth, elapsedSeconds]);

  // Mission completion flow
  const completion = useDiveCompletion({
    selectedTask,
    saveTimeSpent,
    addLocalFocusSession,
    refetchSessions,
    refetchProfile,
    profile,
    updateProfile,
    isAuthenticated,
    isGuestMode,
    onAfterClose: useCallback(() => {
      timer.resetTimer();
      resetDive();
      exitFullscreen();
    }, [timer, resetDive, exitFullscreen]),
  });
  useEffect(() => {
    completionRef.current = { triggerMissionComplete: completion.triggerMissionComplete };
  }, [completion.triggerMissionComplete]);

  const maxDepthToastShownRef = useRef(false);

  // Auto-selection now handled inside useTaskHandlers.


  // Handle emergency ascent (oxygen depleted)
  useEffect(() => {
    if (isEmergency && isRunning) {
      timer.setIsRunning(false);
      hapticsWarning();
      setShowEmergencyModal(true);
    }
  }, [isEmergency, isRunning, timer]);

  // Show toast when max depth is reached
  useEffect(() => {
    if (isAtMaxDepth && isRunning && !maxDepthToastShownRef.current) {
      maxDepthToastShownRef.current = true;
      toast(
        <div className="flex flex-col gap-1">
          <p className="text-amber-400 font-bold text-base flex items-center gap-2">
            <span className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">🏆</span>
            <span className="drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">Maximum Depth Reached!</span>
          </p>
          <p className="!text-slate-200 text-sm font-normal">
            Incredible focus! To explore deeper zones, you will need to upgrade your vessel.
          </p>
        </div>,
        {
          duration: 5000,
          position: "top-center",
          className: "!bg-black !border-2 !border-amber-400 !shadow-[0_0_40px_rgba(251,191,36,0.6)] !p-4",
        }
      );
    }
    if (!isRunning) {
      maxDepthToastShownRef.current = false;
    }
  }, [isAtMaxDepth, isRunning, maxDepth, depth]);

  const handleEmergencyClose = useCallback(() => {
    setShowEmergencyModal(false);
    timer.resetTimer();
    resetDive();
    exitFullscreen();
  }, [timer, resetDive, exitFullscreen]);

  // Task handlers extracted to useTaskHandlers.


  // formatShortDuration lives in src/lib/formatTime.ts

  const handleLogout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  // Stable handlers passed to memoized child components.
  const handleOpenPricing = useCallback(() => setShowPricing(true), []);
  const handleOpenEngineeringBay = useCallback(() => setShowEngineeringBay(true), []);
  const handleResetAll = useCallback(() => {
    timer.handleReset();
    resetDive();
  }, [timer, resetDive]);

  const getTimeDisplay = useCallback(
    (task: LocalTask) => {
      const dbTodayMins = getTaskTodayMinutes(task.text);
      const sessionSeconds = task.timeSpentInSeconds;
      const totalTodaySeconds = (dbTodayMins * 60) + sessionSeconds;
      return {
        total: totalTodaySeconds,
        formatted: formatShortDuration(totalTodaySeconds),
      };
    },
    [getTaskTodayMinutes],
  );

  const handleUpgrade = useCallback(async (moduleId: string) => {
    const currentTier = moduleId === 'hull' ? hullLevel : engineLevel;
    const cost = getUpgradeCost(currentTier);
    const pearls = profile?.total_pearls || 0;

    if (currentTier >= 5) {
      toast.error('Already at maximum tier!');
      return;
    }
    if (pearls < cost) {
      toast.error('Not enough pearls!', { description: `Need ${cost.toLocaleString()} pearls.` });
      return;
    }

    if (isAuthenticated && !isGuestMode) {
      // Server-authoritative spend via SECURITY DEFINER RPC.
      // Prevents tampering and handles cross-device race conditions atomically.
      const { error } = await supabase.rpc('spend_pearls', { p_amount: cost });
      if (error) {
        const msg = /insufficient/i.test(error.message)
          ? 'Not enough pearls!'
          : 'Upgrade failed. Please try again.';
        toast.error(msg, { description: error.message });
        return;
      }
      // Refresh profile so balance UI reflects the new total.
      refetchProfile();
    } else {
      // Guest mode: local-only profile mutation is still permitted.
      updateProfile({ total_pearls: pearls - cost });
    }

    if (moduleId === 'hull') {
      setHullLevel(prev => prev + 1);
    } else if (moduleId === 'engine') {
      setEngineLevel(prev => prev + 1);
    }

    toast.success(`${moduleId === 'hull' ? 'Hull' : 'Engine'} upgraded to Tier ${currentTier + 1}!`);
  }, [hullLevel, engineLevel, profile?.total_pearls, isAuthenticated, isGuestMode, updateProfile, refetchProfile, setHullLevel, setEngineLevel]);

  const handleActivatePro = useCallback(() => {
    activatePro();
    setShowPricing(false);
    toast.success('Nuclear Reactor activated! Unlimited missions unlocked.', { duration: 4000 });
  }, [activatePro]);

  // Ordered task list respecting sortMode. In 'priority' mode we surface
  // scored uncompleted first, then unscored, then completed.
  const displayedTasks = (() => {
    if (sortMode === "manual") return tasks;
    const uncompleted = tasks.filter((t) => !t.isCompleted);
    const completed = tasks.filter((t) => t.isCompleted);
    const scored = uncompleted.filter((t) => getPriorityScore(t) != null);
    const unscored = uncompleted.filter((t) => getPriorityScore(t) == null);
    return [...sortByPriority(scored), ...unscored, ...completed];
  })();

  // Reorder inside Focus tab: dragging always flips sort mode to manual.
  const handleFocusReorder = useCallback(
    (reordered: LocalTask[]) => {
      if (sortMode !== "manual") setSortMode("manual");
      reorderTasks(reordered);
    },
    [sortMode, setSortMode, reorderTasks]
  );

  // Priority tab → Focus tab dive handoff.
  const handleSelectAndDive = useCallback(
    (taskId: string) => {
      taskHandlers.handleSelectTask(taskId);
      setActiveTab("focus");
    },
    [taskHandlers]
  );

  return (
    <>
      {activeTab === "history" ? (
        <History />
      ) : activeTab === "collection" ? (
        <Collection key={completion.collectionRefreshKey} />
      ) : activeTab === "priority" ? (
        <Priority
          tasks={tasks}
          onReorder={handleFocusReorder}
          onToggleComplete={taskHandlers.handleToggleComplete}
          onDelete={taskHandlers.handleDeleteTask}
          onUpdateScores={updateTaskScores}
          onSelectAndDive={handleSelectAndDive}
        />
      ) : (

        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 pb-28 relative overflow-hidden">
          {/* Deep Sea Ambience - Underwater bubbles when diving */}
          <DeepSeaAmbience isActive={isRunning} isDiving={timer.isDiveTransition} />

          
          <TopBar
            showProBadge={monetizationUI.enabled && isPro}
            onOpenPricing={handleOpenPricing}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={toggleSoundEnabled}
            onOpenEngineeringBay={handleOpenEngineeringBay}
            onLogout={handleLogout}
          />


          <div className="w-full max-w-2xl mx-auto space-y-12 animate-fade-in">
        {/* Header - hidden in focus mode */}
        {!isRunning && (
          <div className="text-center space-y-1 pt-8 md:pt-0 px-12 md:px-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-ocean bg-clip-text text-transparent">
              DEEP DIVE
            </h1>
            <p className="text-foreground/60 text-sm sm:text-base font-medium">Deep work without distractions</p>
          </div>
        )}

        {/* Timer Circle - Submarine HUD Gauge */}
        <div className="flex flex-col items-center gap-6">
          <DiveGauge
            ref={timer.svgRef}
            setDuration={timer.setDuration}
            timeLeft={timer.timeLeft}
            isRunning={isRunning}
            isDragging={timer.isDragging}
            displayProgress={timer.displayProgress}
            depth={depth}
            isAtMaxDepth={isAtMaxDepth}
            onMouseDown={timer.handleMouseDown}
            onTouchStart={timer.handleTouchStart}
          />


          
          {/* Oxygen Bar - shown when diving */}
          {isRunning && (
            <OxygenBar oxygen={oxygen} className="animate-fade-in" />
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            {/* Play/Pause Button - Theme-aware Glowing Glass Effect */}
            <Button
              onClick={timer.handleStart}
              size="lg"
              className="play-button-themed h-16 w-16 rounded-full p-0 backdrop-blur-md transition-all duration-300 active:scale-95"
            >
              {isRunning ? (
                <Pause className="h-7 w-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              ) : (
                <Play className="h-7 w-7 ml-0.5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </Button>

            {/* Reset Button - Theme-aware Dark Glass Effect */}
            <Button
              onClick={handleResetAll}
              size="lg"
              variant="ghost"
              className="reset-button-themed h-16 w-16 rounded-full p-0 bg-white/5 backdrop-blur-md border border-white/10 text-muted-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300 active:scale-95"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>

          </div>
        </div>

        {/* Focus Mode: Show only selected task when running */}
        {isRunning && selectedTask && !selectedTask.isCompleted && (
          <div className="text-center animate-fade-in mt-2">
            <p className="text-4xl md:text-5xl font-extrabold text-foreground/90 drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] tracking-wide">
              {selectedTask.text}
            </p>
          </div>
        )}

        {!isRunning && (
          <MissionObjectivePanel
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            editingTaskId={taskHandlers.editingTaskId}
            editingText={taskHandlers.editingText}
            newTaskText={taskHandlers.newTaskText}
            taskGating={taskGating}
            onNewTaskTextChange={taskHandlers.setNewTaskText}
            onSubmit={taskHandlers.handleAddTask}
            onOpenPricing={handleOpenPricing}
            onSelect={taskHandlers.handleSelectTask}
            onToggleComplete={taskHandlers.handleToggleComplete}
            onStartEdit={taskHandlers.handleStartEdit}
            onSaveEdit={taskHandlers.handleSaveEdit}
            onEditKeyDown={taskHandlers.handleEditKeyDown}
            onEditTextChange={taskHandlers.setEditingText}
            onDelete={taskHandlers.handleDeleteTask}
            onReorder={reorderTasks}
            getTimeDisplay={getTimeDisplay}
          />
        )}

        <DiveTimeCard todayMinutes={todayMinutes} showCalibration={!isRunning} />

        <AmbientSoundMixer
          sounds={sounds}
          toggleSound={toggleSound}
          activeSoundsCount={activeSoundsCount}
        />

          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Fullscreen Immersion Flash */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-[9999] pointer-events-none will-change-[opacity]"
          style={{
            animation: "immersion-snap 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            backgroundColor: "hsl(var(--primary) / 0.15)",
          }}
        />
      )}
      
      {/* Emergency Ascent Modal */}
      <EmergencyModal 
        open={showEmergencyModal} 
        onClose={handleEmergencyClose}
        depth={depth}
      />
      
      {/* Mission Complete Modal */}
      <MissionCompleteModal
        open={completion.showMissionCompleteModal}
        onClose={completion.handleMissionCompleteClose}
        maxDepth={completion.completedSessionDepth}
        creature={completion.rewardCreature}
        sessionDuration={completion.completedSessionDuration}
        isNewDiscovery={completion.isNewDiscovery}
      />

      
      {/* Engineering Bay Modal — only mount when open (avoids constant remount cost) */}
      {showEngineeringBay && (
        <EngineeringBayModal
          open={showEngineeringBay}
          onClose={() => setShowEngineeringBay(false)}
          engineLevel={engineLevel}
          hullLevel={hullLevel}
          currentPearls={profile?.total_pearls || 0}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Monetization modals — only mounted when subscription UI is enabled. */}
      {monetizationUI.enabled && (
        <>
          <UpgradeRequiredModal
            open={showUpgradeRequired}
            onClose={() => setShowUpgradeRequired(false)}
            onOpenPricing={handleOpenPricing}
          />
          {showPricing && (
            <PricingModal
              open={showPricing}
              onClose={() => setShowPricing(false)}
              isPro={isPro}
              onActivatePro={handleActivatePro}
              currentPearls={profile?.total_pearls || 0}
            />
          )}
        </>
      )}


    </>
  );
};

export default Index;
