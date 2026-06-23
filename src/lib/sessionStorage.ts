// Local-only fallback session log. Authenticated users go through
// useFocusSessions / Supabase; this is the guest-mode mirror used by
// useSessionStats so the UI behaves identically when offline.
export interface FocusSession {
  id: string;
  taskId: string | null;
  taskName: string;
  duration: number; // seconds
  timestamp: number; // Unix timestamp
}

const STORAGE_KEY = "deepDiveSessions";

export const getSessions = (): FocusSession[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const saveSessions = (sessions: FocusSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
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
