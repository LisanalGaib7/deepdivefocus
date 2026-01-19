import { useState, useEffect } from "react";

type Theme = "ocean" | "sage" | "rose" | "lavender" | "mono";

const themes: { id: Theme; label: string; colors: string[] }[] = [
  { id: "ocean", label: "Ocean", colors: ["#0ea5e9", "#3b82f6"] },
  { id: "sage", label: "Sage", colors: ["#86efac", "#22c55e"] },
  { id: "rose", label: "Rose", colors: ["#fda4af", "#f43f5e"] },
  { id: "lavender", label: "Lavender", colors: ["#c4b5fd", "#8b5cf6"] },
  { id: "mono", label: "Mono", colors: ["#e5e5e5", "#737373"] },
];

const ThemeSwitcher = () => {
  const [activeTheme, setActiveTheme] = useState<Theme>("ocean");

  useEffect(() => {
    const saved = localStorage.getItem("deepDiveTheme") as Theme | null;
    if (saved && themes.find((t) => t.id === saved)) {
      setActiveTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setActiveTheme(theme);
    localStorage.setItem("deepDiveTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => handleThemeChange(theme.id)}
          className={`group relative w-8 h-8 rounded-full transition-all duration-300 hover:scale-110 ${
            activeTheme === theme.id
              ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/50 scale-110"
              : ""
          }`}
          style={{
            background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
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
