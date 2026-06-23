import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { hapticsMedium, hapticsSuccess, hapticsWarning } from "@/lib/haptics";

// Common components
import BottomNav from "@/components/common/BottomNav";

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

// Hooks & Data
import { useAuthContext } from "@/contexts/AuthContext";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { useSessionStats } from "@/hooks/useSessionStats";
import { useUserCreatures } from "@/hooks/useUserCreatures";
import { useGamification } from "@/hooks/useGamification";
import { useDeepDiveAudio } from "@/hooks/useDeepDiveAudio";
import { useTasks, LocalTask } from "@/hooks/useTasks";
import { Creature } from "@/data/creatures";
import { rollForCreature, getPearlValue } from "@/lib/lootSystem";
import { TIMER_CONFIG, getUpgradeCost } from "@/constants/gameConfig";
import { useProStatus } from "@/hooks/useProStatus";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useUpgradeLevels } from "@/hooks/useUpgradeLevels";
import { useTaskGating, useMonetizationUI } from "@/features/monetization/gating";


const Index = () => {
  const { signOut, profile, updateProfile, refetchProfile, isGuestMode, isAuthenticated } = useAuthContext();
  const { isPro, activatePro } = useProStatus();
  const taskGating = useTaskGating();
  const monetizationUI = useMonetizationUI();
  const { addSession } = useFocusSessions();
  const { addCreature } = useUserCreatures();
  const { todayMinutes, getTaskTodayMinutes, refetch: refetchSessions, addLocalFocusSession } = useSessionStats();
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    incrementTimeSpent,
    saveTimeSpent,
    reorderTasks,
  } = useTasks();
  
  const [setDuration, setSetDuration] = useState(TIMER_CONFIG.DEFAULT_DURATION_SECONDS);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.DEFAULT_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSoundMixer, setShowSoundMixer] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  
  // Audio hook - manages all sound playback
  const { sounds, toggleSound, playCompletionSound, activeSoundsCount, isSoundEnabled, toggleSoundEnabled } = useDeepDiveAudio();
  const { isFullscreen, showOverlay, toggleFullscreen, exitFullscreen } = useFullscreen();
  const [activeTab, setActiveTab] = useState<"focus" | "history" | "collection">("focus");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false);
  const [showEngineeringBay, setShowEngineeringBay] = useState(false);
  const [showUpgradeRequired, setShowUpgradeRequired] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [rewardCreature, setRewardCreature] = useState<Creature | null>(null);
  const [completedSessionDepth, setCompletedSessionDepth] = useState(0);
  const [completedSessionDuration, setCompletedSessionDuration] = useState(0);
  const [isDiveTransition, setIsDiveTransition] = useState(false);
  const [collectionRefreshKey, setCollectionRefreshKey] = useState(0);
  
  // Persistent upgrade levels (localStorage for both guest & auth).
  const { engineLevel, setEngineLevel, hullLevel, setHullLevel } = useUpgradeLevels();


  const { depth, oxygen, isEmergency, elapsedSeconds, isAtMaxDepth, maxDepth, resetDive } = useGamification({
    isDiving: isRunning,
    engineLevel,
    hullLevel,
  });
  const maxDepthToastShownRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Auto-select first uncompleted task when tasks load
  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      const firstUncompleted = tasks.find((t: LocalTask) => !t.isCompleted);
      if (firstUncompleted) setSelectedTaskId(firstUncompleted.id);
    }
  }, [tasks, selectedTaskId]);

  // Handle emergency ascent (oxygen depleted)
  useEffect(() => {
    if (isEmergency && isRunning) {
      setIsRunning(false);
      hapticsWarning();
      setShowEmergencyModal(true);
    }
  }, [isEmergency, isRunning]);

  // Show toast when max depth is reached
  useEffect(() => {
    if (isAtMaxDepth && isRunning && !maxDepthToastShownRef.current) {
      maxDepthToastShownRef.current = true;
      // Nuclear option: bypass Sonner's title/description rendering by injecting our own JSX content.
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
          // IMPORTANT: intentionally no `description` prop here
        }
      );
    }
    // Reset toast flag when starting a new dive
    if (!isRunning) {
      maxDepthToastShownRef.current = false;
    }
  }, [isAtMaxDepth, isRunning, maxDepth, depth]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Track if we've already handled completion for this session
  const completionHandledRef = useRef(false);

  // Timer logic with per-task time accumulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && timeLeft > 0) {
      completionHandledRef.current = false; // Reset on new session start
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Add time to selected task (local tracking during session)
          if (selectedTaskId) {
            incrementTimeSpent(selectedTaskId);
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, selectedTaskId, incrementTimeSpent]);


  // Calculate angle from mouse/touch position (0 at top, clockwise 0-360)
  const getAngleFromEvent = useCallback((clientX: number, clientY: number): number => {
    if (!svgRef.current) return 0;
    
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    // Calculate angle in degrees (0 at top, clockwise positive)
    let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    return angle;
  }, []);

  // Convert angle (0-360) to time in seconds
  const angleToTime = useCallback((angle: number): number => {
    // Map 360 degrees to MAX_TIME (60 minutes)
    const rawTime = (angle / 360) * TIMER_CONFIG.MAX_TIME_SECONDS;
    // Snap to nearest minute
    const snappedTime = Math.round(rawTime / 60) * 60;
    // Clamp between min and max, ensure at least MIN_TIME
    return Math.max(TIMER_CONFIG.MIN_TIME_SECONDS, Math.min(TIMER_CONFIG.MAX_TIME_SECONDS, snappedTime));
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (isRunning) return;
    setIsDragging(true);
    // Immediately set time based on click position
    const angle = getAngleFromEvent(clientX, clientY);
    const newTime = angleToTime(angle);
    setSetDuration(newTime);
  }, [isRunning, getAngleFromEvent, angleToTime]);

  // Handle drag move - directly map position to time
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isRunning) return;
    
    const angle = getAngleFromEvent(clientX, clientY);
    const newTime = angleToTime(angle);
    setSetDuration(newTime);
  }, [isDragging, isRunning, getAngleFromEvent, angleToTime]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Sync timeLeft with setDuration when done dragging
      setTimeLeft(setDuration);
    }
  }, [isDragging, setDuration]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Add/remove global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Sync timeLeft with setDuration when dragging
  useEffect(() => {
    if (isDragging && !isRunning) {
      setTimeLeft(setDuration);
    }
  }, [setDuration, isDragging, isRunning]);


  const handleStart = () => {
    if (!isRunning && timeLeft === 0) {
      // Reset to set duration if timer finished
      setTimeLeft(setDuration);
    }
    
    // Trigger dive transition burst when starting
    if (!isRunning) {
      setIsDiveTransition(true);
      setTimeout(() => setIsDiveTransition(false), 2000);
    }
    
    hapticsMedium();
    setIsRunning(!isRunning);
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(setDuration);
    resetDive();
  };

  const handleEmergencyClose = () => {
    setShowEmergencyModal(false);
    setTimeLeft(setDuration);
    resetDive();
    exitFullscreen();
  };

  const handleMissionComplete = useCallback(() => {
    // Capture current values immediately (avoid stale closures)
    const currentDepth = depth;
    const currentDuration = elapsedSeconds;
    const taskName = selectedTask?.text || "Focus Session";
    
    // Store current depth and duration before reset
    setCompletedSessionDepth(currentDepth);
    setCompletedSessionDuration(currentDuration);
    
    // Roll for a creature reward
    const creature = rollForCreature(currentDepth);
    setRewardCreature(creature);
    
    // Show the mission complete modal INSTANTLY
    hapticsSuccess();
    setShowMissionCompleteModal(true);
    
    // Fire all async saves in the background (non-blocking)
    (async () => {
      try {
        if (selectedTask) {
          saveTimeSpent(selectedTask.id, selectedTask.timeSpentInSeconds);
        }
        
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
          // Guest mode: update in-memory profile pearls
          if (profile) {
            updateProfile({ 
              total_pearls: (profile.total_pearls || 0) + totalPearls,
              total_depth: (profile.total_depth || 0) + currentDepth,
            });
          }
          addLocalFocusSession({
            taskId: selectedTask?.id || null,
            taskName: taskName,
            duration: currentDuration,
            timestamp: Date.now(),
          });
        }

        await refetchSessions();
      } catch (err) {
        console.error('[MissionComplete] Background save error:', err);
      }
    })();
  }, [depth, elapsedSeconds, selectedTask, addSession, profile, updateProfile, refetchSessions, isGuestMode, isAuthenticated, addLocalFocusSession, saveTimeSpent]);

  // Handle timer completion separately to avoid closure issues
  useEffect(() => {
    if (timeLeft === 0 && isRunning && !completionHandledRef.current) {
      completionHandledRef.current = true;
      setIsRunning(false);
      playCompletionSound();
      
      
      handleMissionComplete();
    }
  }, [timeLeft, isRunning, playCompletionSound, handleMissionComplete, elapsedSeconds, depth]);

  const handleMissionCompleteClose = useCallback(async () => {
    // Add creature to collection if one was found
    if (rewardCreature) {
      await addCreature(rewardCreature.id);
    }
    
    setShowMissionCompleteModal(false);
    setRewardCreature(null);
    setTimeLeft(setDuration);
    resetDive();
    exitFullscreen();
    
    // Trigger Collection & Engineering Bay to refresh with latest data
    setCollectionRefreshKey(prev => prev + 1);
    refetchProfile();
    
    if (rewardCreature) {
      toast.success("Creature added to collection!", {
        description: `${rewardCreature.name} saved!`,
      });
    }
  }, [rewardCreature, addCreature, setDuration, resetDive, exitFullscreen]);

  // Task gating: see src/features/monetization/gating.ts for the rules.
  const taskLimit = taskGating.limit;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    // Free-tier soft limit → upgrade prompt (only active when SUBSCRIPTION_ENABLED).
    if (taskGating.hitFreeLimit(tasks.length)) {
      setShowUpgradeRequired(true);
      return;
    }

    // Always-on hard ceiling (performance/UX, not monetization).
    if (taskGating.hitHardCap(tasks.length)) {
      toast.error(`Mission slots full (${taskGating.hardCap} max)`, {
        description: "Complete or remove a mission to add a new one.",
      });
      return;
    }

    const newTask = await addTask(newTaskText.trim());
    setNewTaskText("");
    // Auto-select if no task selected
    if (!selectedTaskId && newTask) {
      setSelectedTaskId(newTask.id);
    }
  };

  const handleSelectTask = (taskId: string) => {
    if (!isRunning) {
      setSelectedTaskId(taskId);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isCompleted: !task.isCompleted });
    }
    // If completing the selected task, select next uncompleted
    if (task && !task.isCompleted && selectedTaskId === taskId) {
      const nextUncompleted = tasks.find(t => t.id !== taskId && !t.isCompleted);
      setSelectedTaskId(nextUncompleted?.id || null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    if (selectedTaskId === taskId) {
      const remaining = tasks.filter(t => t.id !== taskId && !t.isCompleted);
      setSelectedTaskId(remaining[0]?.id || null);
    }
  };

  const handleStartEdit = (task: LocalTask) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editingText.trim()) {
      updateTask(editingTaskId, { text: editingText.trim() });
    }
    setEditingTaskId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingText("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress: starts at 100% (full) and depletes to 0%
  // When dragging, show the setDuration position directly; otherwise show timeLeft progress
  const displayTime = isDragging ? setDuration : timeLeft;
  const displayProgress = setDuration > 0 ? (displayTime / TIMER_CONFIG.MAX_TIME_SECONDS) * 100 : 0;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {activeTab === "history" ? (
        <History />
      ) : activeTab === "collection" ? (
        <Collection key={collectionRefreshKey} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 pb-28 relative overflow-hidden">
          {/* Deep Sea Ambience - Underwater bubbles when diving */}
          <DeepSeaAmbience isActive={isRunning} isDiving={isDiveTransition} />
          
          {/* Top Left - PRO Badge (only when monetization UI is enabled and user is Pro) */}
          {monetizationUI.enabled && isPro && (
            <div className="absolute top-4 left-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowPricing(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-yellow-500/50 bg-yellow-500/10 transition-all duration-300 hover:bg-yellow-500/20"
                    style={{ boxShadow: '0 0 12px rgba(234,179,8,0.3)' }}
                  >
                    <Crown className="w-3.5 h-3.5 text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
                    <span className="text-[10px] font-bold font-mono tracking-widest text-yellow-400">PRO</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
                  NUCLEAR REACTOR ACTIVE
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
           {/* Top Right Controls - Fullscreen, Sound Toggle, Hangar, Guidebook & Logout */}
           <div className="absolute top-4 right-4 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    toggleFullscreen();
                    toast(
                      isFullscreen ? "STANDARD VIEW RESTORED" : "INITIATING FULL IMMERSION",
                      {
                        duration: 2000,
                        position: "bottom-center",
                        className: "!bg-black/90 !border !border-primary/40 !shadow-[0_0_20px_hsl(var(--primary)/0.3)] !text-primary font-mono !text-xs !tracking-widest",
                      }
                    );
                  }}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isFullscreen
                      ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)] hover:bg-primary/10"
                      : "text-muted-foreground/50 hover:bg-muted/10"
                  }`}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 transition-transform duration-300" />
                  ) : (
                    <Maximize className="w-5 h-5 transition-transform duration-300" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
                {isFullscreen ? "EXIT IMMERSION" : "FULL IMMERSION"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    toggleSoundEnabled();
                    toast(
                      isSoundEnabled ? "SILENT RUNNING ACTIVATED" : "SONAR SYSTEMS ONLINE",
                      {
                        duration: 2000,
                        position: "bottom-center",
                        className: "!bg-black/90 !border !border-primary/40 !shadow-[0_0_20px_hsl(var(--primary)/0.3)] !text-primary font-mono !text-xs !tracking-widest",
                      }
                    );
                  }}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isSoundEnabled
                      ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)] hover:bg-primary/10"
                      : "text-muted-foreground/50 hover:bg-muted/10"
                  }`}
                  aria-label={isSoundEnabled ? "Mute notifications" : "Unmute notifications"}
                >
                  {isSoundEnabled ? (
                    <Volume2 className="w-5 h-5 transition-transform duration-300" />
                  ) : (
                    <VolumeX className="w-5 h-5 transition-transform duration-300" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
                {isSoundEnabled ? "SONAR ACTIVE" : "SILENT RUNNING"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowEngineeringBay(true)}
                  className="p-2 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
                  aria-label="Engineering Bay"
                >
                  <Wrench className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
                ENGINEERING BAY
              </TooltipContent>
            </Tooltip>
            <GuidebookModal />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                  aria-label="Logout"
                >
                  <Power className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-mono text-xs tracking-wider">
                SYSTEM SHUTDOWN
              </TooltipContent>
            </Tooltip>
          </div>

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
          <div className="relative select-none">
            <svg 
              ref={svgRef}
              className={`w-72 h-72 md:w-80 md:h-80 touch-none ${
                !isRunning ? "cursor-grab" : "cursor-default"
              } ${isDragging ? "cursor-grabbing" : ""}`}
              viewBox="-20 -20 340 340"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <defs>
                {/* Glow filter for active segments */}
                <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="gaugeGlowIntense" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Dark background disc */}
              <circle
                cx="150"
                cy="150"
                r="135"
                fill="hsl(var(--background))"
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />

              {/* Inner dark ring for depth */}
              <circle
                cx="150"
                cy="150"
                r="105"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1"
                opacity="0.5"
              />

              {/* Segmented gauge ring - 60 segments */}
              {Array.from({ length: 60 }).map((_, i) => {
                const segAngle = (i * 6 - 90) * (Math.PI / 180);
                const nextAngle = ((i + 1) * 6 - 90.5) * (Math.PI / 180);
                const isMajor = i % 5 === 0;
                const outerR = 132;
                const innerR = isMajor ? 112 : 118;

                // Is this segment within the active range?
                const segmentPercent = (i / 60) * 100;
                const maxPercent = (setDuration / TIMER_CONFIG.MAX_TIME_SECONDS) * 100;
                const currentPercent = displayProgress;
                const isActive = segmentPercent < currentPercent;
                const isInSetRange = segmentPercent < maxPercent;

                const x1 = 150 + outerR * Math.cos(segAngle);
                const y1 = 150 + outerR * Math.sin(segAngle);
                const x2 = 150 + innerR * Math.cos(segAngle);
                const y2 = 150 + innerR * Math.sin(segAngle);

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      isActive
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground))"
                    }
                    strokeWidth={isMajor ? 3 : 2}
                    opacity={isActive ? 1 : (isMajor ? 0.25 : 0.1)}
                    strokeLinecap="round"
                    filter={isActive ? "url(#gaugeGlow)" : undefined}
                    style={{
                      transition: isDragging ? "none" : "opacity 0.3s, stroke 0.3s",
                    }}
                  />
                );
              })}

              {/* Outer bezel ring */}
              <circle
                cx="150"
                cy="150"
                r="136"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                opacity="0.3"
              />

              {/* Numeric labels every 5 minutes */}
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((minutes) => {
                const angle = ((minutes / 60) * 360 - 90) * (Math.PI / 180);
                const labelR = 145;
                const x = 150 + labelR * Math.cos(angle);
                const y = 150 + labelR * Math.sin(angle);
                const segmentPercent = (minutes / 60) * 100;
                const isActive = segmentPercent <= displayProgress;

                return (
                  <text
                    key={minutes}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                    className="text-[10px] font-bold"
                    style={{ fontFamily: "'Orbitron', monospace" }}
                    opacity={isActive ? 0.9 : 0.4}
                  >
                    {minutes}
                  </text>
                );
              })}

              {/* Knob indicator at the edge */}
              {displayProgress > 0 && (() => {
                const anglePercent = displayProgress / 100;
                const endAngle = (-90 + (anglePercent * 360)) * (Math.PI / 180);
                const knobR = 132;
                const knobX = 150 + knobR * Math.cos(endAngle);
                const knobY = 150 + knobR * Math.sin(endAngle);

                return (
                  <g filter="url(#gaugeGlowIntense)">
                    <circle
                      cx={knobX}
                      cy={knobY}
                      r="8"
                      fill="hsl(var(--background))"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                    />
                    <circle
                      cx={knobX}
                      cy={knobY}
                      r="3"
                      fill="hsl(var(--primary))"
                    />
                  </g>
                );
              })()}

              {/* Invisible hit area */}
              <circle
                cx="150"
                cy="150"
                r="136"
                fill="transparent"
              />
            </svg>

            {/* Center display - LED style with CRT scanline overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* CRT Scanline overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none overflow-hidden opacity-[0.04]"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)",
                  backgroundSize: "100% 3px",
                  animation: "scanline-scroll 8s linear infinite",
                }}
              />

              {/* Timer digits */}
              <div
                className="text-4xl md:text-5xl font-extrabold tabular-nums tracking-wider font-robotic text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
              >
                {formatTime(isDragging ? setDuration : timeLeft)}
              </div>

              {/* Depth Display - shown when diving */}
              {isRunning && (
                <div className="flex flex-col items-center mt-2">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Anchor className="h-4 w-4" />
                    <span className="font-robotic text-lg font-bold tracking-wider">
                      {depth}m
                    </span>
                  </div>
                  {isAtMaxDepth && (
                    <p className="text-xs text-primary/40 font-robotic mt-1">
                      ZONE LOCKED 🔒
                    </p>
                  )}
                </div>
              )}

              {!isRunning && !isDragging && (
                <p className="text-xs mt-2 text-primary/50 font-robotic tracking-wider">
                  DRAG TO SET
                </p>
              )}
              {isDragging && (
                <p className="text-xs mt-2 animate-pulse text-primary/70 font-robotic tracking-wider">
                  {formatTime(setDuration)} — RELEASE
                </p>
              )}
            </div>
          </div>
          
          {/* Oxygen Bar - shown when diving */}
          {isRunning && (
            <OxygenBar oxygen={oxygen} className="animate-fade-in" />
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            {/* Play/Pause Button - Theme-aware Glowing Glass Effect */}
            <Button
              onClick={handleStart}
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
              onClick={handleReset}
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

        {/* Task List - Hidden when timer is running (Focus Mode) */}
        {!isRunning && (
          <div className="space-y-4 animate-fade-in w-full max-w-md md:max-w-lg mx-auto">
            <form onSubmit={handleAddTask} className="space-y-2">
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-xs uppercase tracking-widest text-primary font-bold">
                  MISSION OBJECTIVE
                </span>
                <div className="flex items-center gap-2">
                  {taskGating.showUpgradeHint && (
                    <button
                      type="button"
                      onClick={() => setShowPricing(true)}
                      className="text-[10px] font-mono text-yellow-400/70 hover:text-yellow-400 transition-colors tracking-wider"
                    >
                      ↑ UPGRADE
                    </button>
                  )}
                  {taskGating.showSlotCounter && (
                    <span className={`text-xs uppercase tracking-widest font-mono font-semibold ${
                      taskGating.hitFreeLimit(tasks.length) ? 'text-yellow-400/80' : 'text-foreground/50'
                    }`}>
                      SLOT [{tasks.length}/{taskLimit}]
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="> Add a focus task..."
                  className="text-center text-lg h-14 font-mono bg-black/60 border border-white/10 placeholder:text-white/30 placeholder:text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all flex-1"
                  disabled={taskGating.hitHardCap(tasks.length)}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-14 w-14 bg-primary hover:bg-primary/90"
                  disabled={taskGating.hitHardCap(tasks.length) || !newTaskText.trim()}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </form>
            
            {/* Task List */}
            {tasks.length > 0 && (
              <SortableTaskList
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                editingTaskId={editingTaskId}
                editingText={editingText}
                onSelect={handleSelectTask}
                onToggleComplete={handleToggleComplete}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onEditKeyDown={handleEditKeyDown}
                onEditTextChange={setEditingText}
                onDelete={handleDeleteTask}
                onReorder={reorderTasks}
                getTimeDisplay={(task) => {
                  const dbTodayMins = getTaskTodayMinutes(task.text);
                  const sessionSeconds = task.timeSpentInSeconds;
                  const totalTodaySeconds = (dbTodayMins * 60) + sessionSeconds;
                  return {
                    total: totalTodaySeconds,
                    formatted: formatTimeSpent(totalTodaySeconds),
                  };
                }}
              />
            )}
          </div>
        )}

        {/* Unified Control Module - Time + Theme */}
        <div className="flex justify-center">
          <div className="relative inline-flex flex-col items-center rounded-2xl bg-background/40 backdrop-blur-md border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.15)] overflow-hidden">
            {/* Corner accents for HUD feel */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50 rounded-br-xl" />
            
            {/* Top Section - Time Display */}
            <div className="flex flex-col items-center gap-3 px-10 py-5">
              {/* Label with status indicator */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold">
                  TODAY'S DIVE TIME
                </span>
              </div>
              
              {/* Main value display with glow */}
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-5xl md:text-6xl font-mono font-black text-foreground tracking-tight tabular-nums drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                >
                  {todayMinutes}
                </span>
                <span className="text-base font-mono uppercase tracking-widest text-foreground/50 font-bold">
                  mins
                </span>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            {/* Bottom Section - Theme Controls */}
            {!isRunning && (
              <div className="flex flex-col items-center gap-2 px-8 py-4 animate-fade-in">
                <span className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">
                  CALIBRATION
                </span>
                <ThemeSwitcher />
              </div>
            )}
          </div>
        </div>

        {/* Ambient Sound Mixer - Moved to bottom */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <Button
              onClick={() => setShowSoundMixer(!showSoundMixer)}
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Volume2 className={`h-5 w-5 ${activeSoundsCount > 0 ? "text-foreground" : ""}`} />
              <span className="text-sm font-semibold">
                Ambient Sounds {activeSoundsCount > 0 && `(${activeSoundsCount})`}
              </span>
            </Button>
          </div>
          
          {showSoundMixer && (
            <div className="flex justify-center gap-4 animate-fade-in">
              <Button
                onClick={() => toggleSound("rain")}
                variant="ghost"
                className={`flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl transition-all duration-300 ${
                  sounds.rain
                    ? "text-foreground bg-foreground/10"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                }`}
              >
                <CloudRain className="h-6 w-6" />
                <span className="text-xs">Rain</span>
              </Button>
              
              <Button
                onClick={() => toggleSound("ocean")}
                variant="ghost"
                className={`flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl transition-all duration-300 ${
                  sounds.ocean
                    ? "text-foreground bg-foreground/10"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                }`}
              >
                <Waves className="h-6 w-6" />
                <span className="text-xs">Ocean Waves</span>
              </Button>
              
              <Button
                onClick={() => toggleSound("whiteNoise")}
                variant="ghost"
                className={`flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl transition-all duration-300 ${
                  sounds.whiteNoise
                    ? "text-foreground bg-foreground/10"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                }`}
              >
                <Wind className="h-6 w-6" />
                <span className="text-xs">White Noise</span>
              </Button>
            </div>
          )}
        </div>
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
        open={showMissionCompleteModal}
        onClose={handleMissionCompleteClose}
        maxDepth={completedSessionDepth}
        creature={rewardCreature}
        sessionDuration={completedSessionDuration}
      />
      
      {/* Engineering Bay Modal */}
      <EngineeringBayModal
        open={showEngineeringBay}
        onClose={() => setShowEngineeringBay(false)}
        engineLevel={engineLevel}
        hullLevel={hullLevel}
        currentPearls={profile?.total_pearls || 0}
        onUpgrade={(moduleId) => {
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

          // Deduct pearls
          updateProfile({ total_pearls: pearls - cost });

          // Increment tier
          if (moduleId === 'hull') {
            setHullLevel(prev => prev + 1);
          } else if (moduleId === 'engine') {
            setEngineLevel(prev => prev + 1);
          }

          toast.success(`${moduleId === 'hull' ? 'Hull' : 'Engine'} upgraded to Tier ${currentTier + 1}!`);
        }}
      />

      {/* Monetization modals — only mounted when subscription UI is enabled. */}
      {monetizationUI.enabled && (
        <>
          <UpgradeRequiredModal
            open={showUpgradeRequired}
            onClose={() => setShowUpgradeRequired(false)}
            onOpenPricing={() => setShowPricing(true)}
          />
          <PricingModal
            open={showPricing}
            onClose={() => setShowPricing(false)}
            isPro={isPro}
            onActivatePro={() => { activatePro(); setShowPricing(false); toast.success('Nuclear Reactor activated! Unlimited missions unlocked.', { duration: 4000 }); }}
            currentPearls={profile?.total_pearls || 0}
          />
        </>
      )}

    </>
  );
};

export default Index;
