/**
 * Centralized Validation System - Zod v4 Compatible
 *
 * This file consolidates all validation logic across the QuizForce application,
 * providing type-safe schema validation, XSS prevention, and proper error handling.
 * 
 * Updated for Zod v4 compatibility with new error handling patterns.
 */

import { z } from "zod";
import DOMPurify from "dompurify";

/**
 * Initialize DOMPurify for server-side usage
 */
const createDOMPurify = () => {
  if (typeof window !== "undefined") {
    return DOMPurify;
  } else {
    try {
      const { JSDOM } = require("jsdom");
      const window = new JSDOM("").window;
      return DOMPurify(window as any);
    } catch (error) {
      console.warn("JSDOM not available, falling back to basic sanitization");
      return {
        sanitize: (input: string) => input.replace(/<[^>]*>/g, ""),
      } as any;
    }
  }
};

/**
 * Validation error types - Zod v4 compatible
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Common validation patterns - Updated for Zod v4
 */
export const ValidationPatterns = {
  // Email validation with comprehensive rules
  email: z
    .string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(254, "Email is too long")
    .toLowerCase()
    .refine(
      email => !email.includes(".."),
      "Email cannot contain consecutive dots"
    ),

  // Password validation with security requirements
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .refine(
      password => /[A-Z]/.test(password),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      password => /[a-z]/.test(password),
      "Password must contain at least one lowercase letter"
    )
    .refine(
      password => /[0-9]/.test(password),
      "Password must contain at least one number"
    )
    .refine(
      password => /[^A-Za-z0-9]/.test(password),
      "Password must contain at least one special character"
    ),

  // Name validation (first name, last name)
  name: z
    .string({ message: "Name is required" })
    .min(1, "Name is required")
    .max(50, "Name is too long")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .transform(name => name.trim()),

  // Username validation
  username: z
    .string({ message: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .toLowerCase(),

  // URL validation
  url: z
    .string({ message: "URL is required" })
    .url("Invalid URL format")
    .max(2048, "URL is too long"),

  // Phone number validation (international format)
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),

  // UUID validation
  uuid: z.string({ message: "ID is required" }).uuid("Invalid ID format"),

  // Positive integer validation
  positiveInt: z
    .number({ message: "Must be a number" })
    .int("Must be a whole number")
    .positive("Must be a positive number"),

  // Non-negative integer validation
  nonNegativeInt: z
    .number({ message: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Must be non-negative"),

  // IP address validation (replaces removed z.string().ip())
  ipAddress: z
    .string({ message: "IP address is required" })
    .refine(
      (ip) => {
        // IPv4 validation
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        // IPv6 validation (more comprehensive)
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:([0-9a-fA-F]{1,4}:){1,7}$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
      },
      "Invalid IP address format"
    ),
};

/**
 * Enum validation helpers - Zod v4 compatible
 */
export const EnumValidators = {
  certificationLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    message: "Invalid certification level",
  }),

  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "ARCHIVED"], {
    message: "Invalid status",
  }),

  questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_BLANK"], {
    message: "Invalid question type",
  }),

  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    message: "Invalid difficulty level",
  }),

  paymentType: z.enum(["card", "paypal"], {
    message: "Invalid payment method type",
  }),

  userRole: z.enum(["USER", "ADMIN", "MODERATOR"], {
    message: "Invalid user role",
  }),

  bulkAction: z.enum(["DELETE", "ACTIVATE", "DEACTIVATE", "ARCHIVE"], {
    message: "Invalid bulk action",
  }),

  httpMethod: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"], {
    message: "Invalid HTTP method",
  }),
};

/**
 * Authentication and user-related schemas
 */
export const AuthValidators = {
  // User registration schema
  register: z
    .object({
      firstName: ValidationPatterns.name,
      lastName: ValidationPatterns.name,
      email: ValidationPatterns.email,
      password: ValidationPatterns.password,
      confirmPassword: z.string({ message: "Please confirm your password" }),
      acceptTerms: z
        .boolean({ message: "You must accept the terms and conditions" })
        .refine(
          val => val === true,
          "You must accept the terms and conditions"
        ),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  // User login schema
  login: z.object({
    email: ValidationPatterns.email,
    password: z.string({ message: "Password is required" }).min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  }),

  // Password reset request schema
  passwordResetRequest: z.object({
    email: ValidationPatterns.email,
  }),

  // Password reset schema
  passwordReset: z
    .object({
      token: z.string({ message: "Reset token is required" }).min(1, "Reset token is required"),
      password: ValidationPatterns.password,
      confirmPassword: z.string({ message: "Please confirm your password" }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  // Profile update schema
  profileUpdate: z.object({
    firstName: ValidationPatterns.name.optional(),
    lastName: ValidationPatterns.name.optional(),
    phone: ValidationPatterns.phone,
    bio: z.string().max(500, "Bio is too long").optional(),
  }),

  // Password change schema
  passwordChange: z
    .object({
      currentPassword: z.string({ message: "Current password is required" }).min(1, "Current password is required"),
      newPassword: ValidationPatterns.password,
      confirmPassword: z.string({ message: "Please confirm your password" }),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

/**
 * Certification and course-related schemas
 */
export const CourseValidators = {
  // Certification creation/update schema
  certification: z.object({
    title: z
      .string({ message: "Title is required" })
      .min(1, "Title is required")
      .max(200, "Title is too long"),
    description: z
      .string({ message: "Description is required" })
      .min(1, "Description is required")
      .max(2000, "Description is too long"),
    level: EnumValidators.certificationLevel,
    price: z
      .number({ message: "Price must be a number" })
      .min(0, "Price must be non-negative")
      .max(9999.99, "Price is too high"),
    duration: ValidationPatterns.positiveInt,
    passingScore: z
      .number({ message: "Passing score must be a number" })
      .min(0, "Passing score must be non-negative")
      .max(100, "Passing score cannot exceed 100"),
    status: EnumValidators.status,
    tags: z.array(z.string().max(50, "Tag is too long")).optional(),
  }),

  // Knowledge area schema
  knowledgeArea: z.object({
    name: z
      .string({ message: "Knowledge area name is required" })
      .min(3, "Knowledge area name must be at least 3 characters")
      .max(100, "Knowledge area name cannot exceed 100 characters")
      .regex(
        /^[a-zA-Z0-9\s\-\&\(\)\/\:]+$/,
        "Knowledge area name contains invalid characters"
      )
      .refine(
        val => val.trim().length > 0,
        "Knowledge area name cannot be only whitespace"
      ),
    description: z
      .string()
      .optional()
      .refine(
        val => !val || val.trim().length === 0 || val.trim().length >= 10,
        "Description must be at least 10 characters if provided"
      )
      .refine(
        val => !val || val.length <= 500,
        "Description cannot exceed 500 characters"
      ),
    certification_id: z.string({ message: "Please select a certification" }).min(1, "Please select a certification"),
    weight_percentage: z
      .number({ message: "Weight percentage is required" })
      .min(1, "Weight percentage must be at least 1%")
      .max(100, "Weight percentage cannot exceed 100%")
      .int("Weight percentage must be a whole number")
      .refine(val => val > 0, "Weight percentage must be greater than zero"),
    sort_order: z
      .number({ message: "Sort order must be a number" })
      .min(0, "Sort order must be non-negative")
      .max(999, "Sort order cannot exceed 999")
      .int("Sort order must be a whole number"),
  }),

  // Question creation/update schema
  question: z.object({
    text: z
      .string({ message: "Question text is required" })
      .min(1, "Question text is required")
      .max(1000, "Question text is too long"),
    type: EnumValidators.questionType,
    options: z
      .array(z.string().max(500, "Option is too long"))
      .min(2, "At least 2 options are required")
      .max(6, "Maximum 6 options allowed"),
    correctAnswer: z.string({ message: "Correct answer is required" }).min(1, "Correct answer is required"),
    explanation: z.string().max(1000, "Explanation is too long").optional(),
    difficulty: EnumValidators.difficulty,
    points: ValidationPatterns.positiveInt,
    difficulty_level: EnumValidators.difficulty, // Alias for compatibility
    question_number: z
      .number({ message: "Question number is required" })
      .int("Question number must be a whole number")
      .positive("Question number must be positive"),
    required_selections: z
      .number({ message: "Required selections is required" })
      .int("Required selections must be a whole number")
      .min(1, "At least 1 selection required"),
  }),

  // Exam submission schema
  examSubmission: z.object({
    certificationId: ValidationPatterns.uuid,
    answers: z
      .array(
        z.object({
          questionId: ValidationPatterns.uuid,
          answer: z.string().max(1000, "Answer is too long"),
          timeSpent: ValidationPatterns.nonNegativeInt,
        })
      )
      .min(1, "At least one answer is required"),
    totalTime: ValidationPatterns.nonNegativeInt,
  }),

  // Course enrollment schema
  enrollment: z.object({
    certificationId: ValidationPatterns.uuid,
    paymentIntentId: z.string().optional(),
  }),
};

/**
 * Payment and billing schemas
 */
export const PaymentValidators = {
  // Checkout session creation schema
  checkout: z
    .object({
      certificationId: ValidationPatterns.uuid.optional(),
      packageId: ValidationPatterns.uuid.optional(),
      successUrl: ValidationPatterns.url.optional(),
      cancelUrl: ValidationPatterns.url.optional(),
    })
    .refine(data => data.certificationId || data.packageId, {
      message: "Either certification ID or package ID is required",
      path: ["certificationId"],
    }),

  // Payment method schema
  paymentMethod: z.object({
    type: EnumValidators.paymentType,
    cardNumber: z
      .string()
      .regex(/^\d{13,19}$/, "Invalid card number")
      .optional(),
    expiryMonth: z
      .number({ message: "Expiry month must be a number" })
      .min(1, "Invalid expiry month")
      .max(12, "Invalid expiry month")
      .optional(),
    expiryYear: z
      .number({ message: "Expiry year must be a number" })
      .min(new Date().getFullYear(), "Card has expired")
      .optional(),
    cvv: z
      .string()
      .regex(/^\d{3,4}$/, "Invalid CVV")
      .optional(),
  }),
};

/**
 * Admin and management schemas
 */
export const AdminValidators = {
  // User management schema
  userUpdate: z.object({
    firstName: ValidationPatterns.name.optional(),
    lastName: ValidationPatterns.name.optional(),
    email: ValidationPatterns.email.optional(),
    role: EnumValidators.userRole.optional(),
    status: EnumValidators.status.optional(),
  }),

  // Bulk operations schema
  bulkOperation: z.object({
    action: EnumValidators.bulkAction,
    ids: z
      .array(ValidationPatterns.uuid)
      .min(1, "At least one item must be selected")
      .max(100, "Cannot process more than 100 items at once"),
  }),

  // Analytics query schema - Updated for Zod v4 z.record() syntax
  analyticsQuery: z
    .object({
      startDate: z.string({ message: "Start date is required" }).datetime("Invalid start date"),
      endDate: z.string({ message: "End date is required" }).datetime("Invalid end date"),
      metrics: z.array(z.string()).optional(),
      filters: z.record(z.string(), z.any()).optional(), // Fixed: z.record() now requires key and value types
    })
    .refine(data => new Date(data.startDate) <= new Date(data.endDate), {
      message: "Start date must be before end date",
      path: ["endDate"],
    }),

  // Package management schema
  packageUpdate: z.object({
    title: z.string({ message: "Title is required" }).min(1, "Title is required"),
    description: z.string({ message: "Description is required" }).min(1, "Description is required"),
    price: z.number({ message: "Price must be a number" }).min(0, "Price must be non-negative"),
    status: EnumValidators.status,
  }),
};

/**
 * Rate limiting and API schemas
 */
export const APIValidators = {
  // API request validation with rate limiting context
  apiRequest: z.object({
    endpoint: z.string({ message: "Endpoint is required" }).min(1, "Endpoint is required"),
    method: EnumValidators.httpMethod,
    userAgent: z.string().optional(),
    ip: ValidationPatterns.ipAddress.optional(),
  }),

  // Pagination schema
  pagination: z.object({
    page: ValidationPatterns.positiveInt.optional().default(1),
    limit: z
      .number({ message: "Limit must be a number" })
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .optional()
      .default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"], { message: "Sort order must be 'asc' or 'desc'" }).optional().default("asc"),
  }),
};

/**
 * XSS Prevention and Sanitization - Enhanced for Zod v4
 */
export class XSSPrevention {
  private static purify = createDOMPurify();

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    return this.purify.sanitize(input, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "ol",
        "ul",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      ALLOWED_ATTR: ["class"],
      KEEP_CONTENT: true,
    });
  }

  /**
   * Sanitize text content (removes all HTML)
   */
  static sanitizeText(input: string): string {
    return this.purify.sanitize(input, {
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true,
    });
  }

  /**
   * Sanitize URL to prevent javascript: and data: schemes
   */
  static sanitizeUrl(input: string): string {
    const sanitized = this.purify.sanitize(input);

    // Additional checks for dangerous schemes
    if (sanitized.match(/^(javascript|data|vbscript):/i)) {
      return "#";
    }

    return sanitized;
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(input: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };

    return input.replace(/[&<>"'\/]/g, s => map[s]);
  }

  /**
   * Validate and sanitize user input for safe database storage
   */
  static sanitizeForDatabase(
    input: string,
    allowHtml: boolean = false
  ): string {
    if (allowHtml) {
      return this.sanitizeHtml(input);
    } else {
      return this.sanitizeText(input);
    }
  }
}

/**
 * Validation utilities - Updated for Zod v4
 */
export class ValidationUtils {
  /**
   * Validate data against a Zod schema - Zod v4 compatible
   */
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> {
    try {
      const result = schema.safeParse(data);

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        // Updated for Zod v4 - error structure is compatible
        const errors: ValidationError[] = result.error.issues.map(err => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return {
          success: false,
          errors,
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "unknown",
            message: "Validation failed due to an unexpected error",
          },
        ],
      };
    }
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
          (sanitized as any)[key] = XSSPrevention.sanitizeHtml(value);
        } else if (textFields.includes(key)) {
          (sanitized as any)[key] = XSSPrevention.sanitizeText(value);
        } else {
          // Default to text sanitization for safety
          (sanitized as any)[key] = XSSPrevention.sanitizeText(value);
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
   * Format validation errors for API responses
   */
  static formatErrorsForResponse(
    errors: ValidationError[]
  ): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const error of errors) {
      if (!formatted[error.field]) {
        formatted[error.field] = [];
      }
      formatted[error.field].push(error.message);
    }

    return formatted;
  }

  /**
   * Extract validation errors from Zod error - Zod v4 compatible
   */
  static extractZodErrors(error: z.ZodError): ValidationError[] {
    return error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));
  }
}

/**
 * File upload validation - Enhanced
 */
export class FileValidation {
  private static readonly ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png", 
    "image/gif",
    "image/webp",
  ];

  private static readonly ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * File validation schema
   */
  static fileSchema = z.object({
    name: z.string({ message: "File name is required" }).min(1, "File name is required"),
    size: z
      .number({ message: "File size must be a number" })
      .max(FileValidation.MAX_FILE_SIZE, "File size must be less than 10MB"),
    type: z
      .string({ message: "File type is required" })
      .refine(
        (type) => {
          const allowedTypes = [
            ...FileValidation.ALLOWED_IMAGE_TYPES,
            ...FileValidation.ALLOWED_DOCUMENT_TYPES,
          ];
          return allowedTypes.includes(type);
        },
        "Invalid file type"
      ),
  });

  /**
   * Validate uploaded file
   */
  static validateFile(file: File): ValidationResult<File> {
    const errors: ValidationError[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push({
        field: "file",
        message: "File size exceeds 10MB limit",
        code: "FILE_TOO_LARGE",
      });
    }

    // Check file type
    const allowedTypes = [
      ...this.ALLOWED_IMAGE_TYPES,
      ...this.ALLOWED_DOCUMENT_TYPES,
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: "file",
        message: "File type not allowed",
        code: "INVALID_FILE_TYPE",
      });
    }

    // Check filename
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push({
        field: "file",
        message: "Filename contains invalid characters",
        code: "INVALID_FILENAME",
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: file,
    };
  }

  /**
   * Validate image file specifically
   */
  static validateImage(file: File): ValidationResult<File> {
    const errors: ValidationError[] = [];

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push({
        field: "file",
        message: "Only JPEG, PNG, GIF, and WebP images are allowed",
        code: "INVALID_IMAGE_TYPE",
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB for images
      errors.push({
        field: "file",
        message: "Image size exceeds 5MB limit",
        code: "IMAGE_TOO_LARGE",
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: file,
    };
  }
}

/**
 * Consolidated export object for easy access
 */
export const Validators = {
  // Patterns and Enums
  Patterns: ValidationPatterns,
  Enums: EnumValidators,
  
  // Schema groups
  Auth: AuthValidators,
  Course: CourseValidators,
  Payment: PaymentValidators,
  Admin: AdminValidators,
  API: APIValidators,
  
  // Utilities
  Utils: ValidationUtils,
  XSS: XSSPrevention,
  File: FileValidation,
};

// Legacy compatibility exports
export const Schemas = Validators;
export const Patterns = ValidationPatterns;
export const Utils = ValidationUtils;

/**
 * Default export for convenience
 */
export default Validators; 