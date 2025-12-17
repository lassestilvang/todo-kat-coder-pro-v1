"use client";

import * as React from "react";
import { TaskWithRelations } from "@/types/task";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
// import { format } from "date-fns";

interface TaskCardProps {
  task: TaskWithRelations;
  onToggle?: (task: TaskWithRelations) => void;
  onEdit?: (task: TaskWithRelations) => void;
  onDelete?: (task: TaskWithRelations) => void;
  onDuplicate?: (task: TaskWithRelations) => void;
  onAddSubTask?: (task: TaskWithRelations) => void;
  onAddAttachment?: (task: TaskWithRelations) => void;
  compact?: boolean;
  showLabels?: boolean;
  showSubTasks?: boolean;
  showAttachments?: boolean;
  showActions?: boolean;
}

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate,
  onAddSubTask,
  onAddAttachment,
  compact = false,
  showLabels = true,
  showSubTasks = true,
  showAttachments = true,
  showActions = true,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const priorityColors = {
    none: "bg-gray-100 text-gray-800",
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const subTasksCompleted =
    task.subTasks?.filter((st) => st.isCompleted).length || 0;
  const subTasksTotal = task.subTasks?.length || 0;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.isCompleted}
            onChange={() => onToggle?.(task)}
            className="mt-1"
          />

          <div className="flex-1">
            <h3
              className={`text-sm font-medium ${
                task.isCompleted
                  ? "text-gray-500 line-through"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {task.description}
              </p>
            )}

            {!compact && (
              <>
                {showLabels && task.labels && task.labels.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {task.labels.map((label) => (
                      <Badge
                        key={label.id}
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: label.color, color: label.color }}
                      >
                        <span className="mr-1">{label.icon}</span>
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {showSubTasks && task.subTasks && task.subTasks.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Subtasks</span>
                      <span>
                        {subTasksCompleted}/{subTasksTotal}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                              width: `${
                                subTasksTotal > 0
                                  ? (subTasksCompleted / subTasksTotal) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? "Hide" : "Show"}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 space-y-2">
                        {task.subTasks.map((subTask) => (
                          <div
                            key={subTask.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={subTask.isCompleted}
                              onChange={() => {
                                // Handle subtask toggle
                              }}
                              checkboxSize="sm"
                            />
                            <span
                              className={`text-sm ${
                                subTask.isCompleted
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {subTask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>

            {task.date && (
              <Badge variant="outline" className="text-xs">
                {formatDate(task.date)}
              </Badge>
            )}

            {task.deadline && (
              <Badge variant="destructive" className="text-xs">
                Due: {formatDate(task.deadline)}
              </Badge>
            )}
          </div>

          {showAttachments &&
            task.attachments &&
            task.attachments.length > 0 && (
              <Badge variant="outline" className="text-xs">
                📎 {task.attachments.length}
              </Badge>
            )}

          {showActions && (
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit?.(task)}>
                ✏️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate?.(task)}
              >
                📋
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(task)}
              >
                🗑️
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
