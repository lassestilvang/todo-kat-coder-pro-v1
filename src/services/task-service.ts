import { db } from "@/lib/db";
import { DatabaseService } from "@/lib/db-service";
import {
  attachments,
  labels,
  lists,
  subTasks,
  taskChanges,
  taskLabels,
  tasks,
} from "@/lib/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  like,
  sql,
  or,
  between,
} from "drizzle-orm";
import {
  Attachment,
  Label,
  List,
  Priority,
  RecurrenceType,
  Reminder,
  SubTask,
  Task,
  TaskChange,
  TaskFilter,
  TaskFormData,
  TaskWithRelations,
} from "@/types/task";

export class TaskService {
  private dbService = new DatabaseService();

  // Task CRUD operations
  async createTask(taskData: TaskFormData): Promise<TaskWithRelations> {
    try {
      // Create the main task
      const [newTask] = await db
        .insert(tasks)
        .values({
          title: taskData.title,
          description: taskData.description,
          date: taskData.date,
          deadline: taskData.deadline,
          estimateHours: taskData.estimateHours,
          estimateMinutes: taskData.estimateMinutes,
          actualHours: taskData.actualHours,
          actualMinutes: taskData.actualMinutes,
          priority: taskData.priority,
          listId: taskData.listId,
          isCompleted: taskData.isCompleted || false,
          completedAt: taskData.completedAt,
          isRecurring: taskData.isRecurring || false,
          recurrenceType: taskData.recurrenceType,
          recurrenceInterval: taskData.recurrenceInterval,
          recurrenceEndDate: taskData.recurrenceEndDate,
          reminders: taskData.reminders,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      // Add labels if provided
      if (taskData.labels && taskData.labels.length > 0) {
        const labelValues = taskData.labels.map((labelId) => ({
          taskId: newTask.id,
          labelId,
        }));
        await db.insert(taskLabels).values(labelValues).run();
      }

      // Add subtasks if provided
      if (taskData.subTasks && taskData.subTasks.length > 0) {
        const subTaskValues = taskData.subTasks.map((subTask) => ({
          ...subTask,
          taskId: newTask.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        await db.insert(subTasks).values(subTaskValues).run();
      }

      // Add attachments if provided
      if (taskData.attachments && taskData.attachments.length > 0) {
        const attachmentValues = taskData.attachments.map((attachment) => ({
          ...attachment,
          taskId: newTask.id,
          createdAt: new Date().toISOString(),
        }));
        await db.insert(attachments).values(attachmentValues).run();
      }

      // Log the creation
      await this.logTaskChange(newTask.id, "create", null, newTask);

      const createdTask = await this.getTaskById(newTask.id);
      if (!createdTask) {
        throw new Error("Failed to retrieve created task");
      }
      return createdTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw new Error("Failed to create task");
    }
  }

  async updateTask(
    id: number,
    taskData: Partial<TaskFormData>
  ): Promise<TaskWithRelations | undefined> {
    try {
      // Get the current task for change logging
      const currentTask = await this.getTaskById(id);
      if (!currentTask) {
        return undefined;
      }

      // Update the main task
      const [updatedTask] = await db
        .update(tasks)
        .set({
          ...taskData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasks.id, id))
        .returning();

      // Update labels if provided
      if (taskData.labels !== undefined) {
        // Remove existing labels
        await db.delete(taskLabels).where(eq(taskLabels.taskId, id)).run();
        // Add new labels
        if (taskData.labels && taskData.labels.length > 0) {
          const labelValues = taskData.labels.map((labelId) => ({
            taskId: id,
            labelId,
          }));
          await db.insert(taskLabels).values(labelValues).run();
        }
      }

      // Update subtasks if provided
      if (taskData.subTasks !== undefined) {
        // Remove existing subtasks
        await db.delete(subTasks).where(eq(subTasks.taskId, id)).run();
        // Add new subtasks
        if (taskData.subTasks && taskData.subTasks.length > 0) {
          const subTaskValues = taskData.subTasks.map((subTask) => ({
            ...subTask,
            taskId: id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          await db.insert(subTasks).values(subTaskValues).run();
        }
      }

      // Update attachments if provided
      if (taskData.attachments !== undefined) {
        // Remove existing attachments
        await db.delete(attachments).where(eq(attachments.taskId, id)).run();
        // Add new attachments
        if (taskData.attachments && taskData.attachments.length > 0) {
          const attachmentValues = taskData.attachments.map((attachment) => ({
            ...attachment,
            taskId: id,
            createdAt: new Date().toISOString(),
          }));
          await db.insert(attachments).values(attachmentValues).run();
        }
      }

      // Log the update
      await this.logTaskChange(id, "update", currentTask, updatedTask);

      return this.getTaskById(id);
    } catch (error) {
      console.error("Error updating task:", error);
      throw new Error("Failed to update task");
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      // Get the current task for change logging
      const currentTask = await this.getTaskById(id);
      if (!currentTask) {
        return false;
      }

      // Log the deletion
      await this.logTaskChange(id, "delete", currentTask, null);

      // Delete related records (cascading)
      await db.delete(taskLabels).where(eq(taskLabels.taskId, id)).run();
      await db.delete(subTasks).where(eq(subTasks.taskId, id)).run();
      await db.delete(attachments).where(eq(attachments.taskId, id)).run();
      await db.delete(taskChanges).where(eq(taskChanges.taskId, id)).run();

      // Delete the task
      const result = await db.delete(tasks).where(eq(tasks.id, id)).run();

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task");
    }
  }

  async completeTask(id: number): Promise<TaskWithRelations | undefined> {
    try {
      const [completedTask] = await db
        .update(tasks)
        .set({
          isCompleted: true,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasks.id, id))
        .returning();

      if (!completedTask) {
        return undefined;
      }

      // Log the completion
      await this.logTaskChange(id, "complete", null, completedTask);

      return this.getTaskById(id);
    } catch (error) {
      console.error("Error completing task:", error);
      throw new Error("Failed to complete task");
    }
  }

  async uncompleteTask(id: number): Promise<TaskWithRelations | undefined> {
    try {
      const [uncompletedTask] = await db
        .update(tasks)
        .set({
          isCompleted: false,
          completedAt: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasks.id, id))
        .returning();

      if (!uncompletedTask) {
        return undefined;
      }

      // Log the uncompletion
      await this.logTaskChange(id, "uncomplete", null, uncompletedTask);

      return this.getTaskById(id);
    } catch (error) {
      console.error("Error uncompleting task:", error);
      throw new Error("Failed to uncomplete task");
    }
  }

  async getTaskById(id: number): Promise<TaskWithRelations | undefined> {
    return this.dbService.getTaskById(id);
  }

  async getTasks(filter: TaskFilter = {}): Promise<{
    tasks: TaskWithRelations[];
    total: number;
  }> {
    return this.dbService.getTasks(filter);
  }

  // View-specific queries
  async getTodayTasks(): Promise<TaskWithRelations[]> {
    return this.dbService.getTodayTasks();
  }

  async getUpcomingTasks(days: number = 7): Promise<TaskWithRelations[]> {
    return this.dbService.getUpcomingTasks(days);
  }

  async getAllTasks(): Promise<TaskWithRelations[]> {
    return this.dbService.getAllTasks();
  }

  async getInboxTasks(): Promise<TaskWithRelations[]> {
    return this.dbService.getInboxTasks();
  }

  // Advanced filtering and search
  async searchTasks(
    query: string,
    filter: TaskFilter = {}
  ): Promise<TaskWithRelations[]> {
    try {
      const searchConditions = [
        like(tasks.title, `%${query}%`),
        like(tasks.description, `%${query}%`),
      ];

      let whereClause = db.sql`(${searchConditions.join(" OR ")})`;

      // Apply additional filters
      if (filter.listId) {
        whereClause = db.sql`${whereClause} AND ${tasks.listId} = ${filter.listId}`;
      }

      if (filter.priority) {
        whereClause = db.sql`${whereClause} AND ${tasks.priority} = ${filter.priority}`;
      }

      if (filter.completed !== undefined) {
        whereClause = db.sql`${whereClause} AND ${tasks.isCompleted} = ${
          filter.completed ? 1 : 0
        }`;
      }

      // Get tasks with relations
      const taskQuery = db
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
        .leftJoin(taskLabels, eq(tasks.id, taskLabels.taskId))
        .leftJoin(labels, eq(taskLabels.labelId, labels.id))
        .leftJoin(subTasks, eq(tasks.id, subTasks.taskId))
        .leftJoin(attachments, eq(tasks.id, attachments.taskId))
        .where(whereClause)
        .orderBy(desc(tasks.createdAt));

      const rawResults = await taskQuery.all();

      // Group results by task
      const tasksMap = new Map<number, TaskWithRelations>();

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

  // Task change logging
  private async logTaskChange(
    taskId: number,
    changeType: "create" | "update" | "delete" | "complete" | "uncomplete",
    oldValue: unknown,
    newValue: unknown
  ): Promise<void> {
    try {
      await db
        .insert(taskChanges)
        .values({
          taskId,
          changeType,
          oldValue: oldValue ? JSON.stringify(oldValue) : null,
          newValue: newValue ? JSON.stringify(newValue) : null,
          changedFields: this.getChangedFields(oldValue, newValue),
          changedBy: "system", // Could be user ID in a multi-user system
          createdAt: new Date().toISOString(),
        })
        .run();
    } catch (error) {
      console.error("Error logging task change:", error);
      // Don't throw error for logging failures to avoid breaking main operations
    }
  }

  private getChangedFields(oldValue: unknown, newValue: unknown): string {
    if (!oldValue || !newValue) {
      return JSON.stringify(newValue || oldValue);
    }

    const changes: Record<string, { old: unknown; new: unknown }> = {};

    Object.keys(newValue as Record<string, unknown>).forEach((key) => {
      if (
        JSON.stringify((oldValue as Record<string, unknown>)[key]) !==
        JSON.stringify((newValue as Record<string, unknown>)[key])
      ) {
        changes[key] = {
          old: (oldValue as Record<string, unknown>)[key],
          new: (newValue as Record<string, unknown>)[key],
        };
      }
    });

    return Object.keys(changes).length > 0 ? JSON.stringify(changes) : "{}";
  }

  // Statistics and analytics
  async getTaskStatistics(): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    todayTasks: number;
    upcomingTasks: number;
    highPriorityTasks: number;
  }> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [
        totalResult,
        completedResult,
        pendingResult,
        todayResult,
        upcomingResult,
        highPriorityResult,
      ] = await Promise.all([
        db.select({ count: count() }).from(tasks).get(),
        db
          .select({ count: count() })
          .from(tasks)
          .where(eq(tasks.isCompleted, true))
          .get(),
        db
          .select({ count: count() })
          .from(tasks)
          .where(eq(tasks.isCompleted, false))
          .get(),
        db
          .select({ count: count() })
          .from(tasks)
          .where(and(eq(tasks.date, today), eq(tasks.isCompleted, false)))
          .get(),
        db
          .select({ count: count() })
          .from(tasks)
          .where(
            and(
              between(
                tasks.date,
                today,
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              ),
              eq(tasks.isCompleted, false)
            )
          )
          .get(),
        db
          .select({ count: count() })
          .from(tasks)
          .where(and(eq(tasks.priority, "high"), eq(tasks.isCompleted, false)))
          .get(),
      ]);

      return {
        totalTasks: totalResult?.count || 0,
        completedTasks: completedResult?.count || 0,
        pendingTasks: pendingResult?.count || 0,
        todayTasks: todayResult?.count || 0,
        upcomingTasks: upcomingResult?.count || 0,
        highPriorityTasks: highPriorityResult?.count || 0,
      };
    } catch (error) {
      console.error("Error getting task statistics:", error);
      throw new Error("Failed to get task statistics");
    }
  }

  // Recurring task management
  async processRecurringTasks(): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get all completed recurring tasks
      const recurringTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.isRecurring, true),
            eq(tasks.isCompleted, true),
            eq(tasks.date, today)
          )
        );

      for (const task of recurringTasks) {
        const nextDate = this.calculateNextRecurringDate(
          task.date,
          task.recurrenceType,
          task.recurrenceInterval
        );

        if (
          nextDate &&
          (!task.recurrenceEndDate || nextDate <= task.recurrenceEndDate)
        ) {
          // Create a new instance of the task
          await db
            .insert(tasks)
            .values({
              title: task.title,
              description: task.description,
              date: nextDate,
              deadline: task.deadline,
              estimateHours: task.estimateHours,
              estimateMinutes: task.estimateMinutes,
              actualHours: null,
              actualMinutes: null,
              priority: task.priority,
              listId: task.listId,
              isCompleted: false,
              completedAt: null,
              isRecurring: true,
              recurrenceType: task.recurrenceType,
              recurrenceInterval: task.recurrenceInterval,
              recurrenceEndDate: task.recurrenceEndDate,
              reminders: task.reminders,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .run();

          // Copy labels, subtasks, and attachments
          await this.copyTaskRelations(task.id, nextDate);
        }
      }
    } catch (error) {
      console.error("Error processing recurring tasks:", error);
      throw new Error("Failed to process recurring tasks");
    }
  }

  private calculateNextRecurringDate(
    currentDate: string,
    recurrenceType: RecurrenceType | undefined,
    interval: number | undefined
  ): string | null {
    const date = new Date(currentDate);
    const daysToAdd = interval || 1;

    switch (recurrenceType) {
      case "daily":
        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split("T")[0];
      case "weekly":
        date.setDate(date.getDate() + daysToAdd * 7);
        return date.toISOString().split("T")[0];
      case "weekday":
        // Add days until we reach a weekday (Monday to Friday)
        let daysToAddWeekday = daysToAdd;
        while (daysToAddWeekday > 0) {
          date.setDate(date.getDate() + 1);
          const dayOfWeek = date.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysToAddWeekday--;
          }
        }
        return date.toISOString().split("T")[0];
      case "monthly":
        date.setMonth(date.getMonth() + daysToAdd);
        return date.toISOString().split("T")[0];
      case "yearly":
        date.setFullYear(date.getFullYear() + daysToAdd);
        return date.toISOString().split("T")[0];
      case "custom":
        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split("T")[0];
      default:
        return null;
    }
  }

  private async copyTaskRelations(
    taskId: number,
    newDate: string
  ): Promise<void> {
    // Copy labels
    const labels = await db
      .select()
      .from(taskLabels)
      .where(eq(taskLabels.taskId, taskId));

    if (labels.length > 0) {
      // Get the new task ID based on the date
      const newTask = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(eq(tasks.date, newDate), eq(tasks.isCompleted, false)))
        .orderBy(desc(tasks.createdAt))
        .get();

      if (newTask) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const labelValues = labels.map((label: any) => ({
          taskId: newTask.id,
          labelId: label.labelId,
        }));
        await db.insert(taskLabels).values(labelValues).run();
      }
    }

    // Note: Subtasks and attachments are not copied for recurring tasks
    // as they might be specific to each instance
  }
}
