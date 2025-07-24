/**
 * API Validation Helpers
 *
 * Utilities for integrating input validation with API routes,
 * providing consistent validation patterns across the application.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ValidationUtils,
  XSSPrevention,
  Validators as Schemas,
} from "./validators";
import type { ValidationResult, ValidationError } from "./validators";

/**
 * API validation response types
 */
export interface ApiValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  message?: string;
}

/**
 * Standard API error responses
 */
export const ApiErrors = {
  BAD_REQUEST: (message: string = "Invalid request data") => ({
    error: "BAD_REQUEST",
    message,
    statusCode: 400,
  }),

  UNAUTHORIZED: (message: string = "Authentication required") => ({
    error: "UNAUTHORIZED",
    message,
    statusCode: 401,
  }),

  FORBIDDEN: (message: string = "Access denied") => ({
    error: "FORBIDDEN",
    message,
    statusCode: 403,
  }),

  NOT_FOUND: (message: string = "Resource not found") => ({
    error: "NOT_FOUND",
    message,
    statusCode: 404,
  }),

  METHOD_NOT_ALLOWED: (message: string = "Method not allowed") => ({
    error: "METHOD_NOT_ALLOWED",
    message,
    statusCode: 405,
  }),

  RATE_LIMITED: (message: string = "Too many requests") => ({
    error: "RATE_LIMITED",
    message,
    statusCode: 429,
  }),

  INTERNAL_ERROR: (message: string = "Internal server error") => ({
    error: "INTERNAL_SERVER_ERROR",
    message,
    statusCode: 500,
  }),

  VALIDATION_ERROR: (errors: ValidationError[]) => ({
    error: "VALIDATION_ERROR",
    message: "Request validation failed",
    errors: ValidationUtils.formatErrorsForResponse(errors),
    statusCode: 400,
  }),
};

/**
 * Common validation schemas for API endpoints
 */
export const ApiValidationSchemas = {
  // Standard ID parameter validation
  idParam: z.object({
    id: z.string().uuid("Invalid ID format"),
  }),

  // Pagination parameters
  pagination: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a number")
      .transform(Number)
      .refine(val => val >= 1, "Page must be at least 1")
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .refine(val => val >= 1 && val <= 100, "Limit must be between 1 and 100")
      .optional(),
    search: z.string().max(100, "Search query is too long").optional(),
    sortBy: z.string().max(50, "Sort field is too long").optional(),
    sortOrder: z
      .enum(["asc", "desc"], {
        message: "Sort order must be 'asc' or 'desc'",
      })
      .optional(),
  }),

  // Bulk operation validation
  bulkOperation: z.object({
    action: z.enum(["delete", "activate", "deactivate", "archive"], {
      message: "Invalid bulk action",
    }),
    ids: z
      .array(z.string().uuid("Invalid ID format"))
      .min(1, "At least one ID is required")
      .max(100, "Cannot process more than 100 items at once"),
  }),

  // File upload validation
  fileUpload: z.object({
    filename: z
      .string()
      .min(1, "Filename is required")
      .max(255, "Filename is too long")
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Filename can only contain letters, numbers, dots, underscores, and hyphens"
      ),
    contentType: z
      .string()
      .regex(/^[a-zA-Z0-9\/.-]+$/, "Invalid content type format"),
    size: z
      .number()
      .min(1, "File size must be greater than 0")
      .max(10 * 1024 * 1024, "File size cannot exceed 10MB"),
  }),
};

/**
 * Enhanced API validation middleware with comprehensive error handling
 */
export class ApiValidationMiddleware {
  /**
   * Validate request body against a schema
   */
  static async validateBody<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>,
    options?: {
      sanitize?: boolean;
      htmlFields?: string[];
      textFields?: string[];
    }
  ): Promise<ApiValidationResult<T>> {
    try {
      const body = await request.json();

      if (options?.sanitize) {
        const result = ValidationUtils.validateAndSanitize(schema, body, {
          htmlFields: options.htmlFields,
          textFields: options.textFields,
        });

        if (!result.success) {
          return {
            success: false,
            errors: result.errors,
          };
        }

        return {
          success: true,
          data: result.data,
        };
      } else {
        const result = ValidationUtils.validate(schema, body);

        if (!result.success) {
          return {
            success: false,
            errors: result.errors,
          };
        }

        return {
          success: true,
          data: result.data,
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "body",
            message: "Invalid JSON in request body",
            code: "INVALID_JSON",
          },
        ],
      };
    }
  }

  /**
   * Validate URL parameters against a schema
   */
  static validateParams<T>(
    params: Record<string, string | string[]>,
    schema: z.ZodSchema<T>
  ): ApiValidationResult<T> {
    const result = ValidationUtils.validate(schema, params);

    if (!result.success) {
      return {
        success: false,
        errors: result.errors,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  /**
   * Validate query parameters against a schema
   */
  static validateQuery<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): ApiValidationResult<T> {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, string> = {};

    // Convert URLSearchParams to plain object
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const result = ValidationUtils.validate(schema, query);

    if (!result.success) {
      return {
        success: false,
        errors: result.errors,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  /**
   * Create a validation error response
   */
  static validationErrorResponse(
    errors: ValidationError[],
    message: string = "Validation failed"
  ): NextResponse {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message,
        errors: ValidationUtils.formatErrorsForResponse(errors),
      },
      { status: 400 }
    );
  }

  /**
   * Create a standard error response
   */
  static errorResponse(
    error: ReturnType<typeof ApiErrors[keyof typeof ApiErrors]>
  ): NextResponse {
    return NextResponse.json(error, { status: error.statusCode });
  }

  /**
   * Create a success response with optional data
   */
  static successResponse<T>(
    data?: T,
    message?: string,
    status: number = 200
  ): NextResponse {
    const response: any = {
      success: true,
    };

    if (message) {
      response.message = message;
    }

    if (data !== undefined) {
      response.data = data;
    }

    return NextResponse.json(response, { status });
  }

  /**
   * Comprehensive request validation (body, params, query)
   */
  static async validateRequest<
    TBody = any,
    TParams = any,
    TQuery = any
  >(
    request: NextRequest,
    params: Record<string, string | string[]>,
    schemas: {
      body?: z.ZodSchema<TBody>;
      params?: z.ZodSchema<TParams>;
      query?: z.ZodSchema<TQuery>;
    },
    options?: {
      sanitize?: boolean;
      htmlFields?: string[];
      textFields?: string[];
    }
  ): Promise<{
    success: boolean;
    data?: {
      body?: TBody;
      params?: TParams;
      query?: TQuery;
    };
    errors?: ValidationError[];
    response?: NextResponse;
  }> {
    const errors: ValidationError[] = [];
    const data: any = {};

    // Validate body if schema provided
    if (schemas.body) {
      const bodyResult = await this.validateBody(request, schemas.body, options);
      if (!bodyResult.success) {
        errors.push(...(bodyResult.errors || []));
      } else {
        data.body = bodyResult.data;
      }
    }

    // Validate params if schema provided
    if (schemas.params) {
      const paramsResult = this.validateParams(params, schemas.params);
      if (!paramsResult.success) {
        errors.push(...(paramsResult.errors || []));
      } else {
        data.params = paramsResult.data;
      }
    }

    // Validate query if schema provided
    if (schemas.query) {
      const queryResult = this.validateQuery(request, schemas.query);
      if (!queryResult.success) {
        errors.push(...(queryResult.errors || []));
      } else {
        data.query = queryResult.data;
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        response: this.validationErrorResponse(errors),
      };
    }

    return {
      success: true,
      data,
    };
  }

  /**
   * Rate limiting validation helper
   */
  static rateLimitResponse(
    retryAfter?: number,
    message: string = "Too many requests"
  ): NextResponse {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (retryAfter) {
      headers["Retry-After"] = retryAfter.toString();
    }

    return new NextResponse(
      JSON.stringify({
        error: "RATE_LIMITED",
        message,
      }),
      {
        status: 429,
        headers,
      }
    );
  }

  /**
   * Authentication validation helper
   */
  static authenticationRequiredResponse(
    message: string = "Authentication required"
  ): NextResponse {
    return NextResponse.json(
      {
        error: "UNAUTHORIZED",
        message,
      },
      { status: 401 }
    );
  }

  /**
   * Authorization validation helper
   */
  static authorizationFailedResponse(
    message: string = "Access denied"
  ): NextResponse {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message,
      },
      { status: 403 }
    );
  }
}

/**
 * Utility functions for common API validation patterns
 */
export class ApiValidationUtils {
  /**
   * Sanitize and validate user input for safe database storage
   */
  static sanitizeInput(
    input: string,
    allowHtml: boolean = false
  ): string {
    return XSSPrevention.sanitizeForDatabase(input, allowHtml);
  }

  /**
   * Validate and format pagination parameters
   */
  static validatePagination(query: Record<string, string>) {
    const result = ValidationUtils.validate(
      ApiValidationSchemas.pagination,
      query
    );

    if (!result.success) {
      return {
        success: false,
        errors: result.errors,
      };
    }

    // Set defaults
    const pagination = {
      page: result.data?.page || 1,
      limit: result.data?.limit || 10,
      search: result.data?.search,
      sortBy: result.data?.sortBy,
      sortOrder: result.data?.sortOrder || "asc",
    };

    return {
      success: true,
      data: pagination,
    };
  }

  /**
   * Extract and validate file upload data
   */
  static validateFileUpload(file: File): ApiValidationResult<File> {
    const fileData = {
      filename: file.name,
      contentType: file.type,
      size: file.size,
    };

    const result = ValidationUtils.validate(
      ApiValidationSchemas.fileUpload,
      fileData
    );

    if (!result.success) {
      return {
        success: false,
        errors: result.errors,
      };
    }

    return {
      success: true,
      data: file,
    };
  }

  /**
   * Create standardized API response format
   */
  static createResponse<T>(
    success: boolean,
    data?: T,
    message?: string,
    errors?: ValidationError[]
  ) {
    const response: any = { success };

    if (message) {
      response.message = message;
    }

    if (data !== undefined) {
      response.data = data;
    }

    if (errors && errors.length > 0) {
      response.errors = ValidationUtils.formatErrorsForResponse(errors);
    }

    return response;
  }

  /**
   * Validate UUID parameters
   */
  static validateUuid(id: string, fieldName: string = "id"): ApiValidationResult<string> {
    const result = ValidationUtils.validate(
      z.string().uuid(`Invalid ${fieldName} format`),
      id
    );

    if (!result.success) {
      return {
        success: false,
        errors: result.errors,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }
}

/**
 * Common validation schemas for specific use cases
 */
export const CommonValidationSchemas = {
  // User authentication
  login: Schemas.Auth.login,
  register: Schemas.Auth.register,
  passwordReset: Schemas.Auth.passwordReset,

  // Course management
  certification: Schemas.Course.certification,
  knowledgeArea: Schemas.Course.knowledgeArea,
  question: Schemas.Course.question,

  // Payment processing
  checkout: Schemas.Payment.checkout,
  paymentMethod: Schemas.Payment.paymentMethod,

  // Admin operations
  userUpdate: Schemas.Admin.userUpdate,
  bulkOperation: Schemas.Admin.bulkOperation,

  // API operations
  pagination: Schemas.API.pagination,
  apiRequest: Schemas.API.apiRequest,
};

/**
 * Export all validation utilities for easy access
 */
export {
  ValidationUtils,
  XSSPrevention,
  Schemas,
};

export type {
  ValidationResult,
  ValidationError,
};

/**
 * Legacy compatibility exports for existing code
 */
export const validate = {
  body: ApiValidationMiddleware.validateBody,
  params: ApiValidationMiddleware.validateParams,
  query: ApiValidationMiddleware.validateQuery,
};

export const respond = {
  success: ApiValidationMiddleware.successResponse,
  error: ApiValidationMiddleware.errorResponse,
  validation: ApiValidationMiddleware.validationErrorResponse,
};

export const SecurityValidators = {
  validateInput: ApiValidationUtils.sanitizeInput,
  validateUuid: ApiValidationUtils.validateUuid,
  validatePagination: ApiValidationUtils.validatePagination,
};
