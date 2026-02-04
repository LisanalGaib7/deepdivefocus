import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { DEFAULT_THEME, isTheme, THEME_STORAGE_KEY } from "@/theme/theme";

// Apply theme BEFORE React renders to prevent a "flash of ocean/blue".
(() => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const initial = isTheme(saved) ? saved : DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", initial);
    document.body?.setAttribute("data-theme", initial);
  } catch {
    // ignore
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
