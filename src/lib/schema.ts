import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  json,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Lists table - supports magic Inbox and custom lists
export const lists = sqliteTable(
  "lists",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    color: text("color", { length: 7 }).notNull(), // Hex color like #FF5733
    emoji: text("emoji", { length: 4 }).notNull(), // Emoji icon
    isMagic: integer("is_magic", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    nameIdx: uniqueIndex("list_name_idx").on(table.name),
    magicIdx: index("magic_list_idx").on(table.isMagic),
  })
);

// Labels table - for categorizing tasks with icons
export const labels = sqliteTable(
  "labels",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    icon: text("icon", { length: 4 }).notNull(), // Emoji icon
    color: text("color", { length: 7 }).notNull(), // Hex color
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    nameIdx: uniqueIndex("label_name_idx").on(table.name),
  })
);

// Tasks table - comprehensive task management
export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),

    // Date and time fields
    date: text("date").notNull(), // ISO date string YYYY-MM-DD
    deadline: text("deadline"), // ISO datetime string YYYY-MM-DDTHH:mm
    estimateHours: integer("estimate_hours", { mode: "number" }),
    estimateMinutes: integer("estimate_minutes", { mode: "number" }),
    actualHours: integer("actual_hours", { mode: "number" }),
    actualMinutes: integer("actual_minutes", { mode: "number" }),

    // Priority with proper enum
    priority: text("priority", {
      enum: ["none", "low", "medium", "high"],
    })
      .notNull()
      .default("none"),

    // List relationship
    listId: integer("list_id", { mode: "number" }).notNull(),

    // Completion tracking
    isCompleted: integer("is_completed", { mode: "boolean" })
      .notNull()
      .default(false),
    completedAt: text("completed_at"), // ISO datetime when completed

    // Recurring task configuration
    isRecurring: integer("is_recurring", { mode: "boolean" })
      .notNull()
      .default(false),
    recurrenceType: text("recurrence_type", {
      enum: ["daily", "weekly", "weekday", "monthly", "yearly", "custom"],
    }),
    recurrenceInterval: integer("recurrence_interval", { mode: "number" }), // For custom recurrence
    recurrenceEndDate: text("recurrence_end_date"), // ISO date when recurrence ends

    // Reminders configuration (stored as JSON array of reminder objects)
    reminders: json("reminders"), // Array of { time: string, unit: 'minutes'|'hours'|'days' }

    // Metadata
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // Indexes for performance
    titleIdx: index("task_title_idx").on(table.title),
    priorityIdx: index("task_priority_idx").on(table.priority),
    dateIdx: index("task_date_idx").on(table.date),
    deadlineIdx: index("task_deadline_idx").on(table.deadline),
    completedIdx: index("task_completed_idx").on(table.isCompleted),
    listIdx: index("task_list_idx").on(table.listId),
    recurringIdx: index("task_recurring_idx").on(table.isRecurring),

    // Composite indexes for common queries
    listPriorityIdx: index("task_list_priority_idx").on(
      table.listId,
      table.priority
    ),
    dateCompletedIdx: index("task_date_completed_idx").on(
      table.date,
      table.isCompleted
    ),
  })
);

// Task-Label many-to-many relationship
export const taskLabels = sqliteTable(
  "task_labels",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    taskId: integer("task_id", { mode: "number" }).notNull(),
    labelId: integer("label_id", { mode: "number" }).notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueTaskLabel: uniqueIndex("unique_task_label").on(
      table.taskId,
      table.labelId
    ),
    taskIdx: index("task_label_task_idx").on(table.taskId),
    labelIdx: index("task_label_label_idx").on(table.labelId),
  })
);

// Sub-tasks table
export const subTasks = sqliteTable(
  "sub_tasks",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    taskId: integer("task_id", { mode: "number" }).notNull(),
    title: text("title").notNull(),
    isCompleted: integer("is_completed", { mode: "boolean" })
      .notNull()
      .default(false),
    completedAt: text("completed_at"), // ISO datetime when completed
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    taskIdx: index("subtask_task_idx").on(table.taskId),
    completedIdx: index("subtask_completed_idx").on(table.isCompleted),
  })
);

// Attachments table
export const attachments = sqliteTable(
  "attachments",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    taskId: integer("task_id", { mode: "number" }).notNull(),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(), // Path or URL to the file
    fileSize: integer("file_size", { mode: "number" }), // Size in bytes
    mimeType: text("mime_type").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    taskIdx: index("attachment_task_idx").on(table.taskId),
    fileNameIdx: index("attachment_filename_idx").on(table.fileName),
  })
);

// Task changes log for audit trail
export const taskChanges = sqliteTable(
  "task_changes",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    taskId: integer("task_id", { mode: "number" }).notNull(),
    changeType: text("change_type", {
      enum: ["create", "update", "delete", "complete", "uncomplete"],
    }).notNull(),
    changedFields: json("changed_fields"), // JSON object with field changes
    oldValue: json("old_value"), // Previous state of the task
    newValue: json("new_value"), // New state of the task
    changedBy: text("changed_by"), // User who made the change (if applicable)
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    taskIdx: index("change_task_idx").on(table.taskId),
    changeTypeIdx: index("change_type_idx").on(table.changeType),
    createdAtIdx: index("change_created_idx").on(table.createdAt),
  })
);

// Relations
export const listsRelations = relations(lists, ({ many }) => ({
  tasks: many(tasks),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  taskLabels: many(taskLabels),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
  }),
  taskLabels: many(taskLabels),
  subTasks: many(subTasks),
  attachments: many(attachments),
  changes: many(taskChanges),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));

export const subTasksRelations = relations(subTasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subTasks.taskId],
    references: [tasks.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
}));

export const taskChangesRelations = relations(taskChanges, ({ one }) => ({
  task: one(tasks, {
    fields: [taskChanges.taskId],
    references: [tasks.id],
  }),
}));
