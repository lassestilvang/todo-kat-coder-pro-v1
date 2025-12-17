"use client";

import * as React from "react";
import { TaskWithRelations } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorMessage } from "./ui/ErrorMessage";

interface TaskListProps {
  tasks: TaskWithRelations[];
  loading?: boolean;
  error?: string;
  onTaskToggle?: (task: TaskWithRelations) => void;
  onTaskEdit?: (task: TaskWithRelations) => void;
  onTaskDelete?: (task: TaskWithRelations) => void;
  onTaskDuplicate?: (task: TaskWithRelations) => void;
  onTaskClick?: (task: TaskWithRelations) => void;
  emptyState?: React.ReactNode;
  compact?: boolean;
  showLabels?: boolean;
  showSubTasks?: boolean;
  showAttachments?: boolean;
  showActions?: boolean;
  virtualized?: boolean;
  onScrollToBottom?: () => void;
}

export function TaskList({
  tasks,
  loading = false,
  error,
  onTaskToggle,
  onTaskEdit,
  onTaskDelete,
  onTaskDuplicate,
  onTaskClick,
  emptyState,
  compact = false,
  showLabels = true,
  showSubTasks = true,
  showAttachments = true,
  showActions = true,
  virtualized = false,
  onScrollToBottom,
}: TaskListProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !onScrollToBottom) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
      ) {
        onScrollToBottom();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [onScrollToBottom]);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load tasks"
        message={error}
        action={{
          label: "Retry",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center">
        {emptyState || (
          <div className="text-gray-500 dark:text-gray-400">
            No tasks found. Create your first task!
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`space-y-3 ${
        virtualized ? "max-h-[600px] overflow-y-auto" : ""
      }`}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onTaskToggle}
          onEdit={onTaskEdit}
          onDelete={onTaskDelete}
          onDuplicate={onTaskDuplicate}
          compact={compact}
          showLabels={showLabels}
          showSubTasks={showSubTasks}
          showAttachments={showAttachments}
          showActions={showActions}
        />
      ))}

      {loading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
