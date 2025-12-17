# State Management Implementation

This document provides a comprehensive overview of the state management system implemented for the Next.js daily task planner application.

## 🏗️ Architecture Overview

The application uses **Zustand** for state management, organized into multiple focused stores:

### Stores Structure

```
src/store/
├── taskStore.ts      # Task management (CRUD, filtering, sorting)
├── listStore.ts      # List management (CRUD, selection)
├── labelStore.ts     # Label management (CRUD, selection)
├── uiStore.ts        # UI state (theme, modals, notifications)
├── searchStore.ts    # Search functionality (queries, filters, history)
├── viewStore.ts      # View management (Today, Next 7 Days, Upcoming, All, Inbox)
├── formStore.ts      # Form state and validation
└── index.ts          # Store exports and utilities
```

## 📦 Key Features Implemented

### ✅ Task Store (`useTaskStore`)

- **CRUD Operations**: Create, read, update, delete tasks with API synchronization
- **Real-time Validation**: Client-side validation with Zod schemas
- **Filtering & Sorting**: Comprehensive filtering by priority, status, date, list
- **Form Management**: Task form state with validation and error handling
- **Bulk Operations**: Bulk update and delete multiple tasks
- **State Persistence**: Automatic localStorage persistence
- **Optimistic Updates**: Smooth UX with rollback on errors

### ✅ List Store (`useListStore`)

- **List Management**: Complete CRUD operations for lists
- **Form Validation**: Real-time validation for list creation/editing
- **Selection State**: Track selected list for editing
- **State Persistence**: Remember list state across sessions

### ✅ Label Store (`useLabelStore`)

- **Label Management**: Create, update, delete labels
- **Form Validation**: Client-side validation for label forms
- **Selection State**: Track selected label for editing
- **State Persistence**: Persistent label state

### ✅ UI Store (`useUIStore`)

- **Theme Management**: Light/dark/system theme switching
- **Modal Management**: Open/close modals with data passing
- **Loading States**: Track loading states for different operations
- **Notification System**: Toast notifications with auto-dismiss
- **Sidebar State**: Collapsed/expanded state management
- **State Persistence**: Remember UI preferences

### ✅ Search Store (`useSearchStore`)

- **Search Queries**: Real-time search with debouncing
- **Search History**: Remember recent searches
- **Advanced Filters**: Filter by lists, labels, priorities, date ranges
- **Search Results**: Cache search results for performance
- **State Persistence**: Remember search filters and history

### ✅ View Store (`useViewStore`)

- **View Management**: Switch between Today, Next 7 Days, Upcoming, All, Inbox
- **View Caching**: Cache view data to avoid redundant API calls
- **Bulk Refresh**: Refresh all views simultaneously
- **State Persistence**: Remember current view selection

### ✅ Form Store (`useFormStore`)

- **Form State**: Manage values, errors, touched fields
- **Real-time Validation**: Validate fields as user types
- **Form Submission**: Track submission state and errors
- **Field Management**: Individual field operations

## 🔧 Validation System

### Zod Integration

```typescript
// Example validation schema
export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  priority: z.enum(["low", "medium", "high", "none"]),
  // ... more fields
});
```

### Real-time Validation Hook

```typescript
import { useFormValidation } from "@/hooks/useFormValidation";

const { values, errors, setFieldValue, validateField, handleSubmit } =
  useFormValidation({
    initialValues: { title: "", priority: "medium" },
    validationSchema: TaskSchema,
    validateOnChange: true,
    onSubmit: async (values) => {
      await createTask(values);
    },
  });
```

## 🎯 Key Implementation Details

### State Persistence

All stores use Zustand's persistence middleware:

```typescript
persist(
  (set) => ({ ... }),
  {
    name: "store-name",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      // Only persist specific properties
      byId: state.byId,
      allIds: state.allIds,
      filter: state.filter,
      // ...
    }),
  }
)
```

### Immer Integration

State updates use Immer for immutable updates:

```typescript
immer((set) => ({
  updateTask: (id, updates) => {
    set((state) => {
      state.byId[id] = { ...state.byId[id], ...updates };
    });
  },
}));
```

### Error Handling

Comprehensive error handling across all stores:

```typescript
try {
  const result = await api.createTask(data);
  set({ loading: "success", error: null });
} catch (error) {
  set({
    loading: "error",
    error: error instanceof Error ? error.message : "Unknown error",
  });
}
```

## 🚀 Usage Examples

### Basic Store Usage

```typescript
import { useTaskStore } from "@/store";

function TaskList() {
  const { tasks, loading, error, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading === "loading") return <LoadingSpinner />;
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

### Form with Validation

```typescript
import { useFormValidation } from "@/hooks/useFormValidation";
import { TaskSchema } from "@/lib/validation";

function TaskForm() {
  const {
    values,
    errors,
    setFieldValue,
    validateField,
    handleSubmit,
    submitting,
  } = useFormValidation({
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
        className={errors.title ? "error" : ""}
      />
      {errors.title && <span className="error">{errors.title}</span>}

      <select
        value={values.priority}
        onChange={(e) => setFieldValue("priority", e.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}
```

### UI Store for Notifications

```typescript
import { useUIStore } from "@/store";

function TaskActions() {
  const { addNotification, openModal, closeModal } = useUIStore();

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      addNotification({
        type: "success",
        title: "Task Deleted",
        message: "Task has been deleted successfully",
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to delete task",
      });
    }
  };

  return (
    <div>
      <button onClick={() => openModal("taskForm", { mode: "create" })}>
        Create Task
      </button>
      <button onClick={() => handleDelete(taskId)}>Delete Task</button>
    </div>
  );
}
```

## 📱 Components Created

### DatePicker Component

- **Location**: `src/components/ui/DatePicker.tsx`
- **Features**:
  - Calendar integration with Popover
  - Time selection (optional)
  - Date range validation
  - Error display
  - Accessibility support

### Form Validation Hook

- **Location**: `src/hooks/useFormValidation.ts`
- **Features**:
  - Real-time field validation
  - Form-level validation
  - Error handling
  - Submission state management
  - TypeScript support

## 🎨 UI Enhancements

### Theme Support

- Light/dark mode switching
- System theme detection
- Persistent theme preferences
- Smooth theme transitions

### Notification System

- Toast notifications with auto-dismiss
- Multiple notification types (success, error, warning, info)
- Action buttons in notifications
- Notification history

### Modal Management

- Centralized modal state
- Data passing to modals
- Modal stacking support
- Escape key handling

## 🔄 State Flow

1. **User Action**: User interacts with UI
2. **Store Action**: Store action is called
3. **Loading State**: Set loading state
4. **API Call**: Make API request
5. **State Update**: Update store state
6. **Error Handling**: Handle success/error
7. **UI Update**: Components re-render

## 📊 Performance Optimizations

1. **Selective Persistence**: Only persist necessary state
2. **Immer Integration**: Efficient immutable updates
3. **Caching**: View data caching to avoid redundant API calls
4. **Lazy Loading**: Load data on-demand
5. **Component Memoization**: Prevent unnecessary re-renders

## 🧪 Testing Strategy

### Unit Tests

- Store actions and state updates
- Validation functions
- Hook behavior
- Component rendering

### Integration Tests

- API integration with stores
- Cross-store interactions
- Form submission flows
- UI state changes

### E2E Tests

- Complete user workflows
- State persistence
- Error scenarios
- Performance testing

## 🚀 Deployment Considerations

1. **Bundle Size**: Zustand has minimal bundle impact
2. **Performance**: Optimized for production use
3. **Error Boundaries**: Graceful error handling
4. **Monitoring**: State change tracking for debugging

## 📚 Documentation

- **Technical Specification**: `technical-specification/06-state-management.md`
- **API Documentation**: Inline code documentation
- **Usage Examples**: Component examples and patterns

## 🔮 Future Enhancements

1. **Real-time Updates**: WebSocket integration for live updates
2. **Offline Support**: Enhanced offline capabilities
3. **State Synchronization**: Multi-tab state sync
4. **Analytics**: State change analytics
5. **Performance Monitoring**: State performance metrics

## 🤝 Contributing

When adding new state or modifying existing stores:

1. **Follow Patterns**: Use existing store patterns
2. **Type Safety**: Always use TypeScript
3. **Error Handling**: Implement comprehensive error handling
4. **Testing**: Add tests for new functionality
5. **Documentation**: Update documentation for changes

## 📞 Support

For questions or issues related to state management:

1. Check the technical specification
2. Review existing store implementations
3. Look at usage examples in components
4. Check error handling patterns
5. Verify TypeScript types are correct

---

**Note**: This state management system provides a solid foundation for the task planner application, with room for growth and optimization as the application evolves.
