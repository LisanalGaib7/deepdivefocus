import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { DEFAULT_THEME, isTheme } from "@/theme/theme";
import { STORAGE_KEYS } from "@/lib/storage/keys";

// Apply theme BEFORE React renders to prevent a "flash of ocean/blue".
// Inline `localStorage` access (rather than going through safeStorage) is
// intentional here — this script runs once at boot, before any module graph
// is meaningful, and must stay tiny.
(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    const initial = isTheme(saved) ? saved : DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", initial);
    document.body?.setAttribute("data-theme", initial);
  } catch {
    // ignore
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
