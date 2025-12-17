import {
  ReactNode,
  ReactElement,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import {
  Task,
  TaskWithRelations,
  List,
  Label,
  SubTask,
  Attachment,
  Priority,
  RecurrenceType,
  Reminder,
} from "./task";

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  title?: string;
  description?: string;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  theme?: "light" | "dark" | "system";
}

export interface HeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export interface SidebarProps extends BaseComponentProps {
  items: Array<{
    label: string;
    icon?: ReactElement;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    children?: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
      active?: boolean;
    }>;
  }>;
  collapsed?: boolean;
  onToggle?: () => void;
}

// Task component props
export interface TaskCardProps extends BaseComponentProps {
  task: TaskWithRelations;
  onToggle?: (task: TaskWithRelations) => void;
  onEdit?: (task: TaskWithRelations) => void;
  onDelete?: (task: TaskWithRelations) => void;
  onDuplicate?: (task: TaskWithRelations) => void;
  onAddSubTask?: (task: TaskWithRelations) => void;
  onAddAttachment?: (task: TaskWithRelations) => void;
  compact?: boolean;
  showLabels?: boolean;
  showSubTasks?: boolean;
  showAttachments?: boolean;
  showActions?: boolean;
}

export interface TaskListProps extends BaseComponentProps {
  tasks: TaskWithRelations[];
  loading?: boolean;
  error?: string;
  onTaskToggle?: (task: TaskWithRelations) => void;
  onTaskEdit?: (task: TaskWithRelations) => void;
  onTaskDelete?: (task: TaskWithRelations) => void;
  onTaskDuplicate?: (task: TaskWithRelations) => void;
  onTaskClick?: (task: TaskWithRelations) => void;
  emptyState?: ReactNode;
  compact?: boolean;
  showLabels?: boolean;
  showSubTasks?: boolean;
  showAttachments?: boolean;
  showActions?: boolean;
  virtualized?: boolean;
  onScrollToBottom?: () => void;
}

export interface TaskFormProps extends BaseComponentProps {
  task?: TaskWithRelations;
  lists: List[];
  labels: Label[];
  onSubmit: (data: unknown) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: (task: TaskWithRelations) => void;
  mode?: "create" | "edit";
  loading?: boolean;
  error?: string;
}

export interface TaskDetailsProps extends BaseComponentProps {
  task: TaskWithRelations;
  onEdit?: (task: TaskWithRelations) => void;
  onDelete?: (task: TaskWithRelations) => void;
  onDuplicate?: (task: TaskWithRelations) => void;
  onAddSubTask?: (task: TaskWithRelations) => void;
  onAddAttachment?: (task: TaskWithRelations) => void;
  onClose?: () => void;
}

// List component props
export interface ListCardProps extends BaseComponentProps {
  list: List;
  taskCount?: number;
  onEdit?: (list: List) => void;
  onDelete?: (list: List) => void;
  onClick?: (list: List) => void;
  active?: boolean;
}

export interface ListFormProps extends BaseComponentProps {
  list?: List;
  onSubmit: (data: unknown) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: (list: List) => void;
  mode?: "create" | "edit";
  loading?: boolean;
  error?: string;
}

export interface ListSelectorProps extends BaseComponentProps {
  lists: List[];
  selectedListId?: number;
  onChange: (listId: number) => void;
  placeholder?: string;
  showAll?: boolean;
  allLabel?: string;
}

// Label component props
export interface LabelChipProps extends BaseComponentProps {
  label: Label;
  removable?: boolean;
  onRemove?: (label: Label) => void;
  onClick?: (label: Label) => void;
  size?: "sm" | "md" | "lg";
}

export interface LabelSelectorProps extends BaseComponentProps {
  labels: Label[];
  selectedLabels?: Label[];
  onChange: (labels: Label[]) => void;
  placeholder?: string;
  creatable?: boolean;
  onCreate?: (label: Omit<Label, "id" | "createdAt">) => Promise<Label>;
}

export interface LabelFormProps extends BaseComponentProps {
  label?: Label;
  onSubmit: (data: unknown) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: (label: Label) => void;
  mode?: "create" | "edit";
  loading?: boolean;
  error?: string;
}

// Filter/Search component props
export interface SearchBarProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  debounce?: number;
}

export interface FilterBarProps extends BaseComponentProps {
  filters: {
    search?: string;
    priority?: Priority;
    status?: "all" | "completed" | "pending";
    listId?: number;
    labelIds?: number[];
    date?: string;
  };
  lists: List[];
  labels: Label[];
  onFilterChange: (filters: Record<string, unknown>) => void;
  onClear?: () => void;
  compact?: boolean;
}

export interface SortControlsProps extends BaseComponentProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  options: Array<{ value: string; label: string }>;
  onChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

// View component props
export interface ViewHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  sort?: ReactNode;
}

export interface ViewLayoutProps extends BaseComponentProps {
  header: ReactNode;
  filters?: ReactNode;
  content: ReactNode;
  sidebar?: ReactNode;
  loading?: boolean;
  error?: string;
}

// Form component props
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  name: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface InputFieldProps
  extends Omit<FormFieldProps, "name">,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "name"> {
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "time"
    | "datetime-local";
  name: string;
}

export interface TextareaFieldProps extends FormFieldProps {
  rows?: number;
  resize?: boolean;
}

export interface SelectFieldProps<T = unknown>
  extends Omit<FormFieldProps, "name">,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "name"> {
  options: Array<{ value: T; label: string; disabled?: boolean }>;
  multiple?: boolean;
  name: string;
}

export interface CheckboxFieldProps extends FormFieldProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface RadioGroupProps extends FormFieldProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
}

// Interactive component props
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
}

export interface IconButtonProps extends ButtonProps {
  icon: ReactElement;
  "aria-label": string;
}

export interface ToggleProps extends BaseComponentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export interface CheckboxProps extends BaseComponentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export interface DropdownMenuProps extends BaseComponentProps {
  trigger: ReactNode;
  items: Array<{
    label: string;
    icon?: ReactElement;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
    destructive?: boolean;
    shortcut?: string;
  }>;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
}

export interface DialogProps extends ModalProps {
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
}

// Notification component props
export interface ToastProps extends BaseComponentProps {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  onDismiss?: () => void;
}

export interface ToastProviderProps extends BaseComponentProps {
  duration?: number;
  swipeDirection?: "right" | "left";
  swipeThreshold?: number;
}

// Loading and error components
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
}

export interface SkeletonProps extends BaseComponentProps {
  height?: number | string;
  width?: number | string;
  borderRadius?: number | string;
  animated?: boolean;
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: Record<string, unknown>) => void;
}

export interface ErrorMessageProps extends BaseComponentProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "destructive";
}

// Utility types
export type ComponentSize = "sm" | "md" | "lg" | "xl";

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    input: string;
    ring: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

// Export all component types
