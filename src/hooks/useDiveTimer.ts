import { useState, useEffect, useRef, useCallback } from "react";
import { hapticsMedium } from "@/lib/haptics";
import { TIMER_CONFIG } from "@/constants/gameConfig";

/**
 * Dive timer state + drag-to-set + countdown loop.
 * Fires onComplete exactly once when the countdown reaches 0.
 */
export function useDiveTimer({
  selectedTaskId,
  incrementTimeSpent,
  onComplete,
  onStart,
}: {
  selectedTaskId: string | null;
  incrementTimeSpent: (id: string) => void;
  onComplete: () => void;
  onStart?: () => void;
}) {
  const [setDuration, setSetDuration] = useState(TIMER_CONFIG.DEFAULT_DURATION_SECONDS);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.DEFAULT_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDiveTransition, setIsDiveTransition] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const completionHandledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      completionHandledRef.current = false;
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (selectedTaskId) incrementTimeSpent(selectedTaskId);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, selectedTaskId, incrementTimeSpent, timeLeft]);

  // Fire onComplete when reaching 0
  useEffect(() => {
    if (timeLeft === 0 && isRunning && !completionHandledRef.current) {
      completionHandledRef.current = true;
      setIsRunning(false);
      onCompleteRef.current();
    }
  }, [timeLeft, isRunning]);

  // --- Drag-to-set ---
  const getAngleFromEvent = useCallback((clientX: number, clientY: number): number => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const angleToTime = useCallback((angle: number): number => {
    const rawTime = (angle / 360) * TIMER_CONFIG.MAX_TIME_SECONDS;
    const snapped = Math.round(rawTime / 60) * 60;
    return Math.max(TIMER_CONFIG.MIN_TIME_SECONDS, Math.min(TIMER_CONFIG.MAX_TIME_SECONDS, snapped));
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (isRunning) return;
    setIsDragging(true);
    setSetDuration(angleToTime(getAngleFromEvent(clientX, clientY)));
  }, [isRunning, getAngleFromEvent, angleToTime]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isRunning) return;
    setSetDuration(angleToTime(getAngleFromEvent(clientX, clientY)));
  }, [isDragging, isRunning, getAngleFromEvent, angleToTime]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setTimeLeft(setDuration);
    }
  }, [isDragging, setDuration]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    handleDragStart(t.clientX, t.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onUp = () => handleDragEnd();
    const onTMove = (e: TouchEvent) => {
      const t = e.touches[0];
      handleDragMove(t.clientX, t.clientY);
    };
    const onTEnd = () => handleDragEnd();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTMove);
    window.addEventListener("touchend", onTEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTMove);
      window.removeEventListener("touchend", onTEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (isDragging && !isRunning) setTimeLeft(setDuration);
  }, [setDuration, isDragging, isRunning]);

  // --- Controls ---
  const handleStart = useCallback(() => {
    if (!isRunning && timeLeft === 0) setTimeLeft(setDuration);
    if (!isRunning) {
      setIsDiveTransition(true);
      setTimeout(() => setIsDiveTransition(false), 2000);
      onStart?.();
    }
    hapticsMedium();
    setIsRunning((r) => !r);
  }, [isRunning, timeLeft, setDuration, onStart]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(setDuration);
  }, [setDuration]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(setDuration);
  }, [setDuration]);

  // Derived
  const displayTime = isDragging ? setDuration : timeLeft;
  const displayProgress = setDuration > 0 ? (displayTime / TIMER_CONFIG.MAX_TIME_SECONDS) * 100 : 0;

  return {
    // state
    setDuration, timeLeft, isRunning, isDragging, isDiveTransition,
    svgRef, displayProgress,
    // controls
    handleStart, handleReset, resetTimer,
    handleMouseDown, handleTouchStart,
    // imperative setters (for emergency / external resets)
    setIsRunning, setTimeLeft,
  };
}
