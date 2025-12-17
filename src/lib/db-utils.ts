import { db } from "./db";
import { tasks } from "./schema";
import type { Task } from "@/types/task";

/**
 * Database utility functions for common operations
 */
export class DatabaseUtils {
  /**
   * Format time estimate/actual time to HH:mm format
   */
  static formatTime(hours?: number, minutes?: number): string {
    if (!hours && !minutes) return "";

    const h = hours || 0;
    const m = minutes || 0;

    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  /**
   * Parse time from HH:mm format to hours and minutes
   */
  static parseTime(timeString: string): { hours: number; minutes: number } {
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
  static async calculateTaskCompletion(taskId: number): Promise<number> {
    // This would need to be implemented with sub-tasks query
    // For now, return 0 or implement based on your sub-task logic
    return 0;
  }

  /**
   * Check if a task is overdue
   */
  static isTaskOverdue(task: Pick<Task, "deadline" | "isCompleted">): boolean {
    if (task.isCompleted || !task.deadline) return false;

    const now = new Date();
    const deadline = new Date(task.deadline);

    return deadline < now;
  }

  /**
   * Get priority color class for styling
   */
  static getPriorityColor(priority: Task["priority"]): string {
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
  static formatDate(dateString: string): string {
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
  static formatDeadline(deadlineString?: string): string {
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
  static generateTaskSummary(task: Task): string {
    const parts: string[] = [];

    if (task.priority && task.priority !== "none") {
      parts.push(`Priority: ${task.priority}`);
    }

    if (task.date) {
      parts.push(`Date: ${this.formatDate(task.date)}`);
    }

    if (task.deadline) {
      parts.push(`Deadline: ${this.formatDeadline(task.deadline)}`);
    }

    if (task.estimateHours || task.estimateMinutes) {
      const estimate = this.formatTime(
        task.estimateHours,
        task.estimateMinutes
      );
      parts.push(`Estimate: ${estimate}`);
    }

    if (task.actualHours || task.actualMinutes) {
      const actual = this.formatTime(task.actualHours, task.actualMinutes);
      parts.push(`Actual: ${actual}`);
    }

    return parts.join(" • ");
  }

  /**
   * Search tasks with full-text search capabilities
   */
  static async searchTasks(
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
      db.sql`LOWER(${tasks.title}) LIKE LOWER('%' || ${query} || '%')`,
      db.sql`LOWER(${tasks.description}) LIKE LOWER('%' || ${query} || '%')`,
    ];

    const whereClause = db.sql`(${searchConditions.join(" OR ")})`;

    // Apply additional filters
    let finalWhereClause = whereClause;
    if (options.listId) {
      finalWhereClause = db.sql`${finalWhereClause} AND ${tasks.listId} = ${options.listId}`;
    }
    if (options.priority) {
      finalWhereClause = db.sql`${finalWhereClause} AND ${tasks.priority} = ${options.priority}`;
    }
    if (options.completed !== undefined) {
      finalWhereClause = db.sql`${finalWhereClause} AND ${
        tasks.isCompleted
      } = ${options.completed ? 1 : 0}`;
    }

    // Get total count
    const totalResult = await db
      .select({ count: db.sql<number>`COUNT(*)` })
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
      .orderBy(db.sql`${tasks.isCompleted}, ${tasks.date} DESC`)
      .all();

    return {
      tasks: taskResults as Task[],
      total,
    };
  }

  /**
   * Get task statistics for dashboard
   */
  static async getTaskStatistics() {
    const stats = await db.transaction(async (tx) => {
      const [
        totalTasks,
        completedTasks,
        pendingTasks,
        highPriorityTasks,
        overdueTasks,
        todayTasks,
      ] = await Promise.all([
        tx
          .select({ count: db.sql<number>`COUNT(*)` })
          .from(tasks)
          .get(),
        tx
          .select({ count: db.sql<number>`COUNT(*)` })
          .from(tasks)
          .where(db.sql`${tasks.isCompleted} = 1`)
          .get(),
        tx
          .select({ count: db.sql<number>`COUNT(*)` })
          .from(tasks)
          .where(db.sql`${tasks.isCompleted} = 0`)
          .get(),
        tx
          .select({ count: db.sql<number>`COUNT(*)` })
          .from(tasks)
          .where(
            db.sql`${tasks.priority} = 'high' AND ${tasks.isCompleted} = 0`
          )
          .get(),
        tx
          .select({ count: db.sql<number>`COUNT(*)` })
          .from(tasks)
          .where(
            db.sql`${tasks.deadline} < DATETIME('now') AND ${tasks.isCompleted} = 0`
          )
          .get(),
        tx
          .select({ count: db.sql<number>`COUNT(*)` })
          .from(tasks)
          .where(
            db.sql`DATE(${tasks.date}) = DATE('now') AND ${tasks.isCompleted} = 0`
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
  static async cleanupOldChanges(maxAgeDays: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    const result = await db
      .delete(tasks)
      .where(db.sql`${tasks.createdAt} < ${cutoffDate.toISOString()}`)
      .run();

    return result.changes;
  }
}
