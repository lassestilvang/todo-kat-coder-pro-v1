import { and, asc, count, desc, eq, inArray, like, sql } from "drizzle-orm";
import { db } from "./db";
import {
  attachments,
  labels,
  lists,
  subTasks,
  taskChanges,
  taskLabels,
  tasks,
} from "./schema";
import type {
  Attachment,
  Label,
  List,
  SubTask,
  Task,
  TaskChange,
  TaskWithRelations,
} from "@/types/task";

export class DatabaseService {
  // Lists operations
  async getLists(): Promise<List[]> {
    return db.select().from(lists).all() as List[];
  }

  async getListById(id: number): Promise<List | undefined> {
    return db.select().from(lists).where(eq(lists.id, id)).get() as
      | List
      | undefined;
  }

  async createList(
    list: Omit<List, "id" | "createdAt" | "updatedAt">
  ): Promise<List> {
    const [newList] = (await db
      .insert(lists)
      .values(list)
      .returning()
      .all()) as List[];
    return newList;
  }

  async updateList(
    id: number,
    updates: Partial<List>
  ): Promise<List | undefined> {
    const [updatedList] = (await db
      .update(lists)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(lists.id, id))
      .returning()
      .all()) as List[];
    return updatedList;
  }

  async deleteList(id: number): Promise<void> {
    await db.delete(lists).where(eq(lists.id, id)).run();
  }

  // Labels operations
  async getLabels(): Promise<Label[]> {
    return db.select().from(labels).all() as Label[];
  }

  async createLabel(label: Omit<Label, "id" | "createdAt">): Promise<Label> {
    const [newLabel] = (await db
      .insert(labels)
      .values(label)
      .returning()
      .all()) as Label[];
    return newLabel;
  }

  async deleteLabel(id: number): Promise<void> {
    await db.delete(labels).where(eq(labels.id, id)).run();
  }

  // Tasks operations
  async getTasks(
    options: {
      listId?: number;
      search?: string;
      priority?: Task["priority"];
      completed?: boolean;
      date?: string;
      limit?: number;
      offset?: number;
      orderBy?: keyof Task;
      orderDirection?: "asc" | "desc";
    } = {}
  ): Promise<{ tasks: TaskWithRelations[]; total: number }> {
    const {
      listId,
      search,
      priority,
      completed,
      date,
      limit = 50,
      offset = 0,
      orderBy = "date",
      orderDirection = "asc",
    } = options;

    // Build where conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereConditions: Array<any> = [];
    if (listId) whereConditions.push(eq(tasks.listId, listId));
    if (priority) whereConditions.push(eq(tasks.priority, priority));
    if (completed !== undefined)
      whereConditions.push(eq(tasks.isCompleted, completed));
    if (date) whereConditions.push(eq(tasks.date, date));
    if (search) {
      whereConditions.push(like(tasks.title, `%${search}%`));
    }

    const whereClause = whereConditions.length
      ? and(...whereConditions)
      : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(tasks)
      .where(whereClause)
      .get();

    const total = totalResult?.count || 0;

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
      .orderBy(
        orderDirection === "asc" ? asc(tasks[orderBy]) : desc(tasks[orderBy])
      )
      .limit(limit)
      .offset(offset);

    const rawResults = await taskQuery.all();

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
          reminders: row.task.reminders ? JSON.parse(row.task.reminders) : [],
        });
      }

      const task = tasksMap.get(taskId)!;

      // Add label if exists and not already added
      if (row.labels && !task.labels?.find((l) => l.id === row.labels.id)) {
        task.labels?.push(row.labels);
      }

      // Add subtask if exists and not already added
      if (
        row.subTasks &&
        !task.subTasks?.find((s) => s.id === row.subTasks.id)
      ) {
        task.subTasks?.push(row.subTasks);
      }

      // Add attachment if exists and not already added
      if (
        row.attachments &&
        !task.attachments?.find((a) => a.id === row.attachments.id)
      ) {
        task.attachments?.push(row.attachments);
      }
    });

    return {
      tasks: Array.from(tasksMap.values()),
      total,
    };
  }

  async getTaskById(id: number): Promise<TaskWithRelations | undefined> {
    const results = await db
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
      .where(eq(tasks.id, id))
      .all();

    if (results.length === 0) return undefined;

    const task = {
      ...results[0].task,
      list: results[0].list,
      labels: [],
      subTasks: [],
      attachments: [],
      reminders: results[0].task.reminders ? JSON.parse(results[0].task.reminders) : [],
    } as TaskWithRelations;

    // Group related data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results.forEach((row: any) => {
      if (row.labels && !task.labels?.find((l) => l.id === row.labels.id)) {
        task.labels?.push(row.labels);
      }
      if (
        row.subTasks &&
        !task.subTasks?.find((s) => s.id === row.subTasks.id)
      ) {
        task.subTasks?.push(row.subTasks);
      }
      if (
        row.attachments &&
        !task.attachments?.find((a) => a.id === row.attachments.id)
      ) {
        task.attachments?.push(row.attachments);
      }
    });

    return task;
  }

  async createTask(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<TaskWithRelations> {
    const [newTask] = (await db
      .insert(tasks)
      .values({
        ...task,
        reminders: task.reminders ? JSON.stringify(task.reminders) : undefined,
      })
      .returning()
      .all()) as unknown as Task[];

    const createdTask = await this.getTaskById(newTask.id!);
    if (!createdTask) {
      throw new Error("Failed to retrieve created task");
    }
    return createdTask;
  }

  async updateTask(
    id: number,
    updates: Partial<Task>
  ): Promise<TaskWithRelations | undefined> {
    const [updatedTask] = (await db
      .update(tasks)
      .set({
        ...updates,
        reminders: updates.reminders ? JSON.stringify(updates.reminders) : undefined,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(tasks.id, id))
      .returning()
      .all()) as unknown as Task[];

    if (!updatedTask) return undefined;

    return this.getTaskById(updatedTask.id!);
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id)).run();
  }

  async completeTask(id: number): Promise<TaskWithRelations | undefined> {
    const [completedTask] = (await db
      .update(tasks)
      .set({
        isCompleted: true,
        completedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(tasks.id, id))
      .returning()
      .all()) as unknown as Task[];

    if (!completedTask) return undefined;

    return this.getTaskById(completedTask.id!);
  }

  async uncompleteTask(id: number): Promise<TaskWithRelations | undefined> {
    const [uncompletedTask] = (await db
      .update(tasks)
      .set({
        isCompleted: false,
        completedAt: null,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(tasks.id, id))
      .returning()
      .all()) as unknown as Task[];

    if (!uncompletedTask) return undefined;

    return this.getTaskById(uncompletedTask.id!);
  }

  // Task labels operations
  async addLabelToTask(taskId: number, labelId: number): Promise<void> {
    await db
      .insert(taskLabels)
      .values({ taskId, labelId })
      .onConflictDoNothing()
      .run();
  }

  async removeLabelFromTask(taskId: number, labelId: number): Promise<void> {
    await db
      .delete(taskLabels)
      .where(
        and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId))
      )
      .run();
  }

  // Sub-tasks operations
  async createSubTask(
    subTask: Omit<SubTask, "id" | "createdAt" | "updatedAt">
  ): Promise<SubTask> {
    const [newSubTask] = (await db
      .insert(subTasks)
      .values(subTask)
      .returning()
      .all()) as SubTask[];
    return newSubTask;
  }

  async updateSubTask(
    id: number,
    updates: Partial<SubTask>
  ): Promise<SubTask | undefined> {
    const [updatedSubTask] = (await db
      .update(subTasks)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(subTasks.id, id))
      .returning()
      .all()) as SubTask[];
    return updatedSubTask;
  }

  async deleteSubTask(id: number): Promise<void> {
    await db.delete(subTasks).where(eq(subTasks.id, id)).run();
  }

  // Attachments operations
  async createAttachment(
    attachment: Omit<Attachment, "id" | "createdAt">
  ): Promise<Attachment> {
    const [newAttachment] = (await db
      .insert(attachments)
      .values(attachment)
      .returning()
      .all()) as Attachment[];
    return newAttachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id)).run();
  }

  // Task changes operations
  async getTaskChanges(taskId: number): Promise<TaskChange[]> {
    return db
      .select()
      .from(taskChanges)
      .where(eq(taskChanges.taskId, taskId))
      .orderBy(desc(taskChanges.createdAt))
      .all() as TaskChange[];
  }

  async createTaskChange(
    change: Omit<TaskChange, "id" | "createdAt">
  ): Promise<void> {
    await db.insert(taskChanges).values(change).run();
  }

  // View-specific queries
  async getTodayTasks(): Promise<TaskWithRelations[]> {
    const today = new Date().toISOString().split("T")[0];
    const { tasks } = await this.getTasks({
      date: today,
      orderBy: "deadline",
      orderDirection: "asc",
    });
    return tasks;
  }

  async getUpcomingTasks(days: number = 7): Promise<TaskWithRelations[]> {
    const today = new Date();
    const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    const endDateStr = endDate.toISOString().split("T")[0];

    const { tasks } = await this.getTasks({
      date: endDateStr,
      orderBy: "date",
      orderDirection: "asc",
    });

    // Filter tasks that are within the next 7 days
    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate >= today && taskDate <= endDate;
    });
  }

  async getAllTasks(): Promise<TaskWithRelations[]> {
    const { tasks } = await this.getTasks({
      orderBy: "date",
      orderDirection: "desc",
    });
    return tasks;
  }

  async getInboxTasks(): Promise<TaskWithRelations[]> {
    const inboxList = (await db
      .select()
      .from(lists)
      .where(eq(lists.isMagic, true))
      .get()) as List;

    if (!inboxList) return [];

    const { tasks } = await this.getTasks({
      listId: inboxList.id,
      orderBy: "createdAt",
      orderDirection: "desc",
    });

    return tasks;
  }
}

export const dbService = new DatabaseService();