import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Check, Volume2, CloudRain, Waves, Wind, Plus, Trash2, Anchor, Power, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Common components
import ThemeSwitcher from "@/components/common/ThemeSwitcher";
import BottomNav from "@/components/common/BottomNav";
import GuidebookModal from "@/components/common/GuidebookModal";

// Timer feature components
import DeepSeaAmbience from "@/features/timer/DeepSeaAmbience";
import OxygenBar from "@/features/timer/OxygenBar";
import EmergencyModal from "@/features/timer/EmergencyModal";
import MissionCompleteModal from "@/features/timer/MissionCompleteModal";

// Pages
import History from "@/pages/History";
import Collection from "@/pages/Collection";

// Hooks & Data
import { useAuthContext } from "@/contexts/AuthContext";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { useSessionStats } from "@/hooks/useSessionStats";
import { useUserCreatures } from "@/hooks/useUserCreatures";
import { useGamification } from "@/hooks/useGamification";
import { useDeepDiveAudio, SoundType } from "@/hooks/useDeepDiveAudio";
import { Creature } from "@/data/creatures";
import { rollForCreature } from "@/lib/lootSystem";
import { TIMER_CONFIG } from "@/constants/gameConfig";

// Task type with time tracking
interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  timeSpentInSeconds: number;
}


const Index = () => {
  const { signOut, profile, updateProfile, isGuestMode, isAuthenticated } = useAuthContext();
  const { addSession } = useFocusSessions();
  const { addCreature } = useUserCreatures();
  const { todayMinutes, getTaskTodayMinutes, refetch: refetchSessions, addLocalFocusSession } = useSessionStats();
  
  const [setDuration, setSetDuration] = useState(TIMER_CONFIG.DEFAULT_DURATION_SECONDS);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.DEFAULT_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSoundMixer, setShowSoundMixer] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  
  // Audio hook - manages all sound playback
  const { sounds, toggleSound, playCompletionSound, activeSoundsCount } = useDeepDiveAudio();
  const [activeTab, setActiveTab] = useState<"focus" | "history" | "collection">("focus");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false);
  const [rewardCreature, setRewardCreature] = useState<Creature | null>(null);
  const [completedSessionDepth, setCompletedSessionDepth] = useState(0);
  const [completedSessionDuration, setCompletedSessionDuration] = useState(0);
  const [isDiveTransition, setIsDiveTransition] = useState(false);
  
  // Gamification hook - engine level starts at 1
  const engineLevel = 1; // TODO: Load from user profile when persistence is added
  const hullLevel = 1; // TODO: Load from user profile when persistence is added
  const { depth, oxygen, isEmergency, elapsedSeconds, isAtMaxDepth, maxDepth, resetDive } = useGamification({
    isDiving: isRunning,
    engineLevel,
    hullLevel,
  });
  const maxDepthToastShownRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("deepDiveTasks");
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      setTasks(parsedTasks);
      // Auto-select first uncompleted task
      const firstUncompleted = parsedTasks.find((t: Task) => !t.isCompleted);
      if (firstUncompleted) setSelectedTaskId(firstUncompleted.id);
    }
  }, []);


  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("deepDiveTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Handle emergency ascent (oxygen depleted)
  useEffect(() => {
    if (isEmergency && isRunning) {
      setIsRunning(false);
      setShowEmergencyModal(true);
    }
  }, [isEmergency, isRunning]);

  // Show toast when max depth is reached
  useEffect(() => {
    if (isAtMaxDepth && isRunning && !maxDepthToastShownRef.current) {
      maxDepthToastShownRef.current = true;
      toast.warning(`⚠️ Hull Limit Reached (${maxDepth.toLocaleString()}m)`, {
        description: "Depth capped. Upgrade your submarine to dive deeper.",
        duration: 5000,
        position: "top-center",
      });
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
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      completionHandledRef.current = false; // Reset on new session start
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Add time to selected task (local tracking during session)
          if (selectedTaskId) {
            setTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === selectedTaskId 
                  ? { ...task, timeSpentInSeconds: task.timeSpentInSeconds + 1 }
                  : task
              )
            );
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, selectedTaskId]);


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
  };

  const handleMissionComplete = useCallback(async () => {
    // Capture current values immediately (avoid stale closures)
    const currentDepth = depth;
    // Use actual elapsed time instead of set duration for accurate tracking
    const currentDuration = elapsedSeconds;
    const taskName = selectedTask?.text || "Focus Session";
    
    console.log('[MissionComplete] Starting save:', { 
      currentDepth, 
      currentDuration, 
      elapsedSeconds,
      taskName, 
      isGuestMode, 
      isAuthenticated 
    });
    
    // Store current depth and duration before reset
    setCompletedSessionDepth(currentDepth);
    setCompletedSessionDuration(currentDuration);
    
    // Roll for a creature reward
    const creature = rollForCreature(currentDepth);
    setRewardCreature(creature);
    
    // Save session based on auth mode
    if (isAuthenticated && !isGuestMode) {
      // Authenticated: save to database
      const result = await addSession({
        task_name: taskName,
        duration: currentDuration,
        depth_reached: currentDepth,
        pearls_earned: Math.floor(currentDepth / 10),
        creature_id: creature?.id || null,
      });
      console.log('[MissionComplete] DB save result:', result);
      
      // Update total depth in profile
      if (profile) {
        updateProfile({ 
          total_depth: (profile.total_depth || 0) + currentDepth,
          total_pearls: (profile.total_pearls || 0) + Math.floor(currentDepth / 10),
        });
      }
    } else {
      // Guest mode: save to localStorage
      addLocalFocusSession({
        taskId: selectedTask?.id || null,
        taskName: taskName,
        duration: currentDuration,
        timestamp: Date.now(),
      });
      console.log('[MissionComplete] Local session saved');
    }

    // Refetch sessions to update "Today's Focus" display
    await refetchSessions();
    console.log('[MissionComplete] Sessions refetched');
    
    // Show the mission complete modal
    setShowMissionCompleteModal(true);
  }, [depth, elapsedSeconds, selectedTask, addSession, profile, updateProfile, refetchSessions, isGuestMode, isAuthenticated, addLocalFocusSession]);

  // Handle timer completion separately to avoid closure issues
  useEffect(() => {
    if (timeLeft === 0 && isRunning && !completionHandledRef.current) {
      completionHandledRef.current = true;
      setIsRunning(false);
      playCompletionSound();
      
      console.log('[Timer] Session complete, saving...', { elapsedSeconds, depth });
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
    
    if (rewardCreature) {
      toast.success("Creature added to collection!", {
        description: `${rewardCreature.name} saved!`,
      });
    }
  }, [rewardCreature, addCreature, setDuration, resetDive]);

  // Task management functions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() && tasks.length < TIMER_CONFIG.MAX_TASKS) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        isCompleted: false,
        timeSpentInSeconds: 0,
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskText("");
      // Auto-select if no task selected
      if (!selectedTaskId) {
        setSelectedTaskId(newTask.id);
      }
    }
  };

  const handleSelectTask = (taskId: string) => {
    if (!isRunning) {
      setSelectedTaskId(taskId);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      )
    );
    // If completing the selected task, select next uncompleted
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.isCompleted && selectedTaskId === taskId) {
      const nextUncompleted = tasks.find(t => t.id !== taskId && !t.isCompleted);
      setSelectedTaskId(nextUncompleted?.id || null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) {
      const remaining = tasks.filter(t => t.id !== taskId && !t.isCompleted);
      setSelectedTaskId(remaining[0]?.id || null);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editingText.trim()) {
      setTasks(prev => 
        prev.map(task => 
          task.id === editingTaskId 
            ? { ...task, text: editingText.trim() }
            : task
        )
      );
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
        <Collection />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 pb-28 relative overflow-hidden">
          {/* Deep Sea Ambience - Underwater bubbles when diving */}
          <DeepSeaAmbience isActive={isRunning} isDiving={isDiveTransition} />
          {/* Top Right Controls - Guidebook & Logout */}
          <div className="absolute top-4 right-4 flex items-center gap-1">
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-ocean bg-clip-text text-transparent">
              DEEP DIVE
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Deep work without distractions</p>
          </div>
        )}

        {/* Timer Circle - Solid Analog Dial */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative select-none">
            <svg 
              ref={svgRef}
              className={`w-72 h-72 md:w-80 md:h-80 touch-none ${
                !isRunning ? "cursor-grab" : "cursor-default"
              } ${isDragging ? "cursor-grabbing" : ""}`}
              viewBox="0 0 300 300"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Background - black disc */}
              <circle
                cx="150"
                cy="150"
                r="130"
                className="fill-background"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
              
              {/* Solid pie-chart fill (theme-colored disc that depletes) */}
              {displayProgress > 0 && (
                <path
                  d={(() => {
                    const centerX = 150;
                    const centerY = 150;
                    const radius = 128;
                    const anglePercent = displayProgress / 100;
                    const endAngle = -90 + (anglePercent * 360);
                    const startAngle = -90;
                    
                    const startX = centerX + radius * Math.cos(startAngle * Math.PI / 180);
                    const startY = centerY + radius * Math.sin(startAngle * Math.PI / 180);
                    const endX = centerX + radius * Math.cos(endAngle * Math.PI / 180);
                    const endY = centerY + radius * Math.sin(endAngle * Math.PI / 180);
                    
                    const largeArcFlag = anglePercent > 0.5 ? 1 : 0;
                    
                    if (anglePercent >= 0.9999) {
                      return `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`;
                    }
                    
                    return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
                  })()}
                  className="fill-primary"
                  style={{
                    transition: isDragging ? "none" : "d 1s linear",
                  }}
                />
              )}
              
              {/* Tick marks around the edge */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i * 6 - 90) * (Math.PI / 180);
                const isMajor = i % 5 === 0;
                const outerR = 130;
                const innerR = isMajor ? 115 : 122;
                const x1 = 150 + outerR * Math.cos(angle);
                const y1 = 150 + outerR * Math.sin(angle);
                const x2 = 150 + innerR * Math.cos(angle);
                const y2 = 150 + innerR * Math.sin(angle);
                
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={isMajor ? 2 : 1}
                    opacity={isMajor ? 0.6 : 0.3}
                  />
                );
              })}
              
              {/* Numeric labels every 5 minutes */}
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((minutes) => {
                const angle = ((minutes / 60) * 360 - 90) * (Math.PI / 180);
                const labelR = 145; // Position labels outside the dial
                const x = 150 + labelR * Math.cos(angle);
                const y = 150 + labelR * Math.sin(angle);
                
                return (
                  <text
                    key={minutes}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[10px] font-medium"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {minutes}
                  </text>
                );
              })}
              
              {/* Knob indicator at the edge of the pie slice */}
              {displayProgress > 0 && (() => {
                const anglePercent = displayProgress / 100;
                const endAngle = (-90 + (anglePercent * 360)) * (Math.PI / 180);
                const knobR = 128;
                const knobX = 150 + knobR * Math.cos(endAngle);
                const knobY = 150 + knobR * Math.sin(endAngle);
                
                return (
                  <g>
                    {/* Knob outer ring */}
                    <circle
                      cx={knobX}
                      cy={knobY}
                      r="10"
                      className="fill-background stroke-primary"
                      strokeWidth="3"
                    />
                    {/* Knob inner dot */}
                    <circle
                      cx={knobX}
                      cy={knobY}
                      r="4"
                      className="fill-primary"
                    />
                  </g>
                );
              })()}
              
              {/* Outer ring border */}
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="3"
              />
              
              {/* Invisible hit area for drag */}
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="transparent"
              />
            </svg>
            
            {/* Timer display with mix-blend-mode for contrast */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div 
                className="text-6xl md:text-7xl font-bold tabular-nums tracking-tight font-mono"
                style={{ mixBlendMode: "difference", color: "white" }}
              >
                {formatTime(isDragging ? setDuration : timeLeft)}
              </div>
              
              {/* Depth Display - shown when diving */}
              {isRunning && (
                <div className="flex flex-col items-center mt-2">
                  <div className="flex items-center gap-2" style={{ mixBlendMode: "difference", color: "white" }}>
                    <Anchor className="h-4 w-4" />
                    <span className="font-robotic text-xl tracking-wider">
                      {depth}m
                    </span>
                  </div>
                  {/* Next Zone Locked indicator - shown at max depth */}
                  {isAtMaxDepth && (
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">
                      Next Zone: Abyss (Locked 🔒)
                    </p>
                  )}
                </div>
              )}
              
              {!isRunning && !isDragging && (
                <p 
                  className="text-xs mt-2"
                  style={{ mixBlendMode: "difference", color: "white" }}
                >
                  Drag to set time
                </p>
              )}
              {isDragging && (
                <p 
                  className="text-xs mt-2 animate-pulse"
                  style={{ mixBlendMode: "difference", color: "white" }}
                >
                  {formatTime(setDuration)} — Release to confirm
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
          <div className="text-center animate-fade-in">
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {selectedTask.text}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Focused: {formatTimeSpent(selectedTask.timeSpentInSeconds)}
            </p>
          </div>
        )}

        {/* Task List - Hidden when timer is running (Focus Mode) */}
        {!isRunning && (
          <div className="space-y-4 animate-fade-in w-full max-w-md md:max-w-lg mx-auto">
            <form onSubmit={handleAddTask} className="space-y-2">
              <div className="flex justify-between items-center px-1 mb-2">
                <span className="text-xs uppercase tracking-widest text-primary/70">
                  MISSION OBJECTIVE
                </span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                  SLOT [{tasks.length}/{TIMER_CONFIG.MAX_TASKS}]
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="> Add a focus task..."
                  className="text-center text-lg h-14 font-mono bg-black/60 border border-white/10 placeholder:text-white/30 placeholder:text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all flex-1"
                  disabled={tasks.length >= TIMER_CONFIG.MAX_TASKS}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-14 w-14 bg-primary hover:bg-primary/90"
                  disabled={tasks.length >= TIMER_CONFIG.MAX_TASKS || !newTaskText.trim()}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </form>
            
            {/* Task List */}
            {tasks.length > 0 && (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => handleSelectTask(task.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedTaskId === task.id 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30" 
                        : "border-border bg-card hover:border-primary/50"
                    } ${task.isCompleted ? "opacity-60" : ""}`}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(task.id);
                      }}
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-full border-2 shrink-0 ${
                        selectedTaskId === task.id ? "border-primary" : "border-muted-foreground"
                      }`}
                    >
                      {task.isCompleted && <Check className="h-4 w-4 text-primary" />}
                    </Button>
                    {editingTaskId === task.id ? (
                      <Input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleEditKeyDown}
                        autoFocus
                        className="flex-1 h-8 text-base font-medium bg-background/50"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className={`flex-1 text-base font-medium ${
                        task.isCompleted ? "line-through text-muted-foreground" : ""
                      }`}>
                        {task.text}
                      </p>
                    )}
                    {/* Show TODAY's accumulated time from database + current session time */}
                    {(() => {
                      const dbTodayMins = getTaskTodayMinutes(task.text);
                      const sessionSeconds = task.timeSpentInSeconds;
                      const totalTodaySeconds = (dbTodayMins * 60) + sessionSeconds;
                      
                      return totalTodaySeconds > 0 ? (
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                          {formatTimeSpent(totalTodaySeconds)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 px-2 py-1 bg-muted/50 rounded-full">
                          0m
                        </span>
                      );
                    })()}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(task);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary/70 font-medium">
                  TODAY'S ACCUMULATED TIME
                </span>
              </div>
              
              {/* Main value display with glow */}
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-5xl md:text-6xl font-mono font-black text-foreground tracking-tight tabular-nums drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                >
                  {todayMinutes}
                </span>
                <span className="text-base font-mono uppercase tracking-widest text-muted-foreground font-medium">
                  mins
                </span>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            {/* Bottom Section - Theme Controls */}
            {!isRunning && (
              <div className="flex flex-col items-center gap-2 px-8 py-4 animate-fade-in">
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium">
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
              <span className="text-sm">
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
    </>
  );
};

export default Index;
