import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  trackApiPerformance,
  PerformanceTimer,
} from "./performance-monitoring";

// Standard API error types
export enum ApiErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

// API error class
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode: number;
  public readonly context?: Record<string, any>;

  constructor(
    type: ApiErrorType,
    message: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.statusCode = statusCode;
    this.context = context;
  }
}

// API error response interface
interface ApiErrorResponse {
  error: {
    type: string;
    message: string;
    statusCode: number;
    timestamp: string;
    requestId?: string;
  };
  details?: Record<string, any>;
}

// Extract request context for error reporting
function extractRequestContext(request: NextRequest): Record<string, any> {
  const url = new URL(request.url);

  return {
    method: request.method,
    url: request.url,
    pathname: url.pathname,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    headers: {
      "user-agent": request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      "x-forwarded-for": request.headers.get("x-forwarded-for"),
      "x-real-ip": request.headers.get("x-real-ip"),
    },
    // Don't log sensitive headers like authorization
  };
}

// Create standardized error responses
function createErrorResponse(
  error: ApiError | Error,
  requestId?: string,
  isDevelopment: boolean = process.env.NODE_ENV === "development"
): ApiErrorResponse {
  const isApiError = error instanceof ApiError;

  const response: ApiErrorResponse = {
    error: {
      type: isApiError ? error.type : ApiErrorType.INTERNAL_SERVER_ERROR,
      message: isApiError ? error.message : "Internal server error",
      statusCode: isApiError ? error.statusCode : 500,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  // Include additional details in development mode
  if (isDevelopment) {
    response.details = {
      stack: error.stack,
      originalMessage: error.message,
      ...(isApiError && error.context ? { context: error.context } : {}),
    };
  }

  return response;
}

// Get appropriate HTTP status code for error type
function getStatusCodeForErrorType(type: ApiErrorType): number {
  switch (type) {
    case ApiErrorType.VALIDATION_ERROR:
      return 400;
    case ApiErrorType.AUTHENTICATION_ERROR:
      return 401;
    case ApiErrorType.AUTHORIZATION_ERROR:
      return 403;
    case ApiErrorType.NOT_FOUND_ERROR:
      return 404;
    case ApiErrorType.RATE_LIMIT_ERROR:
      return 429;
    case ApiErrorType.DATABASE_ERROR:
    case ApiErrorType.EXTERNAL_API_ERROR:
    case ApiErrorType.INTERNAL_SERVER_ERROR:
    default:
      return 500;
  }
}

// Main error handler function
export function handleApiError(
  error: unknown,
  request: NextRequest,
  context?: Record<string, any>
): NextResponse {
  // Generate request ID for tracking
  const requestId = crypto.randomUUID();

  // Normalize error to ApiError
  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = new ApiError(
      ApiErrorType.INTERNAL_SERVER_ERROR,
      error.message,
      500,
      context
    );
  } else {
    apiError = new ApiError(
      ApiErrorType.INTERNAL_SERVER_ERROR,
      "Unknown error occurred",
      500,
      context
    );
  }

  // Extract request context
  const requestContext = extractRequestContext(request);

  // Log error locally
  console.error(`API Error [${requestId}]:`, {
    type: apiError.type,
    message: apiError.message,
    statusCode: apiError.statusCode,
    context: apiError.context,
    requestContext,
    stack: apiError.stack,
  });

  // Report to Sentry with comprehensive context
  const eventId = Sentry.captureException(apiError, {
    tags: {
      errorType: "api_error",
      apiErrorType: apiError.type,
      statusCode: apiError.statusCode.toString(),
      method: request.method,
      pathname: requestContext.pathname,
    },
    contexts: {
      api: {
        requestId,
        type: apiError.type,
        statusCode: apiError.statusCode,
        errorMessage: apiError.message,
      },
      request: requestContext,
      ...(apiError.context && { errorContext: apiError.context }),
      ...(context && { additionalContext: context }),
    },
    level: apiError.statusCode >= 500 ? "error" : "warning",
    fingerprint: [apiError.type, requestContext.pathname, request.method],
  });

  // Create error response
  const errorResponse = createErrorResponse(apiError, requestId);

  return NextResponse.json(errorResponse, {
    status: apiError.statusCode,
    headers: {
      "X-Request-ID": requestId,
      "X-Sentry-Event-ID": eventId || "",
    },
  });
}

// Wrapper for API route handlers with automatic error handling and performance monitoring
export function withApiErrorHandler<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Start performance timer
    const timer = new PerformanceTimer(
      `${request.method} ${new URL(request.url).pathname}`,
      "api_request",
      {
        method: request.method,
        pathname: new URL(request.url).pathname,
      }
    );

    let statusCode = 200;
    let success = true;
    let errorMessage: string | undefined;

    try {
      const response = await handler(request, ...args);
      statusCode = response.status;
      return response;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorResponse = handleApiError(error, request);
      statusCode = errorResponse.status;
      return errorResponse;
    } finally {
      // Track API performance
      const duration = timer.stop({
        success,
        statusCode,
        ...(errorMessage && { error: errorMessage }),
      });

      // Also use the standalone tracking function for additional metrics
      trackApiPerformance(
        new URL(request.url).pathname,
        request.method,
        duration,
        statusCode,
        {
          success,
          ...(errorMessage && { error: errorMessage }),
        }
      );
    }
  };
}

// Utility functions for creating specific error types
export const createValidationError = (
  message: string,
  context?: Record<string, any>
) => new ApiError(ApiErrorType.VALIDATION_ERROR, message, 400, context);

export const createAuthenticationError = (
  message: string = "Authentication required"
) => new ApiError(ApiErrorType.AUTHENTICATION_ERROR, message, 401);

export const createAuthorizationError = (
  message: string = "Insufficient permissions"
) => new ApiError(ApiErrorType.AUTHORIZATION_ERROR, message, 403);

export const createNotFoundError = (message: string = "Resource not found") =>
  new ApiError(ApiErrorType.NOT_FOUND_ERROR, message, 404);

export const createRateLimitError = (message: string = "Rate limit exceeded") =>
  new ApiError(ApiErrorType.RATE_LIMIT_ERROR, message, 429);

export const createDatabaseError = (
  message: string,
  context?: Record<string, any>
) => new ApiError(ApiErrorType.DATABASE_ERROR, message, 500, context);

export const createExternalApiError = (
  message: string,
  context?: Record<string, any>
) => new ApiError(ApiErrorType.EXTERNAL_API_ERROR, message, 500, context);

export const createInternalServerError = (
  message: string = "Internal server error",
  context?: Record<string, any>
) => new ApiError(ApiErrorType.INTERNAL_SERVER_ERROR, message, 500, context);

// Async wrapper for database operations
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error) {
      throw createDatabaseError(`Database operation failed: ${error.message}`, {
        ...context,
        originalError: error.message,
        stack: error.stack,
      });
    }
    throw createDatabaseError("Unknown database error", context);
  }
}

// Async wrapper for external API calls
export async function withExternalApiErrorHandling<T>(
  operation: () => Promise<T>,
  apiName: string,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error) {
      throw createExternalApiError(
        `${apiName} API call failed: ${error.message}`,
        {
          apiName,
          ...context,
          originalError: error.message,
          stack: error.stack,
        }
      );
    }
    throw createExternalApiError(`${apiName} API call failed`, {
      apiName,
      ...context,
    });
  }
}
