import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LocalTask } from "@/hooks/useTasks";
import { getPriorityScore } from "@/lib/priority";

type ScoreUpdate = {
  urgency?: number | null;
  impact?: number | null;
  effortMinutes?: number | null;
};

interface TaskScoreRowProps {
  task: LocalTask;
  onChange: (taskId: string, updates: ScoreUpdate) => void | Promise<void>;
  className?: string;
}

const URGENCY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "언제든" },
  { value: 2, label: "이번주" },
  { value: 3, label: "며칠내" },
  { value: 4, label: "오늘중" },
  { value: 5, label: "지금당장" },
];

const IMPACT_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "사소함" },
  { value: 2, label: "조금" },
  { value: 3, label: "보통" },
  { value: 4, label: "큼" },
  { value: 5, label: "결정적" },
];

const EFFORT_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: "5분" },
  { value: 15, label: "15분" },
  { value: 30, label: "30분" },
  { value: 60, label: "1시간" },
  { value: 120, label: "2시간+" },
];

interface SegmentGroupProps {
  label: string;
  options: { value: number; label: string }[];
  selected: number | null;
  onSelect: (value: number) => void;
}

const SegmentGroup = ({ label, options, selected, onSelect }: SegmentGroupProps) => {
  return (
    <div className="space-y-1.5">
      <div
        className="text-[10px] uppercase tracking-widest text-muted-foreground/70"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        {label}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-5 gap-1"
      >
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(opt.value)}
              className={cn(
                "min-h-11 rounded-md border px-1 text-[11px] font-medium leading-tight",
                "transition-colors duration-150 select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                active
                  ? "border-primary bg-primary/20 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.35)]"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const TaskScoreRow = ({ task, onChange, className }: TaskScoreRowProps) => {
  const score = getPriorityScore(task);

  const handleUrgency = useCallback(
    (value: number) => onChange(task.id, { urgency: value }),
    [task.id, onChange]
  );
  const handleImpact = useCallback(
    (value: number) => onChange(task.id, { impact: value }),
    [task.id, onChange]
  );
  const handleEffort = useCallback(
    (value: number) => onChange(task.id, { effortMinutes: value }),
    [task.id, onChange]
  );

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card/30 p-3 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className="text-[10px] uppercase tracking-widest text-muted-foreground/70"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          Priority
        </div>
        <div className="flex items-center gap-2">
          {score == null ? (
            <>
              <span className="text-lg font-bold text-muted-foreground">—</span>
              <Badge
                variant="outline"
                className="text-[9px] uppercase tracking-widest border-border/60 text-muted-foreground"
              >
                미분류
              </Badge>
            </>
          ) : (
            <span
              className="text-lg font-bold text-primary tabular-nums"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              {score}
            </span>
          )}
        </div>
      </div>

      <SegmentGroup
        label="Urgency"
        options={URGENCY_OPTIONS}
        selected={task.urgency}
        onSelect={handleUrgency}
      />
      <SegmentGroup
        label="Impact"
        options={IMPACT_OPTIONS}
        selected={task.impact}
        onSelect={handleImpact}
      />
      <SegmentGroup
        label="Effort"
        options={EFFORT_OPTIONS}
        selected={task.effortMinutes}
        onSelect={handleEffort}
      />
    </div>
  );
};

export default TaskScoreRow;
