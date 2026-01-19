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
  resetDive: () => void;
}

export const useGamification = ({
  isDiving,
  engineLevel,
}: UseGamificationProps): UseGamificationReturn => {
  const [depth, setDepth] = useState(0);
  const [oxygen, setOxygen] = useState<number>(OXYGEN_CONFIG.MAX_OXYGEN);
  const [isEmergency, setIsEmergency] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const hiddenAtRef = useRef<number | null>(null);
  const depthAtPenaltyRef = useRef<number>(0);

  // Reset dive state
  const resetDive = useCallback(() => {
    setDepth(0);
    setOxygen(OXYGEN_CONFIG.MAX_OXYGEN);
    setIsEmergency(false);
    startTimeRef.current = null;
    hiddenAtRef.current = null;
    depthAtPenaltyRef.current = 0;
  }, []);

  // Depth calculation: 5 * engineLevel * (timeElapsed ^ 0.7)
  useEffect(() => {
    if (!isDiving) {
      startTimeRef.current = null;
      return;
    }

    // Set start time when diving begins
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      if (startTimeRef.current === null || isEmergency) return;

      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const newDepth = DEPTH_CONFIG.DEPTH_MULTIPLIER * engineLevel * Math.pow(elapsedSeconds, DEPTH_CONFIG.DEPTH_EXPONENT);
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
    resetDive,
  };
};
