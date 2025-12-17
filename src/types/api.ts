import { z } from "zod";
import {
  Task,
  TaskWithRelations,
  List,
  Label,
  SubTask,
  Attachment,
  TaskChange,
  TaskFilter,
  TaskSort,
  DatabaseStats,
} from "./task";

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Request Types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  date: string;
  deadline?: string;
  estimateHours?: number;
  estimateMinutes?: number;
  actualHours?: number;
  actualMinutes?: number;
  priority: Task["priority"];
  listId: number;
  isCompleted?: boolean;
  isRecurring?: boolean;
  recurrenceType?: Task["recurrenceType"];
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  reminders?: Array<{
    time: number;
    unit: "minutes" | "hours" | "days";
  }>;
  labels?: number[];
  subTasks?: Array<{
    title: string;
    isCompleted?: boolean;
  }>;
  attachments?: Array<{
    fileName: string;
    filePath: string;
    fileSize?: number;
    mimeType: string;
  }>;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: number;
}

export interface CreateListRequest {
  name: string;
  color: string;
  emoji: string;
  isMagic?: boolean;
}

export interface UpdateListRequest extends Partial<CreateListRequest> {
  id: number;
}

export interface CreateLabelRequest {
  name: string;
  icon: string;
  color: string;
}

export interface UpdateLabelRequest extends Partial<CreateLabelRequest> {
  id: number;
}

export interface CreateSubTaskRequest {
  taskId: number;
  title: string;
  isCompleted?: boolean;
}

export interface UpdateSubTaskRequest extends Partial<CreateSubTaskRequest> {
  id: number;
}

export interface CreateAttachmentRequest {
  taskId: number;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType: string;
}

export interface SearchRequest {
  query: string;
  filters?: TaskFilter;
  sort?: TaskSort;
  limit?: number;
  offset?: number;
}

// API Error Types
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public fieldErrors: Record<string, string[]>) {
    super(400, message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Resource conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class ServerError extends ApiError {
  constructor(message: string = "Internal server error") {
    super(500, message);
    this.name = "ServerError";
  }
}

// API Hook Types
export interface UseApiOptions<TData = unknown> {
  enabled?: boolean;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
}

export interface UseMutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: () => void;
}

// WebSocket Events
export interface TaskEvent {
  type: "task_created" | "task_updated" | "task_deleted" | "task_completed";
  data: TaskWithRelations;
  timestamp: string;
  userId?: string;
}

export interface ListEvent {
  type: "list_created" | "list_updated" | "list_deleted";
  data: List;
  timestamp: string;
  userId?: string;
}

export interface LabelEvent {
  type: "label_created" | "label_updated" | "label_deleted";
  data: Label;
  timestamp: string;
  userId?: string;
}

// File Upload Types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResult {
  success: boolean;
  file: Attachment;
  error?: string;
}

// Export all types for convenience
export type {
  Task,
  TaskWithRelations,
  List,
  Label,
  SubTask,
  Attachment,
  TaskChange,
  TaskFilter,
  TaskSort,
  DatabaseStats,
};
