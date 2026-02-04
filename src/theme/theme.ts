export type Theme = "ocean" | "sage" | "rose" | "lavender" | "mono";

export const DEFAULT_THEME: Theme = "ocean";
export const THEME_STORAGE_KEY = "deepDiveTheme";

export const themes: { id: Theme; label: string; colors: [string, string] }[] = [
  { id: "ocean", label: "Ocean", colors: ["#0ea5e9", "#3b82f6"] },
  { id: "sage", label: "Sage", colors: ["#86efac", "#22c55e"] },
  { id: "rose", label: "Rose", colors: ["#fda4af", "#f43f5e"] },
  { id: "lavender", label: "Lavender", colors: ["#c4b5fd", "#8b5cf6"] },
  { id: "mono", label: "Mono", colors: ["#e5e5e5", "#737373"] },
];

export const isTheme = (value: unknown): value is Theme => {
  if (typeof value !== "string") return false;
  return themes.some((t) => t.id === value);
};
