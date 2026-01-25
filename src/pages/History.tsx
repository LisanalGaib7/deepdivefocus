import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from "recharts";
import { useTheme, getThemePrimaryHex, getThemePalette } from "@/hooks/useTheme";
import { useSessionStats } from "@/hooks/useSessionStats";
import { useAuthContext } from "@/contexts/AuthContext";
import { YearlyDepthLog } from "@/features/history";

const History = () => {
  const { currentTheme } = useTheme();
  const primaryColor = getThemePrimaryHex(currentTheme);
  const themePalette = getThemePalette(currentTheme);
  const { isGuestMode, isAuthenticated } = useAuthContext();
  
  // Use unified session stats hook (single source of truth)
  const { 
    sessions, 
    localSessions,
    todayMinutes, 
    totalMinutes, 
    totalSessions, 
    avgSessionLength, 
    loading 
  } = useSessionStats();
  
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Combine and normalize sessions from both sources into unified format
  const formattedSessions = useMemo(() => {
    if (isAuthenticated && !isGuestMode) {
      // Database sessions
      return sessions.map(s => ({
        id: s.id,
        taskId: s.id,
        taskName: s.task_name,
        duration: s.duration,
        timestamp: new Date(s.session_date).getTime(),
      }));
    } else {
      // Local storage sessions (guest mode)
      return localSessions.map(s => ({
        id: s.id,
        taskId: s.taskId || s.id,
        taskName: s.taskName,
        duration: s.duration,
        timestamp: s.timestamp,
      }));
    }
  }, [sessions, localSessions, isAuthenticated, isGuestMode]);

  // Weekly data for bar chart - last 7 days including today
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

      const dayMinutes = formattedSessions
        .filter((s) => s.timestamp >= startOfDay && s.timestamp <= endOfDayTime)
        .reduce((sum, s) => sum + s.duration / 60, 0);

      result.push({
        day: days[date.getDay()],
        minutes: Math.round(dayMinutes),
      });
    }

    console.log('[History] Weekly data calculated:', result);
    return result;
  }, [formattedSessions]);

  // Task breakdown for donut chart
  const taskBreakdown = useMemo(() => {
    const taskMap: Record<string, { name: string; minutes: number }> = {};

    formattedSessions.forEach((s) => {
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
  }, [formattedSessions]);

  // Stats are now derived from useSessionStats hook (single source of truth)

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-8 pb-28 flex items-center justify-center">
        <div className="animate-pulse text-primary font-robotic tracking-widest">
          LOADING DIVE LOGS...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-28 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 
            className="text-4xl font-bold text-primary font-mono uppercase drop-shadow-[0_0_15px_hsl(var(--primary)/0.7)]"
          >
            ANALYTICS
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Your focus journey</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Today" value={`${todayMinutes}m`} color={primaryColor} />
          <StatCard label="Total Sessions" value={totalSessions.toString()} color={primaryColor} />
          <StatCard label="Total Focus" value={`${totalMinutes}m`} color={primaryColor} />
          <StatCard label="Avg Session" value={`${avgSessionLength}m`} color={primaryColor} />
        </div>

        {/* Weekly Bar Chart */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Weekly Focus</h2>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <ResponsiveContainer width="100%" height={180}>
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
        </div>

        {/* Task Breakdown Donut Chart */}
        {taskBreakdown.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-muted-foreground">Task Breakdown</h2>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
                <ResponsiveContainer width="100%" height={180} className="md:w-1/2">
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
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="minutes"
                      paddingAngle={2}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
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
                      <span className="font-mono font-medium" style={{ color: themePalette[index % themePalette.length] }}>
                        {task.minutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yearly Depth Log */}
        <YearlyDepthLog sessions={formattedSessions} />
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ label, value, color }: StatCardProps) => (
  <div className="bg-card rounded-2xl p-4 border border-border">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-bold font-mono" style={{ color }}>
      {value}
    </p>
  </div>
);

export default History;
