import { useState, useEffect, useRef, useCallback } from "react";
import { DEPTH_CONFIG, OXYGEN_CONFIG } from "@/constants/gameConfig";

interface UseGamificationProps {
  isDiving: boolean;
  engineLevel: number;
}

interface UseGamificationReturn {
  depth: number;
  oxygen: number;
  isEmergency: boolean;
  elapsedSeconds: number;
  resetDive: () => void;
}

export const useGamification = ({
  isDiving,
  engineLevel,
}: UseGamificationProps): UseGamificationReturn => {
  const [depth, setDepth] = useState(0);
  const [oxygen, setOxygen] = useState<number>(OXYGEN_CONFIG.MAX_OXYGEN);
  const [isEmergency, setIsEmergency] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Refs for tracking time - accumulate elapsed time across pauses
  const sessionStartRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0); // Time accumulated before current pause
  const hiddenAtRef = useRef<number | null>(null);
  const depthAtPenaltyRef = useRef<number>(0);

  // Reset dive state - only called when mission completes or user explicitly resets
  const resetDive = useCallback(() => {
    setDepth(0);
    setOxygen(OXYGEN_CONFIG.MAX_OXYGEN);
    setIsEmergency(false);
    setElapsedSeconds(0);
    sessionStartRef.current = null;
    accumulatedTimeRef.current = 0;
    hiddenAtRef.current = null;
    depthAtPenaltyRef.current = 0;
  }, []);

  // Depth calculation: 5 * engineLevel * (timeElapsed ^ 0.7)
  // Now preserves accumulated time across pauses
  useEffect(() => {
    if (!isDiving) {
      // When pausing, save accumulated time (don't reset!)
      if (sessionStartRef.current !== null) {
        const currentSegmentTime = (Date.now() - sessionStartRef.current) / 1000;
        accumulatedTimeRef.current += currentSegmentTime;
        sessionStartRef.current = null;
      }
      return;
    }

    // Resume diving - start new segment from now
    if (sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }

    const interval = setInterval(() => {
      if (sessionStartRef.current === null || isEmergency) return;

      // Total elapsed = accumulated from previous segments + current segment
      const currentSegmentTime = (Date.now() - sessionStartRef.current) / 1000;
      const totalElapsed = accumulatedTimeRef.current + currentSegmentTime;
      
      setElapsedSeconds(Math.floor(totalElapsed));
      
      // Depth based on total elapsed time (continuous dive)
      const newDepth = DEPTH_CONFIG.DEPTH_MULTIPLIER * engineLevel * Math.pow(totalElapsed, DEPTH_CONFIG.DEPTH_EXPONENT);
      setDepth(Math.floor(newDepth));
      depthAtPenaltyRef.current = newDepth;
    }, 100);

    return () => clearInterval(interval);
  }, [isDiving, engineLevel, isEmergency]);

  // Visibility change detection for oxygen penalty
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isDiving || isEmergency) return;

      if (document.hidden) {
        // User left - record the time
        hiddenAtRef.current = Date.now();
      } else if (hiddenAtRef.current !== null) {
        // User returned - calculate penalty
        const timeAwaySeconds = (Date.now() - hiddenAtRef.current) / 1000;
        const currentDepth = depthAtPenaltyRef.current;

        // Loss = TimeAway * PENALTY_MULTIPLIER * (1 + depth / DEPTH_PENALTY_DIVISOR)
        const loss = timeAwaySeconds * OXYGEN_CONFIG.PENALTY_MULTIPLIER * (1 + currentDepth / OXYGEN_CONFIG.DEPTH_PENALTY_DIVISOR);

        setOxygen((prev) => {
          const newOxygen = Math.max(0, prev - loss);
          if (newOxygen <= 0) {
            setIsEmergency(true);
          }
          return newOxygen;
        });

        hiddenAtRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isDiving, isEmergency]);

  return {
    depth,
    oxygen,
    isEmergency,
    elapsedSeconds,
    resetDive,
  };
};
