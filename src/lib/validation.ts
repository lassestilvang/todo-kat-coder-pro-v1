import { z } from "zod";
import {
  Task,
  List,
  Label,
  SubTask,
  Attachment,
  prioritySchema,
  recurrenceTypeSchema,
  reminderSchema,
} from "@/types/task";

// Zod schemas for validation
export const PrioritySchema = prioritySchema;

export const RecurrenceTypeSchema = recurrenceTypeSchema;

export const TaskSchema = z.object({
  id: z.number().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  deadline: z.string().optional(),
  estimateHours: z.number().min(0).max(23).optional(),
  estimateMinutes: z.number().min(0).max(59).optional(),
  actualHours: z.number().min(0).max(23).optional(),
  actualMinutes: z.number().min(0).max(59).optional(),
  priority: PrioritySchema.default("none"),
  listId: z.number(),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: RecurrenceTypeSchema.optional(),
  recurrenceInterval: z.number().min(1).optional(),
  recurrenceEndDate: z.string().optional(),
  reminders: z.array(reminderSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ListSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, "List name is required")
    .max(100, "List name must be less than 100 characters"),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  emoji: z.string().optional(),
  isMagic: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const LabelSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, "Label name is required")
    .max(50, "Label name must be less than 50 characters"),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  createdAt: z.string().optional(),
});

export const SubTaskSchema = z.object({
  id: z.number().optional(),
  taskId: z.number(),
  title: z
    .string()
    .min(1, "Subtask title is required")
    .max(200, "Subtask title must be less than 200 characters"),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const AttachmentSchema = z.object({
  id: z.number().optional(),
  taskId: z.number(),
  fileName: z.string().min(1, "File name is required"),
  filePath: z.string().url("Invalid file path"),
  fileSize: z.number().min(0, "File size must be positive"),
  mimeType: z.string().optional(),
  createdAt: z.string().optional(),
});

// Type-safe validation functions
export const validateTask = (data: unknown): Task => {
  const parsed = TaskSchema.parse(data);
  // Remove undefined id if present
  if (parsed.id === undefined) {
    const { id, ...rest } = parsed;
    return rest as Task;
  }
  return parsed as Task;
};

export const validateTaskPartial = (data: unknown): Partial<Task> => {
  return TaskSchema.partial().parse(data);
};

export const validateList = (data: unknown): List => {
  const parsed = ListSchema.parse(data);
  // Remove undefined id if present
  if (parsed.id === undefined) {
    const { id, ...rest } = parsed;
    return rest as List;
  }
  return parsed as List;
};

export const validateListPartial = (data: unknown): Partial<List> => {
  return ListSchema.partial().parse(data);
};

export const validateLabel = (data: unknown): Label => {
  const parsed = LabelSchema.parse(data);
  // Remove undefined id if present
  if (parsed.id === undefined) {
    const { id, ...rest } = parsed;
    return rest as Label;
  }
  return parsed as Label;
};

export const validateLabelPartial = (data: unknown): Partial<Label> => {
  return LabelSchema.partial().parse(data);
};

export const validateSubTask = (data: unknown): SubTask => {
  const parsed = SubTaskSchema.parse(data);
  // Remove undefined id if present
  if (parsed.id === undefined) {
    const { id, ...rest } = parsed;
    return rest as SubTask;
  }
  return parsed as SubTask;
};

export const validateAttachment = (data: unknown): Attachment => {
  const parsed = AttachmentSchema.parse(data);
  // Remove undefined id if present
  if (parsed.id === undefined) {
    const { id, ...rest } = parsed;
    return rest as Attachment;
  }
  return parsed as Attachment;
};

// Validation result types
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
};

// Validate function that returns detailed results
export const validateWithDetails = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: "Validation failed" } };
  }
};

// Real-time validation functions
export const validateTaskField = (
  field: keyof Task,
  value: unknown,
  currentData: Partial<Task> = {}
): string | undefined => {
  try {
    const partialSchema = TaskSchema.pick({ [field]: true });
    partialSchema.parse({ [field]: value });
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message;
    }
    return "Invalid value";
  }
};

export const validateListField = (
  field: keyof List,
  value: unknown
): string | undefined => {
  try {
    const partialSchema = ListSchema.pick({ [field]: true });
    partialSchema.parse({ [field]: value });
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message;
    }
    return "Invalid value";
  }
};

export const validateLabelField = (
  field: keyof Label,
  value: unknown
): string | undefined => {
  try {
    const partialSchema = LabelSchema.pick({ [field]: true });
    partialSchema.parse({ [field]: value });
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message;
    }
    return "Invalid value";
  }
};

// Utility functions for common validations
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateColor = (color: string): boolean => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colorRegex.test(color);
};

export const validateFileSize = (
  size: number,
  maxSizeMB: number = 10
): boolean => {
  return size <= maxSizeMB * 1024 * 1024;
};

export const validateFileType = (
  fileName: string,
  allowedTypes: string[] = ["image", "document", "pdf"]
): boolean => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) return false;

  const typeMap: Record<string, string[]> = {
    image: ["jpg", "jpeg", "png", "gif", "bmp", "svg"],
    document: ["doc", "docx", "txt", "rtf"],
    pdf: ["pdf"],
  };

  for (const type of allowedTypes) {
    if (typeMap[type]?.includes(extension)) {
      return true;
    }
  }
  return false;
};
