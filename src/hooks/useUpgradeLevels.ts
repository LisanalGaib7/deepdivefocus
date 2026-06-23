/**
 * useUpgradeLevels — persists engine/hull tier in localStorage.
 *
 * Same source of truth for guest and authenticated users today; when we move
 * upgrade levels into the DB, swap this hook's internals without touching
 * callers.
 */
import { useEffect, useState } from "react";

const ENGINE_KEY = "deepdive_engine_level";
const HULL_KEY = "deepdive_hull_level";

const readLevel = (key: string): number => {
  const saved = localStorage.getItem(key);
  return saved ? parseInt(saved, 10) || 1 : 1;
};

export const useUpgradeLevels = () => {
  const [engineLevel, setEngineLevel] = useState<number>(() => readLevel(ENGINE_KEY));
  const [hullLevel, setHullLevel] = useState<number>(() => readLevel(HULL_KEY));

  useEffect(() => {
    localStorage.setItem(ENGINE_KEY, String(engineLevel));
  }, [engineLevel]);

  useEffect(() => {
    localStorage.setItem(HULL_KEY, String(hullLevel));
  }, [hullLevel]);

  return { engineLevel, setEngineLevel, hullLevel, setHullLevel };
};
