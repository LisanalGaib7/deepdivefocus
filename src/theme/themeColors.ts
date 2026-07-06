import type { Theme } from "@/theme/theme";

/**
 * Per-theme Tailwind/CSS color descriptor used by feature pages that need to
 * paint their own gradients, glows and depth text (e.g. the Bestiary).
 *
 * Extracted from src/pages/Collection.tsx so any other page can reuse the
 * same palette map — keep new callers going through here rather than
 * hand-rolling a second copy.
 */
export interface ThemeColorTokens {
  primary: string;
  primaryHex: string;
  gradient: string;
  glow: string;
  glowRgba: string;
  border: string;
  text: string;
  bg: string;
  bgLight: string;
  bullet: string;
  depthText: string;
}

const THEME_COLOR_MAP: Record<Theme, ThemeColorTokens> = {
  ocean: {
    primary: "cyan",
    primaryHex: "#22d3ee",
    gradient: "from-cyan-600 to-cyan-400",
    glow: "rgba(34, 211, 238, 0.8)",
    glowRgba: "rgba(34, 211, 238, 0.3)",
    border: "border-cyan-500",
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    bgLight: "bg-cyan-900/20",
    bullet: "text-cyan-700",
    depthText: "text-cyan-600",
  },
  sage: {
    primary: "green",
    primaryHex: "#4ade80",
    gradient: "from-green-600 to-green-400",
    glow: "rgba(74, 222, 128, 0.8)",
    glowRgba: "rgba(74, 222, 128, 0.3)",
    border: "border-green-500",
    text: "text-green-400",
    bg: "bg-green-500/10",
    bgLight: "bg-green-900/20",
    bullet: "text-green-700",
    depthText: "text-green-600",
  },
  rose: {
    primary: "rose",
    primaryHex: "#fb7185",
    gradient: "from-rose-600 to-rose-400",
    glow: "rgba(251, 113, 133, 0.8)",
    glowRgba: "rgba(251, 113, 133, 0.3)",
    border: "border-rose-500",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    bgLight: "bg-rose-900/20",
    bullet: "text-rose-700",
    depthText: "text-rose-600",
  },
  lavender: {
    primary: "violet",
    primaryHex: "#a78bfa",
    gradient: "from-violet-600 to-violet-400",
    glow: "rgba(167, 139, 250, 0.8)",
    glowRgba: "rgba(167, 139, 250, 0.3)",
    border: "border-violet-500",
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    bgLight: "bg-violet-900/20",
    bullet: "text-violet-700",
    depthText: "text-violet-600",
  },
  mono: {
    primary: "gray",
    primaryHex: "#a3a3a3",
    gradient: "from-gray-500 to-gray-300",
    glow: "rgba(163, 163, 163, 0.8)",
    glowRgba: "rgba(163, 163, 163, 0.3)",
    border: "border-gray-500",
    text: "text-gray-400",
    bg: "bg-gray-500/10",
    bgLight: "bg-gray-800/20",
    bullet: "text-gray-600",
    depthText: "text-gray-500",
  },
};

export const getThemeColors = (theme: Theme): ThemeColorTokens => THEME_COLOR_MAP[theme];
