import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusSessions, FocusSessionDB } from './useFocusSessions';
import { useAuthContext } from '@/contexts/AuthContext';
import { getSessions, addSession as addLocalSession, FocusSession } from '@/lib/sessionStorage';

export interface SessionStats {
  sessions: FocusSessionDB[];
  localSessions: FocusSession[];
  todayMinutes: number;
  weeklyMinutes: number;
  totalMinutes: number;
  totalSessions: number;
  avgSessionLength: number;
  loading: boolean;
  refetch: () => Promise<void>;
  getTaskTotalMinutes: (taskName: string) => number;
  addLocalFocusSession: (session: Omit<FocusSession, 'id'>) => void;
}

export const useSessionStats = (): SessionStats => {
  const { isAuthenticated, isGuestMode } = useAuthContext();
  const { fetchSessions } = useFocusSessions();
  
  const [sessions, setSessions] = useState<FocusSessionDB[]>([]);
  const [localSessions, setLocalSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sessions based on auth mode
  const loadSessions = useCallback(async () => {
    setLoading(true);
    
    if (isAuthenticated && !isGuestMode) {
      // Authenticated: load from database
      const data = await fetchSessions();
      setSessions(data);
      setLocalSessions([]);
    } else {
      // Guest mode: load from localStorage
      const local = getSessions();
      setLocalSessions(local);
      setSessions([]);
    }
    
    setLoading(false);
  }, [isAuthenticated, isGuestMode, fetchSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Add a local session (guest mode)
  const addLocalFocusSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    const newSession = addLocalSession(session);
    console.log('[SessionStats] Added local session:', newSession);
    setLocalSessions(prev => [...prev, newSession]);
  }, []);

  // Get today's date string for comparison (YYYY-MM-DD format)
  const getTodayString = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Today's focus time (since 00:00 local time)
  const todayMinutes = useMemo(() => {
    const todayStr = getTodayString();
    
    if (isAuthenticated && !isGuestMode) {
      // Database sessions: session_date is a full timestamp
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();
      
      return Math.round(
        sessions
          .filter(s => new Date(s.session_date).getTime() >= todayTimestamp)
          .reduce((sum, s) => sum + s.duration / 60, 0)
      );
    } else {
      // Local sessions: compare by date string derived from timestamp
      return Math.round(
        localSessions
          .filter(s => new Date(s.timestamp).toISOString().split('T')[0] === todayStr)
          .reduce((sum, s) => sum + s.duration / 60, 0)
      );
    }
  }, [sessions, localSessions, isAuthenticated, isGuestMode, getTodayString]);

  // This week's focus time (Sunday to Saturday)
  const weeklyMinutes = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekTime = startOfWeek.getTime();
    
    if (isAuthenticated && !isGuestMode) {
      return Math.round(
        sessions
          .filter(s => new Date(s.session_date).getTime() >= startOfWeekTime)
          .reduce((sum, s) => sum + s.duration / 60, 0)
      );
    } else {
      return Math.round(
        localSessions
          .filter(s => s.timestamp >= startOfWeekTime)
          .reduce((sum, s) => sum + s.duration / 60, 0)
      );
    }
  }, [sessions, localSessions, isAuthenticated, isGuestMode]);

  // Total focus time (all time)
  const totalMinutes = useMemo(() => {
    if (isAuthenticated && !isGuestMode) {
      return Math.round(
        sessions.reduce((sum, s) => sum + s.duration / 60, 0)
      );
    } else {
      return Math.round(
        localSessions.reduce((sum, s) => sum + s.duration / 60, 0)
      );
    }
  }, [sessions, localSessions, isAuthenticated, isGuestMode]);

  // Total session count
  const totalSessions = isAuthenticated && !isGuestMode ? sessions.length : localSessions.length;

  // Average session length
  const avgSessionLength = useMemo(() => {
    const count = totalSessions;
    if (count === 0) return 0;
    return Math.round(totalMinutes / count);
  }, [totalSessions, totalMinutes]);

  // Get total minutes for a specific task (by name)
  const getTaskTotalMinutes = useCallback((taskName: string): number => {
    if (isAuthenticated && !isGuestMode) {
      return Math.round(
        sessions
          .filter(s => s.task_name === taskName)
          .reduce((sum, s) => sum + s.duration / 60, 0)
      );
    } else {
      return Math.round(
        localSessions
          .filter(s => s.taskName === taskName)
          .reduce((sum, s) => sum + s.duration / 60, 0)
      );
    }
  }, [sessions, localSessions, isAuthenticated, isGuestMode]);

  return {
    sessions,
    localSessions,
    todayMinutes,
    weeklyMinutes,
    totalMinutes,
    totalSessions,
    avgSessionLength,
    loading,
    refetch: loadSessions,
    getTaskTotalMinutes,
    addLocalFocusSession,
  };
};
