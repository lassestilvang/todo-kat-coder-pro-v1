import { db } from "@/lib/db";
import { tasks, lists, labels, subTasks, attachments } from "@/lib/schema";
import { and, asc, desc, eq, inArray, like, or, sql, count } from "drizzle-orm";
import { TaskWithRelations } from "@/types/task";

export class SearchService {
  async searchAll(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: keyof TaskWithRelations;
      orderDirection?: "asc" | "desc";
    } = {}
  ): Promise<{ results: TaskWithRelations[]; total: number }> {
    try {
      const {
        limit = 50,
        offset = 0,
        orderBy = "updatedAt",
        orderDirection = "desc",
      } = options;

      const searchConditions = [
        like(tasks.title, `%${query}%`),
        like(tasks.description, `%${query}%`),
        like(labels.name, `%${query}%`),
        like(subTasks.title, `%${query}%`),
        like(attachments.fileName, `%${query}%`),
      ];

      const whereClause = sql`(${searchConditions.join(" OR ")})`;

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(tasks)
        .leftJoin(labels, eq(tasks.id, labels.id))
        .leftJoin(subTasks, eq(tasks.id, subTasks.taskId))
        .leftJoin(attachments, eq(tasks.id, attachments.taskId))
        .where(whereClause)
        .get();

      const total = totalResult?.count || 0;

      // Get search results with relations
      const searchQuery = db
        .select({
          task: tasks,
          list: lists,
          labels: {
            id: labels.id,
            name: labels.name,
            icon: labels.icon,
            color: labels.color,
          },
          subTasks: subTasks,
          attachments: attachments,
        })
        .from(tasks)
        .leftJoin(lists, eq(tasks.listId, lists.id))
        .leftJoin(labels, eq(tasks.id, labels.id))
        .leftJoin(subTasks, eq(tasks.id, subTasks.taskId))
        .leftJoin(attachments, eq(tasks.id, attachments.taskId))
        .where(whereClause)
        .orderBy(
          orderDirection === "asc" ? asc(tasks.updatedAt) : desc(tasks.updatedAt)
        )
        .limit(limit)
        .offset(offset);

      const rawResults = await searchQuery.all();

      // Group results by task
      const tasksMap = new Map<number, TaskWithRelations>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawResults.forEach((row: any) => {
        const taskId = row.task.id;

        if (!tasksMap.has(taskId)) {
          tasksMap.set(taskId, {
            ...row.task,
            list: row.list,
            labels: [],
            subTasks: [],
            attachments: [],
          });
        }

        const task = tasksMap.get(taskId)!;

        // Add label if exists and not already added
        if (row.labels) {
          if (!task.labels) task.labels = [];
          if (!task.labels.find((l) => l.id === row.labels.id)) {
            task.labels.push(row.labels);
          }
        }

        // Add subtask if exists and not already added
        if (row.subTasks) {
          if (!task.subTasks) task.subTasks = [];
          if (!task.subTasks.find((s) => s.id === row.subTasks.id)) {
            task.subTasks.push(row.subTasks);
          }
        }

        // Add attachment if exists and not already added
        if (row.attachments) {
          if (!task.attachments) task.attachments = [];
          if (!task.attachments.find((a) => a.id === row.attachments.id)) {
            task.attachments.push(row.attachments);
          }
        }
      });

      return {
        results: Array.from(tasksMap.values()),
        total,
      };
    } catch (error) {
      console.error("Error searching:", error);
      throw new Error("Failed to search");
    }
  }

  async searchTasks(
    query: string,
    options: {
      listId?: number;
      priority?: string;
      completed?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<TaskWithRelations[]> {
    try {
      const searchConditions = [
        like(tasks.title, `%${query}%`),
        like(tasks.description, `%${query}%`),
      ];

      let whereClause = sql`(${searchConditions.join(" OR ")})`;

      // Apply additional filters
      if (options.listId) {
        whereClause = sql`${whereClause} AND ${tasks.listId} = ${options.listId}`;
      }

      if (options.priority) {
        whereClause = sql`${whereClause} AND ${tasks.priority} = ${options.priority}`;
      }

      if (options.completed !== undefined) {
        whereClause = sql`${whereClause} AND ${tasks.isCompleted} = ${
          options.completed ? 1 : 0
        }`;
      }

      const searchQuery = db
        .select({
          task: tasks,
          list: lists,
          labels: {
            id: labels.id,
            name: labels.name,
            icon: labels.icon,
            color: labels.color,
          },
          subTasks: subTasks,
          attachments: attachments,
        })
        .from(tasks)
        .leftJoin(lists, eq(tasks.listId, lists.id))
        .leftJoin(labels, eq(tasks.id, labels.id))
        .leftJoin(subTasks, eq(tasks.id, subTasks.taskId))
        .leftJoin(attachments, eq(tasks.id, attachments.taskId))
        .where(whereClause)
        .orderBy(desc(tasks.updatedAt));

      const rawResults = await searchQuery.all();

      // Group results by task
      const tasksMap = new Map<number, TaskWithRelations>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawResults.forEach((row: any) => {
        const taskId = row.task.id;

        if (!tasksMap.has(taskId)) {
          tasksMap.set(taskId, {
            ...row.task,
            list: row.list,
            labels: [],
            subTasks: [],
            attachments: [],
          });
        }

        const task = tasksMap.get(taskId)!;

        // Add label if exists and not already added
        if (row.labels) {
          if (!task.labels) task.labels = [];
          if (!task.labels.find((l) => l.id === row.labels.id)) {
            task.labels.push(row.labels);
          }
        }

        // Add subtask if exists and not already added
        if (row.subTasks) {
          if (!task.subTasks) task.subTasks = [];
          if (!task.subTasks.find((s) => s.id === row.subTasks.id)) {
            task.subTasks.push(row.subTasks);
          }
        }

        // Add attachment if exists and not already added
        if (row.attachments) {
          if (!task.attachments) task.attachments = [];
          if (!task.attachments.find((a) => a.id === row.attachments.id)) {
            task.attachments.push(row.attachments);
          }
        }
      });

      return Array.from(tasksMap.values());
    } catch (error) {
      console.error("Error searching tasks:", error);
      throw new Error("Failed to search tasks");
    }
  }

  async searchLabels(query: string): Promise<{ id: number; name: string }[]> {
    try {
      return db
        .select({ id: labels.id, name: labels.name })
        .from(labels)
        .where(like(labels.name, `%${query}%`))
        .limit(10)
        .all() as { id: number; name: string }[];
    } catch (error) {
      console.error("Error searching labels:", error);
      throw new Error("Failed to search labels");
    }
  }

  async searchLists(query: string): Promise<{ id: number; name: string }[]> {
    try {
      return db
        .select({ id: lists.id, name: lists.name })
        .from(lists)
        .where(like(lists.name, `%${query}%`))
        .limit(10)
        .all() as { id: number; name: string }[];
    } catch (error) {
      console.error("Error searching lists:", error);
      throw new Error("Failed to search lists");
    }
  }
}