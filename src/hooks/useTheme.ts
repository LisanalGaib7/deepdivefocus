import { useThemeContext } from "@/contexts/ThemeContext";
import { themes, type Theme } from "@/theme/theme";

export type { Theme } from "@/theme/theme";
export { themes };

// Get HSL color string for each theme's primary
export const getThemePrimaryHsl = (theme: Theme): string => {
  const hslMap: Record<Theme, string> = {
    ocean: "hsl(199, 89%, 48%)",
    sage: "hsl(142, 69%, 58%)",
    rose: "hsl(8, 60%, 58%)",
    lavender: "hsl(270, 67%, 77%)",
    mono: "hsl(0, 0%, 85%)",
  };
  return hslMap[theme];
};

// Get hex color for recharts
export const getThemePrimaryHex = (theme: Theme): string => {
  const hexMap: Record<Theme, string> = {
    ocean: "#0ea5e9",
    sage: "#4ade80",
    rose: "#c9604a",
    lavender: "#c4b5fd",
    mono: "#d9d9d9",
  };
  return hexMap[theme];
};

// Get secondary shade for charts
export const getThemeSecondaryHex = (theme: Theme): string => {
  const hexMap: Record<Theme, string> = {
    ocean: "#3b82f6",
    sage: "#22c55e",
    rose: "#993428",
    lavender: "#8b5cf6",
    mono: "#a3a3a3",
  };
  return hexMap[theme];
};

// Get 5-color palette for donut charts (gradient from bright to deep)
export const getThemePalette = (theme: Theme): string[] => {
  const palettes: Record<Theme, string[]> = {
    ocean: ['#BAE6FD', '#7DD3FC', '#0EA5E9', '#0284C7', '#0369A1'],
    sage: ['#86EFAC', '#4ADE80', '#22C55E', '#166534', '#15803D'],
    rose: ['#F87171', '#EF4444', '#B91C1C', '#7F1D1D', '#991B1B'],
    lavender: ['#D8B4FE', '#A855F7', '#7E22CE', '#581C87', '#6B21A8'],
    mono: ['#94A3B8', '#64748B', '#475569', '#1E293B', '#334155'],
  };
  return palettes[theme];
};

export const useTheme = () => {
  const { theme } = useThemeContext();
  return { currentTheme: theme };
};
