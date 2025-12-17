import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import {
  validateTaskField,
  validateListField,
  validateLabelField,
  validateWithDetails,
  ValidationResult,
} from "@/lib/validation";
import { Task, List, Label } from "@/types/task";

type FormField<T> = {
  value: T;
  error: string;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
};

type UseFormValidationOptions<T> = {
  initialValues: Partial<T>;
  validationSchema?: unknown; // Zod schema
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
  onError?: (errors: Record<string, string>) => void;
};

type UseFormValidationReturn<T> = {
  values: Partial<T>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: boolean;
  validating: boolean;
  submitting: boolean;
  isValid: boolean;

  // Field operations
  setFieldValue: (name: keyof T, value: unknown) => void;
  setFieldError: (name: keyof T, error: string) => void;
  setFieldTouched: (name: keyof T, touched: boolean) => void;
  validateField: (name: keyof T, value?: unknown) => Promise<string | undefined>;
  resetField: (name: keyof T) => void;

  // Form operations
  validateForm: () => Promise<ValidationResult>;
  resetForm: () => void;
  setSubmitting: (submitting: boolean) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  clearErrors: () => void;
};

export function useFormValidation<T extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  validateOnChange = true,
  validateOnBlur = true,
  validateOnMount = false,
  onSubmit,
  onError,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize touched fields
  useEffect(() => {
    const initialTouched: Record<string, boolean> = {};
    Object.keys(initialValues).forEach((key) => {
      initialTouched[key] = false;
    });
    setTouched(initialTouched);
  }, [initialValues]);

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
  }, [validateOnMount]);

  const validateField = useCallback(
    async (name: keyof T, value?: unknown): Promise<string | undefined> => {
      const fieldValue = value !== undefined ? value : values[name];
      let error: string | undefined;

      // Use schema validation if provided
      if (validationSchema) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fieldSchema = (validationSchema as any).pick({ [name]: true });
          fieldSchema.parse({ [name]: fieldValue });
        } catch (err) {
          if (err instanceof Error) {
            error = err.message;
          }
        }
      } else {
        // Use specific field validators based on the form type
        // Note: Task, List, Label are types, not values, so we can't use them directly
        // This is a placeholder - in a real implementation, you'd need to define
        // the field names or use a different approach
        error = ""; // No validation for unknown fields
      }

      setFieldError(name, error || "");
      return error;
    },
    [values, validationSchema]
  );

  const setFieldValue = useCallback(
    (name: keyof T, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setDirty(true);

      if (validateOnChange) {
        validateField(name, value);
      }
    },
    [validateOnChange, validateField]
  );

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback(
    (name: keyof T, touched: boolean) => {
      setTouched((prev) => ({ ...prev, [name]: touched }));

      if (touched && validateOnBlur) {
        validateField(name, values[name]);
      }
    },
    [values, validateOnBlur, validateField]
  );

  const resetField = useCallback(
    (name: keyof T) => {
      setValues((prev) => ({ ...prev, [name]: initialValues[name] }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setTouched((prev) => ({ ...prev, [name]: false }));
    },
    [initialValues]
  );

  const validateForm = useCallback(async (): Promise<ValidationResult> => {
    setValidating(true);

    try {
      let formErrors: Record<string, string> = {};

      if (validationSchema) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = validateWithDetails(validationSchema as any, values);
        formErrors = result.errors;
      } else {
        // Validate each field individually
        const fieldPromises = Object.keys(values).map(async (key) => {
          const error = await validateField(
            key as keyof T,
            values[key as keyof T]
          );
          return { key, error };
        });

        const results = await Promise.all(fieldPromises);
        results.forEach(({ key, error }) => {
          if (error) {
            formErrors[key] = error;
          }
        });
      }

      setErrors(formErrors);
      return {
        isValid: Object.keys(formErrors).length === 0,
        errors: formErrors,
      };
    } finally {
      setValidating(false);
    }
  }, [values, validationSchema, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setDirty(false);
    setValidating(false);
    setSubmitting(false);
  }, [initialValues]);

  const setSubmittingState = useCallback((submitting: boolean) => {
    setSubmitting(submitting);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const validationResult = await validateForm();

      if (!validationResult.isValid) {
        if (onError) {
          onError(validationResult.errors);
        }
        return;
      }

      if (onSubmit) {
        setSubmittingState(true);
        try {
          await onSubmit(values as T);
        } catch (error) {
          console.error("Form submission error:", error);
        } finally {
          setSubmittingState(false);
        }
      }
    },
    [validateForm, onSubmit, onError, values, setSubmittingState]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0 && !validating;

  return {
    values,
    errors,
    touched,
    dirty,
    validating,
    submitting,
    isValid,

    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    resetField,

    validateForm,
    resetForm,
    setSubmitting: setSubmittingState,
    handleSubmit,
    clearErrors,
  };
}