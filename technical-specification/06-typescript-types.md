# TypeScript Interfaces and Type Definitions

## Overview

This document defines all TypeScript interfaces and type definitions for the Next.js daily task planner application. The type system ensures type safety, provides excellent developer experience with IntelliSense, and serves as living documentation for the application's data structures.

## Core Type Definitions

### 1. Basic Types

```typescript
// lib/types/common.ts
export type Id = string;

export type Timestamp = number;

export interface BaseEntity {
  id: Id;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export type Status = "pending" | "in_progress" | "completed";

export type Priority = "low" | "medium" | "high" | "urgent";

export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export type Theme = "light" | "dark" | "system";

export type ListType = "inbox" | "today" | "upcoming" | "all" | "custom";
```

### 2. List Types

```typescript
// lib/types/list.ts
import { BaseEntity, Id } from "./common";

export interface List extends BaseEntity {
  name: string;
  description?: string;
  color: string; // Hex color code
  emoji?: string;
  isDefault?: ListType;
  order: number;
}

export interface CreateListData {
  name: string;
  description?: string;
  color?: string;
  emoji?: string;
}

export interface UpdateListData {
  name?: string;
  description?: string;
  color?: string;
  emoji?: string;
  order?: number;
}

export interface ListFilters {
  includeDefault?: boolean;
  sortBy?: keyof List;
  sortOrder?: "asc" | "desc";
}

export interface ListStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  urgentTasks: number;
}
```

### 3. Task Types

```typescript
// lib/types/task.ts
import { BaseEntity, Id, Status, Priority, Timestamp } from "./common";
import { Label } from "./label";
import { Subtask } from "./subtask";
import { Attachment } from "./attachment";
import { Reminder } from "./reminder";
import { RecurringTask } from "./recurring";

export interface Task extends BaseEntity {
  title: string;
  description?: string;

  // Date fields
  startDate?: Timestamp;
  dueDate?: Timestamp;
  completedAt?: Timestamp;

  // Status and priority
  status: Status;
  priority: Priority;

  // Time tracking
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes

  // Relationships
  listId?: Id;
  parentId?: Id;

  // Recurring task
  isRecurring: boolean;

  // Completion
  isCompleted: boolean;

  // Order within list
  order: number;

  // Related data (populated when needed)
  labels?: Label[];
  subtasks?: Subtask[];
  attachments?: Attachment[];
  reminders?: Reminder[];
  recurringConfig?: RecurringTask;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  listId: Id;
  startDate?: Date;
  dueDate?: Date;
  status?: Status;
  priority?: Priority;
  estimatedTime?: number;
  actualTime?: number;
  isCompleted?: boolean;
  order?: number;
  labels?: Id[];
  subtasks?: Omit<Subtask, "id" | "taskId" | "createdAt" | "updatedAt">[];
  reminders?: Omit<Reminder, "id" | "taskId" | "createdAt">[];
  attachments?: File[];
  isRecurring?: boolean;
  recurringConfig?: Omit<
    RecurringTask,
    "id" | "taskId" | "createdAt" | "updatedAt"
  >;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  listId?: Id;
  startDate?: Date;
  dueDate?: Date;
  status?: Status;
  priority?: Priority;
  estimatedTime?: number;
  actualTime?: number;
  isCompleted?: boolean;
  order?: number;
  labels?: Id[];
}

export interface TaskFilters {
  listId?: Id;
  status?: Status[];
  priority?: Priority[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  labels?: Id[];
  search?: string;
  isCompleted?: boolean;
  hasAttachments?: boolean;
  hasReminders?: boolean;
  isOverdue?: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  urgent: number;
  today: number;
  next7Days: number;
}

export interface TaskTimeStats {
  totalEstimated: number;
  totalActual: number;
  averageCompletionTime: number;
  timeVariance: number;
}
```

### 4. Label Types

```typescript
// lib/types/label.ts
import { BaseEntity, Id } from "./common";

export interface Label extends BaseEntity {
  name: string;
  color: string; // Hex color code
  description?: string;
  usageCount: number;
}

export interface CreateLabelData {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
  description?: string;
}

export interface LabelFilters {
  search?: string;
  sortBy?: keyof Label;
  sortOrder?: "asc" | "desc";
}
```

### 5. Subtask Types

```typescript
// lib/types/subtask.ts
import { BaseEntity, Id, Timestamp } from "./common";

export interface Subtask extends BaseEntity {
  taskId: Id;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface CreateSubtaskData {
  taskId: Id;
  title: string;
  order?: number;
}

export interface UpdateSubtaskData {
  title?: string;
  isCompleted?: boolean;
  order?: number;
}

export interface SubtaskStats {
  total: number;
  completed: number;
  pending: number;
}
```

### 6. Attachment Types

```typescript
// lib/types/attachment.ts
import { BaseEntity, Id, Timestamp } from "./common";

export interface Attachment extends BaseEntity {
  taskId: Id;
  fileName: string;
  filePath: string;
  fileSize: number; // in bytes
  mimeType: string;
  originalName: string;
}

export interface CreateAttachmentData {
  taskId: Id;
  file: File;
  description?: string;
}

export interface AttachmentFilters {
  taskId?: Id;
  mimeType?: string;
  sizeFrom?: number;
  sizeTo?: number;
  sortBy?: keyof Attachment;
  sortOrder?: "asc" | "desc";
}

export interface AttachmentStats {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
}
```

### 7. Reminder Types

```typescript
// lib/types/reminder.ts
import { BaseEntity, Id, Timestamp } from "./common";

export interface Reminder extends BaseEntity {
  taskId: Id;
  reminderTime: Timestamp;
  isSent: boolean;
}

export interface CreateReminderData {
  taskId: Id;
  reminderTime: Date;
}

export interface UpdateReminderData {
  reminderTime?: Date;
  isSent?: boolean;
}

export interface ReminderFilters {
  taskId?: Id;
  isSent?: boolean;
  from?: Date;
  to?: Date;
}

export interface ReminderStats {
  total: number;
  sent: number;
  pending: number;
  overdue: number;
}
```

### 8. Recurring Task Types

```typescript
// lib/types/recurring.ts
import { BaseEntity, Id, Frequency, Timestamp } from "./common";

export interface RecurringTask extends BaseEntity {
  taskId: Id;
  frequency: Frequency;
  interval: number; // e.g., every 2 weeks
  endDate?: Timestamp;
  lastGeneratedDate?: Timestamp;
}

export interface CreateRecurringTaskData {
  taskId: Id;
  frequency: Frequency;
  interval: number;
  endDate?: Date;
}

export interface UpdateRecurringTaskData {
  frequency?: Frequency;
  interval?: number;
  endDate?: Date;
}

export interface RecurringTaskFilters {
  taskId?: Id;
  frequency?: Frequency;
  activeOnly?: boolean;
}
```

### 9. User Preferences Types

```typescript
// lib/types/user.ts
import { Theme } from "./common";

export interface UserPreferences {
  theme: Theme;
  language: string;
  dateFormat: string;
  timeFormat: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    email: boolean;
  };
  display: {
    compactMode: boolean;
    showCompletedTasks: boolean;
    showTaskCount: boolean;
  };
  reminders: {
    defaultTime: string;
    advanceNotice: number; // minutes
  };
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityScore: number;
  streak: number;
}
```

### 10. UI State Types

```typescript
// lib/types/ui.ts
import { Id, Priority, Status } from "./common";
import { List } from "./list";

export interface Filters {
  status: Status[];
  priority: Priority[];
  dueDate: {
    from?: string;
    to?: string;
  };
  labels: Id[];
}

export interface UIState {
  selectedListId: Id | null;
  selectedList: List | null;
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  filters: Filters;
  searchQuery: string;
  viewMode: "list" | "grid" | "kanban";
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface ModalState {
  open: boolean;
  type: "task" | "list" | "label" | "reminder";
  data?: any;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}
```

### 11. API Types

```typescript
// lib/types/api.ts
import { Task, List, Label, Attachment, Reminder } from "./index";
import { PaginationParams, ApiResponse } from "./common";

// Task API
export interface GetTasksQuery extends PaginationParams {
  listId?: string;
  status?: string;
  priority?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  labels?: string[];
}

export type GetTasksResponse = ApiResponse<{
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}>;

export type CreateTaskResponse = ApiResponse<Task>;
export type UpdateTaskResponse = ApiResponse<Task>;
export type DeleteTaskResponse = ApiResponse<{ deletedId: string }>;

// List API
export interface GetListsQuery extends PaginationParams {
  includeDefault?: boolean;
}

export type GetListsResponse = ApiResponse<{
  lists: List[];
  total: number;
}>;

export type CreateListResponse = ApiResponse<List>;
export type UpdateListResponse = ApiResponse<List>;
export type DeleteListResponse = ApiResponse<{ deletedId: string }>;

// Label API
export type GetLabelsResponse = ApiResponse<Label[]>;
export type CreateLabelResponse = ApiResponse<Label>;
export type UpdateLabelResponse = ApiResponse<Label>;
export type DeleteLabelResponse = ApiResponse<{ deletedId: string }>;

// Attachment API
export type UploadAttachmentResponse = ApiResponse<Attachment>;
export type GetAttachmentsResponse = ApiResponse<Attachment[]>;
export type DeleteAttachmentResponse = ApiResponse<{ deletedId: string }>;

// Search API
export interface SearchQuery {
  q: string;
  types?: ("tasks" | "lists" | "labels")[];
  listId?: string;
  page?: number;
  limit?: number;
}

export type SearchResponse = ApiResponse<{
  tasks: Task[];
  lists: List[];
  labels: Label[];
  total: number;
}>;
```

### 12. Form Types

```typescript
// lib/types/forms.ts
import { Id, Priority, Status } from "./common";

export interface TaskFormData {
  title: string;
  description?: string;
  listId: Id;
  startDate?: Date;
  dueDate?: Date;
  status: Status;
  priority: Priority;
  estimatedTime?: number;
  labels: Id[];
  subtasks: {
    title: string;
    isCompleted: boolean;
  }[];
  reminders: {
    reminderTime: Date;
  }[];
  isRecurring: boolean;
  recurringConfig?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: Date;
  };
}

export interface ListFormData {
  name: string;
  description?: string;
  color: string;
  emoji?: string;
}

export interface LabelFormData {
  name: string;
  color: string;
  description?: string;
}

export interface FilterFormData {
  status: Status[];
  priority: Priority[];
  dueDate: {
    from?: Date;
    to?: Date;
  };
  labels: Id[];
}

export interface UserPreferencesFormData {
  theme: "light" | "dark" | "system";
  language: string;
  dateFormat: string;
  timeFormat: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    email: boolean;
  };
  display: {
    compactMode: boolean;
    showCompletedTasks: boolean;
    showTaskCount: boolean;
  };
  reminders: {
    defaultTime: string;
    advanceNotice: number;
  };
}
```

### 13. Utility Types

```typescript
// lib/types/utils.ts
import { Task, List, Label } from "./index";

// Partial types for updates
export type PartialTask = Partial<Task>;
export type PartialList = Partial<List>;
export type PartialLabel = Partial<Label>;

// Pick specific fields
export type TaskSummary = Pick<
  Task,
  "id" | "title" | "status" | "priority" | "dueDate"
>;
export type ListSummary = Pick<List, "id" | "name" | "color" | "emoji">;
export type LabelSummary = Pick<Label, "id" | "name" | "color">;

// Omit specific fields
export type TaskWithoutRelations = Omit<
  Task,
  "labels" | "subtasks" | "attachments" | "reminders"
>;

// Array types
export type TaskArray = Task[];
export type ListArray = List[];
export type LabelArray = Label[];

// Union types
export type EntityType = "task" | "list" | "label" | "attachment";
export type ViewType = "list" | "grid" | "kanban" | "calendar";

// Conditional types
export type EntityById<T extends EntityType> = T extends "task"
  ? Task
  : T extends "list"
  ? List
  : T extends "label"
  ? Label
  : never;

// Mapped types
export type EntityFields<T> = {
  [K in keyof T]?: T[K];
};

// Recursive types
export interface TreeNode<T> {
  data: T;
  children: TreeNode<T>[];
}

// Generic types
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilteredResult<T> {
  data: T[];
  filters: any;
  total: number;
}
```

### 14. Event Types

```typescript
// lib/types/events.ts
import { Id, Timestamp } from "./common";
import { Task, List, Label } from "./index";

export type EventType =
  | "task_created"
  | "task_updated"
  | "task_deleted"
  | "task_completed"
  | "list_created"
  | "list_updated"
  | "list_deleted"
  | "label_created"
  | "label_updated"
  | "label_deleted"
  | "attachment_uploaded"
  | "attachment_deleted"
  | "reminder_triggered";

export interface Event {
  id: Id;
  type: EventType;
  timestamp: Timestamp;
  userId: Id;
  entityId: Id;
  entityType: "task" | "list" | "label" | "attachment";
  data: any;
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
}

export interface EventFilters {
  type?: EventType[];
  userId?: Id;
  entityId?: Id;
  entityType?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}
```

### 15. Export All Types

```typescript
// lib/types/index.ts
export * from "./common";
export * from "./list";
export * from "./task";
export * from "./label";
export * from "./subtask";
export * from "./attachment";
export * from "./reminder";
export * from "./recurring";
export * from "./user";
export * from "./ui";
export * from "./api";
export * from "./forms";
export * from "./utils";
export * from "./events";
```

## Type Guards

```typescript
// lib/types/guards.ts
import { Task, List, Label, Priority, Status } from "./index";

export function isTask(entity: any): entity is Task {
  return entity && typeof entity.id === "string" && "title" in entity;
}

export function isList(entity: any): entity is List {
  return entity && typeof entity.id === "string" && "name" in entity;
}

export function isLabel(entity: any): entity is Label {
  return entity && typeof entity.id === "string" && "name" in entity;
}

export function isPriority(value: any): value is Priority {
  return ["low", "medium", "high", "urgent"].includes(value);
}

export function isStatus(value: any): value is Status {
  return ["pending", "in_progress", "completed"].includes(value);
}

export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}
```

## Type Utilities

```typescript
// lib/types/utils.ts
import { Task, List, Label } from "./index";

// Type-safe object property access
export type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: `${string & K}` | `${string & K}.${DeepKeys<T[K]>}`;
    }[keyof T]
  : never;

// Type-safe pick
export type SafePick<T, K extends keyof T> = Pick<T, K>;

// Type-safe omit
export type SafeOmit<T, K extends keyof T> = Omit<T, K>;

// Type-safe partial with required fields
export type PartialWithRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

// Type-safe record
export type StringRecord<T> = Record<string, T>;

// Type-safe array
export type NonEmptyArray<T> = readonly [T, ...T[]];
```

This comprehensive type system ensures type safety throughout the application, provides excellent developer experience with IntelliSense, and serves as living documentation for all data structures used in the task planner application.
