import { useThemeContext } from "@/contexts/ThemeContext";

/**
 * Backwards-compatible hook name.
 * Theme state is now centralized in ThemeProvider.
 */
export const usePersistedTheme = () => {
  const { theme, setTheme } = useThemeContext();
  return { currentTheme: theme, setTheme };
};
