import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from "recharts";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "lucide-react";
import { useTheme, getThemePrimaryHex, getThemePalette } from "@/hooks/useTheme";
import { useSessionStats, TimeRange } from "@/hooks/useSessionStats";
import { useAuthContext } from "@/contexts/AuthContext";
import { YearlyDepthLog } from "@/features/history";
import TimeRangeSelector from "@/components/common/TimeRangeSelector";

// Helper to get date range text for badge
const getDateRangeText = (range: TimeRange): string | null => {
  const now = new Date();
  
  switch (range) {
    case "today":
      return format(now, "MMM d, yyyy");
    case "week": {
      const start = startOfWeek(now, { weekStartsOn: 0 });
      const end = endOfWeek(now, { weekStartsOn: 0 });
      return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
    }
    case "month": {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
    }
    case "year":
      return format(now, "yyyy");
    case "all":
    default:
      return null;
  }
};

const History = () => {
  const { currentTheme } = useTheme();
  const primaryColor = getThemePrimaryHex(currentTheme);
  const themePalette = getThemePalette(currentTheme);
  const { isGuestMode, isAuthenticated } = useAuthContext();
  
  // Time range filter state - default to "all" for charts/stats
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  
  // Use unified session stats hook (single source of truth)
  const { 
    sessions, 
    localSessions,
    todayMinutes, 
    getFilteredStats,
    loading 
  } = useSessionStats();
  
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Get filtered stats based on selected time range
  const filteredStats = useMemo(() => getFilteredStats(timeRange), [getFilteredStats, timeRange]);

  // ALL sessions normalized (for YearlyDepthLog - always shows full year)
  const allFormattedSessions = useMemo(() => {
    if (isAuthenticated && !isGuestMode) {
      return sessions.map(s => ({
        id: s.id,
        taskId: s.id,
        taskName: s.task_name,
        duration: s.duration,
        timestamp: new Date(s.session_date).getTime(),
      }));
    } else {
      return localSessions.map(s => ({
        id: s.id,
        taskId: s.taskId || s.id,
        taskName: s.taskName,
        duration: s.duration,
        timestamp: s.timestamp,
      }));
    }
  }, [sessions, localSessions, isAuthenticated, isGuestMode]);

  // Weekly data for bar chart - based on filtered sessions
  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const startOfDay = date.getTime();
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const endOfDayTime = endOfDay.getTime();

      const dayMinutes = filteredStats.sessions
        .filter((s) => s.timestamp >= startOfDay && s.timestamp <= endOfDayTime)
        .reduce((sum, s) => sum + s.duration / 60, 0);

      result.push({
        day: days[date.getDay()],
        minutes: Math.round(dayMinutes),
      });
    }

    return result;
  }, [filteredStats.sessions]);

  // Task breakdown for donut chart - based on filtered sessions
  const taskBreakdown = useMemo(() => {
    const taskMap: Record<string, { name: string; minutes: number }> = {};

    filteredStats.sessions.forEach((s) => {
      const key = s.taskName || "Untitled";
      if (!taskMap[key]) {
        taskMap[key] = { name: key, minutes: 0 };
      }
      taskMap[key].minutes += s.duration / 60;
    });

    return Object.values(taskMap)
      .map((t) => ({ ...t, minutes: Math.round(t.minutes) }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
  }, [filteredStats.sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-8 pb-28 flex items-center justify-center">
        <div className="animate-pulse text-primary font-robotic tracking-widest">
          LOADING DIVE LOGS...
        </div>
      </div>
    );
  }

  // Format total minutes for hero display - returns JSX with styled units
  const formatHeroTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return (
        <span className="inline-flex items-baseline">
          <span>{hours}</span>
          <span className="text-3xl md:text-4xl ml-1 text-primary/80 font-bold">h</span>
          {mins > 0 && (
            <>
              <span className="ml-2">{mins}</span>
              <span className="text-3xl md:text-4xl ml-1 text-primary/80 font-bold">m</span>
            </>
          )}
        </span>
      );
    }
    return (
      <span className="inline-flex items-baseline">
        <span>{minutes}</span>
        <span className="text-3xl md:text-4xl ml-1 text-primary/80 font-bold">m</span>
      </span>
    );
  };

  return (
    <div className="h-screen bg-background text-foreground overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-28 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 
            className="text-4xl font-bold tracking-widest text-primary font-mono uppercase"
            style={{ textShadow: `0 0 7px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)` }}
          >
            ANALYTICS
          </h1>
          <p className="text-primary/60 text-sm font-semibold mt-3 tracking-wide uppercase">Your focus journey</p>
        </div>

        {/* FIXED: Yearly Depth Log - Always shows full year regardless of filter */}
        <YearlyDepthLog sessions={allFormattedSessions} />

        {/* Time Range Filter */}
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

        {/* ===== BENTO GRID STATS ===== */}
        <div className="space-y-3">
          {/* Hero Card - Full Width with Tight Grouping */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
            {/* Header Row: Label + Date Badge (Flex Aligned) */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Total Focus Time
              </p>
              {getDateRangeText(timeRange) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50 border border-border/30 backdrop-blur-sm">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {getDateRangeText(timeRange)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Big Number with Styled Unit */}
            <div className="text-6xl md:text-7xl font-bold font-mono tracking-tighter bg-gradient-to-r from-primary to-primary-deep bg-clip-text text-transparent drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
              {formatHeroTime(filteredStats.totalMinutes)}
            </div>
          </div>

          {/* Sub Cards - 2 Columns with Tight Grouping */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Sessions */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Sessions
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight text-primary">
                  {filteredStats.totalSessions}
                </p>
              </div>
            </div>

            {/* Average Session */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Avg Session
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight text-primary inline-flex items-baseline">
                  <span>{filteredStats.avgSessionLength}</span>
                  <span className="text-lg ml-0.5 text-primary/80 font-bold">m</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CHART SECTION ===== */}
        {/* Weekly Bar Chart */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Weekly Focus</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart 
              data={weeklyData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onMouseLeave={() => setActiveBarIndex(null)}
            >
              <defs>
                <filter id="bar-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feFlood floodColor={primaryColor} floodOpacity="0.6"/>
                  <feComposite in2="coloredBlur" operator="in"/>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#737373", fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#737373", fontSize: 11 }}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                offset={15}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        className="rounded-lg px-3 py-2 bg-background border"
                        style={{
                          borderColor: primaryColor,
                          boxShadow: `0 0 20px ${primaryColor}66`,
                        }}
                      >
                        <p className="text-foreground text-xs font-medium mb-1">{label}</p>
                        <p className="font-mono font-bold" style={{ color: primaryColor }}>
                          {payload[0].value} min
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="minutes" 
                radius={[6, 6, 0, 0]}
                onMouseEnter={(_, index) => setActiveBarIndex(index)}
                shape={(props: any) => {
                  const { x, y, width, height, index } = props;
                  const isActive = activeBarIndex === index;
                  const isDimmed = activeBarIndex !== null && activeBarIndex !== index;
                  
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={6}
                      ry={6}
                      fill={primaryColor}
                      opacity={isDimmed ? 0.3 : 1}
                      style={{
                        filter: isActive ? `url(#bar-glow) brightness(1.3)` : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Breakdown Donut Chart */}
        {taskBreakdown.length > 0 && (
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Task Breakdown</h2>
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
              <ResponsiveContainer width="100%" height={160} className="md:w-1/2">
                <PieChart>
                  <defs>
                    {themePalette.map((color, index) => (
                      <filter key={`glow-${index}`} id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feFlood floodColor={color} floodOpacity="0.6"/>
                        <feComposite in2="coloredBlur" operator="in"/>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    data={taskBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    dataKey="minutes"
                    paddingAngle={2}
                    stroke="hsl(var(--card))"
                    strokeWidth={1}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    activeIndex={activeIndex !== null ? activeIndex : undefined}
                    activeShape={(props: any) => {
                      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
                      return (
                        <g>
                          <Sector
                            cx={cx}
                            cy={cy}
                            innerRadius={innerRadius}
                            outerRadius={outerRadius * 1.1}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                            stroke="none"
                            style={{
                              filter: `url(#glow-${index}) brightness(1.3)`,
                              transition: 'all 0.25s ease-out',
                            }}
                          />
                        </g>
                      );
                    }}
                  >
                    {taskBreakdown.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={themePalette[index % themePalette.length]}
                        opacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.4}
                        style={{ transition: 'all 0.25s ease-out' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const sliceColor = themePalette[taskBreakdown.findIndex(t => t.name === data.name) % themePalette.length];
                        return (
                          <div
                            className="rounded-lg px-3 py-2 bg-background/95 border"
                            style={{
                              borderColor: sliceColor,
                              boxShadow: `0 0 20px ${sliceColor}66`,
                            }}
                          >
                            <p className="text-foreground text-xs font-bold mb-1">{data.name}</p>
                            <p className="font-mono font-bold" style={{ color: sliceColor }}>
                              {data.value} min
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 md:flex-1">
                {taskBreakdown.map((task, index) => (
                  <div key={task.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: themePalette[index % themePalette.length] }}
                    />
                    <span className="text-muted-foreground truncate flex-1">{task.name}</span>
                    <span className="font-mono font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                      {task.minutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
