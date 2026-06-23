/**
 * useUpgradeLevels — persists engine/hull tier in localStorage via safeStorage.
 *
 * Same source of truth for guest and authenticated users today; when we move
 * upgrade levels into the DB, swap this hook's internals without touching
 * callers.
 */
import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readString, writeString } from "@/lib/storage/safeStorage";

const readLevel = (key: string): number => {
  const saved = readString(key);
  return saved ? parseInt(saved, 10) || 1 : 1;
};

export const useUpgradeLevels = () => {
  const [engineLevel, setEngineLevel] = useState<number>(() => readLevel(STORAGE_KEYS.engineLevel));
  const [hullLevel, setHullLevel] = useState<number>(() => readLevel(STORAGE_KEYS.hullLevel));

  useEffect(() => {
    writeString(STORAGE_KEYS.engineLevel, String(engineLevel));
  }, [engineLevel]);

  useEffect(() => {
    writeString(STORAGE_KEYS.hullLevel, String(hullLevel));
  }, [hullLevel]);

  return { engineLevel, setEngineLevel, hullLevel, setHullLevel };
};
