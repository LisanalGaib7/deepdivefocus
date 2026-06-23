import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { LocalTask } from "@/hooks/useTasks";
import type { useTaskGating } from "@/features/monetization/gating";

type TaskGating = ReturnType<typeof useTaskGating>;

/**
 * Owns task-related local state (selection, editing, input) plus the
 * orchestration handlers consumed by MissionObjectivePanel.
 *
 * Lives outside the panel itself so Index can still observe `selectedTaskId`
 * (needed by the dive timer for time-spent accounting) without lifting
 * everything else back into the page component.
 */
export function useTaskHandlers({
  tasks,
  addTask,
  updateTask,
  deleteTask,
  getIsRunning,
  taskGating,
  onHitFreeLimit,
}: {
  tasks: LocalTask[];
  addTask: (title: string) => Promise<LocalTask | null>;
  updateTask: (
    id: string,
    updates: Partial<Pick<LocalTask, "text" | "isCompleted" | "timeSpentInSeconds">>,
  ) => Promise<void> | void;
  deleteTask: (id: string) => Promise<void> | void;
  /** Read at call-time to avoid circular hook ordering with useDiveTimer. */
  getIsRunning: () => boolean;
  taskGating: TaskGating;
  onHitFreeLimit: () => void;
}) {

  const [newTaskText, setNewTaskText] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Auto-select first uncompleted task when tasks load.
  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      const firstUncompleted = tasks.find((t) => !t.isCompleted);
      if (firstUncompleted) setSelectedTaskId(firstUncompleted.id);
    }
  }, [tasks, selectedTaskId]);

  const handleAddTask = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskText.trim()) return;

      if (taskGating.hitFreeLimit(tasks.length)) {
        onHitFreeLimit();
        return;
      }
      if (taskGating.hitHardCap(tasks.length)) {
        toast.error(`Mission slots full (${taskGating.hardCap} max)`, {
          description: "Complete or remove a mission to add a new one.",
        });
        return;
      }

      const newTask = await addTask(newTaskText.trim());
      setNewTaskText("");
      if (!selectedTaskId && newTask) setSelectedTaskId(newTask.id);
    },
    [newTaskText, taskGating, tasks.length, addTask, selectedTaskId, onHitFreeLimit],
  );

  const handleSelectTask = useCallback(
    (taskId: string) => {
      if (!getIsRunning()) setSelectedTaskId(taskId);
    },
    [getIsRunning],
  );


  const handleToggleComplete = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) updateTask(taskId, { isCompleted: !task.isCompleted });
      if (task && !task.isCompleted && selectedTaskId === taskId) {
        const nextUncompleted = tasks.find((t) => t.id !== taskId && !t.isCompleted);
        setSelectedTaskId(nextUncompleted?.id || null);
      }
    },
    [tasks, updateTask, selectedTaskId],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      await deleteTask(taskId);
      if (selectedTaskId === taskId) {
        const remaining = tasks.filter((t) => t.id !== taskId && !t.isCompleted);
        setSelectedTaskId(remaining[0]?.id || null);
      }
    },
    [deleteTask, selectedTaskId, tasks],
  );

  const handleStartEdit = useCallback((task: LocalTask) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingTaskId && editingText.trim()) {
      updateTask(editingTaskId, { text: editingText.trim() });
    }
    setEditingTaskId(null);
    setEditingText("");
  }, [editingTaskId, editingText, updateTask]);

  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditingText("");
  }, []);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === "Escape") {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit],
  );

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return {
    // state
    newTaskText,
    selectedTaskId,
    selectedTask,
    editingTaskId,
    editingText,
    // setters
    setNewTaskText,
    setEditingText,
    // handlers
    handleAddTask,
    handleSelectTask,
    handleToggleComplete,
    handleDeleteTask,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleEditKeyDown,
  };
}
