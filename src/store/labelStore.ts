import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Label } from "@/types/task";
import { validateLabel, validateLabelField } from "@/lib/validation";

interface EntityState<T> {
  byId: Record<number, T>;
  allIds: number[];
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  lastUpdated: number | null;
}

interface LabelState extends EntityState<Label> {
  // Form state
  form: {
    isSubmitting: boolean;
    isDirty: boolean;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
  };

  // Selected label for editing
  selectedLabelId: number | null;

  // API operations
  fetchLabels: () => Promise<void>;
  createLabel: (label: Omit<Label, "id" | "createdAt">) => Promise<void>;
  updateLabel: (id: number, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: number) => Promise<void>;

  // Form operations
  setFormError: (field: string, error: string) => void;
  setFieldTouched: (field: string) => void;
  validateField: (field: keyof Label, value: unknown) => string | undefined;
  resetForm: () => void;

  // Selection
  selectLabel: (id: number | null) => void;

  // Clear error
  clearError: () => void;
}

export const useLabelStore = create<LabelState>()(
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

      selectedLabelId: null,

      // Actions
      fetchLabels: async () => {
        set((state) => {
          state.loading = "loading";
          state.error = null;
        });

        try {
          const response = await fetch("/api/labels");
          if (!response.ok) {
            throw new Error("Failed to fetch labels");
          }
          const labels = await response.json();

          set((state) => {
            state.loading = "success";
            state.error = null;
            state.lastUpdated = Date.now();

            // Clear existing data
            state.byId = {};
            state.allIds = [];

            // Add new labels
            labels.forEach((label: Label) => {
              state.byId[label.id] = label;
              state.allIds.push(label.id);
            });
          });
        } catch (error) {
          set((state) => {
            state.loading = "error";
            state.error =
              error instanceof Error ? error.message : "Failed to fetch labels";
          });
        }
      },

      createLabel: async (labelData) => {
        set((state) => {
          state.form.isSubmitting = true;
          state.error = null;
        });

        try {
          const validatedLabel = validateLabel(labelData);
          const response = await fetch("/api/labels", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedLabel),
          });

          if (!response.ok) {
            throw new Error("Failed to create label");
          }

          const newLabel = await response.json();

          set((state) => {
            state.byId[newLabel.id] = newLabel;
            state.allIds.push(newLabel.id);
            state.form.isSubmitting = false;
            state.form.isDirty = false;
            state.form.errors = {};
            state.form.touched = {};
          });
        } catch (error) {
          set((state) => {
            state.form.isSubmitting = false;
            state.error =
              error instanceof Error ? error.message : "Failed to create label";
          });
        }
      },

      updateLabel: async (id, updates) => {
        const currentLabel = get().byId[id];
        if (!currentLabel) return;

        set((state) => {
          state.form.isSubmitting = true;
          state.error = null;
        });

        try {
          const validatedUpdates = validateLabelPartial(updates);
          const response = await fetch(`/api/labels/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedUpdates),
          });

          if (!response.ok) {
            throw new Error("Failed to update label");
          }

          const updatedLabel = await response.json();

          set((state) => {
            state.byId[id] = { ...currentLabel, ...updatedLabel };
            state.form.isSubmitting = false;
            state.form.isDirty = false;
            state.form.errors = {};
            state.form.touched = {};
          });
        } catch (error) {
          set((state) => {
            state.form.isSubmitting = false;
            state.error =
              error instanceof Error ? error.message : "Failed to update label";
          });
        }
      },

      deleteLabel: async (id) => {
        set((state) => {
          state.loading = "loading";
          state.error = null;
        });

        try {
          const response = await fetch(`/api/labels/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete label");
          }

          set((state) => {
            delete state.byId[id];
            state.allIds = state.allIds.filter(
              (labelId: number) => labelId !== id
            );
            state.loading = "success";
            state.error = null;

            if (state.selectedLabelId === id) {
              state.selectedLabelId = null;
            }
          });
        } catch (error) {
          set((state) => {
            state.loading = "error";
            state.error =
              error instanceof Error ? error.message : "Failed to delete label";
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
        const error = validateLabelField(field, value);
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

      selectLabel: (id) => {
        set((state) => {
          state.selectedLabelId = id;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    }),
  )
);

// Helper function to get store state (for use in actions)
const get = () => useLabelStore.getState();

// Helper function for partial validation
function validateLabelPartial(updates: Partial<Label>): Partial<Label> {
  const errors: Record<string, string> = {};

  if (updates.name !== undefined) {
    const error = validateLabelField("name", updates.name);
    if (error) errors.name = error;
  }

  if (updates.icon !== undefined) {
    const error = validateLabelField("icon", updates.icon);
    if (error) errors.icon = error;
  }

  if (updates.color !== undefined) {
    const error = validateLabelField("color", updates.color);
    if (error) errors.color = error;
  }

  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).join(", "));
  }

  return updates;
}
