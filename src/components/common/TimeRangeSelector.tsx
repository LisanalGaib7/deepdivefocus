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
    <div className="grid grid-cols-6 gap-2 md:flex md:flex-row md:justify-center md:gap-2">
      {timeRangeOptions.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            index < 3 ? "col-span-2" : "col-span-3"
          } md:col-span-1 ${
            value === option.value
              ? "bg-primary text-primary-foreground"
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
