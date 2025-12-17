import { db } from "@/lib/db";
import { taskChanges } from "@/lib/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { TaskChange } from "@/types/task";

export class AuditService {
  async getTaskChanges(
    taskId: number,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      changeType?: TaskChange["changeType"];
    } = {}
  ): Promise<TaskChange[]> {
    try {
      const {
        limit = 100,
        offset = 0,
        startDate,
        endDate,
        changeType,
      } = options;

      let whereClause = eq(taskChanges.taskId, taskId);

      if (startDate) {
        whereClause = and(whereClause, gte(taskChanges.createdAt, startDate));
      }

      if (endDate) {
        whereClause = and(whereClause, lte(taskChanges.createdAt, endDate));
      }

      if (changeType) {
        whereClause = and(whereClause, eq(taskChanges.changeType, changeType));
      }

      return db
        .select()
        .from(taskChanges)
        .where(whereClause)
        .orderBy(desc(taskChanges.createdAt))
        .limit(limit)
        .offset(offset)
        .all() as TaskChange[];
    } catch (error) {
      console.error("Error getting task changes:", error);
      throw new Error("Failed to get task changes");
    }
  }

  async getAllChanges(
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      changeType?: TaskChange["changeType"];
      taskId?: number;
    } = {}
  ): Promise<TaskChange[]> {
    try {
      const {
        limit = 100,
        offset = 0,
        startDate,
        endDate,
        changeType,
        taskId,
      } = options;

      let whereClause = undefined;

      if (taskId) {
        whereClause = eq(taskChanges.taskId, taskId);
      }

      if (startDate) {
        whereClause = whereClause
          ? and(whereClause, gte(taskChanges.createdAt, startDate))
          : gte(taskChanges.createdAt, startDate);
      }

      if (endDate) {
        whereClause = whereClause
          ? and(whereClause, lte(taskChanges.createdAt, endDate))
          : lte(taskChanges.createdAt, endDate);
      }

      if (changeType) {
        whereClause = whereClause
          ? and(whereClause, eq(taskChanges.changeType, changeType))
          : eq(taskChanges.changeType, changeType);
      }

      return db
        .select()
        .from(taskChanges)
        .where(whereClause)
        .orderBy(desc(taskChanges.createdAt))
        .limit(limit)
        .offset(offset)
        .all() as TaskChange[];
    } catch (error) {
      console.error("Error getting all changes:", error);
      throw new Error("Failed to get all changes");
    }
  }

  async logChange(
    taskId: number,
    changeType: TaskChange["changeType"],
    oldValue: unknown,
    newValue: unknown,
    changedFields?: Record<string, { old: unknown; new: unknown }>
  ): Promise<void> {
    try {
      await db
        .insert(taskChanges)
        .values({
          taskId,
          changeType,
          oldValue: oldValue ? JSON.stringify(oldValue) : null,
          newValue: newValue ? JSON.stringify(newValue) : null,
          changedFields: changedFields ? JSON.stringify(changedFields) : null,
          changedBy: "system", // Could be user ID in a multi-user system
          createdAt: new Date().toISOString(),
        })
        .run();
    } catch (error) {
      console.error("Error logging change:", error);
      // Don't throw error for logging failures to avoid breaking main operations
    }
  }

  async getChangeStatistics(
    options: {
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    totalChanges: number;
    changesByType: Record<TaskChange["changeType"], number>;
    changesByDay: Array<{ date: string; count: number }>;
  }> {
    try {
      const { startDate, endDate } = options;

      let whereClause = undefined;

      if (startDate) {
        whereClause = gte(taskChanges.createdAt, startDate);
      }

      if (endDate) {
        whereClause = whereClause
          ? and(whereClause, lte(taskChanges.createdAt, endDate))
          : lte(taskChanges.createdAt, endDate);
      }

      // Get total changes
      const totalResult = await db
        .select({ count: count() })
        .from(taskChanges)
        .where(whereClause)
        .get();

      const totalChanges = totalResult?.count || 0;

      // Get changes by type
      const changesByTypeResult = await db
        .select({
          changeType: taskChanges.changeType,
          count: count(),
        })
        .from(taskChanges)
        .where(whereClause)
        .groupBy(taskChanges.changeType);

      const changesByType = changesByTypeResult.reduce((acc, item) => {
        acc[item.changeType as TaskChange["changeType"]] = Number(item.count);
        return acc;
      }, {} as Record<TaskChange["changeType"], number>);

      // Get changes by day
      const changesByDayResult = await db
        .select({
          date: sql<string>`DATE(${taskChanges.createdAt})`,
          count: count(),
        })
        .from(taskChanges)
        .where(whereClause)
        .groupBy(sql`DATE(${taskChanges.createdAt})`)
        .orderBy(desc(sql`DATE(${taskChanges.createdAt})`));

      const changesByDay = changesByDayResult.map((item) => ({
        date: item.date,
        count: Number(item.count),
      }));

      return {
        totalChanges,
        changesByType,
        changesByDay,
      };
    } catch (error) {
      console.error("Error getting change statistics:", error);
      throw new Error("Failed to get change statistics");
    }
  }

  async cleanupOldChanges(maxAgeDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      const result = await db
        .delete(taskChanges)
        .where(lte(taskChanges.createdAt, cutoffDate.toISOString()))
        .run();

      return result.changes || 0;
    } catch (error) {
      console.error("Error cleaning up old changes:", error);
      throw new Error("Failed to cleanup old changes");
    }
  }

  async getTaskHistory(taskId: number): Promise<TaskChange[]> {
    return this.getTaskChanges(taskId, { limit: 1000 });
  }

  async getRecentChanges(limit: number = 50): Promise<TaskChange[]> {
    return db
      .select()
      .from(taskChanges)
      .orderBy(desc(taskChanges.createdAt))
      .limit(limit)
      .all() as TaskChange[];
  }
}
