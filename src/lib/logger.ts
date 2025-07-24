/**
 * Structured Logging System
 * 
 * Provides centralized, structured logging with different levels, contexts,
 * and integrations with Sentry for error tracking and performance monitoring.
 */

import pino from 'pino';
import * as Sentry from '@sentry/nextjs';
import { config } from './config';

// Log levels and severity mapping
export enum LogLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

// Context types for structured logging
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  component?: string;
  action?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

// Performance metrics interface
export interface PerformanceLog extends LogContext {
  operation: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Security event interface
export interface SecurityLog extends LogContext {
  eventType: 'auth_failure' | 'csrf_violation' | 'rate_limit_exceeded' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

// Business event interface
export interface BusinessLog extends LogContext {
  eventType: 'user_registration' | 'exam_completed' | 'payment_processed' | 'enrollment_created';
  entityId: string;
  entityType: string;
  metadata?: Record<string, any>;
}

// Create base logger configuration
const createLogger = () => {
  const isDevelopment = config.isDevelopment;
  const isProduction = config.isProduction;

  // Base configuration
  const baseConfig: pino.LoggerOptions = {
    name: 'quizforce',
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    
    // Add timestamp and hostname
    timestamp: pino.stdTimeFunctions.isoTime,
    
    // Serialize errors properly
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },

    // Add process and environment info
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'unknown',
      environment: config.isDevelopment ? 'development' : 'production',
      service: 'quizforce-api',
      version: process.env.npm_package_version || '0.1.0',
    },
  };

  // Development configuration (pretty printing)
  if (isDevelopment) {
    return pino({
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    });
  }

  // Production configuration (JSON output)
  return pino(baseConfig);
};

// Create logger instance
const logger = createLogger();

/**
 * Enhanced Logger Class with context and integrations
 */
export class Logger {
  private baseLogger: pino.Logger;
  private context: LogContext;

  constructor(baseLogger: pino.Logger, context: LogContext = {}) {
    this.baseLogger = baseLogger;
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger(
      this.baseLogger.child(context),
      { ...this.context, ...context }
    );
  }

  /**
   * Log fatal errors (system-breaking issues)
   */
  fatal(message: string, context?: LogContext, error?: Error): void {
    const logContext = { ...this.context, ...context };
    
    if (error) {
      logContext.error = error;
    }

    this.baseLogger.fatal(logContext, message);

    // Send to Sentry as fatal
    if (error) {
      Sentry.captureException(error, {
        level: 'fatal',
        tags: {
          logLevel: 'fatal',
          component: logContext.component,
          action: logContext.action,
        },
        contexts: {
          logger: logContext,
        },
      });
    } else {
      Sentry.captureMessage(message, 'fatal');
    }
  }

  /**
   * Log errors (recoverable issues)
   */
  error(message: string, context?: LogContext, error?: Error): void {
    const logContext = { ...this.context, ...context };
    
    if (error) {
      logContext.error = error;
    }

    this.baseLogger.error(logContext, message);

    // Send to Sentry
    if (error) {
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          logLevel: 'error',
          component: logContext.component,
          action: logContext.action,
        },
        contexts: {
          logger: logContext,
        },
      });
    } else {
      Sentry.captureMessage(message, 'error');
    }
  }

  /**
   * Log warnings (potential issues)
   */
  warn(message: string, context?: LogContext): void {
    const logContext = { ...this.context, ...context };
    this.baseLogger.warn(logContext, message);

    // Send warning to Sentry if it's production and seems important
    if (config.isProduction && (logContext.component || logContext.action)) {
      Sentry.captureMessage(message, 'warning');
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    const logContext = { ...this.context, ...context };
    this.baseLogger.info(logContext, message);
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    const logContext = { ...this.context, ...context };
    this.baseLogger.debug(logContext, message);
  }

  /**
   * Log trace information (very verbose)
   */
  trace(message: string, context?: LogContext): void {
    const logContext = { ...this.context, ...context };
    this.baseLogger.trace(logContext, message);
  }

  /**
   * Log performance metrics
   */
  performance(data: PerformanceLog): void {
    const logContext = {
      ...this.context,
      ...data,
      logType: 'performance',
    };

    const level = data.duration > 5000 ? 'warn' : 'info';
    const message = `${data.operation} completed in ${data.duration}ms`;

    this.baseLogger[level](logContext, message);

    // Send to Sentry if performance is poor
    if (data.duration > 5000 || !data.success) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message,
        level: data.success ? 'warning' : 'error',
        data: {
          operation: data.operation,
          duration: data.duration,
          success: data.success,
          ...data.metadata,
        },
      });
    }
  }

  /**
   * Log security events
   */
  security(data: SecurityLog): void {
    const logContext = {
      ...this.context,
      ...data,
      logType: 'security',
    };

    const level = data.severity === 'critical' ? 'error' : data.severity === 'high' ? 'warn' : 'info';
    const message = `Security event: ${data.eventType}`;

    this.baseLogger[level](logContext, message);

    // Always send security events to Sentry
    Sentry.captureMessage(message, data.severity === 'critical' ? 'error' : 'warning');
    
    // Add security tag for filtering
    Sentry.setTag('security_event', data.eventType);
  }

  /**
   * Log business events
   */
  business(data: BusinessLog): void {
    const logContext = {
      ...this.context,
      ...data,
      logType: 'business',
    };

    const message = `Business event: ${data.eventType}`;
    this.baseLogger.info(logContext, message);

    // Add breadcrumb for business events
    Sentry.addBreadcrumb({
      category: 'business',
      message,
      level: 'info',
      data: {
        eventType: data.eventType,
        entityId: data.entityId,
        entityType: data.entityType,
        ...data.metadata,
      },
    });
  }

  /**
   * Log API requests and responses
   */
  apiCall(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const logContext = {
      ...this.context,
      ...context,
      method,
      url,
      statusCode,
      duration,
      logType: 'api',
    };

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;

    this.baseLogger[level](logContext, message);

    // Track API performance
    if (duration > 2000 || statusCode >= 400) {
      Sentry.addBreadcrumb({
        category: 'http',
        message,
        level: statusCode >= 500 ? 'error' : 'warning',
        data: {
          method,
          url,
          statusCode,
          duration,
        },
      });
    }
  }

  /**
   * Log database operations
   */
  database(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    const logContext = {
      ...this.context,
      ...context,
      operation,
      table,
      duration,
      success,
      logType: 'database',
    };

    const level = !success ? 'error' : duration > 1000 ? 'warn' : 'debug';
    const message = `DB ${operation} on ${table} - ${duration}ms`;

    this.baseLogger[level](logContext, message);

    // Track slow queries
    if (duration > 1000 || !success) {
      Sentry.addBreadcrumb({
        category: 'database',
        message,
        level: !success ? 'error' : 'warning',
        data: {
          operation,
          table,
          duration,
          success,
        },
      });
    }
  }
}

// Create default logger instances
export const rootLogger = new Logger(logger);

// Create specialized loggers for different components
export const apiLogger = rootLogger.child({ component: 'api' });
export const dbLogger = rootLogger.child({ component: 'database' });
export const authLogger = rootLogger.child({ component: 'auth' });
export const examLogger = rootLogger.child({ component: 'exam' });
export const paymentLogger = rootLogger.child({ component: 'payment' });
export const securityLogger = rootLogger.child({ component: 'security' });

// Utility functions for common logging patterns
export const logApiRequest = (req: any, startTime: number, statusCode: number, context?: LogContext) => {
  const duration = Date.now() - startTime;
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  
  apiLogger.apiCall(
    req.method,
    req.url,
    statusCode,
    duration,
    {
      requestId,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      ...context,
    }
  );
};

export const logError = (error: Error, context?: LogContext) => {
  rootLogger.error(error.message, context, error);
};

export const logPerformance = (operation: string, duration: number, success: boolean = true, metadata?: Record<string, any>) => {
  rootLogger.performance({
    operation,
    duration,
    success,
    metadata,
  });
};

export const logSecurity = (eventType: SecurityLog['eventType'], severity: SecurityLog['severity'], details: Record<string, any>, context?: LogContext) => {
  securityLogger.security({
    eventType,
    severity,
    details,
    ...context,
  });
};

export const logBusiness = (eventType: BusinessLog['eventType'], entityId: string, entityType: string, metadata?: Record<string, any>, context?: LogContext) => {
  rootLogger.business({
    eventType,
    entityId,
    entityType,
    metadata,
    ...context,
  });
};

// Export the base logger for direct use if needed
export { logger as baseLogger };

// Initialize logger
if (typeof window === 'undefined') {
  rootLogger.info('Logger initialized', {
    environment: config.isDevelopment ? 'development' : 'production',
    logLevel: process.env.LOG_LEVEL || (config.isDevelopment ? 'debug' : 'info'),
    sentryEnabled: config.sentry.isConfigured,
  });
} 