import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusSessions, FocusSessionDB } from './useFocusSessions';
import { useAuthContext } from '@/contexts/AuthContext';

export interface SessionStats {
  sessions: FocusSessionDB[];
  todayMinutes: number;
  weeklyMinutes: number;
  totalMinutes: number;
  totalSessions: number;
  avgSessionLength: number;
  loading: boolean;
  refetch: () => Promise<void>;
  getTaskTotalMinutes: (taskName: string) => number;
}

export const useSessionStats = (): SessionStats => {
  const { isAuthenticated } = useAuthContext();
  const { fetchSessions } = useFocusSessions();
  
  const [sessions, setSessions] = useState<FocusSessionDB[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    if (!isAuthenticated) {
      setSessions([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const data = await fetchSessions();
    setSessions(data);
    setLoading(false);
  }, [isAuthenticated, fetchSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Today's focus time (since 00:00 local time)
  const todayMinutes = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    return Math.round(
      sessions
        .filter(s => new Date(s.session_date).getTime() >= todayTimestamp)
        .reduce((sum, s) => sum + s.duration / 60, 0)
    );
  }, [sessions]);

  // This week's focus time (Sunday to Saturday)
  const weeklyMinutes = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    return Math.round(
      sessions
        .filter(s => new Date(s.session_date).getTime() >= startOfWeek.getTime())
        .reduce((sum, s) => sum + s.duration / 60, 0)
    );
  }, [sessions]);

  // Total focus time (all time)
  const totalMinutes = useMemo(() => {
    return Math.round(
      sessions.reduce((sum, s) => sum + s.duration / 60, 0)
    );
  }, [sessions]);

  // Total session count
  const totalSessions = sessions.length;

  // Average session length
  const avgSessionLength = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.round(totalMinutes / sessions.length);
  }, [sessions, totalMinutes]);

  // Get total minutes for a specific task (by name)
  const getTaskTotalMinutes = useCallback((taskName: string): number => {
    return Math.round(
      sessions
        .filter(s => s.task_name === taskName)
        .reduce((sum, s) => sum + s.duration / 60, 0)
    );
  }, [sessions]);

  return {
    sessions,
    todayMinutes,
    weeklyMinutes,
    totalMinutes,
    totalSessions,
    avgSessionLength,
    loading,
    refetch: loadSessions,
    getTaskTotalMinutes,
  };
};
