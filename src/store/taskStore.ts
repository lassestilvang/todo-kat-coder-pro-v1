import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Task, TaskWithRelations, TaskFilter, TaskSort } from "@/types/task";
import {
  validateTask,
  validateTaskPartial,
  validateTaskField,
} from "@/lib/validation";
import { TaskService } from "@/services/task-service";

interface EntityState<T> {
  byId: Record<number, T>;
  allIds: number[];
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  lastUpdated: number | null;
}

// Helper function to get all tasks as an array
export const getAllTasks = (state: TaskState): TaskWithRelations[] => {
  return state.allIds.map((id) => state.byId[id]).filter(Boolean);
};

// Typed selector for use in components
export const useAllTasks = () => useTaskStore(getAllTasks);

interface TaskState extends EntityState<TaskWithRelations> {
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
  persist(
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
          const { tasks } = await TaskService.getTasks();
          set((state) => {
            state.loading = "success";
            state.error = null;
            state.lastUpdated = Date.now();

            // Clear existing data
            state.byId = {};
            state.allIds = [];

            // Add new tasks
            tasks.forEach((task) => {
              state.byId[task.id] = task;
              state.allIds.push(task.id);
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
          const newTask = await TaskService.createTask(validatedTask);

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
          const updatedTask = await TaskService.updateTask(
            id,
            validatedUpdates
          );

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
          const success = await TaskService.deleteTask(id);

          if (success) {
            set((state) => {
              delete state.byId[id];
              state.allIds = state.allIds.filter((taskId) => taskId !== id);
              state.loading = "success";
              state.error = null;

              if (state.selectedTaskId === id) {
                state.selectedTaskId = null;
              }
            });
          } else {
            throw new Error("Failed to delete task");
          }
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
          if (currentTask.isCompleted) {
            const updatedTask = await TaskService.uncompleteTask(id);
            if (updatedTask) {
              set((state) => {
                state.byId[id] = { ...currentTask, ...updatedTask };
              });
            }
          } else {
            const updatedTask = await TaskService.completeTask(id);
            if (updatedTask) {
              set((state) => {
                state.byId[id] = { ...currentTask, ...updatedTask };
              });
            }
          }
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
    })),
    {
      name: "task-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        byId: state.byId,
        allIds: state.allIds,
        filter: state.filter,
        sort: state.sort,
        searchTerm: state.searchTerm,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Helper function to get store state (for use in actions)
const get = () => useTaskStore.getState();
