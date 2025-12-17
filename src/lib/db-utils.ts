import { db } from "./db";
import { tasks } from "./schema";
import { sql } from "drizzle-orm";
import type { Task } from "@/types/task";

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
 * Calculate task completion percentage based on sub-tasks
 */
export async function calculateTaskCompletion(taskId: number): Promise<number> {
  // This would need to be implemented with sub-tasks query
  // For now, return 0 or implement based on your sub-task logic
  return 0;
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

/**
 * Search tasks with full-text search capabilities
 */
export async function searchTasks(
  query: string,
  options: {
    listId?: number;
    priority?: Task["priority"];
    completed?: boolean;
    limit?: number;
    offset?: number;
  } = {}
) {
  if (!query.trim()) {
    return { tasks: [], total: 0 };
  }

  // Build search conditions
  const searchConditions = [
    sql`LOWER(${tasks.title}) LIKE LOWER('%' || ${query} || '%')`,
    sql`LOWER(${tasks.description}) LIKE LOWER('%' || ${query} || '%')`,
  ];

  const whereClause = sql`(${searchConditions.join(" OR ")})`;

  // Apply additional filters
  let finalWhereClause = whereClause;
  if (options.listId) {
    finalWhereClause = sql`${finalWhereClause} AND ${tasks.listId} = ${options.listId}`;
  }
  if (options.priority) {
    finalWhereClause = sql`${finalWhereClause} AND ${tasks.priority} = ${options.priority}`;
  }
  if (options.completed !== undefined) {
    finalWhereClause = sql`${finalWhereClause} AND ${
      tasks.isCompleted
    } = ${options.completed ? 1 : 0}`;
  }

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tasks)
    .where(finalWhereClause)
    .get();

  const total = totalResult?.count || 0;

  // Get tasks
  const taskResults = await db
    .select()
    .from(tasks)
    .where(finalWhereClause)
    .limit(options.limit || 50)
    .offset(options.offset || 0)
    .orderBy(sql`${tasks.isCompleted}, ${tasks.date} DESC`)
    .all();

  // Convert reminders from string to array if needed
  const tasksWithProperReminders = taskResults.map((task: { reminders: string | unknown[] }) => ({
    ...task,
    reminders: typeof task.reminders === 'string' ? JSON.parse(task.reminders || '[]') : task.reminders,
  }));

  return {
    tasks: tasksWithProperReminders as Task[],
    total,
  };
}

/**
 * Get task statistics for dashboard
 */
export async function getTaskStatistics() {
  const stats = await db.transaction(async (tx: unknown) => {
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
      overdueTasks,
      todayTasks,
    ] = await Promise.all([
      (tx as any)
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .get(),
      (tx as any)
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .where(sql`${tasks.isCompleted} = 1`)
        .get(),
      (tx as any)
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .where(sql`${tasks.isCompleted} = 0`)
        .get(),
      (tx as any)
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .where(
          sql`${tasks.priority} = 'high' AND ${tasks.isCompleted} = 0`
        )
        .get(),
      (tx as any)
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .where(
          sql`${tasks.deadline} < DATETIME('now') AND ${tasks.isCompleted} = 0`
        )
        .get(),
      (tx as any)
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .where(
          sql`DATE(${tasks.date}) = DATE('now') AND ${tasks.isCompleted} = 0`
        )
        .get(),
    ]);

    return {
      totalTasks: Number(totalTasks?.count || 0),
      completedTasks: Number(completedTasks?.count || 0),
      pendingTasks: Number(pendingTasks?.count || 0),
      highPriorityTasks: Number(highPriorityTasks?.count || 0),
      overdueTasks: Number(overdueTasks?.count || 0),
      todayTasks: Number(todayTasks?.count || 0),
    };
  });

  return stats;
}

/**
 * Clean up old task changes (for maintenance)
 */
export async function cleanupOldChanges(maxAgeDays: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  const result = await db
    .delete(tasks)
    .where(sql`${tasks.createdAt} < ${cutoffDate.toISOString()}`)
    .run();

  return result.changes;
}

