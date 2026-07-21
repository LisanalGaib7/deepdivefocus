import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readString, writeString } from "@/lib/storage/safeStorage";

export type SortMode = "priority" | "manual";

const isSortMode = (v: string | null): v is SortMode =>
  v === "priority" || v === "manual";

/**
 * Global sort-mode preference shared across Focus and Priority tabs.
 * Persisted in localStorage; syncs across hook instances via storage events.
 */
export const useSortMode = () => {
  const [mode, setModeState] = useState<SortMode>(() => {
    const raw = readString(STORAGE_KEYS.sortMode);
    return isSortMode(raw) ? raw : "priority";
  });

  const setMode = useCallback((next: SortMode) => {
    setModeState(next);
    writeString(STORAGE_KEYS.sortMode, next);
    // Notify sibling hook instances in the same tab.
    window.dispatchEvent(
      new CustomEvent("deepdive:sort-mode", { detail: next })
    );
  }, []);

  useEffect(() => {
    const onCustom = (e: Event) => {
      const next = (e as CustomEvent<SortMode>).detail;
      if (isSortMode(next)) setModeState(next);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.sortMode && isSortMode(e.newValue)) {
        setModeState(e.newValue);
      }
    };
    window.addEventListener("deepdive:sort-mode", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("deepdive:sort-mode", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { sortMode: mode, setSortMode: setMode };
};
