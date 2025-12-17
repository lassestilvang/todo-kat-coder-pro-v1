"use client";

import * as React from "react";
import {
  Task,
  TaskWithRelations,
  Priority,
  RecurrenceType,
} from "@/types/task";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Modal } from "./ui/modal";

interface TaskFormProps {
  task?: TaskWithRelations;
  lists: Array<{ id: number; name: string; color: string; emoji: string }>;
  labels: Array<{ id: number; name: string; color: string; icon: string }>;
  onSubmit: (data: Task) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: (task: TaskWithRelations) => void;
  mode?: "create" | "edit";
  loading?: boolean;
  error?: string;
}

export function TaskForm({
  task,
  lists,
  labels,
  onSubmit,
  onCancel,
  onDelete,
  mode = "create",
  loading = false,
  error,
}: TaskFormProps) {
  const [formData, setFormData] = React.useState<Task>({
    title: task?.title || "",
    description: task?.description || "",
    date: task?.date || new Date().toISOString().split("T")[0],
    deadline: task?.deadline || "",
    estimateHours: task?.estimateHours || 0,
    estimateMinutes: task?.estimateMinutes || 0,
    actualHours: task?.actualHours || 0,
    actualMinutes: task?.actualMinutes || 0,
    priority: task?.priority || "none",
    listId: task?.listId || lists[0]?.id || 0,
    isCompleted: task?.isCompleted || false,
    completedAt: task?.completedAt || "",
    isRecurring: task?.isRecurring || false,
    recurrenceType: task?.recurrenceType || undefined,
    recurrenceInterval: task?.recurrenceInterval || 1,
    recurrenceEndDate: task?.recurrenceEndDate || "",
    reminders: task?.reminders || [],
  });

  const handleInputChange = (field: keyof Task, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Task title"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Task description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date *
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Deadline
          </label>
          <Input
            type="datetime-local"
            value={formData.deadline || ""}
            onChange={(e) => handleInputChange("deadline", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <Select
            value={formData.priority}
            onChange={(e) =>
              handleInputChange("priority", e.target.value as Priority)
            }
            options={[
              { value: "none", label: "No priority" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            List
          </label>
          <Select
            value={formData.listId.toString()}
            onChange={(e) =>
              handleInputChange("listId", Number(e.target.value))
            }
            options={lists.map((list) => ({
              value: list.id.toString(),
              label: `${list.emoji} ${list.name}`,
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Estimate Hours
          </label>
          <Input
            type="number"
            min="0"
            max="23"
            value={formData.estimateHours || 0}
            onChange={(e) =>
              handleInputChange("estimateHours", Number(e.target.value))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Estimate Minutes
          </label>
          <Input
            type="number"
            min="0"
            max="59"
            value={formData.estimateMinutes || 0}
            onChange={(e) =>
              handleInputChange("estimateMinutes", Number(e.target.value))
            }
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Checkbox
          checked={formData.isCompleted}
          onChange={(checked) => handleInputChange("isCompleted", checked)}
          label="Mark as completed"
        />

        <Checkbox
          checked={formData.isRecurring}
          onChange={(checked) => handleInputChange("isRecurring", checked)}
          label="Recurring task"
        />
      </div>

      {formData.isRecurring && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recurrence Type
            </label>
            <Select
              value={formData.recurrenceType || ""}
              onChange={(e) =>
                handleInputChange(
                  "recurrenceType",
                  e.target.value as RecurrenceType
                )
              }
              options={[
                { value: "", label: "Select recurrence type" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "weekday", label: "Weekdays" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Interval
            </label>
            <Input
              type="number"
              min="1"
              value={formData.recurrenceInterval || 1}
              onChange={(e) =>
                handleInputChange("recurrenceInterval", Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <Input
              type="date"
              value={formData.recurrenceEndDate || ""}
              onChange={(e) =>
                handleInputChange("recurrenceEndDate", e.target.value)
              }
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {onDelete && task && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(task)}
          >
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Task"
            : "Update Task"}
        </Button>
      </div>
    </form>
  );
}
