/**
 * Production Monitoring Middleware
 * 
 * Provides comprehensive request tracking, performance monitoring, error handling,
 * and alerting for production environments. Integrates with structured logging and Sentry.
 */

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { apiLogger, logApiRequest, logSecurity, LogContext } from "./logger";
import { trackPerformance, PERFORMANCE_THRESHOLDS } from "./performance-monitoring";
import { config } from "./config";

// Request tracking interface
interface RequestMetrics {
  startTime: number;
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  sessionId?: string;
}

// Performance thresholds for different route types
const ROUTE_THRESHOLDS = {
  '/api/': {
    slow: 2000,
    critical: 5000,
  },
  '/api/exam/': {
    slow: 1000,
    critical: 3000,
  },
  '/api/auth/': {
    slow: 1500,
    critical: 4000,
  },
  '/api/admin/': {
    slow: 3000,
    critical: 8000,
  },
} as const;

// Excluded paths from detailed monitoring (to reduce noise)
const EXCLUDED_PATHS = [
  '/api/csrf-token',
  '/api/health',
  '/favicon.ico',
  '/_next/',
  '/monitoring',
] as const;

/**
 * Enhanced monitoring wrapper for API routes
 */
export function withMonitoring<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: {
    component?: string;
    action?: string;
    requireAuth?: boolean;
    skipLogging?: boolean;
  } = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Extract request context
    const context = extractRequestContext(request, requestId, options);
    
    // Create request logger
    const requestLogger = apiLogger.child({
      requestId,
      component: options.component,
      action: options.action,
    });

    // Check if we should skip detailed monitoring
    if (shouldSkipMonitoring(request.url)) {
      try {
        return await handler(request, ...args);
      } catch (error) {
        // Still log errors even for excluded paths
        requestLogger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined);
        throw error;
      }
    }

    // Set Sentry context for this request
    Sentry.withScope((scope) => {
      scope.setTag('request_id', requestId);
      scope.setTag('method', request.method);
      scope.setTag('component', options.component || 'api');
      scope.setContext('request', context);
      
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }
    });

    try {
      // Log request start
      if (!options.skipLogging) {
        requestLogger.info('Request started', {
          method: request.method,
          url: context.url,
          userAgent: context.userAgent,
          ip: context.ip,
        });
      }

      // Execute the handler
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Log request completion
      logApiRequest(request, startTime, statusCode, {
        requestId,
        userId: context.userId,
        component: options.component,
        action: options.action,
      });

      // Track performance metrics
      trackRequestPerformance(context, duration, statusCode, true);

      // Check for performance issues
      checkPerformanceThresholds(context, duration, statusCode);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log error
      requestLogger.error('Request failed', {
        duration,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      }, error instanceof Error ? error : undefined);

      // Track failed request
      trackRequestPerformance(context, duration, 500, false, errorMessage);

      // Check for security issues
      checkSecurityConcerns(request, error, context);

      // Re-throw to maintain error handling
      throw error;
    }
  };
}

/**
 * Extract comprehensive request context
 */
function extractRequestContext(request: NextRequest, requestId: string, options: any): RequestMetrics & LogContext {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || undefined;
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Try to extract user context from headers or cookies
  const userId = request.headers.get('x-user-id') || undefined;
  const sessionId = request.cookies.get('session-id')?.value || undefined;

  return {
    startTime: Date.now(),
    requestId,
    method: request.method,
    url: url.pathname,
    userAgent,
    ip,
    userId,
    sessionId,
    component: options.component,
    action: options.action,
  };
}

/**
 * Check if request should skip detailed monitoring
 */
function shouldSkipMonitoring(url: string): boolean {
  return EXCLUDED_PATHS.some(path => url.includes(path));
}

/**
 * Track request performance metrics
 */
function trackRequestPerformance(
  context: RequestMetrics & LogContext,
  duration: number,
  statusCode: number,
  success: boolean,
  errorMessage?: string
): void {
  // Track with our performance monitoring system
  trackPerformance({
    name: `${context.method} ${context.url}`,
    type: 'api' as any, // Type assertion for performance metric type
    duration,
    timestamp: Date.now(),
    userId: context.userId,
    sessionId: context.sessionId,
    metadata: {
      method: context.method,
      url: context.url,
      statusCode,
      success,
      component: context.component,
      action: context.action,
      errorMessage,
    },
  });
}

/**
 * Check performance thresholds and alert if necessary
 */
function checkPerformanceThresholds(
  context: RequestMetrics & LogContext,
  duration: number,
  statusCode: number
): void {
  // Determine threshold based on route
  let threshold: { slow: number; critical: number } = ROUTE_THRESHOLDS['/api/']; // default
  
  for (const [route, routeThreshold] of Object.entries(ROUTE_THRESHOLDS)) {
    if (context.url.startsWith(route)) {
      threshold = routeThreshold;
      break;
    }
  }

  // Check if request was slow
  if (duration > threshold.critical) {
    apiLogger.error('Critical performance issue detected', {
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      duration,
      statusCode,
      threshold: threshold.critical,
      component: context.component,
    });

    // Send alert to Sentry
    Sentry.captureMessage(
      `Critical slow request: ${context.method} ${context.url} took ${duration}ms`,
      'error'
    );
  } else if (duration > threshold.slow) {
    apiLogger.warn('Slow request detected', {
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      duration,
      statusCode,
      threshold: threshold.slow,
      component: context.component,
    });
  }

  // Check for error status codes
  if (statusCode >= 500) {
    apiLogger.error('Server error response', {
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      statusCode,
      duration,
      component: context.component,
    });
  } else if (statusCode >= 400) {
    apiLogger.warn('Client error response', {
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      statusCode,
      duration,
      component: context.component,
    });
  }
}

/**
 * Check for potential security concerns
 */
function checkSecurityConcerns(
  request: NextRequest,
  error: unknown,
  context: RequestMetrics & LogContext
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerErrorMessage = errorMessage.toLowerCase();

  // Check for common security-related errors
  if (lowerErrorMessage.includes('unauthorized') || 
      lowerErrorMessage.includes('forbidden') ||
      lowerErrorMessage.includes('authentication')) {
    
    logSecurity('auth_failure', 'medium', {
      method: context.method,
      url: context.url,
      userAgent: context.userAgent,
      ip: context.ip,
      errorMessage,
    }, {
      requestId: context.requestId,
      component: context.component,
    });
  }

  // Check for potential injection attempts
  if (lowerErrorMessage.includes('sql') || 
      lowerErrorMessage.includes('injection') ||
      lowerErrorMessage.includes('script')) {
    
    logSecurity('suspicious_activity', 'high', {
      method: context.method,
      url: context.url,
      userAgent: context.userAgent,
      ip: context.ip,
      errorMessage,
      suspicionReason: 'Potential injection attempt',
    }, {
      requestId: context.requestId,
      component: context.component,
    });
  }

  // Check for rate limiting
  if (lowerErrorMessage.includes('rate limit') || 
      lowerErrorMessage.includes('too many requests')) {
    
    logSecurity('rate_limit_exceeded', 'low', {
      method: context.method,
      url: context.url,
      userAgent: context.userAgent,
      ip: context.ip,
      errorMessage,
    }, {
      requestId: context.requestId,
      component: context.component,
    });
  }
}

/**
 * Health check endpoint monitoring
 */
export function createHealthCheck() {
  return withMonitoring(
    async (request: NextRequest) => {
      const startTime = Date.now();
      
      try {
        // Basic health checks
        const checks = {
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          environment: config.isDevelopment ? 'development' : 'production',
          version: process.env.npm_package_version || '0.1.0',
          sentry: config.sentry.isConfigured,
          redis: config.rateLimit.redis.isConfigured,
        };

        const duration = Date.now() - startTime;
        
        return NextResponse.json({
          status: 'healthy',
          duration: `${duration}ms`,
          checks,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        
        return NextResponse.json({
          status: 'unhealthy',
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 503 });
      }
    },
    { component: 'health', skipLogging: true }
  );
}

/**
 * Request ID middleware for tracing
 */
export function addRequestId(request: NextRequest): NextRequest {
  const requestId = crypto.randomUUID();
  
  // Add request ID to headers for downstream handlers
  const headers = new Headers(request.headers);
  headers.set('x-request-id', requestId);
  
  // Set Sentry tag
  Sentry.setTag('request_id', requestId);
  
  return new NextRequest(request.url, {
    ...request,
    headers,
  });
}

/**
 * Performance monitoring for database operations
 */
export function withDatabaseMonitoring<T>(
  operation: () => Promise<T>,
  table: string,
  operationType: string,
  context?: LogContext
): Promise<T> {
  const startTime = Date.now();
  
  return operation()
    .then((result) => {
      const duration = Date.now() - startTime;
      
      // Log database operation
      apiLogger.database(operationType, table, duration, true, context);
      
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      
      // Log failed database operation
      apiLogger.database(operationType, table, duration, false, {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    });
}

/**
 * Batch monitoring for multiple operations
 */
export async function withBatchMonitoring<T>(
  operations: Array<{ name: string; operation: () => Promise<T> }>,
  context?: LogContext
): Promise<T[]> {
  const startTime = Date.now();
  const requestId = context?.requestId || crypto.randomUUID();
  
  try {
    const results = await Promise.allSettled(
      operations.map(async ({ name, operation }) => {
        const opStartTime = Date.now();
        try {
          const result = await operation();
          const duration = Date.now() - opStartTime;
          
          apiLogger.info(`Batch operation completed: ${name}`, {
            requestId,
            operation: name,
            duration,
            success: true,
            ...context,
          });
          
          return result;
        } catch (error) {
          const duration = Date.now() - opStartTime;
          
          apiLogger.error(`Batch operation failed: ${name}`, {
            requestId,
            operation: name,
            duration,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            ...context,
          }, error instanceof Error ? error : undefined);
          
          throw error;
        }
      })
    );

    const totalDuration = Date.now() - startTime;
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    apiLogger.info('Batch operations completed', {
      requestId,
      totalDuration,
      totalOperations: operations.length,
      successful,
      failed,
      ...context,
    });

    // Extract results, throwing if any failed
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        throw result.reason;
      }
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    
    apiLogger.error('Batch operations failed', {
      requestId,
      totalDuration,
      totalOperations: operations.length,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...context,
    }, error instanceof Error ? error : undefined);
    
    throw error;
  }
} 