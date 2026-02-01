import { useState, useEffect, useRef, useCallback } from "react";
import { DEPTH_CONFIG, OXYGEN_CONFIG } from "@/constants/gameConfig";

interface UseGamificationProps {
  isDiving: boolean;
  engineLevel: number;
  hullLevel?: number; // For max depth calculation
}

interface UseGamificationReturn {
  depth: number;
  oxygen: number;
  isEmergency: boolean;
  elapsedSeconds: number;
  isAtMaxDepth: boolean;
  maxDepth: number;
  resetDive: () => void;
}

export const useGamification = ({
  isDiving,
  engineLevel,
  hullLevel = 1,
}: UseGamificationProps): UseGamificationReturn => {
  const [depth, setDepth] = useState(0);
  const [oxygen, setOxygen] = useState<number>(OXYGEN_CONFIG.MAX_OXYGEN);
  const [isEmergency, setIsEmergency] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAtMaxDepth, setIsAtMaxDepth] = useState(false);

  // Calculate max depth based on hull level
  const maxDepth = DEPTH_CONFIG.BASE_MAX_DEPTH + (hullLevel - 1) * DEPTH_CONFIG.DEPTH_PER_HULL_LEVEL;

  // Refs for tracking time - accumulate elapsed time across pauses
  const sessionStartRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0); // Time accumulated before current pause
  const hiddenAtRef = useRef<number | null>(null);
  const depthAtPenaltyRef = useRef<number>(0);

  // Track if we've shown the max depth toast
  const maxDepthToastShownRef = useRef(false);

  // Reset dive state - only called when mission completes or user explicitly resets
  const resetDive = useCallback(() => {
    setDepth(0);
    setOxygen(OXYGEN_CONFIG.MAX_OXYGEN);
    setIsEmergency(false);
    setElapsedSeconds(0);
    setIsAtMaxDepth(false);
    sessionStartRef.current = null;
    accumulatedTimeRef.current = 0;
    hiddenAtRef.current = null;
    depthAtPenaltyRef.current = 0;
    maxDepthToastShownRef.current = false;
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
      
      // Depth based on total elapsed time (continuous dive), capped at maxDepth
      const calculatedDepth = DEPTH_CONFIG.DEPTH_MULTIPLIER * engineLevel * Math.pow(totalElapsed, DEPTH_CONFIG.DEPTH_EXPONENT);
      const cappedDepth = Math.min(calculatedDepth, maxDepth);
      
      setDepth(Math.floor(cappedDepth));
      setIsAtMaxDepth(calculatedDepth >= maxDepth);
      depthAtPenaltyRef.current = cappedDepth;
    }, 100);

    return () => clearInterval(interval);
  }, [isDiving, engineLevel, isEmergency, maxDepth]);

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
    isAtMaxDepth,
    maxDepth,
    resetDive,
  };
};
