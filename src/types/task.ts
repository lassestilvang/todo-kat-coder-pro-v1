import { z } from "zod";

export const prioritySchema = z.enum(["none", "low", "medium", "high"]);

export type Priority = z.infer<typeof prioritySchema>;

export const recurrenceTypeSchema = z.enum([
  "daily",
  "weekly",
  "weekday",
  "monthly",
  "yearly",
  "custom",
]);

export type RecurrenceType = z.infer<typeof recurrenceTypeSchema>;

export const reminderSchema = z.object({
  time: z.number().min(1),
  unit: z.enum(["minutes", "hours", "days"]),
});

export type Reminder = z.infer<typeof reminderSchema>;

export const taskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  deadline: z.string().optional(),
  estimateHours: z.number().min(0).max(23).optional(),
  estimateMinutes: z.number().min(0).max(59).optional(),
  actualHours: z.number().min(0).max(23).optional(),
  actualMinutes: z.number().min(0).max(59).optional(),
  priority: prioritySchema.default("none"),
  listId: z.number(),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: recurrenceTypeSchema.optional(),
  recurrenceInterval: z.number().min(1).optional(),
  recurrenceEndDate: z.string().optional(),
  reminders: z.array(reminderSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Task = z.infer<typeof taskSchema>;

export type TaskWithRelations = Omit<Task, "reminders"> & {
  reminders?: Reminder[];
  list?: List;
  labels?: Label[];
  subTasks?: SubTask[];
  attachments?: Attachment[];
};

export type TaskFormData = Omit<
  Task,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "completedAt"
  | "isCompleted"
  | "listId"
  | "reminders"
> & {
  title: string; // Title is required
  reminders?: Reminder[];
  labels?: number[]; // Array of label IDs
  subTasks?: Omit<SubTask, "id" | "taskId" | "createdAt" | "updatedAt">[];
  attachments?: Omit<Attachment, "id" | "taskId" | "createdAt">[];
  listId?: number;
  isCompleted?: boolean;
  completedAt?: string;
};

export type List = {
  id: number;
  name: string;
  color: string;
  emoji: string;
  isMagic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Label = {
  id: number;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
};

export type SubTask = {
  id: number;
  taskId: number;
  title: string;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Attachment = {
  id: number;
  taskId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string;
  createdAt: string;
};

export type TaskChange = {
  id: number;
  taskId: number;
  changeType: "create" | "update" | "delete" | "complete" | "uncomplete";
  changedFields: string | null;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string | null;
  createdAt: string;
};

export type TaskFilter = {
  search?: string;
  priority?: Priority;
  status?: "all" | "completed" | "pending";
  view?: "today" | "next7days" | "upcoming" | "all" | "inbox";
  listId?: number;
  date?: string;
  limit?: number;
  offset?: number;
  orderBy?: keyof Task;
  orderDirection?: "asc" | "desc";
  completed?: boolean;
};

export type TaskSort = {
  field: keyof Task;
  direction: "asc" | "desc";
};

export type DatabaseStats = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalLists: number;
  totalLabels: number;
  todayTasks: number;
  upcomingTasks: number;
};
