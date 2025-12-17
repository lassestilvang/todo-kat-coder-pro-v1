# State Management with Zustand

This document describes the comprehensive state management system implemented with Zustand for the Next.js daily task planner application.

## Overview

The application uses Zustand for state management, providing a simple and efficient way to manage global state across components. The state is organized into multiple stores, each responsible for a specific domain of the application.

## Stores

### 1. Task Store (`useTaskStore`)

**Purpose**: Manages all task-related state including CRUD operations, filtering, sorting, and form state.

**Key Features**:

- Task CRUD operations with API synchronization
- Real-time validation with Zod
- Filtering and sorting capabilities
- Form state management
- Bulk operations (update, delete)
- Optimistic updates
- State persistence with localStorage

**State Structure**:

```typescript
interface TaskState {
  byId: Record<number, TaskWithRelations>;
  allIds: number[];
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  lastUpdated: number | null;

  // Filtering and sorting
  filter: TaskFilter;
  sort: TaskSort;
  searchTerm: string;

  // Form state
  form: {
    isSubmitting: boolean;
    isDirty: boolean;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
  };

  selectedTaskId: number | null;
}
```

**Key Actions**:

- `fetchTasks()`: Fetch tasks from API
- `createTask(task)`: Create new task
- `updateTask(id, updates)`: Update existing task
- `deleteTask(id)`: Delete task
- `toggleTask(id)`: Toggle task completion
- `bulkUpdate(ids, updates)`: Bulk update tasks
- `bulkDelete(ids)`: Bulk delete tasks
- `setFilter(filter)`: Set filter criteria
- `setSort(sort)`: Set sort criteria
- `validateField(field, value)`: Validate individual field

### 2. List Store (`useListStore`)

**Purpose**: Manages list-related state including CRUD operations and selection.

**Key Features**:

- List CRUD operations
- Form validation
- Selection management
- State persistence

**State Structure**:

```typescript
interface ListState {
  byId: Record<number, List>;
  allIds: number[];
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  lastUpdated: number | null;

  form: {
    isSubmitting: boolean;
    isDirty: boolean;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
  };

  selectedListId: number | null;
}
```

### 3. Label Store (`useLabelStore`)

**Purpose**: Manages label-related state including CRUD operations and selection.

**Key Features**:

- Label CRUD operations
- Form validation
- Selection management
- State persistence

### 4. UI Store (`useUIStore`)

**Purpose**: Manages UI-related state including theme, modals, loading states, and notifications.

**Key Features**:

- Theme management (light/dark/system)
- Modal state management
- Loading state management
- Notification system
- Sidebar state
- State persistence

**State Structure**:

```typescript
interface UIState {
  theme: "light" | "dark" | "system";
  isDarkMode: boolean;

  modals: {
    taskForm: { open: boolean; mode: "create" | "edit"; taskId?: number };
    listForm: { open: boolean; mode: "create" | "edit"; listId?: number };
    labelForm: { open: boolean; mode: "create" | "edit"; labelId?: number };
    confirm: {
      open: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel: () => void;
    };
  };

  loadingStates: Record<string, boolean>;

  notifications: Notification[];

  sidebarCollapsed: boolean;
}
```

**Key Actions**:

- `setTheme(theme)`: Set application theme
- `openModal(modal, data)`: Open modal with data
- `closeModal(modal)`: Close modal
- `setLoading(key, loading)`: Set loading state
- `addNotification(notification)`: Add notification
- `removeNotification(id)`: Remove notification
- `toggleSidebar()`: Toggle sidebar

### 5. Search Store (`useSearchStore`)

**Purpose**: Manages search state including queries, results, and filters.

**Key Features**:

- Search query management
- Search results caching
- Search history
- Advanced filtering
- State persistence

**State Structure**:

```typescript
interface SearchState {
  query: string;
  results: TaskWithRelations[];
  searchHistory: string[];
  isSearching: boolean;
  searchError: string | null;

  filters: {
    lists: number[];
    labels: number[];
    priorities: string[];
    dateRange: { start: string; end: string };
    completed: boolean | null;
  };
}
```

### 6. View Store (`useViewStore`)

**Purpose**: Manages view-specific state for different task views (Today, Next 7 Days, Upcoming, All, Inbox).

**Key Features**:

- View switching
- View-specific data caching
- View refresh capabilities
- State persistence

**State Structure**:

```typescript
interface ViewState {
  currentView: ViewType;
  tasks: TaskWithRelations[];
  loading: boolean;
  error: string | null;

  viewData: {
    today: { tasks: TaskWithRelations[]; total: number };
    next7days: { tasks: TaskWithRelations[]; total: number };
    upcoming: { tasks: TaskWithRelations[]; total: number };
    all: { tasks: TaskWithRelations[]; total: number };
    inbox: { tasks: TaskWithRelations[]; total: number };
  };
}
```

### 7. Form Store (`useFormStore`)

**Purpose**: Manages form state and validation for all forms in the application.

**Key Features**:

- Form field state management
- Real-time validation
- Form submission state
- Field-level validation
- Form reset capabilities

## State Persistence

All stores use Zustand's persistence middleware to automatically save state to localStorage:

```typescript
persist(
  (set) => ({ ... }),
  {
    name: "store-name",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      // Only persist specific state properties
    }),
  }
)
```

## State Relationships

Stores are designed to work independently but can interact through:

1. **Shared Services**: All stores use the same service layer for API calls
2. **Cross-Store Dependencies**: Some stores may depend on data from other stores
3. **Event-Driven Updates**: Changes in one store can trigger updates in others

## Performance Optimization

1. **Immer Integration**: Uses Immer for immutable state updates
2. **Selective Persistence**: Only persists necessary state properties
3. **Lazy Loading**: Data is loaded on-demand
4. **Caching**: View data is cached to avoid redundant API calls

## Error Handling

Each store implements comprehensive error handling:

1. **Loading States**: Clear loading states for all async operations
2. **Error States**: Detailed error messages
3. **Error Recovery**: Ability to clear errors and retry operations

## Usage Examples

### Using Task Store

```typescript
import { useTaskStore } from "@/store";

function TaskList() {
  const { tasks, loading, error, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### Using UI Store for Notifications

```typescript
import { useUIStore } from "@/store";

function TaskForm() {
  const { addNotification } = useUIStore();

  const handleSubmit = async (data) => {
    try {
      await createTask(data);
      addNotification({
        type: "success",
        title: "Task Created",
        message: "Your task has been created successfully",
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to create task",
      });
    }
  };
}
```

### Using Form Validation Hook

```typescript
import { useFormValidation } from "@/hooks/useFormValidation";
import { TaskSchema } from "@/lib/validation";

function TaskForm() {
  const { values, errors, setFieldValue, validateField, handleSubmit } =
    useFormValidation({
      initialValues: { title: "", description: "", priority: "medium" },
      validationSchema: TaskSchema,
      onSubmit: async (values) => {
        await createTask(values);
      },
    });

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.title}
        onChange={(e) => setFieldValue("title", e.target.value)}
        onBlur={() => validateField("title")}
      />
      {errors.title && <span className="error">{errors.title}</span>}
      <button type="submit">Create Task</button>
    </form>
  );
}
```

## Best Practices

1. **Store Separation**: Keep stores focused on specific domains
2. **State Immutability**: Always create new state objects
3. **Error Handling**: Implement comprehensive error handling
4. **Loading States**: Always show loading states for async operations
5. **State Persistence**: Persist only necessary state to localStorage
6. **Performance**: Use selective persistence and caching
7. **Type Safety**: Use TypeScript for all state and actions

## Migration from Redux

The Zustand implementation provides several advantages over Redux:

1. **Simplicity**: No need for actions, reducers, or selectors
2. **TypeScript**: Better TypeScript support out of the box
3. **Bundle Size**: Smaller bundle size
4. **Performance**: Better performance with selective subscriptions
5. **Developer Experience**: Easier to write and maintain

## Future Enhancements

1. **Server-Side Rendering**: Add SSR support for better SEO
2. **Real-time Updates**: Integrate with WebSocket for real-time updates
3. **Offline Support**: Enhanced offline capabilities with service workers
4. **State Synchronization**: Multi-tab state synchronization
5. **Analytics**: Track state changes for analytics
