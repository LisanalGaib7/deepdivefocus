import { useState, useEffect, useRef, useCallback } from "react";

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
  const [oxygen, setOxygen] = useState(100);
  const [isEmergency, setIsEmergency] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const hiddenAtRef = useRef<number | null>(null);
  const depthAtPenaltyRef = useRef<number>(0);

  // Reset dive state
  const resetDive = useCallback(() => {
    setDepth(0);
    setOxygen(100);
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
      const newDepth = 5 * engineLevel * Math.pow(elapsedSeconds, 0.7);
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

        // Loss = TimeAwaySeconds * 5 * (1 + CurrentDepth / 500)
        const loss = timeAwaySeconds * 5 * (1 + currentDepth / 500);

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
