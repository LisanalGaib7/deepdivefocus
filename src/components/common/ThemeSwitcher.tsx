import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Theme } from "@/hooks/useTheme";

const themes: { id: Theme; label: string; colors: string[] }[] = [
  { id: "ocean", label: "Ocean", colors: ["#0ea5e9", "#3b82f6"] },
  { id: "sage", label: "Sage", colors: ["#86efac", "#22c55e"] },
  { id: "rose", label: "Rose", colors: ["#fda4af", "#f43f5e"] },
  { id: "lavender", label: "Lavender", colors: ["#c4b5fd", "#8b5cf6"] },
  { id: "mono", label: "Mono", colors: ["#e5e5e5", "#737373"] },
];

const ThemeSwitcher = () => {
  const [activeTheme, setActiveTheme] = useState<Theme>("ocean");
  const { profile, updateProfile, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Load theme from profile if authenticated, otherwise from localStorage
    if (isAuthenticated && profile?.theme_color) {
      const theme = profile.theme_color as Theme;
      if (themes.find((t) => t.id === theme)) {
        setActiveTheme(theme);
        document.documentElement.setAttribute("data-theme", theme);
      }
    } else {
      const saved = localStorage.getItem("deepDiveTheme") as Theme | null;
      if (saved && themes.find((t) => t.id === saved)) {
        setActiveTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    }
  }, [isAuthenticated, profile?.theme_color]);

  const handleThemeChange = async (theme: Theme) => {
    setActiveTheme(theme);
    localStorage.setItem("deepDiveTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);

    // Save to database if authenticated
    if (isAuthenticated) {
      await updateProfile({ theme_color: theme });
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => handleThemeChange(theme.id)}
          className={`group relative w-5 h-5 rounded-full transition-all duration-300 ${
            activeTheme === theme.id
              ? "ring-2 ring-offset-2 ring-offset-background ring-white/60 scale-125 shadow-[0_0_12px_2px] opacity-100"
              : "opacity-40 hover:opacity-70 hover:scale-110"
          }`}
          style={{
            background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
            boxShadow: activeTheme === theme.id ? `0 0 12px 2px ${theme.colors[0]}` : undefined,
          }}
          title={theme.label}
        >
          <span className="sr-only">{theme.label} theme</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
