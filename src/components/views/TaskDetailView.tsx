"use client";

import * as React from "react";
import { TaskWithRelations } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { useListStore } from "@/store/listStore";
import { useLabelStore } from "@/store/labelStore";

interface TaskDetailViewProps {
  task: TaskWithRelations;
  onClose: () => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (task: TaskWithRelations) => void;
  onDuplicate: (task: TaskWithRelations) => void;
}

export function TaskDetailView({
  task,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}: TaskDetailViewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const lists = useListStore((state) =>
    state.allIds.map((id) => state.byId[id])
  );
  const labels = useLabelStore((state) =>
    state.allIds.map((id) => state.byId[id])
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (
    hours: number | undefined,
    minutes: number | undefined
  ) => {
    const hrs = hours || 0;
    const mins = minutes || 0;
    if (hrs === 0 && mins === 0) return "0m";
    const totalMinutes = hrs * 60 + mins;
    const hoursResult = Math.floor(totalMinutes / 60);
    const minutesResult = totalMinutes % 60;
    return `${hoursResult}h ${minutesResult}m`;
  };

  const subTasksCompleted =
    task.subTasks?.filter((st) => st.isCompleted).length || 0;
  const subTasksTotal = task.subTasks?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task.title}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => onDuplicate(task)}
            className="flex items-center space-x-2"
          >
            <span>📋</span>
            <span>Duplicate</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2"
          >
            <span>✏️</span>
            <span>{isEditing ? "Cancel" : "Edit"}</span>
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(task)}
            className="flex items-center space-x-2"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Task Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <TaskForm
                task={task}
                lists={lists}
                labels={labels}
                onSubmit={(data) => {
                  onEdit({ ...task, ...data });
                  setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
                onDelete={onDelete}
                mode="edit"
              />
            </div>
          ) : (
            <>
              {/* Description */}
              {task.description && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Description
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Subtasks */}
              {task.subTasks && task.subTasks.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Subtasks
                  </h2>
                  <div className="space-y-3">
                    {task.subTasks.map((subTask) => (
                      <div
                        key={subTask.id}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          checked={subTask.isCompleted}
                          onChange={() => {
                            // Handle subtask toggle
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span
                          className={`text-sm ${
                            subTask.isCompleted
                              ? "text-gray-500 line-through"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {subTask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {subTasksCompleted}/{subTasksTotal} completed
                    </span>
                    <div className="h-2 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
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
                </div>
              )}

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Attachments
                  </h2>
                  <div className="space-y-2">
                    {task.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">📎</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {attachment.fileName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {attachment.mimeType} • {attachment.fileSize}{" "}
                              bytes
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Changes History */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Activity
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Task created
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>
                  </div>
                  {task.updatedAt !== task.createdAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Task updated
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(task.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {task.isCompleted && task.completedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Task completed
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(task.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Details
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Priority
                </span>
                <Badge
                  className={`mt-1 ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : task.priority === "low"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.priority}
                </Badge>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  List
                </span>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {task.list?.emoji} {task.list?.name}
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Date
                </span>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {formatDate(task.date)}
                </p>
              </div>

              {task.deadline && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Deadline
                  </span>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(task.deadline)}
                  </p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Estimated Time
                </span>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {formatTime(
                    task.estimateHours || 0,
                    task.estimateMinutes || 0
                  )}
                </p>
              </div>

              {task.actualHours !== null && task.actualMinutes !== null && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Actual Time
                  </span>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {formatTime(task.actualHours, task.actualMinutes)}
                  </p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </span>
                <Badge
                  variant="outline"
                  className={`mt-1 ${
                    task.isCompleted
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.isCompleted ? "Completed" : "Pending"}
                </Badge>
              </div>

              {task.isRecurring && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Recurring
                  </span>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {task.recurrenceType} (every {task.recurrenceInterval})
                  </p>
                  {task.recurrenceEndDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ends: {formatDate(task.recurrenceEndDate)}
                    </p>
                  )}
                </div>
              )}

              {task.reminders && task.reminders.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Reminders
                  </span>
                  <div className="mt-1 space-y-1">
                    {task.reminders.map((reminder, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reminder.time} {reminder.unit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Labels
              </h2>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: label.color, color: label.color }}
                  >
                    <span className="mr-2">{label.icon}</span>
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                variant={task.isCompleted ? "outline" : "secondary"}
                onClick={() => {
                  // Toggle completion
                }}
                className="w-full"
              >
                {task.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onDuplicate(task)}
                className="w-full"
              >
                Duplicate Task
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                Edit Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
