/**
 * Client-side Validation Hook
 *
 * React hook for performing client-side validation using the same
 * validation schemas used on the server side.
 */

import { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import {
  ClientValidationUtils as ValidationUtils,
  ClientXSSPrevention as XSSPrevention,
} from "@/lib/validators-client";
import type { ValidationResult, ValidationError } from "@/lib/validators-client";

/**
 * Hook state interface
 */
interface ValidationState {
  isValid: boolean;
  errors: Record<string, string[]>;
  isValidating: boolean;
}

/**
 * Hook options interface
 */
interface UseValidationOptions {
  validateOnChange?: boolean;
  sanitizeOnValidate?: boolean;
  debounceMs?: number;
}

/**
 * Hook return interface
 */
interface UseValidationReturn<T> {
  validate: (data: unknown) => ValidationResult<T>;
  validateField: (fieldName: string, value: any) => string[];
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  sanitize: (data: T) => T;
  state: ValidationState;
  errors: Record<string, string[]>;
  isValid: boolean;
  isValidating: boolean;
}

/**
 * Main validation hook
 */
export function useValidation<T>(
  schema: z.ZodSchema<T>,
  options: UseValidationOptions = {}
): UseValidationReturn<T> {
  const {
    validateOnChange = false,
    sanitizeOnValidate = true,
    debounceMs = 300,
  } = options;

  const [state, setState] = useState<ValidationState>({
    isValid: false,
    errors: {},
    isValidating: false,
  });

  /**
   * Validate data against the schema
   */
  const validate = useCallback(
    (data: unknown): ValidationResult<T> => {
      setState(prev => ({ ...prev, isValidating: true }));

      const sanitizeOptions = sanitizeOnValidate
        ? {
            textFields: ["firstName", "lastName", "email", "title"],
            htmlFields: ["description", "bio"],
          }
        : undefined;

      const result = sanitizeOnValidate
        ? ValidationUtils.validateAndSanitize(schema, data, sanitizeOptions)
        : ValidationUtils.validate(schema, data);

      const formattedErrors = result.errors
        ? ValidationUtils.formatErrorsForResponse(result.errors)
        : {};

      setState({
        isValid: result.success,
        errors: formattedErrors,
        isValidating: false,
      });

      return result;
    },
    [schema, sanitizeOnValidate]
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName: string, value: any): string[] => {
      try {
        // Validate the entire object with just this field
        const testData = { [fieldName]: value };
        const result = ValidationUtils.validate(schema, testData);

        if (result.success) {
          // Clear errors for this field
          setState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              [fieldName]: [],
            },
          }));
          return [];
        } else {
          const fieldErrors =
            result.errors
              ?.filter(err => err.field === fieldName)
              .map(err => err.message) || [];

          // Update errors for this field
          setState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              [fieldName]: fieldErrors,
            },
          }));

          return fieldErrors;
        }
      } catch (error) {
        // If field validation fails, return empty array
        return [];
      }
    },
    [schema]
  );

  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: false,
    }));
  }, []);

  /**
   * Clear errors for a specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: [],
      },
    }));
  }, []);

  /**
   * Sanitize data without validation
   */
  const sanitize = useCallback((data: T): T => {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    const sanitized = { ...data };

    // Common sanitization patterns
    const textFields = ["firstName", "lastName", "email", "title", "name"];
    const htmlFields = ["description", "bio", "content"];

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === "string") {
        if (htmlFields.includes(key)) {
          (sanitized as any)[key] = XSSPrevention.sanitizeHtml(value);
        } else if (textFields.includes(key)) {
          (sanitized as any)[key] = XSSPrevention.sanitizeText(value);
        }
      }
    }

    return sanitized;
  }, []);

  return {
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    sanitize,
    state,
    errors: state.errors,
    isValid: state.isValid,
    isValidating: state.isValidating,
  };
}

/**
 * Specialized hooks for common validation scenarios
 * Note: These are temporarily commented out to avoid JSDOM dependencies
 * Import Schemas directly in components when needed
 */

/*
export function useAuthValidation() {
  return {
    register: useValidation(Schemas.Auth.register),
    login: useValidation(Schemas.Auth.login),
    passwordReset: useValidation(Schemas.Auth.passwordResetRequest),
  };
}

export function useCourseValidation() {
  return {
    certification: useValidation(Schemas.Course.certification),
    enrollment: useValidation(Schemas.Course.enrollment),
    examSubmission: useValidation(Schemas.Course.examSubmission),
  };
}

export function usePaymentValidation() {
  return {
    checkout: useValidation(Schemas.Payment.checkout),
  };
}
*/

/**
 * Real-time validation hook with debouncing
 */
export function useRealtimeValidation<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  debounceMs: number = 300
) {
  const { validate, state } = useValidation(schema);

  // Debounced validation effect would go here
  // For now, return the basic validation state
  return {
    ...state,
    validate: () => validate(data),
  };
}

/**
 * Form validation hook with field-level validation
 */
export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData?: Partial<T>
) {
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const { validate, validateField, clearErrors, clearFieldError, state } =
    useValidation(schema);

  const updateField = useCallback(
    (fieldName: keyof T, value: any) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value,
      }));

      // Validate field on change
      validateField(fieldName as string, value);
    },
    [validateField]
  );

  const validateForm = useCallback(() => {
    return validate(formData);
  }, [validate, formData]);

  const resetForm = useCallback(() => {
    setFormData(initialData || {});
    clearErrors();
  }, [initialData, clearErrors]);

  return {
    formData,
    updateField,
    validateForm,
    resetForm,
    clearErrors,
    clearFieldError,
    ...state,
  };
}

/**
 * Validation utilities for components
 */
export const validationHelpers = {
  /**
   * Get error message for a field
   */
  getFieldError: (
    errors: Record<string, string[]>,
    fieldName: string
  ): string | undefined => {
    const fieldErrors = errors[fieldName];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
  },

  /**
   * Check if a field has errors
   */
  hasFieldError: (
    errors: Record<string, string[]>,
    fieldName: string
  ): boolean => {
    const fieldErrors = errors[fieldName];
    return fieldErrors && fieldErrors.length > 0;
  },

  /**
   * Get all error messages as a flat array
   */
  getAllErrors: (errors: Record<string, string[]>): string[] => {
    return Object.values(errors).flat().filter(Boolean);
  },

  /**
   * Format errors for display
   */
  formatErrorsForDisplay: (errors: Record<string, string[]>): string => {
    const allErrors = Object.values(errors).flat().filter(Boolean);
    return allErrors.join(", ");
  },
};
