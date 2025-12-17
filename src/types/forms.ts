import { z } from "zod";
import { Task, List, Label, Priority, RecurrenceType, Reminder } from "./task";

// Form validation schemas
export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  deadline: z.string().optional(),
  estimateHours: z.number().min(0).max(23).optional(),
  estimateMinutes: z.number().min(0).max(59).optional(),
  actualHours: z.number().min(0).max(23).optional(),
  actualMinutes: z.number().min(0).max(59).optional(),
  priority: z.enum(["none", "low", "medium", "high"]).default("none"),
  listId: z.number().positive("Please select a list"),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z
    .enum(["daily", "weekly", "weekday", "monthly", "yearly", "custom"])
    .optional(),
  recurrenceInterval: z.number().min(1).max(365).optional(),
  recurrenceEndDate: z.string().optional(),
  reminders: z
    .array(
      z.object({
        time: z.number().min(1, "Time must be greater than 0"),
        unit: z.enum(["minutes", "hours", "days"]),
      })
    )
    .optional(),
  labels: z.array(z.number()).optional(),
  subTasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Sub-task title is required")
          .max(200, "Sub-task title is too long"),
        isCompleted: z.boolean().default(false),
      })
    )
    .optional(),
});

export const listFormSchema = z.object({
  name: z
    .string()
    .min(1, "List name is required")
    .max(100, "List name is too long"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  emoji: z.string().max(4, "Emoji too long").optional(),
  isMagic: z.boolean().default(false),
});

export const labelFormSchema = z.object({
  name: z
    .string()
    .min(1, "Label name is required")
    .max(50, "Label name is too long"),
  icon: z.string().max(4, "Icon too long").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
});

export const subTaskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Sub-task title is required")
    .max(200, "Sub-task title is too long"),
  isCompleted: z.boolean().default(false),
});

export const attachmentFormSchema = z.object({
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name is too long"),
  filePath: z.string().min(1, "File path is required"),
  fileSize: z.number().min(0, "File size must be positive").optional(),
  mimeType: z
    .string()
    .min(1, "MIME type is required")
    .max(100, "MIME type is too long"),
});

// Form data types
export type TaskFormData = z.infer<typeof taskFormSchema>;
export type ListFormData = z.infer<typeof listFormSchema>;
export type LabelFormData = z.infer<typeof labelFormSchema>;
export type SubTaskFormData = z.infer<typeof subTaskFormSchema>;
export type AttachmentFormData = z.infer<typeof attachmentFormSchema>;

// Form field types
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "date"
    | "time"
    | "number"
    | "checkbox"
    | "radio";
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

// Form submission states
export type FormStatus = "idle" | "submitting" | "success" | "error";

// Form configuration
export interface FormConfig<TData = unknown> {
  title: string;
  description?: string;
  fields: FormField[];
  submitText: string;
  cancelText?: string;
  validationSchema?: unknown; // Keep unknown for Zod schema compatibility
  onSubmit: (data: unknown) => Promise<void> | void;
  onCancel?: () => void;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

// Form context
export interface FormContext<TValues = Record<string, unknown>> {
  isSubmitting: boolean;
  isValidating: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  values: TValues;
  setFieldValue: (name: keyof TValues, value: unknown) => void;
  setFieldError: (name: keyof TValues, error: string) => void;
  setFieldTouched: (name: keyof TValues, touched: boolean) => void;
  validateField: (name: keyof TValues) => Promise<string | undefined>;
  validateForm: () => Promise<ValidationResult>;
  resetForm: () => void;
}

// Form hooks
export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: unknown; // Keep unknown for Zod schema compatibility
  onSubmit: (values: unknown) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  dirty: boolean;
  setFieldValue: (name: keyof T, value: unknown) => void;
  setFieldError: (name: keyof T, error: string) => void;
  setFieldTouched: (name: keyof T, touched: boolean) => void;
  validateField: (name: keyof T) => Promise<string | undefined>;
  validateForm: () => Promise<ValidationResult>;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleReset: () => void;
  resetForm: () => void;
}

// Form validation rules
export const validationRules = {
  required: (message = "This field is required") => ({
    required: true,
    message,
  }),
  minLength: (min: number, message?: string) => ({
    minLength: min,
    message: message || `Must be at least ${min} characters`,
  }),
  maxLength: (max: number, message?: string) => ({
    maxLength: max,
    message: message || `Must be no more than ${max} characters`,
  }),
  email: (message = "Invalid email format") => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message,
  }),
  url: (message = "Invalid URL format") => ({
    pattern: /^https?:\/\/.+\..+$/,
    message,
  }),
  number: (message = "Must be a valid number") => ({
    type: "number",
    message,
  }),
  integer: (message = "Must be an integer") => ({
    pattern: /^\d+$/,
    message,
  }),
  positive: (message = "Must be positive") => ({
    min: 0,
    message,
  }),
  color: (message = "Invalid color format") => ({
    pattern: /^#[0-9A-F]{6}$/i,
    message,
  }),
  date: (message = "Invalid date format") => ({
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message,
  }),
  time: (message = "Invalid time format") => ({
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    message,
  }),
};

// Export all types
