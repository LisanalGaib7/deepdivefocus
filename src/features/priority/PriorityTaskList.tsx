import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocalTask } from "@/hooks/useTasks";
import { getPriorityScore } from "@/lib/priority";
import { TaskScoreRow } from "./TaskScoreRow";

type ScoreUpdate = {
  urgency?: number | null;
  impact?: number | null;
  effortMinutes?: number | null;
};

interface RowProps {
  task: LocalTask;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateScores: (id: string, updates: ScoreUpdate) => void;
  onDive: (id: string) => void;
  isDragOverlay?: boolean;
}

const noop = () => {};

function PriorityRow({
  task,
  onToggleComplete,
  onDelete,
  onUpdateScores,
  onDive,
  isDragOverlay = false,
}: RowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragOverlay,
    resizeObserverConfig: { disabled: isDragOverlay },
  });

  const style = isDragOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition:
          transition || "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)",
        opacity: isDragging ? 0.35 : 1,
      };

  const score = getPriorityScore(task);
  const completed = task.isCompleted;

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={`rounded-xl border p-3 space-y-3 ${
        isDragOverlay
          ? "scale-[1.02] border-primary bg-primary/15 ring-2 ring-primary/40 shadow-[0_0_25px_hsl(var(--primary)/0.4)] z-50"
          : "border-border bg-card"
      } ${completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-2">
        <button
          {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
          className="touch-none p-1 text-muted-foreground/50 hover:text-primary transition-colors cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full border-2 border-muted-foreground shrink-0"
        >
          {completed && <Check className="h-4 w-4 text-primary" />}
        </Button>

        <p
          className={`flex-1 text-sm font-bold ${
            completed ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {task.text}
        </p>

        {score != null && !completed && (
          <Badge
            className="bg-primary/20 text-primary border-primary/40 tabular-nums text-xs shrink-0"
            variant="outline"
          >
            {score}
          </Badge>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {!completed && (
        <>
          <TaskScoreRow task={task} onChange={onUpdateScores} />
          <Button
            onClick={() => onDive(task.id)}
            className="w-full h-11 text-xs uppercase tracking-widest font-bold"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            다이브 시작
          </Button>
        </>
      )}
    </div>
  );
}

interface PriorityTaskListProps {
  tasks: LocalTask[];
  onReorder: (tasks: LocalTask[]) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateScores: (id: string, updates: ScoreUpdate) => void;
  onDive: (id: string) => void;
}

export function PriorityTaskList({
  tasks,
  onReorder,
  onToggleComplete,
  onDelete,
  onUpdateScores,
  onDive,
}: PriorityTaskListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      onReorder(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <PriorityRow
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onUpdateScores={onUpdateScores}
              onDive={onDive}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeTask ? (
          <PriorityRow
            task={activeTask}
            onToggleComplete={noop}
            onDelete={noop}
            onUpdateScores={noop}
            onDive={noop}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
