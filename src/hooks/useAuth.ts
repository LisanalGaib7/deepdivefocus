import { useState, useEffect, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export type AuthUser = User;
export type AuthSession = Session;

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  theme_color: string;
  total_pearls: number;
  total_depth: number;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.error("useAuth", "Error fetching profile:", error);
      return null;
    }
    return data as UserProfile | null;
  }, []);

  // Update profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      // Guest mode: update in-memory profile only
      if (isGuestMode) {
        setProfile((prev) =>
          prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : prev,
        );
        return { error: null };
      }

      if (!user) return { error: new Error("Not authenticated") };

      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);

      if (error) {
        logger.error("useAuth", "Error updating profile:", error);
        return { error };
      }

      // Refresh profile
      const newProfile = await fetchProfile(user.id);
      if (newProfile) setProfile(newProfile);

      return { error: null };
    },
    [user, isGuestMode, fetchProfile],
  );

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) return { error };
    return { data, error: null };
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    return { data, error: null };
  }, []);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      toast.error("Google sign-in failed", { description: error.message });
      return { error };
    }

    return { error: null };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (isGuestMode) {
      setIsGuestMode(false);
      setProfile(null);
      toast.info("Guest session ended");
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Sign out failed", { description: error.message });
      return { error };
    }

    setUser(null);
    setSession(null);
    setProfile(null);
    return { error: null };
  }, [isGuestMode]);

  // Sign in as guest (demo mode)
  const signInAsGuest = useCallback(() => {
    const mockProfile: UserProfile = {
      id: "guest-profile",
      user_id: "guest-user",
      display_name: "Guest Pilot",
      avatar_url: null,
      theme_color: "ocean",
      total_pearls: 0,
      total_depth: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProfile(mockProfile);
    setIsGuestMode(true);
    toast.success("Welcome aboard, Guest Pilot!", {
      description: "Demo mode - data will not be saved",
    });
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // Defer profile fetch with setTimeout to avoid deadlock
      if (currentSession?.user) {
        setTimeout(() => {
          fetchProfile(currentSession.user.id).then(setProfile);
        }, 0);
      } else {
        setProfile(null);
      }

      if (event === "SIGNED_IN") {
        toast.success("Welcome aboard, Captain!");
      } else if (event === "SIGNED_OUT") {
        toast.info("Surfaced successfully");
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data }) => {
      const currentSession = data.session;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, [fetchProfile]);

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!session || isGuestMode,
    isGuestMode,
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    updateProfile,
    refetchProfile: () => user && fetchProfile(user.id).then(setProfile),
  };
};
