import { useState, useEffect } from "react";

export type Theme = "ocean" | "sage" | "rose" | "lavender" | "mono";

export const themes: { id: Theme; label: string; colors: string[] }[] = [
  { id: "ocean", label: "Ocean", colors: ["#0ea5e9", "#3b82f6"] },
  { id: "sage", label: "Sage", colors: ["#86efac", "#22c55e"] },
  { id: "rose", label: "Rose", colors: ["#fda4af", "#f43f5e"] },
  { id: "lavender", label: "Lavender", colors: ["#c4b5fd", "#8b5cf6"] },
  { id: "mono", label: "Mono", colors: ["#e5e5e5", "#737373"] },
];

// Get HSL color string for each theme's primary
export const getThemePrimaryHsl = (theme: Theme): string => {
  const hslMap: Record<Theme, string> = {
    ocean: "hsl(199, 89%, 48%)",
    sage: "hsl(142, 69%, 58%)",
    rose: "hsl(350, 89%, 72%)",
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
    rose: "#fda4af",
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
    rose: "#f43f5e",
    lavender: "#8b5cf6",
    mono: "#a3a3a3",
  };
  return hexMap[theme];
};

// Get 5-color palette for donut charts (gradient from bright to deep)
export const getThemePalette = (theme: Theme): string[] => {
  const palettes: Record<Theme, string[]> = {
    ocean: ['#00F0FF', '#0EA5E9', '#2563EB', '#1E40AF', '#172554'],
    sage: ['#4ADE80', '#22C55E', '#16A34A', '#15803D', '#14532D'],
    rose: ['#FDBA74', '#FB923C', '#F97316', '#EA580C', '#9A3412'],
    lavender: ['#D8B4FE', '#C084FC', '#A855F7', '#7E22CE', '#581C87'],
    mono: ['#FFFFFF', '#D4D4D4', '#A3A3A3', '#737373', '#404040'],
  };
  return palettes[theme];
};

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>("ocean");

  useEffect(() => {
    const saved = localStorage.getItem("deepDiveTheme") as Theme | null;
    if (saved && themes.find((t) => t.id === saved)) {
      setCurrentTheme(saved);
    }

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute("data-theme") as Theme;
      if (theme && themes.find((t) => t.id === theme)) {
        setCurrentTheme(theme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return { currentTheme };
};
