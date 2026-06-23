import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJSON, writeJSON } from '@/lib/storage/safeStorage';
import { CREATURES } from '@/data/creatures';

// TEMP DEV: unlock every creature in the preview. Toggle in browser console:
//   localStorage.setItem('devUnlockAll', '1')  // enable
//   localStorage.removeItem('devUnlockAll')    // disable
// Also auto-enabled with ?unlockAll=1 in the URL.
const isDevUnlockAll = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage.getItem('devUnlockAll') === '1') return true;
    if (new URLSearchParams(window.location.search).get('unlockAll') === '1') {
      window.localStorage.setItem('devUnlockAll', '1');
      return true;
    }
  } catch {}
  return false;
};


export interface UserCreatureDB {
  id: string;
  user_id: string;
  creature_id: string;
  unlocked_at: string;
}

const getGuestCreatures = (): string[] =>
  readJSON<string[]>(STORAGE_KEYS.guestCreatures, []);

const saveGuestCreature = (creatureId: string) => {
  const existing = getGuestCreatures();
  if (!existing.includes(creatureId)) {
    existing.push(creatureId);
    writeJSON(STORAGE_KEYS.guestCreatures, existing);
  }
};


export const useUserCreatures = () => {
  const { user, isGuestMode } = useAuthContext();

  // Fetch all creatures for the user
  const fetchCreatures = useCallback(async (): Promise<UserCreatureDB[]> => {
    if (isDevUnlockAll()) {
      return CREATURES.map((c) => ({
        id: `dev-${c.id}`,
        user_id: user?.id ?? 'dev-user',
        creature_id: c.id,
        unlocked_at: new Date().toISOString(),
      }));
    }

    if (isGuestMode) {
      return getGuestCreatures().map(id => ({
        id: `guest-${id}`,
        user_id: 'guest-user',
        creature_id: id,
        unlocked_at: new Date().toISOString(),
      }));
    }

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
  }, [user, isGuestMode]);

  // Add a creature to collection
  const addCreature = useCallback(async (creatureId: string) => {
    if (isGuestMode) {
      const existing = getGuestCreatures();
      const alreadyExists = existing.includes(creatureId);
      if (!alreadyExists) saveGuestCreature(creatureId);
      return { data: { creature_id: creatureId }, error: null, alreadyExists };
    }

    if (!user) return { error: new Error('Not authenticated') };

    // Check if already exists
    const { data: existing } = await supabase
      .from('user_creatures')
      .select('id')
      .eq('user_id', user.id)
      .eq('creature_id', creatureId)
      .maybeSingle();

    if (existing) {
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
  }, [user, isGuestMode]);

  // Check if creature is collected
  const isCreatureCollected = useCallback(async (creatureId: string) => {
    if (isGuestMode) {
      return getGuestCreatures().includes(creatureId);
    }

    if (!user) return false;

    const { data } = await supabase
      .from('user_creatures')
      .select('id')
      .eq('user_id', user.id)
      .eq('creature_id', creatureId)
      .maybeSingle();

    return !!data;
  }, [user, isGuestMode]);

  return {
    fetchCreatures,
    addCreature,
    isCreatureCollected,
  };
};
