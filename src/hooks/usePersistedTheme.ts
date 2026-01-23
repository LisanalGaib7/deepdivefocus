import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Theme } from '@/hooks/useTheme';

export const usePersistedTheme = () => {
  const { profile, updateProfile, isAuthenticated } = useAuthContext();
  const [currentTheme, setCurrentTheme] = useState<Theme>('ocean');

  // Initialize theme from profile or localStorage
  useEffect(() => {
    if (isAuthenticated && profile?.theme_color) {
      setCurrentTheme(profile.theme_color as Theme);
      document.documentElement.setAttribute('data-theme', profile.theme_color);
      localStorage.setItem('deepDiveTheme', profile.theme_color);
    } else {
      const saved = localStorage.getItem('deepDiveTheme') as Theme | null;
      if (saved) {
        setCurrentTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      }
    }
  }, [isAuthenticated, profile?.theme_color]);

  // Update theme both locally and in database
  const setTheme = useCallback(async (theme: Theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('deepDiveTheme', theme);

    // Save to database if authenticated
    if (isAuthenticated) {
      await updateProfile({ theme_color: theme });
    }
  }, [isAuthenticated, updateProfile]);

  return { currentTheme, setTheme };
};
