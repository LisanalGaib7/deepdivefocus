import { Timer, BarChart3, Fish } from "lucide-react";
import { useTheme, getThemePrimaryHsl } from "@/hooks/useTheme";
import { hapticsLight } from "@/lib/haptics";

interface BottomNavProps {
  activeTab: "focus" | "history" | "collection";
  onTabChange: (tab: "focus" | "history" | "collection") => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { currentTheme } = useTheme();
  const primaryColor = getThemePrimaryHsl(currentTheme);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-2 flex items-center justify-center gap-1 shadow-lg">
          <button
            onClick={() => { hapticsLight(); onTabChange("focus"); }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
              activeTab === "focus"
                ? "bg-primary/10"
                : "hover:bg-muted"
            }`}
            style={{
              color: activeTab === "focus" ? primaryColor : "hsl(var(--muted-foreground))",
            }}
          >
            <Timer
              className="h-5 w-5 transition-all"
              style={{
                filter: activeTab === "focus" ? `drop-shadow(0 0 8px ${primaryColor})` : "none",
              }}
            />
            <span className="text-xs font-medium">Focus</span>
          </button>

          <button
            onClick={() => { hapticsLight(); onTabChange("history"); }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
              activeTab === "history"
                ? "bg-primary/10"
                : "hover:bg-muted"
            }`}
            style={{
              color: activeTab === "history" ? primaryColor : "hsl(var(--muted-foreground))",
            }}
          >
            <BarChart3
              className="h-5 w-5 transition-all"
              style={{
                filter: activeTab === "history" ? `drop-shadow(0 0 8px ${primaryColor})` : "none",
              }}
            />
            <span className="text-xs font-medium">History</span>
          </button>

          <button
            onClick={() => { hapticsLight(); onTabChange("collection"); }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
              activeTab === "collection"
                ? "bg-primary/10"
                : "hover:bg-muted"
            }`}
            style={{
              color: activeTab === "collection" ? primaryColor : "hsl(var(--muted-foreground))",
            }}
          >
            <Fish
              className="h-5 w-5 transition-all"
              style={{
                filter: activeTab === "collection" ? `drop-shadow(0 0 8px ${primaryColor})` : "none",
              }}
            />
            <span className="text-xs font-medium">Collection</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
