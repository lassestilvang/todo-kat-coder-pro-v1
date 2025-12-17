import type { Task } from "@/types/task";
import { clsx, type ClassValue } from "clsx";

/**
 * Utility function to combine class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format time estimate/actual time to HH:mm format
 */
export function formatTime(hours?: number, minutes?: number): string {
  if (!hours && !minutes) return "";

  const h = hours || 0;
  const m = minutes || 0;

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Parse time from HH:mm format to hours and minutes
 */
export function parseTime(timeString: string): { hours: number; minutes: number } {
  if (!timeString || !timeString.includes(":")) {
    return { hours: 0, minutes: 0 };
  }

  const [hours, minutes] = timeString.split(":").map(Number);
  return {
    hours: isNaN(hours) ? 0 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
  };
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Pick<Task, "deadline" | "isCompleted">): boolean {
  if (task.isCompleted || !task.deadline) return false;

  const now = new Date();
  const deadline = new Date(task.deadline);

  return deadline < now;
}

/**
 * Get priority color class for styling
 */
export function getPriorityColor(priority: Task["priority"]): string {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "low":
      return "text-blue-600 bg-blue-100";
    case "none":
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format deadline for display with time
 */
export function formatDeadline(deadlineString?: string): string {
  if (!deadlineString) return "";

  try {
    const date = new Date(deadlineString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return deadlineString;
  }
}

/**
 * Generate task summary for display
 */
export function generateTaskSummary(task: Task): string {
  const parts: string[] = [];

  if (task.priority && task.priority !== "none") {
    parts.push(`Priority: ${task.priority}`);
  }

  if (task.date) {
    parts.push(`Date: ${formatDate(task.date)}`);
  }

  if (task.deadline) {
    parts.push(`Deadline: ${formatDeadline(task.deadline)}`);
  }

  if (task.estimateHours || task.estimateMinutes) {
    const estimate = formatTime(
      task.estimateHours,
      task.estimateMinutes
    );
    parts.push(`Estimate: ${estimate}`);
  }

  if (task.actualHours || task.actualMinutes) {
    const actual = formatTime(task.actualHours, task.actualMinutes);
    parts.push(`Actual: ${actual}`);
  }

  return parts.join(" • ");
}