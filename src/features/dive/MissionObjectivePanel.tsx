import { memo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SortableTaskList from "@/components/common/SortableTaskList";
import type { LocalTask } from "@/hooks/useTasks";

interface TaskGating {
  limit: number;
  hardCap: number;
  hitFreeLimit: (count: number) => boolean;
  hitHardCap: (count: number) => boolean;
  showUpgradeHint: boolean;
  showSlotCounter: boolean;
}

interface MissionObjectivePanelProps {
  tasks: LocalTask[];
  selectedTaskId: string | null;
  editingTaskId: string | null;
  editingText: string;
  newTaskText: string;
  taskGating: TaskGating;
  onNewTaskTextChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenPricing: () => void;
  onSelect: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onStartEdit: (task: LocalTask) => void;
  onSaveEdit: () => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  onEditTextChange: (value: string) => void;
  onDelete: (taskId: string) => void;
  onReorder: (tasks: LocalTask[]) => void;
  getTimeDisplay: (task: LocalTask) => { total: number; formatted: string };
}

const MissionObjectivePanel = ({
  tasks,
  selectedTaskId,
  editingTaskId,
  editingText,
  newTaskText,
  taskGating,
  onNewTaskTextChange,
  onSubmit,
  onOpenPricing,
  onSelect,
  onToggleComplete,
  onStartEdit,
  onSaveEdit,
  onEditKeyDown,
  onEditTextChange,
  onDelete,
  onReorder,
  getTimeDisplay,
}: MissionObjectivePanelProps) => {
  const hardCapped = taskGating.hitHardCap(tasks.length);
  const freeLimitHit = taskGating.hitFreeLimit(tasks.length);

  return (
    <div className="space-y-4 animate-fade-in w-full max-w-md md:max-w-lg mx-auto">
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="flex justify-between items-center px-1 mb-2">
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            MISSION OBJECTIVE
          </span>
          <div className="flex items-center gap-2">
            {taskGating.showUpgradeHint && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="text-[10px] font-mono text-yellow-400/70 hover:text-yellow-400 transition-colors tracking-wider"
              >
                ↑ UPGRADE
              </button>
            )}
            {taskGating.showSlotCounter && (
              <span
                className={`text-xs uppercase tracking-widest font-mono font-semibold ${
                  freeLimitHit ? "text-yellow-400/80" : "text-foreground/50"
                }`}
              >
                SLOT [{tasks.length}/{taskGating.limit}]
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTaskText}
            onChange={e => onNewTaskTextChange(e.target.value)}
            placeholder="> Add a focus task..."
            className="text-center text-lg h-14 font-mono bg-card border border-primary/30 backdrop-blur-md placeholder:text-white/30 placeholder:text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all flex-1"
            disabled={hardCapped}
          />
          <Button
            type="submit"
            size="icon"
            className="h-14 w-14 bg-primary hover:bg-primary/90"
            disabled={hardCapped || !newTaskText.trim()}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {tasks.length > 0 && (
        <SortableTaskList
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          editingTaskId={editingTaskId}
          editingText={editingText}
          onSelect={onSelect}
          onToggleComplete={onToggleComplete}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onEditKeyDown={onEditKeyDown}
          onEditTextChange={onEditTextChange}
          onDelete={onDelete}
          onReorder={onReorder}
          getTimeDisplay={getTimeDisplay}
        />
      )}
    </div>
  );
};

export default memo(MissionObjectivePanel);
