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

  // Generate sequential grid for 2026 (perfect rectangle layout)
  const grid = useMemo(() => {
    const columns: { date: Date; dateKey: string; minutes: number }[][] = [];
    const year = 2026;
    
    // Generate all days of 2026 sequentially
    const allDays: { date: Date; dateKey: string; minutes: number }[] = [];
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    let currentDate = new Date(yearStart);
    currentDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= yearEnd) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const minutes = Math.round(dailyData[dateKey] || 0);
      
      allDays.push({
        date: new Date(currentDate),
        dateKey,
        minutes,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Map sequentially into columns of 7 rows each
    // Index 0 -> Row 0, Col 0; Index 1 -> Row 1, Col 0; etc.
    const numColumns = Math.ceil(allDays.length / 7);
    
    for (let col = 0; col < numColumns; col++) {
      const column: { date: Date; dateKey: string; minutes: number }[] = [];
      
      for (let row = 0; row < 7; row++) {
        const dayIndex = col * 7 + row;
        
        if (dayIndex < allDays.length) {
          column.push(allDays[dayIndex]);
        }
      }
      
      columns.push(column);
    }

    return columns;
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

  // Removed weekday labels for cleaner minimalist look

  // Month labels based on first day of each column
  const monthLabels = useMemo(() => {
    const labels: { label: string; colIndex: number }[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonth = -1;

    grid.forEach((column, colIndex) => {
      const firstDayOfColumn = column[0];
      const month = firstDayOfColumn.date.getMonth();

      if (month !== lastMonth) {
        labels.push({ label: months[month], colIndex });
        lastMonth = month;
      }
    });

    return labels;
  }, [grid]);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-muted-foreground">YEARLY DIVE HISTORY</h2>
      <div className="bg-card rounded-2xl p-4 border border-border overflow-x-auto scrollbar-deep-sea">
        {/* Month labels */}
        <div className="flex mb-2">
          {monthLabels.map(({ label, colIndex }, i) => (
            <div
              key={i}
              className="text-xs text-muted-foreground"
              style={{
                marginLeft: i === 0 ? colIndex * 14 : (colIndex - monthLabels[i - 1].colIndex) * 14 - 24,
                minWidth: 24,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Grid */}
          <div className="flex gap-[3px] relative pr-6">
            {grid.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-[3px]">
                {column.map((day, rowIndex) => {
                  const level = getLevel(day.minutes);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isFuture = day.date > today;

                  return (
                    <div
                      key={`${colIndex}-${rowIndex}`}
                      className="w-[11px] h-[11px] rounded-sm cursor-pointer transition-transform hover:scale-125"
                      style={
                        isFuture
                          ? { backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255,255,255,0.05)" }
                          : getCellStyle(level)
                      }
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          date: formatDate(day.date),
                          minutes: day.minutes,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
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
