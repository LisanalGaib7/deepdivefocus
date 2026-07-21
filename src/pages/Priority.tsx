import { useMemo, useCallback } from "react";
import { Flag, Rocket, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocalTask } from "@/hooks/useTasks";
import { getPriorityScore, sortByPriority } from "@/lib/priority";
import { useSortMode } from "@/hooks/useSortMode";
import { PriorityTaskList } from "@/features/priority/PriorityTaskList";

type ScoreUpdate = {
  urgency?: number | null;
  impact?: number | null;
  effortMinutes?: number | null;
};

interface PriorityProps {
  tasks: LocalTask[];
  onReorder: (tasks: LocalTask[]) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateScores: (id: string, updates: ScoreUpdate) => void;
  onSelectAndDive: (id: string) => void;
}

const formatEffort = (mins: number | null) => {
  if (mins == null) return null;
  if (mins < 60) return `${mins}m`;
  if (mins === 60) return "1h";
  return "2h+";
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="text-xs uppercase tracking-widest text-primary font-bold"
    style={{ fontFamily: "Orbitron, sans-serif" }}
  >
    {children}
  </h2>
);

const Priority = ({
  tasks,
  onReorder,
  onToggleComplete,
  onDelete,
  onUpdateScores,
  onSelectAndDive,
}: PriorityProps) => {
  const { sortMode, setSortMode } = useSortMode();

  const uncompleted = useMemo(() => tasks.filter((t) => !t.isCompleted), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.isCompleted), [tasks]);

  const topThree = useMemo(() => {
    const scored = uncompleted.filter((t) => getPriorityScore(t) != null);
    return sortByPriority(scored).slice(0, 3);
  }, [uncompleted]);

  // Bottom list ordering
  const displayedTasks = useMemo(() => {
    if (sortMode === "manual") {
      // preserve incoming order (sort_order) + completed at end
      return [...uncompleted, ...completed];
    }
    // priority mode: scored uncompleted (sorted) → unscored uncompleted → completed
    const scored = uncompleted.filter((t) => getPriorityScore(t) != null);
    const unscored = uncompleted.filter((t) => getPriorityScore(t) == null);
    return [...sortByPriority(scored), ...unscored, ...completed];
  }, [uncompleted, completed, sortMode]);

  // Compute divider index between scored & unscored in priority mode
  const unscoredStartIndex = useMemo(() => {
    if (sortMode !== "priority") return -1;
    const scoredCount = uncompleted.filter((t) => getPriorityScore(t) != null).length;
    const unscoredCount = uncompleted.length - scoredCount;
    return unscoredCount > 0 ? scoredCount : -1;
  }, [sortMode, uncompleted]);

  const completedStartIndex = useMemo(() => {
    if (completed.length === 0) return -1;
    return displayedTasks.length - completed.length;
  }, [displayedTasks.length, completed.length]);

  const handleReorder = useCallback(
    (reordered: LocalTask[]) => {
      // Drag always implies user wants manual order — switch mode + persist.
      if (sortMode !== "manual") setSortMode("manual");
      onReorder(reordered);
    },
    [sortMode, setSortMode, onReorder]
  );

  const allCompleted = tasks.length > 0 && uncompleted.length === 0;
  const hasScored = uncompleted.some((t) => getPriorityScore(t) != null);

  const renderTop = () => {
    if (tasks.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-6">
          Add tasks from the Focus tab
        </p>
      );
    }
    if (allCompleted) {
      return (
        <p className="text-sm text-primary text-center py-6 font-semibold">
          All tasks completed for today 🎉
        </p>
      );
    }
    if (!hasScored) {
      return (
        <p className="text-sm text-muted-foreground text-center py-6">
          Score your tasks to see priorities here
        </p>
      );
    }
    return (
      <div className="space-y-2">
        {topThree.map((task, idx) => {
          const score = getPriorityScore(task);
          const effort = formatEffort(task.effortMinutes);
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5"
            >
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold shrink-0 tabular-nums"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {task.text}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[10px] border-primary/40 text-primary bg-primary/10"
                  >
                    <Flag className="h-2.5 w-2.5 mr-1" />
                    {score}
                  </Badge>
                  {effort && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border/60 text-muted-foreground"
                    >
                      <Clock className="h-2.5 w-2.5 mr-1" />
                      {effort}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onSelectAndDive(task.id)}
                className="h-10 px-3 text-[11px] uppercase tracking-widest font-bold shrink-0"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                <Rocket className="h-3.5 w-3.5 mr-1" />
                Dive
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-8 pb-28">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1 pt-4">
          <h1
            className="text-3xl md:text-4xl font-extrabold tracking-widest uppercase text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            Priority
          </h1>
          <p className="text-foreground/60 text-sm">
            Rank what matters, dive in order
          </p>
        </div>

        {/* Top: Now Doing */}
        <section className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
          <SectionTitle>Now Doing</SectionTitle>
          {renderTop()}
        </section>

        {/* Bottom: full list */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <SectionTitle>전체 리스트</SectionTitle>
            {sortMode === "manual" && (
              <button
                type="button"
                onClick={() => setSortMode("priority")}
                className="text-[10px] font-mono text-primary/80 hover:text-primary uppercase tracking-widest"
              >
                ↺ 우선순위순으로
              </button>
            )}
          </div>

          {/* Mode toggle */}
          <div
            role="tablist"
            className="grid grid-cols-2 gap-1 p-1 rounded-lg border border-border bg-card/40"
          >
            {(["priority", "manual"] as const).map((m) => {
              const active = sortMode === m;
              return (
                <button
                  key={m}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSortMode(m)}
                  className={`min-h-10 rounded-md text-[11px] uppercase tracking-widest font-bold transition-colors ${
                    active
                      ? "bg-primary/20 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.35)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  {m === "priority" ? "우선순위순" : "직접 정렬"}
                </button>
              );
            })}
          </div>

          {displayedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              태스크가 없습니다
            </p>
          ) : (
            <div className="relative">
              {/* Render list with inline dividers */}
              <ListWithDividers
                tasks={displayedTasks}
                unscoredStartIndex={unscoredStartIndex}
                completedStartIndex={completedStartIndex}
                onReorder={handleReorder}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onUpdateScores={onUpdateScores}
                onDive={onSelectAndDive}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// dnd-kit needs a single flat sortable list, so we render dividers as absolutely
// positioned labels rather than DOM siblings that would break drag targets.
// Simpler: split into up to 3 sections that each drag independently. We split.
interface ListWithDividersProps {
  tasks: LocalTask[];
  unscoredStartIndex: number;
  completedStartIndex: number;
  onReorder: (tasks: LocalTask[]) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateScores: (id: string, updates: ScoreUpdate) => void;
  onDive: (id: string) => void;
}

const Divider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 pt-2 pb-1">
    <div className="h-px flex-1 bg-border" />
    <span
      className="text-[10px] uppercase tracking-widest text-muted-foreground/70"
      style={{ fontFamily: "Orbitron, sans-serif" }}
    >
      {label}
    </span>
    <div className="h-px flex-1 bg-border" />
  </div>
);

function ListWithDividers({
  tasks,
  unscoredStartIndex,
  completedStartIndex,
  onReorder,
  onToggleComplete,
  onDelete,
  onUpdateScores,
  onDive,
}: ListWithDividersProps) {
  // If no dividers active, single list.
  if (unscoredStartIndex < 0 && completedStartIndex < 0) {
    return (
      <PriorityTaskList
        tasks={tasks}
        onReorder={onReorder}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onUpdateScores={onUpdateScores}
        onDive={onDive}
      />
    );
  }

  // Compute section slices
  const sections: { label: string | null; slice: LocalTask[]; startIdx: number }[] = [];
  const boundaries = [
    { idx: 0, label: null },
    ...(unscoredStartIndex > 0 ? [{ idx: unscoredStartIndex, label: "미분류" }] : []),
    ...(completedStartIndex > 0 &&
    completedStartIndex !== unscoredStartIndex
      ? [{ idx: completedStartIndex, label: "완료" }]
      : []),
  ];
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i].idx;
    const end = boundaries[i + 1]?.idx ?? tasks.length;
    sections.push({
      label: boundaries[i].label,
      slice: tasks.slice(start, end),
      startIdx: start,
    });
  }

  const handleSectionReorder = (startIdx: number, reordered: LocalTask[]) => {
    const before = tasks.slice(0, startIdx);
    const after = tasks.slice(startIdx + reordered.length);
    onReorder([...before, ...reordered, ...after]);
  };

  return (
    <div className="space-y-1">
      {sections.map((section, i) => (
        <div key={i}>
          {section.label && <Divider label={section.label} />}
          <PriorityTaskList
            tasks={section.slice}
            onReorder={(r) => handleSectionReorder(section.startIdx, r)}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onUpdateScores={onUpdateScores}
            onDive={onDive}
          />
        </div>
      ))}
    </div>
  );
}

export default Priority;
