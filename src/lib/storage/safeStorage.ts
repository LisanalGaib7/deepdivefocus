/**
 * SSR-safe, exception-safe wrapper around localStorage.
 * All persistence in the app should go through here (or a domain store that wraps it).
 *
 * Why: localStorage throws in private/quota-exceeded mode, is undefined on the server,
 * and silently corrupts when JSON is malformed. Centralising the handling keeps callers clean.
 */

const isBrowser =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage disabled — ignore */
  }
}

export function readString(key: string, fallback: string | null = null): string | null {
  if (!isBrowser) return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeString(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
