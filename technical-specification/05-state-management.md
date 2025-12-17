# State Management Strategy

## Overview

This document outlines the state management strategy for the Next.js daily task planner application using Zustand. The strategy focuses on maintaining a clean, predictable, and scalable state architecture that supports all application features while providing excellent developer experience.

## State Management Principles

### 1. State Separation

- **Server State**: Data from API calls (tasks, lists, labels)
- **Client State**: UI state, form data, local preferences
- **Persistent State**: Data that needs to survive page reloads

### 2. Store Organization

- **Domain-Driven**: Stores organized by business domains
- **Single Responsibility**: Each store manages one specific domain
- **Minimal Coupling**: Stores are independent and loosely coupled

### 3. Data Flow

- **Unidirectional**: Clear data flow from API → Store → Components
- **Predictable Updates**: All state changes go through defined actions
- **Immutability**: State updates create new state objects

## Store Architecture

### 1. Task Store

```typescript
// lib/store/taskStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task, CreateTaskData, UpdateTaskData } from "@/lib/types/task";
import { taskService } from "@/lib/services/taskService";

interface TaskState {
  // State
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string, completed: boolean) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      loading: false,
      error: null,

      // Actions
      fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
          const tasks = await taskService.getAllTasks();
          set({ tasks, loading: false });
        } catch (error) {
          set({
            error: "Failed to fetch tasks",
            loading: false,
          });
        }
      },

      createTask: async (data: CreateTaskData) => {
        set({ loading: true, error: null });
        try {
          const newTask = await taskService.createTask(data);
          set((state) => ({
            tasks: [newTask, ...state.tasks],
            loading: false,
          }));
          return newTask;
        } catch (error) {
          set({
            error: "Failed to create task",
            loading: false,
          });
          throw error;
        }
      },

      updateTask: async (id: string, data: UpdateTaskData) => {
        set({ loading: true, error: null });
        try {
          const updatedTask = await taskService.updateTask(id, data);
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? updatedTask : task
            ),
            loading: false,
          }));
        } catch (error) {
          set({
            error: "Failed to update task",
            loading: false,
          });
          throw error;
        }
      },

      deleteTask: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await taskService.deleteTask(id);
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({
            error: "Failed to delete task",
            loading: false,
          });
          throw error;
        }
      },

      toggleTaskComplete: async (id: string, completed: boolean) => {
        set({ loading: true, error: null });
        try {
          await taskService.updateTask(id, { isCompleted: completed });
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, isCompleted: completed } : task
            ),
            loading: false,
          }));
        } catch (error) {
          set({
            error: "Failed to update task status",
            loading: false,
          });
          throw error;
        }
      },

      setTasks: (tasks: Task[]) => set({ tasks }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);
```

### 2. List Store

```typescript
// lib/store/listStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { List, CreateListData, UpdateListData } from "@/lib/types/list";
import { listService } from "@/lib/services/listService";

interface ListState {
  lists: List[];
  loading: boolean;
  error: string | null;

  fetchLists: () => Promise<void>;
  createList: (data: CreateListData) => Promise<List>;
  updateList: (id: string, data: UpdateListData) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  setLists: (lists: List[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useListStore = create<ListState>()(
  persist(
    (set) => ({
      lists: [],
      loading: false,
      error: null,

      fetchLists: async () => {
        set({ loading: true, error: null });
        try {
          const lists = await listService.getAllLists();
          set({ lists, loading: false });
        } catch (error) {
          set({ error: "Failed to fetch lists", loading: false });
        }
      },

      createList: async (data: CreateListData) => {
        set({ loading: true, error: null });
        try {
          const newList = await listService.createList(data);
          set((state) => ({
            lists: [...state.lists, newList],
            loading: false,
          }));
          return newList;
        } catch (error) {
          set({ error: "Failed to create list", loading: false });
          throw error;
        }
      },

      updateList: async (id: string, data: UpdateListData) => {
        set({ loading: true, error: null });
        try {
          const updatedList = await listService.updateList(id, data);
          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === id ? updatedList : list
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: "Failed to update list", loading: false });
          throw error;
        }
      },

      deleteList: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await listService.deleteList(id);
          set((state) => ({
            lists: state.lists.filter((list) => list.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ error: "Failed to delete list", loading: false });
          throw error;
        }
      },

      setLists: (lists: List[]) => set({ lists }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "list-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lists: state.lists,
      }),
    }
  )
);
```

### 3. UI Store

```typescript
// lib/store/uiStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { List } from "@/lib/types/list";

interface UIState {
  // State
  selectedListId: string | null;
  selectedList: List | null;
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  filters: {
    status: string[];
    priority: string[];
    dueDate: {
      from?: string;
      to?: string;
    };
    labels: string[];
  };
  searchQuery: string;

  // Actions
  setSelectedListId: (id: string | null) => void;
  setSelectedList: (list: List | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setFilters: (filters: UIState["filters"]) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  clearSearch: () => void;
}

export const useUiStore = create<UIState>()(
  persist(
    (set, get) => ({
      selectedListId: "inbox",
      selectedList: null,
      sidebarOpen: true,
      theme: "system",
      filters: {
        status: [],
        priority: [],
        dueDate: {},
        labels: [],
      },
      searchQuery: "",

      setSelectedListId: (id) => set({ selectedListId: id }),
      setSelectedList: (list) => set({ selectedList: list }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setFilters: (filters) => set({ filters }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      resetFilters: () =>
        set({
          filters: {
            status: [],
            priority: [],
            dueDate: {},
            labels: [],
          },
        }),
      clearSearch: () => set({ searchQuery: "" }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 4. Search Store

```typescript
// lib/store/searchStore.ts
import { create } from "zustand";
import { Task, List, Label } from "@/lib/types";

interface SearchResult {
  tasks: Task[];
  lists: List[];
  labels: Label[];
  total: number;
}

interface SearchState {
  results: SearchResult | null;
  loading: boolean;
  error: string | null;
  query: string;
  filters: any;

  search: (query: string, filters?: any) => Promise<void>;
  clearResults: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  results: null,
  loading: false,
  error: null,
  query: "",
  filters: {},

  search: async (query: string, filters = {}) => {
    set({ loading: true, error: null, query, filters });
    try {
      const results = await searchService.search(query, filters);
      set({ results, loading: false });
    } catch (error) {
      set({ error: "Search failed", loading: false });
    }
  },

  clearResults: () => set({ results: null, query: "", filters: {} }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
```

## State Management Patterns

### 1. Custom Hooks

```typescript
// lib/hooks/useTasks.ts
import { useTaskStore } from "@/lib/store/taskStore";
import { useEffect } from "react";

export function useTasks() {
  const { tasks, loading, error, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  };
}

// lib/hooks/useFilteredTasks.ts
import { useTaskStore } from "@/lib/store/taskStore";
import { useUiStore } from "@/lib/store/uiStore";
import { useMemo } from "react";

export function useFilteredTasks() {
  const { tasks } = useTaskStore();
  const { selectedListId, filters, searchQuery } = useUiStore();

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Filter by selected list
        if (selectedListId && selectedListId !== "all") {
          if (selectedListId === "inbox") {
            return !task.listId || task.listId === "inbox";
          }
          return task.listId === selectedListId;
        }
        return true;
      })
      .filter((task) => {
        // Filter by status
        if (filters.status.length > 0) {
          return filters.status.includes(task.status);
        }
        return true;
      })
      .filter((task) => {
        // Filter by priority
        if (filters.priority.length > 0) {
          return filters.priority.includes(task.priority);
        }
        return true;
      })
      .filter((task) => {
        // Filter by due date
        if (filters.dueDate.from || filters.dueDate.to) {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          if (filters.dueDate.from) {
            const fromDate = new Date(filters.dueDate.from);
            if (taskDate < fromDate) return false;
          }
          if (filters.dueDate.to) {
            const toDate = new Date(filters.dueDate.to);
            if (taskDate > toDate) return false;
          }
          return true;
        }
        return true;
      })
      .filter((task) => {
        // Filter by labels
        if (filters.labels.length > 0) {
          return task.labels.some((label) => filters.labels.includes(label.id));
        }
        return true;
      })
      .filter((task) => {
        // Search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.labels.some((label) =>
              label.name.toLowerCase().includes(query)
            )
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by priority and due date
        const priorityOrder = {
          urgent: 0,
          high: 1,
          medium: 2,
          low: 3,
        };

        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }

        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }

        if (a.dueDate) return -1;
        if (b.dueDate) return 1;

        return 0;
      });
  }, [tasks, selectedListId, filters, searchQuery]);

  return { tasks: filteredTasks };
}
```

### 2. State Selectors

```typescript
// lib/store/selectors.ts
import { create } from "zustand";

interface State {
  user: User;
  tasks: Task[];
  lists: List[];
  // ... other state
}

// Selectors for better performance
export const useUser = () => useStore((state) => state.user);
export const useTasks = () => useStore((state) => state.tasks);
export const useLists = () => useStore((state) => state.lists);

// Computed selectors
export const useIncompleteTasks = () =>
  useStore((state) => state.tasks.filter((task) => !task.isCompleted));

export const useUrgentTasks = () =>
  useStore((state) => state.tasks.filter((task) => task.priority === "urgent"));

export const useTasksByList = (listId: string) =>
  useStore((state) => state.tasks.filter((task) => task.listId === listId));
```

### 3. State Persistence

```typescript
// lib/store/persistence.ts
import { persist, createJSONStorage } from "zustand/middleware";

// Custom storage with encryption
const encryptedStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    if (!item) return null;
    // Decrypt item
    return JSON.parse(item);
  },
  setItem: (name: string, value: any) => {
    // Encrypt value
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

// Usage in store
export const useStore = create(
  persist(
    (set) => ({
      // store implementation
    }),
    {
      name: "my-store",
      storage: createJSONStorage(() => encryptedStorage),
      partialize: (state) => ({
        // Only persist specific parts
        tasks: state.tasks,
        lists: state.lists,
      }),
    }
  )
);
```

## State Synchronization

### 1. Server State Synchronization

```typescript
// lib/store/sync.ts
import { useTaskStore } from "./taskStore";
import { useListStore } from "./listStore";

// Polling for real-time updates
export function useRealTimeSync() {
  const { fetchTasks } = useTaskStore();
  const { fetchLists } = useListStore();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
      fetchLists();
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, []);
}
```

### 2. Optimistic Updates

```typescript
// lib/store/optimistic.ts
export const useTaskStore = create((set) => ({
  tasks: [],

  updateTaskOptimistic: async (id: string, data: UpdateTaskData) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...data } : task
      ),
    }));

    try {
      await taskService.updateTask(id, data);
    } catch (error) {
      // Rollback on error
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...data } : task
        ),
      }));
      throw error;
    }
  },
}));
```

## Error Handling

### 1. Global Error State

```typescript
// lib/store/errorStore.ts
import { create } from "zustand";

interface ErrorState {
  errors: Array<{
    id: string;
    message: string;
    timestamp: Date;
  }>;

  addError: (message: string) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],

  addError: (message) =>
    set((state) => ({
      errors: [
        ...state.errors,
        { id: crypto.randomUUID(), message, timestamp: new Date() },
      ],
    })),

  removeError: (id) =>
    set((state) => ({
      errors: state.errors.filter((error) => error.id !== id),
    })),

  clearErrors: () => set({ errors: [] }),
}));
```

### 2. Error Boundaries Integration

```typescript
// components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { useErrorStore } from "@/lib/store/errorStore";

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    useErrorStore.getState().addError(error.message);
  }

  render() {
    return this.props.children;
  }
}
```

## Performance Optimization

### 1. Memoization

```typescript
// lib/store/memoization.ts
import { create } from "zustand";
import { shallow } from "zustand/shallow";

// Use shallow comparison for better performance
export const useStore = create((set) => ({
  // store implementation
}));

// In components
const tasks = useStore((state) => state.tasks, shallow);
```

### 2. Lazy Loading

```typescript
// lib/store/lazy.ts
import { create } from "zustand";

export const useLazyStore = create((set) => ({
  data: null,

  loadData: async () => {
    const data = await fetchData();
    set({ data });
  },
}));
```

## Testing Strategy

### 1. Unit Tests

```typescript
// __tests__/store/taskStore.test.ts
import { create } from "zustand";
import { taskStore } from "@/lib/store/taskStore";

describe("Task Store", () => {
  let store: any;

  beforeEach(() => {
    store = create(taskStore);
  });

  it("should add a task", async () => {
    const task = { id: "1", title: "Test Task" };
    await store.getState().createTask(task);
    expect(store.getState().tasks).toContain(task);
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/store/integration.test.ts
import { renderHook } from "@testing-library/react";
import { useTasks } from "@/lib/hooks/useTasks";

describe("useTasks Hook", () => {
  it("should fetch tasks", async () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.loading).toBe(true);
  });
});
```

This state management strategy provides a robust, scalable, and maintainable approach to managing application state while ensuring excellent performance and developer experience.
