import { Timer, BarChart3, Fish, Flag, LucideIcon } from "lucide-react";
import { useTheme, getThemePrimaryHsl } from "@/hooks/useTheme";
import { hapticsLight } from "@/lib/haptics";

export type BottomTab = "focus" | "priority" | "history" | "collection";

interface BottomNavProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  /** When true, nav dims to blend into focus-mode immersion. Hover/focus restores it. */
  dimmed?: boolean;
}

const TABS: { id: BottomTab; label: string; icon: LucideIcon }[] = [
  { id: "focus", label: "Focus", icon: Timer },
  { id: "priority", label: "Priority", icon: Flag },
  { id: "history", label: "History", icon: BarChart3 },
  { id: "collection", label: "Collection", icon: Fish },
];

const BottomNav = ({ activeTab, onTabChange, dimmed = false }: BottomNavProps) => {
  const { currentTheme } = useTheme();
  const primaryColor = getThemePrimaryHsl(currentTheme);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 pb-safe ${dimmed ? "focus-dim" : ""}`}>
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className={`bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-2 flex items-center justify-center gap-1 shadow-lg ${dimmed ? "bg-card/40" : ""}`}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                data-onboarding={id === "priority" ? "priority-tab" : undefined}
                onClick={() => {
                  hapticsLight();
                  onTabChange(id);
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all duration-300 min-h-11 ${
                  active ? "bg-primary/10" : "hover:bg-muted"
                }`}
                style={{
                  color: active
                    ? primaryColor
                    : "hsl(var(--muted-foreground))",
                }}
              >
                <Icon
                  className="h-5 w-5 transition-all"
                  style={{
                    filter: active
                      ? `drop-shadow(0 0 8px ${primaryColor})`
                      : "none",
                  }}
                />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
