import { TimeRange } from "@/hooks/useSessionStats";

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

const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
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
  );
};

export default TimeRangeSelector;
