/**
 * Client-side validation utilities
 * This file provides browser-safe validation utilities that work with the centralized validators
 * Updated for Zod v4 compatibility
 */

import { z } from "zod";
import { Validators, ValidationError, ValidationResult } from "./validators";

/**
 * Client-safe XSS prevention utilities
 */
export class ClientXSSPrevention {
  /**
   * Basic HTML escaping for client-side use
   */
  static escapeHtml(text: string): string {
    if (typeof document !== "undefined") {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
    // Fallback for SSR
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
    return text.replace(/[&<>"'\/]/g, s => map[s]);
  }

  /**
   * Simple text sanitization for client-side use
   */
  static sanitizeText(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove angle brackets
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim();
  }

  /**
   * Basic HTML sanitization for client-side use
   * Note: This is a simple implementation. Server-side uses DOMPurify
   */
  static sanitizeHtml(input: string): string {
    // For client-side, just escape HTML
    return this.escapeHtml(input);
  }
}

/**
 * Client-safe validation utilities
 */
export class ClientValidationUtils {
  /**
   * Validate data against a Zod schema - Zod v4 compatible
   */
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> {
    return Validators.Utils.validate(schema, data);
  }

  /**
   * Format validation errors for display in forms
   */
  static formatErrorsForDisplay(
    errors: ValidationError[]
  ): Record<string, string> {
    const formatted: Record<string, string> = {};

    for (const error of errors) {
      if (!formatted[error.field]) {
        formatted[error.field] = error.message;
      }
    }

    return formatted;
  }

  /**
   * Format validation errors for API responses
   */
  static formatErrorsForResponse(
    errors: ValidationError[]
  ): Record<string, string[]> {
    return Validators.Utils.formatErrorsForResponse(errors);
  }

  /**
   * Extract first error message for a field
   */
  static getFieldError(
    errors: ValidationError[],
    fieldName: string
  ): string | undefined {
    const fieldError = errors.find(error => error.field === fieldName);
    return fieldError?.message;
  }

  /**
   * Check if a field has errors
   */
  static hasFieldError(
    errors: ValidationError[],
    fieldName: string
  ): boolean {
    return errors.some(error => error.field === fieldName);
  }

  /**
   * Validate form data with client-side sanitization
   */
  static validateForm<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    sanitizeFields?: string[]
  ): ValidationResult<T> {
    // Basic client-side sanitization
    if (sanitizeFields && typeof data === "object" && data !== null) {
      const sanitizedData = { ...data } as any;

      for (const field of sanitizeFields) {
        if (sanitizedData[field] && typeof sanitizedData[field] === "string") {
          sanitizedData[field] = ClientXSSPrevention.sanitizeText(sanitizedData[field]);
        }
      }

      return this.validate(schema, sanitizedData);
    }

    return this.validate(schema, data);
  }

  /**
   * Validate and sanitize input data
   */
  static validateAndSanitize<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    sanitizeOptions?: {
      htmlFields?: string[];
      textFields?: string[];
    }
  ): ValidationResult<T> {
    // First validate the structure
    const validationResult = this.validate(schema, data);

    if (!validationResult.success || !validationResult.data) {
      return validationResult;
    }

    // Then sanitize the validated data
    const sanitizedData = this.sanitizeObject(
      validationResult.data,
      sanitizeOptions
    );

    return {
      success: true,
      data: sanitizedData,
    };
  }

  /**
   * Sanitize an object's string fields
   */
  private static sanitizeObject<T>(
    obj: T,
    options?: {
      htmlFields?: string[];
      textFields?: string[];
    }
  ): T {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    const sanitized = { ...obj };
    const htmlFields = options?.htmlFields || [];
    const textFields = options?.textFields || [];

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === "string") {
        if (htmlFields.includes(key)) {
          (sanitized as any)[key] = ClientXSSPrevention.sanitizeHtml(value);
        } else if (textFields.includes(key)) {
          (sanitized as any)[key] = ClientXSSPrevention.sanitizeText(value);
        } else {
          // Default to text sanitization for safety
          (sanitized as any)[key] = ClientXSSPrevention.sanitizeText(value);
        }
      } else if (Array.isArray(value)) {
        (sanitized as any)[key] = value.map(item =>
          this.sanitizeObject(item, options)
        );
      } else if (typeof value === "object" && value !== null) {
        (sanitized as any)[key] = this.sanitizeObject(value, options);
      }
    }

    return sanitized;
  }

  /**
   * Create a validation middleware for API routes
   */
  static createValidationMiddleware<T>(
    schema: z.ZodSchema<T>,
    sanitizeOptions?: {
      htmlFields?: string[];
      textFields?: string[];
    }
  ) {
    return (data: unknown): ValidationResult<T> => {
      return this.validateAndSanitize(schema, data, sanitizeOptions);
    };
  }

  /**
   * Create a form validator function
   */
  static createFormValidator<T>(
    schema: z.ZodSchema<T>,
    sanitizeFields?: string[]
  ) {
    return (data: unknown): ValidationResult<T> => {
      return this.validateForm(schema, data, sanitizeFields);
    };
  }
}

/**
 * React Hook Form integration helpers
 */
export class ReactHookFormHelpers {
  /**
   * Convert Zod schema to React Hook Form resolver format
   */
  static createResolver<T>(schema: z.ZodSchema<T>) {
    // This will be used with @hookform/resolvers/zod
    return schema;
  }

  /**
   * Extract form errors in React Hook Form format
   */
  static formatForReactHookForm(
    errors: ValidationError[]
  ): Record<string, { message: string; type: string }> {
    const formatted: Record<string, { message: string; type: string }> = {};

    for (const error of errors) {
      formatted[error.field] = {
        message: error.message,
        type: error.code || "validation",
      };
    }

    return formatted;
  }
}

/**
 * Common form validation patterns - Re-exported for convenience
 */
export const FormValidators = {
  // Authentication forms
  signin: Validators.Auth.login,
  signup: Validators.Auth.register,
  forgotPassword: Validators.Auth.passwordResetRequest,
  resetPassword: Validators.Auth.passwordReset,
  changePassword: Validators.Auth.passwordChange,
  profileUpdate: Validators.Auth.profileUpdate,

  // Admin forms
  certification: Validators.Course.certification,
  knowledgeArea: Validators.Course.knowledgeArea,
  question: Validators.Course.question,

  // Payment forms
  checkout: Validators.Payment.checkout,
  paymentMethod: Validators.Payment.paymentMethod,

  // Common patterns
  patterns: Validators.Patterns,
  enums: Validators.Enums,
};

/**
 * Validation state management for React components
 */
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string[]>;
  isValidating: boolean;
}

/**
 * Helper functions for form validation state
 */
export const validationStateHelpers = {
  /**
   * Create initial validation state
   */
  createInitialState: (): ValidationState => ({
    isValid: false,
    errors: {},
    isValidating: false,
  }),

  /**
   * Update validation state with new errors
   */
  updateWithErrors: (
    state: ValidationState,
    errors: ValidationError[]
  ): ValidationState => ({
    ...state,
    isValid: errors.length === 0,
    errors: ClientValidationUtils.formatErrorsForResponse(errors),
    isValidating: false,
  }),

  /**
   * Clear all errors from state
   */
  clearErrors: (state: ValidationState): ValidationState => ({
    ...state,
    isValid: false,
    errors: {},
    isValidating: false,
  }),

  /**
   * Set validating status
   */
  setValidating: (state: ValidationState, isValidating: boolean): ValidationState => ({
    ...state,
    isValidating,
  }),
};

/**
 * Export all utilities for easy access
 */
export {
  ClientXSSPrevention as XSSPrevention,
  ClientValidationUtils as ValidationUtils,
};

export type {
  ValidationError,
  ValidationResult,
};

/**
 * Legacy compatibility exports
 */
export const Schemas = Validators;
export const Utils = ClientValidationUtils;

/**
 * Default export for convenience
 */
export default {
  XSSPrevention: ClientXSSPrevention,
  Utils: ClientValidationUtils,
  FormValidators,
  Validators,
  validationStateHelpers,
}; 