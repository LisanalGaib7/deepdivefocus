// Session data structure
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
    return JSON.parse(saved);
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

// Generate mock data for the last 7 days
export const generateMockData = (): FocusSession[] => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const tasks = [
    { id: "mock-1", name: "Project Planning" },
    { id: "mock-2", name: "Deep Work Session" },
    { id: "mock-3", name: "Learning & Research" },
    { id: "mock-4", name: "Writing & Documentation" },
    { id: "mock-5", name: "Creative Work" },
  ];

  const sessions: FocusSession[] = [];

  for (let day = 6; day >= 0; day--) {
    const dayTimestamp = now - day * oneDay;
    // Random 1-4 sessions per day
    const sessionsCount = Math.floor(Math.random() * 4) + 1;

    for (let s = 0; s < sessionsCount; s++) {
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      const duration = (Math.floor(Math.random() * 6) + 1) * 5 * 60; // 5-30 mins
      sessions.push({
        id: `mock-${day}-${s}`,
        taskId: task.id,
        taskName: task.name,
        duration,
        timestamp: dayTimestamp + s * 60 * 60 * 1000, // Spread sessions across day
      });
    }
  }

  return sessions;
};

// Initialize with mock data if empty
export const initializeSessions = (): FocusSession[] => {
  let sessions = getSessions();
  if (sessions.length === 0) {
    sessions = generateMockData();
    saveSessions(sessions);
  }
  return sessions;
};
