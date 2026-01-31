import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusSessions, FocusSessionDB } from './useFocusSessions';
import { useAuthContext } from '@/contexts/AuthContext';
import { getSessions, addSession as addLocalSession, FocusSession } from '@/lib/sessionStorage';

export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

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
  getTaskTodayMinutes: (taskName: string) => number;
  getFilteredStats: (range: TimeRange) => FilteredStats;
  addLocalFocusSession: (session: Omit<FocusSession, 'id'>) => void;
}

export interface FilteredStats {
  sessions: Array<{ id: string; taskName: string; duration: number; timestamp: number }>;
  totalMinutes: number;
  totalSessions: number;
  avgSessionLength: number;
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

  // Get total minutes for a specific task (by name) - ALL TIME
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

  // Get TODAY's minutes for a specific task (daily reset mode)
  const getTaskTodayMinutes = useCallback((taskName: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    if (isAuthenticated && !isGuestMode) {
      return Math.round(
        sessions
          .filter(s => s.task_name === taskName && new Date(s.session_date).getTime() >= todayTimestamp)
          .reduce((sum, s) => sum + s.duration / 60, 0)
      );
    } else {
      return Math.round(
        localSessions
          .filter(s => s.taskName === taskName && s.timestamp >= todayTimestamp)
          .reduce((sum, s) => sum + s.duration / 60, 0)
      );
    }
  }, [sessions, localSessions, isAuthenticated, isGuestMode]);

  // Get filtered stats by time range (for History page)
  const getFilteredStats = useCallback((range: TimeRange): FilteredStats => {
    const now = new Date();
    let startTimestamp: number;
    
    switch (range) {
      case 'today':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        startTimestamp = today.getTime();
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startTimestamp = startOfWeek.getTime();
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startTimestamp = startOfMonth.getTime();
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startTimestamp = startOfYear.getTime();
        break;
      case 'all':
      default:
        startTimestamp = 0;
        break;
    }
    
    // Normalize sessions to common format
    const normalizedSessions = isAuthenticated && !isGuestMode
      ? sessions.map(s => ({
          id: s.id,
          taskName: s.task_name,
          duration: s.duration,
          timestamp: new Date(s.session_date).getTime(),
        }))
      : localSessions.map(s => ({
          id: s.id,
          taskName: s.taskName,
          duration: s.duration,
          timestamp: s.timestamp,
        }));
    
    // Filter by time range
    const filteredSessions = normalizedSessions.filter(s => s.timestamp >= startTimestamp);
    
    const totalMins = Math.round(filteredSessions.reduce((sum, s) => sum + s.duration / 60, 0));
    const count = filteredSessions.length;
    
    return {
      sessions: filteredSessions,
      totalMinutes: totalMins,
      totalSessions: count,
      avgSessionLength: count > 0 ? Math.round(totalMins / count) : 0,
    };
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
    getTaskTodayMinutes,
    getFilteredStats,
    addLocalFocusSession,
  };
};
