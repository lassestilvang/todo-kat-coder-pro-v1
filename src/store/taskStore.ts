import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Task, TaskWithRelations, TaskFilter, TaskSort } from "@/types/task";
import {
  validateTask,
  validateTaskPartial,
  validateTaskField,
} from "@/lib/validation";

interface EntityState<T> {
  byId: Record<number, T>;
  allIds: number[];
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  lastUpdated: number | null;
}

// Typed selector for use in components - using Zustand's built-in memoization
export const useAllTasks = () => {
  return useTaskStore.getState().allIds.map(id => useTaskStore.getState().byId[id]).filter(Boolean);
};

export interface TaskState extends EntityState<TaskWithRelations> {
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

  // Selected task for editing
  selectedTaskId: number | null;

  // API operations
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;

  // Filtering and sorting operations
  setFilter: (filter: Partial<TaskFilter>) => void;
  setSort: (sort: TaskSort) => void;
  setSearchTerm: (term: string) => void;

  // Form operations
  setFormError: (field: string, error: string) => void;
  setFieldTouched: (field: string) => void;
  validateField: (field: keyof Task, value: unknown) => string | undefined;
  resetForm: () => void;

  // Selection
  selectTask: (id: number | null) => void;

  // Clear error
  clearError: () => void;
}

export const useTaskStore = create<TaskState>()(
  immer((set) => ({
    // Initial state
    byId: {},
    allIds: [],
    loading: "idle",
    error: null,
    lastUpdated: null,

    // Filtering and sorting
    filter: {
      search: "",
      priority: undefined,
      status: "all",
      view: "all",
      listId: undefined,
      date: undefined,
      limit: 50,
      offset: 0,
      orderBy: "createdAt",
      orderDirection: "desc",
      completed: undefined,
    },
    sort: {
      field: "createdAt",
      direction: "desc",
    },
    searchTerm: "",

    // Form state
    form: {
      isSubmitting: false,
      isDirty: false,
      errors: {},
      touched: {},
    },

    selectedTaskId: null,

    // Actions
    fetchTasks: async () => {
      set((state) => {
        state.loading = "loading";
        state.error = null;
      });

      try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const { tasks } = await response.json();

        set((state) => {
          state.loading = "success";
          state.error = null;
          state.lastUpdated = Date.now();

          // Clear existing data
          state.byId = {};
          state.allIds = [];

          // Add new tasks
          tasks.forEach((task: TaskWithRelations) => {
            if (task.id !== undefined) {
              state.byId[task.id] = task;
              state.allIds.push(task.id);
            }
          });
        });
      } catch (error) {
        set((state) => {
          state.loading = "error";
          state.error =
            error instanceof Error ? error.message : "Failed to fetch tasks";
        });
      }
    },

    createTask: async (taskData) => {
      set((state) => {
        state.form.isSubmitting = true;
        state.error = null;
      });

      try {
        const validatedTask = validateTask(taskData);
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedTask),
        });

        if (!response.ok) {
          throw new Error("Failed to create task");
        }

        const newTask = await response.json();

        set((state) => {
          state.byId[newTask.id] = newTask;
          state.allIds.unshift(newTask.id);
          state.form.isSubmitting = false;
          state.form.isDirty = false;
          state.form.errors = {};
          state.form.touched = {};
        });
      } catch (error) {
        set((state) => {
          state.form.isSubmitting = false;
          state.error =
            error instanceof Error ? error.message : "Failed to create task";
        });
      }
    },

    updateTask: async (id, updates) => {
      const currentTask = get().byId[id];
      if (!currentTask) return;

      set((state) => {
        state.form.isSubmitting = true;
        state.error = null;
      });

      try {
        const validatedUpdates = validateTaskPartial(updates);
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedUpdates),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        const updatedTask = await response.json();

        set((state) => {
          state.byId[id] = { ...currentTask, ...updatedTask };
          state.form.isSubmitting = false;
          state.form.isDirty = false;
          state.form.errors = {};
          state.form.touched = {};
        });
      } catch (error) {
        set((state) => {
          state.form.isSubmitting = false;
          state.error =
            error instanceof Error ? error.message : "Failed to update task";
        });
      }
    },

    deleteTask: async (id) => {
      set((state) => {
        state.loading = "loading";
        state.error = null;
      });

      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete task");
        }

        set((state) => {
          delete state.byId[id];
          state.allIds = state.allIds.filter((taskId) => taskId !== id);
          state.loading = "success";
          state.error = null;

          if (state.selectedTaskId === id) {
            state.selectedTaskId = null;
          }
        });
      } catch (error) {
        set((state) => {
          state.loading = "error";
          state.error =
            error instanceof Error ? error.message : "Failed to delete task";
        });
      }
    },

    toggleTask: async (id) => {
      const currentTask = get().byId[id];
      if (!currentTask) return;

      try {
        const response = await fetch(`/api/tasks/${id}/toggle`, {
          method: "PATCH",
        });

        if (!response.ok) {
          throw new Error("Failed to toggle task");
        }

        const updatedTask = await response.json();

        set((state) => {
          state.byId[id] = { ...currentTask, ...updatedTask };
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : "Failed to toggle task";
        });
      }
    },

    setFilter: (filter) => {
      set((state) => {
        state.filter = { ...state.filter, ...filter };
      });
    },

    setSort: (sort) => {
      set((state) => {
        state.sort = sort;
      });
    },

    setSearchTerm: (term) => {
      set((state) => {
        state.searchTerm = term;
        state.filter.search = term;
      });
    },

    setFormError: (field, error) => {
      set((state) => {
        state.form.errors[field] = error;
      });
    },

    setFieldTouched: (field) => {
      set((state) => {
        state.form.touched[field] = true;
      });
    },

    validateField: (field, value) => {
      const error = validateTaskField(field, value);
      if (error) {
        set((state) => {
          state.form.errors[field] = error;
        });
      } else {
        set((state) => {
          delete state.form.errors[field];
        });
      }
      return error;
    },

    resetForm: () => {
      set((state) => {
        state.form = {
          isSubmitting: false,
          isDirty: false,
          errors: {},
          touched: {},
        };
      });
    },

    selectTask: (id) => {
      set((state) => {
        state.selectedTaskId = id;
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);

// Helper function to get store state (for use in actions)
const get = () => useTaskStore.getState();