import { themes, type Theme } from "@/hooks/useTheme";
import { useThemeContext } from "@/contexts/ThemeContext";

const ThemeSwitcher = () => {
  const { theme: activeTheme, setTheme } = useThemeContext();

  const handleThemeChange = (next: Theme) => {
    void setTheme(next);
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
