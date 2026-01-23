import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface FocusSessionDB {
  id: string;
  user_id: string;
  task_name: string;
  duration: number;
  depth_reached: number;
  pearls_earned: number;
  creature_id: string | null;
  session_date: string;
  created_at: string;
}

export const useFocusSessions = () => {
  const { user } = useAuthContext();

  // Fetch all sessions for the user
  const fetchSessions = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data as FocusSessionDB[];
  }, [user]);

  // Add a new session
  const addSession = useCallback(async (session: {
    task_name: string;
    duration: number;
    depth_reached: number;
    pearls_earned?: number;
    creature_id?: string | null;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        task_name: session.task_name,
        duration: session.duration,
        depth_reached: session.depth_reached,
        pearls_earned: session.pearls_earned || 0,
        creature_id: session.creature_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding session:', error);
      return { error };
    }

    return { data, error: null };
  }, [user]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('focus_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting session:', error);
      return { error };
    }

    return { error: null };
  }, [user]);

  return {
    fetchSessions,
    addSession,
    deleteSession,
  };
};
