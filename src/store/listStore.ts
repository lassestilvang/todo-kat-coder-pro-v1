import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { List } from "@/types/task";
import { validateList, validateListField } from "@/lib/validation";
import { ListService } from "@/services/list-service";

interface EntityState<T> {
  byId: Record<number, T>;
  allIds: number[];
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  lastUpdated: number | null;
}

interface ListState extends EntityState<List> {
  // Form state
  form: {
    isSubmitting: boolean;
    isDirty: boolean;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
  };

  // Selected list for editing
  selectedListId: number | null;

  // API operations
  fetchLists: () => Promise<void>;
  createList: (
    list: Omit<List, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateList: (id: number, updates: Partial<List>) => Promise<void>;
  deleteList: (id: number) => Promise<void>;

  // Form operations
  setFormError: (field: string, error: string) => void;
  setFieldTouched: (field: string) => void;
  validateField: (field: keyof List, value: unknown) => string | undefined;
  resetForm: () => void;

  // Selection
  selectList: (id: number | null) => void;

  // Clear error
  clearError: () => void;
}

export const useListStore = create<ListState>()(
  persist(
    immer((set) => ({
      // Initial state
      byId: {},
      allIds: [],
      loading: "idle",
      error: null,
      lastUpdated: null,

      // Form state
      form: {
        isSubmitting: false,
        isDirty: false,
        errors: {},
        touched: {},
      },

      selectedListId: null,

      // Actions
      fetchLists: async () => {
        set((state) => {
          state.loading = "loading";
          state.error = null;
        });

        try {
          const lists = await ListService.getAll();
          set((state) => {
            state.loading = "success";
            state.error = null;
            state.lastUpdated = Date.now();

            // Clear existing data
            state.byId = {};
            state.allIds = [];

            // Add new lists
            lists.forEach((list) => {
              state.byId[list.id] = list;
              state.allIds.push(list.id);
            });
          });
        } catch (error) {
          set((state) => {
            state.loading = "error";
            state.error =
              error instanceof Error ? error.message : "Failed to fetch lists";
          });
        }
      },

      createList: async (listData) => {
        set((state) => {
          state.form.isSubmitting = true;
          state.error = null;
        });

        try {
          const validatedList = validateList(listData);
          const newList = await ListService.create(validatedList);

          set((state) => {
            state.byId[newList.id] = newList;
            state.allIds.push(newList.id);
            state.form.isSubmitting = false;
            state.form.isDirty = false;
            state.form.errors = {};
            state.form.touched = {};
          });
        } catch (error) {
          set((state) => {
            state.form.isSubmitting = false;
            state.error =
              error instanceof Error ? error.message : "Failed to create list";
          });
        }
      },

      updateList: async (id, updates) => {
        const currentList = get().byId[id];
        if (!currentList) return;

        set((state) => {
          state.form.isSubmitting = true;
          state.error = null;
        });

        try {
          const validatedUpdates = validateListPartial(updates);
          const updatedList = await ListService.update(id, validatedUpdates);

          set((state) => {
            state.byId[id] = { ...currentList, ...updatedList };
            state.form.isSubmitting = false;
            state.form.isDirty = false;
            state.form.errors = {};
            state.form.touched = {};
          });
        } catch (error) {
          set((state) => {
            state.form.isSubmitting = false;
            state.error =
              error instanceof Error ? error.message : "Failed to update list";
          });
        }
      },

      deleteList: async (id) => {
        set((state) => {
          state.loading = "loading";
          state.error = null;
        });

        try {
          const success = await ListService.delete(id);

          if (success) {
            set((state) => {
              delete state.byId[id];
              state.allIds = state.allIds.filter((listId) => listId !== id);
              state.loading = "success";
              state.error = null;

              if (state.selectedListId === id) {
                state.selectedListId = null;
              }
            });
          } else {
            throw new Error("Failed to delete list");
          }
        } catch (error) {
          set((state) => {
            state.loading = "error";
            state.error =
              error instanceof Error ? error.message : "Failed to delete list";
          });
        }
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
        const error = validateListField(field, value);
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

      selectList: (id) => {
        set((state) => {
          state.selectedListId = id;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: "list-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        byId: state.byId,
        allIds: state.allIds,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Helper function to get store state (for use in actions)
const get = () => useListStore.getState();
