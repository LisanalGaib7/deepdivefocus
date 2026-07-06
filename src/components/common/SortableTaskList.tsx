import { useState } from 'react';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocalTask } from '@/hooks/useTasks';

const noop = () => {};

interface SortableTaskItemProps {
  task: LocalTask;
  isSelected: boolean;
  isEditing: boolean;
  editingText: string;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onStartEdit: (task: LocalTask) => void;
  onSaveEdit: () => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  onEditTextChange: (text: string) => void;
  onDelete: (id: string) => void;
  getTimeDisplay: (task: LocalTask) => { total: number; formatted: string };
  isDragOverlay?: boolean;
}

function SortableTaskItem({
  task,
  isSelected,
  isEditing,
  editingText,
  onSelect,
  onToggleComplete,
  onStartEdit,
  onSaveEdit,
  onEditKeyDown,
  onEditTextChange,
  onDelete,
  getTimeDisplay,
  isDragOverlay = false,
}: SortableTaskItemProps) {
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
        transition: transition || 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: isDragging ? 0.35 : 1,
      };

  const { total, formatted } = getTimeDisplay(task);

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      onClick={() => !isDragOverlay && onSelect(task.id)}
      className={`flex items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
        isDragOverlay
          ? 'scale-105 border-primary bg-primary/15 ring-2 ring-primary/40 shadow-[0_0_25px_hsl(var(--primary)/0.4),0_8px_30px_rgba(0,0,0,0.4)] z-50'
          : isSelected
            ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
            : 'border-border bg-card hover:border-primary/50'
      } ${task.isCompleted ? 'opacity-60' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
        className="touch-none p-1 text-muted-foreground/50 hover:text-primary transition-colors cursor-grab active:cursor-grabbing shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Complete Button */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id);
        }}
        variant="ghost"
        size="icon"
        className={`h-7 w-7 rounded-full border-2 shrink-0 ${
          isSelected ? 'border-primary' : 'border-muted-foreground'
        }`}
      >
        {task.isCompleted && <Check className="h-4 w-4 text-primary" />}
      </Button>

      {/* Task Text / Edit Input */}
      {isEditing ? (
        <Input
          type="text"
          value={editingText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={onEditKeyDown}
          autoFocus
          className="flex-1 h-8 text-base font-medium bg-background/50"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p className={`flex-1 text-base font-bold ${
          task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
        }`}>
          {task.text}
        </p>
      )}

      {/* Time Display */}
      {total > 0 ? (
        <span className="text-xs font-semibold text-foreground/70 px-2 py-1 bg-muted rounded-full">
          {formatted}
        </span>
      ) : (
        <span className="text-xs font-semibold text-foreground/30 px-2 py-1 bg-muted/50 rounded-full">
          0m
        </span>
      )}

      {/* Edit Button */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit(task);
        }}
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {/* Delete Button */}
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
  );
}

interface SortableTaskListProps {
  tasks: LocalTask[];
  selectedTaskId: string | null;
  editingTaskId: string | null;
  editingText: string;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onStartEdit: (task: LocalTask) => void;
  onSaveEdit: () => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  onEditTextChange: (text: string) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: LocalTask[]) => void;
  getTimeDisplay: (task: LocalTask) => { total: number; formatted: string };
}

export default function SortableTaskList({
  tasks,
  selectedTaskId,
  editingTaskId,
  editingText,
  onSelect,
  onToggleComplete,
  onStartEdit,
  onSaveEdit,
  onEditKeyDown,
  onEditTextChange,
  onDelete,
  onReorder,
  getTimeDisplay,
}: SortableTaskListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(tasks, oldIndex, newIndex);
      onReorder(reordered);
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
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              isEditing={editingTaskId === task.id}
              editingText={editingText}
              onSelect={onSelect}
              onToggleComplete={onToggleComplete}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onEditKeyDown={onEditKeyDown}
              onEditTextChange={onEditTextChange}
              onDelete={onDelete}
              getTimeDisplay={getTimeDisplay}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeTask ? (
          <SortableTaskItem
            task={activeTask}
            isSelected={selectedTaskId === activeTask.id}
            isEditing={false}
            editingText=""
            onSelect={noop}
            onToggleComplete={noop}
            onStartEdit={noop}
            onSaveEdit={noop}
            onEditKeyDown={noop}
            onEditTextChange={noop}
            onDelete={noop}
            getTimeDisplay={getTimeDisplay}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
