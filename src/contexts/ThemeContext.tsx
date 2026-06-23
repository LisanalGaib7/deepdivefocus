import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { DEFAULT_THEME, isTheme, type Theme } from "@/theme/theme";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readString, writeString } from "@/lib/storage/safeStorage";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const readStoredTheme = (): Theme | null => {
  const raw = readString(STORAGE_KEYS.theme);
  return isTheme(raw) ? raw : null;
};

const applyThemeToDocument = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  // Also set on body to guarantee inheritance even if markup changes
  document.body?.setAttribute("data-theme", theme);
};


export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { profile, updateProfile, isAuthenticated, isGuestMode } = useAuthContext();

  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = readStoredTheme();
    if (stored) return stored;

    const fromDom = document.documentElement.getAttribute("data-theme");
    if (isTheme(fromDom)) return fromDom;

    return DEFAULT_THEME;
  });

  // Ensure theme is applied as early as possible during React lifecycle.
  useLayoutEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // If user has a saved theme in their profile AND no local theme exists yet,
  // hydrate from profile (without writing back remotely).
  useEffect(() => {
    if (!isAuthenticated || isGuestMode) return;
    if (!profile?.theme_color) return;

    const stored = readStoredTheme();
    if (stored) return; // local selection wins (prevents "reset to blue")

    const profileTheme = profile.theme_color;
    if (!isTheme(profileTheme)) return;

    setThemeState(profileTheme);
    applyThemeToDocument(profileTheme);
    writeString(STORAGE_KEYS.theme, profileTheme);

  }, [isAuthenticated, isGuestMode, profile?.theme_color]);

  const setTheme = useCallback(
    async (next: Theme) => {
      setThemeState(next);
      applyThemeToDocument(next);
      writeString(STORAGE_KEYS.theme, next);


      // Persist remotely for authenticated (non-guest) users.
      if (isAuthenticated && !isGuestMode) {
        await updateProfile({ theme_color: next });
      }
    },
    [isAuthenticated, isGuestMode, updateProfile],
  );

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
};
