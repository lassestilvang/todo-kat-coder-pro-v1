import {
  Task,
  TaskWithRelations,
  List,
  Label,
  Priority,
  RecurrenceType,
  Reminder,
} from "./task";

// Utility types for common operations
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PickByValueType<T, ValueType> = {
  [Key in keyof T as T[Key] extends ValueType ? Key : never]: T[Key];
};

export type OmitByValueType<T, ValueType> = {
  [Key in keyof T as T[Key] extends ValueType ? never : Key]: T[Key];
};

// Task utility types
export type TaskUpdateData = Partial<
  Omit<Task, "id" | "createdAt" | "updatedAt" | "list">
>;

export type TaskCreateData = Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "isCompleted" | "completedAt"
>;

export type TaskFilterData = {
  search?: string;
  priority?: Priority;
  status?: "all" | "completed" | "pending";
  listId?: number;
  labelIds?: number[];
  date?: string;
  completed?: boolean;
  dueDate?: string;
  hasReminder?: boolean;
  hasAttachment?: boolean;
  hasSubTask?: boolean;
};

export type TaskSortData = {
  field: keyof Task;
  direction: "asc" | "desc";
};

// List utility types
export type ListUpdateData = Partial<
  Omit<List, "id" | "createdAt" | "updatedAt">
>;

export type ListCreateData = Omit<List, "id" | "createdAt" | "updatedAt">;

// Label utility types
export type LabelUpdateData = Partial<Omit<Label, "id" | "createdAt">>;

export type LabelCreateData = Omit<Label, "id" | "createdAt">;

// Date utility types
export type DateRange = {
  start: Date;
  end: Date;
};

export type DateFilter = {
  type: "today" | "tomorrow" | "thisWeek" | "nextWeek" | "thisMonth" | "custom";
  range?: DateRange;
};

// View types
export type ViewType = "today" | "next7days" | "upcoming" | "all" | "inbox";

export type ViewConfig = {
  type: ViewType;
  title: string;
  description: string;
  icon: string;
  filter: TaskFilterData;
  sort: TaskSortData;
};

// Theme types
export type ThemeMode = "light" | "dark" | "system";

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  input: string;
  ring: string;
  destructive: string;
  success: string;
  warning: string;
};

export type ThemeSpacing = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
};

export type ThemeRadius = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  full: string;
};

export type ThemeTypography = {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
};

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeRadius;
  typography: ThemeTypography;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
};

// State management types
export type LoadingState = "idle" | "loading" | "success" | "error";

export type EntityState<T> = {
  byId: Record<number, T>;
  allIds: number[];
  loading: LoadingState;
  error: string | null;
  lastUpdated: number | null;
};

export type PaginationState = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

// API types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    pagination?: PaginationState;
    timestamp?: number;
  };
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
};

// Form types
export type FormFieldError = {
  field: string;
  message: string;
};

export type FormErrors = Record<string, string>;

export type FormValidationResult = {
  isValid: boolean;
  errors: FormErrors;
  warnings?: FormErrors;
};

// Search types
export type SearchQuery = {
  text: string;
  filters?: TaskFilterData;
  sort?: TaskSortData;
  limit?: number;
  offset?: number;
};

export type SearchResult<T> = {
  items: T[];
  total: number;
  query: SearchQuery;
  facets?: Record<string, number>;
};

// Notification types
export type NotificationType = "info" | "success" | "warning" | "error";

export type Notification = {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  createdAt: Date;
  read: boolean;
};

// Export all utility types
