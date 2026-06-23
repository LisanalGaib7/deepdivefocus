// Local-only fallback session log. Authenticated users go through
// useFocusSessions / Supabase; this is the guest-mode mirror used by
// useSessionStats so the UI behaves identically when offline.
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJSON, writeJSON } from "@/lib/storage/safeStorage";

export interface FocusSession {
  id: string;
  taskId: string | null;
  taskName: string;
  duration: number; // seconds
  timestamp: number; // Unix timestamp
}

export const getSessions = (): FocusSession[] =>
  readJSON<FocusSession[]>(STORAGE_KEYS.sessions, []);

export const saveSessions = (sessions: FocusSession[]) => {
  writeJSON(STORAGE_KEYS.sessions, sessions);
};

export const addSession = (session: Omit<FocusSession, "id">) => {
  const sessions = getSessions();
  const newSession: FocusSession = {
    ...session,
    id: Date.now().toString(),
  };
  sessions.push(newSession);
  saveSessions(sessions);
  return newSession;
};
