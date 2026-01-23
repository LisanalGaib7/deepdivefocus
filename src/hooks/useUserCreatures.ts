import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface UserCreatureDB {
  id: string;
  user_id: string;
  creature_id: string;
  unlocked_at: string;
}

export const useUserCreatures = () => {
  const { user } = useAuthContext();

  // Fetch all creatures for the user
  const fetchCreatures = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_creatures')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching creatures:', error);
      return [];
    }

    return data as UserCreatureDB[];
  }, [user]);

  // Add a creature to collection
  const addCreature = useCallback(async (creatureId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Check if already exists
    const { data: existing } = await supabase
      .from('user_creatures')
      .select('id')
      .eq('user_id', user.id)
      .eq('creature_id', creatureId)
      .maybeSingle();

    if (existing) {
      // Already collected
      return { data: existing, error: null, alreadyExists: true };
    }

    const { data, error } = await supabase
      .from('user_creatures')
      .insert({
        user_id: user.id,
        creature_id: creatureId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding creature:', error);
      return { error };
    }

    return { data, error: null, alreadyExists: false };
  }, [user]);

  // Check if creature is collected
  const isCreatureCollected = useCallback(async (creatureId: string) => {
    if (!user) return false;

    const { data } = await supabase
      .from('user_creatures')
      .select('id')
      .eq('user_id', user.id)
      .eq('creature_id', creatureId)
      .maybeSingle();

    return !!data;
  }, [user]);

  return {
    fetchCreatures,
    addCreature,
    isCreatureCollected,
  };
};
