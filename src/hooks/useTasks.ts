 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuthContext } from '@/contexts/AuthContext';
 import { toast } from 'sonner';
 
export interface Task {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  time_spent_seconds: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

// Local task interface for guest mode compatibility
export interface LocalTask {
  id: string;
  text: string;
  isCompleted: boolean;
  timeSpentInSeconds: number;
  lastActiveDate: string;
  sortOrder: number;
}
 
 const GUEST_TASKS_KEY = 'deepDiveTasks';
 
 export const useTasks = () => {
   const { user, isGuestMode, isAuthenticated } = useAuthContext();
   const [tasks, setTasks] = useState<LocalTask[]>([]);
   const [loading, setLoading] = useState(true);
 
  // Get today's local date string
  const getTodayLocal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Convert DB task to local format, resetting time if date changed
  const dbToLocal = (dbTask: any): LocalTask => {
    const today = getTodayLocal();
    const needsReset = dbTask.last_active_date !== today;
    return {
      id: dbTask.id,
      text: dbTask.title,
      isCompleted: dbTask.is_completed,
      timeSpentInSeconds: needsReset ? 0 : dbTask.time_spent_seconds,
      lastActiveDate: needsReset ? today : (dbTask.last_active_date || today),
      sortOrder: dbTask.sort_order ?? 0,
    };
  };
 
   // Fetch tasks from database
   const fetchTasks = useCallback(async () => {
     if (!user || isGuestMode) {
        // Load from localStorage for guests, with daily reset
        const saved = localStorage.getItem(GUEST_TASKS_KEY);
        if (saved) {
          const today = getTodayLocal();
          const parsed: LocalTask[] = JSON.parse(saved);
          const resetTasks = parsed.map(t => 
            t.lastActiveDate !== today 
              ? { ...t, timeSpentInSeconds: 0, lastActiveDate: today } 
              : t
          );
          localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(resetTasks));
          setTasks(resetTasks);
        }
        setLoading(false);
        return;
     }
 
     const { data, error } = await supabase
       .from('tasks')
       .select('*')
       .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
 
      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } else {
        const localTasks = (data || []).map(dbToLocal);
        setTasks(localTasks);
        
        // Reset time in DB for tasks from a previous day
        const today = getTodayLocal();
        for (const dbTask of (data || [])) {
          if (dbTask.last_active_date !== today) {
            supabase
              .from('tasks')
              .update({ time_spent_seconds: 0, last_active_date: today } as any)
              .eq('id', dbTask.id)
              .eq('user_id', user!.id)
              .then();
          }
        }
      }
     setLoading(false);
   }, [user, isGuestMode]);
 
   // Add a new task
   const addTask = useCallback(async (title: string): Promise<LocalTask | null> => {
     if (!title.trim()) return null;
 
     if (!user || isGuestMode) {
       // Guest mode: local storage
         const newTask: LocalTask = {
           id: Date.now().toString(),
           text: title.trim(),
           isCompleted: false,
           timeSpentInSeconds: 0,
           lastActiveDate: getTodayLocal(),
           sortOrder: tasks.length,
         };
       setTasks(prev => {
         const updated = [...prev, newTask];
         localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(updated));
         return updated;
       });
       return newTask;
     }
 
     const { data, error } = await supabase
       .from('tasks')
       .insert({
         user_id: user.id,
         title: title.trim(),
       })
       .select()
       .single();
 
     if (error) {
       console.error('Error adding task:', error);
       toast.error('Failed to add task');
       return null;
     }
 
     const localTask = dbToLocal(data);
     setTasks(prev => [...prev, localTask]);
     return localTask;
   }, [user, isGuestMode]);
 
   // Update a task
   const updateTask = useCallback(async (
     taskId: string,
     updates: Partial<Pick<LocalTask, 'text' | 'isCompleted' | 'timeSpentInSeconds'>>
   ) => {
     if (!user || isGuestMode) {
       // Guest mode: local storage
       setTasks(prev => {
         const updated = prev.map(t =>
           t.id === taskId ? { ...t, ...updates } : t
         );
         localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(updated));
         return updated;
       });
       return;
     }
 
     const dbUpdates: Partial<Task> = {};
     if (updates.text !== undefined) dbUpdates.title = updates.text;
     if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
     if (updates.timeSpentInSeconds !== undefined) dbUpdates.time_spent_seconds = updates.timeSpentInSeconds;
 
     const { error } = await supabase
       .from('tasks')
       .update(dbUpdates)
       .eq('id', taskId)
       .eq('user_id', user.id);
 
     if (error) {
       console.error('Error updating task:', error);
       toast.error('Failed to update task');
       return;
     }
 
     // Update local state optimistically (realtime will also sync)
     setTasks(prev =>
       prev.map(t => (t.id === taskId ? { ...t, ...updates } : t))
     );
   }, [user, isGuestMode]);
 
   // Delete a task
   const deleteTask = useCallback(async (taskId: string) => {
     if (!user || isGuestMode) {
       // Guest mode: local storage
       setTasks(prev => {
         const updated = prev.filter(t => t.id !== taskId);
         localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(updated));
         return updated;
       });
       return;
     }
 
     const { error } = await supabase
       .from('tasks')
       .delete()
       .eq('id', taskId)
       .eq('user_id', user.id);
 
     if (error) {
       console.error('Error deleting task:', error);
       toast.error('Failed to delete task');
       return;
     }
 
     setTasks(prev => prev.filter(t => t.id !== taskId));
   }, [user, isGuestMode]);
 
   // Increment time spent (called every second during focus)
   const incrementTimeSpent = useCallback((taskId: string) => {
     setTasks(prev =>
       prev.map(t =>
         t.id === taskId
           ? { ...t, timeSpentInSeconds: t.timeSpentInSeconds + 1 }
           : t
       )
     );
   }, []);
 
    // Save accumulated time to database (call at session end)
    const saveTimeSpent = useCallback(async (taskId: string, totalSeconds: number) => {
      const today = getTodayLocal();
      
      if (!user || isGuestMode) {
        // Already saved in local state
        const saved = localStorage.getItem(GUEST_TASKS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = parsed.map((t: LocalTask) =>
            t.id === taskId ? { ...t, timeSpentInSeconds: totalSeconds, lastActiveDate: today } : t
          );
          localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(updated));
        }
        return;
      }

      await supabase
        .from('tasks')
        .update({ time_spent_seconds: totalSeconds, last_active_date: today } as any)
        .eq('id', taskId)
        .eq('user_id', user.id);
    }, [user, isGuestMode]);
 
   // Initial fetch
   useEffect(() => {
     fetchTasks();
   }, [fetchTasks]);
 
   // Realtime subscription for cross-device sync
   useEffect(() => {
     if (!user || isGuestMode) return;
 
     const channel = supabase
       .channel('tasks-realtime')
       .on(
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
           table: 'tasks',
           filter: `user_id=eq.${user.id}`,
         },
         (payload) => {
           if (payload.eventType === 'INSERT') {
             const newTask = dbToLocal(payload.new as Task);
             setTasks(prev => {
               // Avoid duplicates (in case we already added it optimistically)
               if (prev.some(t => t.id === newTask.id)) return prev;
               return [...prev, newTask];
             });
           } else if (payload.eventType === 'UPDATE') {
             const updated = dbToLocal(payload.new as Task);
             setTasks(prev =>
               prev.map(t => (t.id === updated.id ? updated : t))
             );
           } else if (payload.eventType === 'DELETE') {
             const deletedId = (payload.old as { id: string }).id;
             setTasks(prev => prev.filter(t => t.id !== deletedId));
           }
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [user, isGuestMode]);
 
    // Reorder tasks (drag and drop)
    const reorderTasks = useCallback(async (reordered: LocalTask[]) => {
      const updated = reordered.map((t, i) => ({ ...t, sortOrder: i }));
      setTasks(updated);

      if (!user || isGuestMode) {
        localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(updated));
        return;
      }

      // Batch update sort_order in DB
      for (let i = 0; i < updated.length; i++) {
        supabase
          .from('tasks')
          .update({ sort_order: i } as any)
          .eq('id', updated[i].id)
          .eq('user_id', user.id)
          .then();
      }
    }, [user, isGuestMode]);

    return {
      tasks,
      loading,
      addTask,
      updateTask,
      deleteTask,
      incrementTimeSpent,
      saveTimeSpent,
      reorderTasks,
      refetch: fetchTasks,
    };
  };