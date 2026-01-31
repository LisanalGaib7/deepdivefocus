import { useMemo } from "react";
import { TimeRange } from "@/hooks/useSessionStats";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

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
    case "year": {
      const start = startOfYear(now);
      const end = endOfYear(now);
      return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
    }
    case "all":
    default:
      return null;
  }
};

const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  const dateRangeText = useMemo(() => getDateRangeText(value), [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              value === option.value
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {dateRangeText && (
        <p className="text-xs text-muted-foreground/70">{dateRangeText}</p>
      )}
    </div>
  );
};

export default TimeRangeSelector;
