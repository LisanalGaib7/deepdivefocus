import { useMemo, useState } from "react";
import { FocusSession } from "@/lib/sessionStorage";

interface YearlyDepthLogProps {
  sessions: FocusSession[];
}

const YearlyDepthLog = ({ sessions }: YearlyDepthLogProps) => {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; minutes: number; x: number; y: number } | null>(null);

  // Aggregate sessions by date (sum all tasks for each day)
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};

    sessions.forEach((s) => {
      const date = new Date(s.timestamp);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      map[dateKey] = (map[dateKey] || 0) + s.duration / 60;
    });

    return map;
  }, [sessions]);

  // Generate 52 weeks x 7 days grid (past year from today)
  const grid = useMemo(() => {
    const weeks: { date: Date; dateKey: string; minutes: number }[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the start of the grid (52 weeks ago, aligned to Sunday)
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364 - today.getDay());

    let currentDate = new Date(startDate);

    for (let week = 0; week < 53; week++) {
      const weekDays: { date: Date; dateKey: string; minutes: number }[] = [];

      for (let day = 0; day < 7; day++) {
        const dateKey = currentDate.toISOString().split("T")[0];
        const minutes = Math.round(dailyData[dateKey] || 0);

        weekDays.push({
          date: new Date(currentDate),
          dateKey,
          minutes,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(weekDays);
    }

    return weeks;
  }, [dailyData]);

  // Get level based on minutes
  const getLevel = (minutes: number): number => {
    if (minutes === 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 120) return 3;
    return 4;
  };

  // Get color class based on level
  const getCellStyle = (level: number): React.CSSProperties => {
    switch (level) {
      case 0:
        return { backgroundColor: "rgba(255, 255, 255, 0.05)" };
      case 1:
        return { backgroundColor: "#083344" }; // cyan-950
      case 2:
        return { backgroundColor: "#0e7490" }; // cyan-700
      case 3:
        return { backgroundColor: "#06b6d4" }; // cyan-500
      case 4:
        return {
          backgroundColor: "#67e8f9", // cyan-300
          boxShadow: "0 0 8px #67e8f9, 0 0 16px #06b6d4",
        };
      default:
        return { backgroundColor: "rgba(255, 255, 255, 0.05)" };
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  // Month labels based on first week of each month
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonth = -1;

    grid.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0];
      const month = firstDayOfWeek.date.getMonth();

      if (month !== lastMonth) {
        labels.push({ label: months[month], weekIndex });
        lastMonth = month;
      }
    });

    return labels;
  }, [grid]);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-muted-foreground">Yearly Depth Log</h2>
      <div className="bg-card rounded-2xl p-4 border border-border overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-2 ml-8">
          {monthLabels.map(({ label, weekIndex }, i) => (
            <div
              key={i}
              className="text-xs text-muted-foreground"
              style={{
                marginLeft: i === 0 ? weekIndex * 14 : (weekIndex - monthLabels[i - 1].weekIndex) * 14 - 24,
                minWidth: 24,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-2 shrink-0">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[11px] text-[10px] text-muted-foreground leading-[11px]">
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px] relative">
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => {
                  const level = getLevel(day.minutes);
                  const isFuture = day.date > new Date();

                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-[11px] h-[11px] rounded-sm cursor-pointer transition-transform hover:scale-125"
                      style={isFuture ? { backgroundColor: "transparent" } : getCellStyle(level)}
                      onMouseEnter={(e) => {
                        if (!isFuture) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            date: formatDate(day.date),
                            minutes: day.minutes,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            ))}

            {/* Tooltip */}
            {hoveredCell && (
              <div
                className="fixed z-50 rounded-lg px-3 py-2 pointer-events-none"
                style={{
                  left: hoveredCell.x,
                  top: hoveredCell.y - 50,
                  transform: "translateX(-50%)",
                  background: "#000000",
                  border: "1px solid #06b6d4",
                  boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
                }}
              >
                <p className="text-white text-xs font-medium mb-1">{hoveredCell.date}</p>
                <p className="font-mono font-bold text-cyan-400">
                  {hoveredCell.minutes > 0 ? `${hoveredCell.minutes} min` : "No focus"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-[11px] h-[11px] rounded-sm"
                style={getCellStyle(level)}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyDepthLog;
