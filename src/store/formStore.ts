import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Task, List, Label, SubTask, Attachment } from "@/types/task";
import {
  validateTask,
  validateTaskPartial,
  validateTaskField,
  validateList,
  validateListField,
  validateLabel,
  validateLabelField,
  ValidationResult,
} from "@/lib/validation";

interface FormField {
  name: string;
  value: any;
  error: string;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

interface FormState {
  // Task form
  taskForm: {
    values: Partial<Task>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    dirty: boolean;
    validating: boolean;
    submitting: boolean;
    fields: FormField[];
  };

  // List form
  listForm: {
    values: Partial<List>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    dirty: boolean;
    validating: boolean;
    submitting: boolean;
    fields: FormField[];
  };

  // Label form
  labelForm: {
    values: Partial<Label>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    dirty: boolean;
    validating: boolean;
    submitting: boolean;
    fields: FormField[];
  };

  // Actions
  // Task form actions
  setTaskFieldValue: (field: keyof Task, value: any) => void;
  setTaskFieldError: (field: keyof Task, error: string) => void;
  setTaskFieldTouched: (field: keyof Task, touched: boolean) => void;
  validateTaskField: (
    field: keyof Task,
    value: any
  ) => Promise<string | undefined>;
  validateTaskForm: () => Promise<ValidationResult>;
  resetTaskForm: () => void;
  setTaskFormSubmitting: (submitting: boolean) => void;

  // List form actions
  setListFieldValue: (field: keyof List, value: any) => void;
  setListFieldError: (field: keyof List, error: string) => void;
  setListFieldTouched: (field: keyof List, touched: boolean) => void;
  validateListField: (
    field: keyof List,
    value: any
  ) => Promise<string | undefined>;
  validateListForm: () => Promise<ValidationResult>;
  resetListForm: () => void;
  setListFormSubmitting: (submitting: boolean) => void;

  // Label form actions
  setLabelFieldValue: (field: keyof Label, value: any) => void;
  setLabelFieldError: (field: keyof Label, error: string) => void;
  setLabelFieldTouched: (field: keyof Label, touched: boolean) => void;
  validateLabelField: (
    field: keyof Label,
    value: any
  ) => Promise<string | undefined>;
  validateLabelForm: () => Promise<ValidationResult>;
  resetLabelForm: () => void;
  setLabelFormSubmitting: (submitting: boolean) => void;
}

export const useFormStore = create<FormState>()(
  immer((set, get) => ({
    // Initial state
    taskForm: {
      values: {},
      errors: {},
      touched: {},
      dirty: false,
      validating: false,
      submitting: false,
      fields: [],
    },

    listForm: {
      values: {},
      errors: {},
      touched: {},
      dirty: false,
      validating: false,
      submitting: false,
      fields: [],
    },

    labelForm: {
      values: {},
      errors: {},
      touched: {},
      dirty: false,
      validating: false,
      submitting: false,
      fields: [],
    },

    // Task form actions
    setTaskFieldValue: (field, value) => {
      set((state) => {
        state.taskForm.values[field] = value;
        state.taskForm.dirty = true;
        state.taskForm.touched[field] = true;
      });
    },

    setTaskFieldError: (field, error) => {
      set((state) => {
        state.taskForm.errors[field] = error;
      });
    },

    setTaskFieldTouched: (field, touched) => {
      set((state) => {
        state.taskForm.touched[field] = touched;
      });
    },

    validateTaskField: async (field, value) => {
      const error = validateTaskField(field, value);
      get().setTaskFieldError(field, error || "");
      return error;
    },

    validateTaskForm: async () => {
      const values = get().taskForm.values;
      try {
        validateTask(values);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof Error) {
          return { isValid: false, errors: { general: error.message } };
        }
        return { isValid: false, errors: { general: "Validation failed" } };
      }
    },

    resetTaskForm: () => {
      set((state) => {
        state.taskForm = {
          values: {},
          errors: {},
          touched: {},
          dirty: false,
          validating: false,
          submitting: false,
          fields: [],
        };
      });
    },

    setTaskFormSubmitting: (submitting) => {
      set((state) => {
        state.taskForm.submitting = submitting;
      });
    },

    // List form actions
    setListFieldValue: (field, value) => {
      set((state) => {
        state.listForm.values[field] = value;
        state.listForm.dirty = true;
        state.listForm.touched[field] = true;
      });
    },

    setListFieldError: (field, error) => {
      set((state) => {
        state.listForm.errors[field] = error;
      });
    },

    setListFieldTouched: (field, touched) => {
      set((state) => {
        state.listForm.touched[field] = touched;
      });
    },

    validateListField: async (field, value) => {
      const error = validateListField(field, value);
      get().setListFieldError(field, error || "");
      return error;
    },

    validateListForm: async () => {
      const values = get().listForm.values;
      try {
        validateList(values);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof Error) {
          return { isValid: false, errors: { general: error.message } };
        }
        return { isValid: false, errors: { general: "Validation failed" } };
      }
    },

    resetListForm: () => {
      set((state) => {
        state.listForm = {
          values: {},
          errors: {},
          touched: {},
          dirty: false,
          validating: false,
          submitting: false,
          fields: [],
        };
      });
    },

    setListFormSubmitting: (submitting) => {
      set((state) => {
        state.listForm.submitting = submitting;
      });
    },

    // Label form actions
    setLabelFieldValue: (field, value) => {
      set((state) => {
        state.labelForm.values[field] = value;
        state.labelForm.dirty = true;
        state.labelForm.touched[field] = true;
      });
    },

    setLabelFieldError: (field, error) => {
      set((state) => {
        state.labelForm.errors[field] = error;
      });
    },

    setLabelFieldTouched: (field, touched) => {
      set((state) => {
        state.labelForm.touched[field] = touched;
      });
    },

    validateLabelField: async (field, value) => {
      const error = validateLabelField(field, value);
      get().setLabelFieldError(field, error || "");
      return error;
    },

    validateLabelForm: async () => {
      const values = get().labelForm.values;
      try {
        validateLabel(values);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof Error) {
          return { isValid: false, errors: { general: error.message } };
        }
        return { isValid: false, errors: { general: "Validation failed" } };
      }
    },

    resetLabelForm: () => {
      set((state) => {
        state.labelForm = {
          values: {},
          errors: {},
          touched: {},
          dirty: false,
          validating: false,
          submitting: false,
          fields: [],
        };
      });
    },

    setLabelFormSubmitting: (submitting) => {
      set((state) => {
        state.labelForm.submitting = submitting;
      });
    },
  }))
);
