import * as Sentry from "@sentry/nextjs";

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  API_SLOW: 2000,
  API_CRITICAL: 5000,
  PAGE_LOAD_SLOW: 3000,
  PAGE_LOAD_CRITICAL: 6000,
  DATABASE_SLOW: 1000,
  DATABASE_CRITICAL: 3000,
  EXTERNAL_API_SLOW: 3000,
  EXTERNAL_API_CRITICAL: 8000,
} as const;

// Performance metric types
export type PerformanceMetricType =
  | "api_request"
  | "page_load"
  | "database_query"
  | "external_api"
  | "user_interaction"
  | "component_render";

// Performance data interface
export interface PerformanceMetric {
  name: string;
  type: PerformanceMetricType;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

// Performance severity levels
export type PerformanceSeverity = "info" | "warning" | "error" | "critical";

// Extended Window interface for Next.js router
declare global {
  interface Window {
    next?: {
      router: {
        events: {
          on: (event: string, handler: (url: string) => void) => void;
        };
      };
    };
  }
}

/**
 * Determine performance severity based on duration and thresholds
 */
export function getPerformanceSeverity(
  type: PerformanceMetricType,
  duration: number
): PerformanceSeverity {
  const thresholds = getThresholdsForType(type);

  if (duration >= thresholds.critical) return "critical";
  if (duration >= thresholds.slow) return "error";
  if (duration >= thresholds.slow * 0.7) return "warning";
  return "info";
}

/**
 * Get appropriate thresholds for a performance metric type
 */
function getThresholdsForType(type: PerformanceMetricType) {
  switch (type) {
    case "api_request":
      return {
        slow: PERFORMANCE_THRESHOLDS.API_SLOW,
        critical: PERFORMANCE_THRESHOLDS.API_CRITICAL,
      };
    case "page_load":
      return {
        slow: PERFORMANCE_THRESHOLDS.PAGE_LOAD_SLOW,
        critical: PERFORMANCE_THRESHOLDS.PAGE_LOAD_CRITICAL,
      };
    case "database_query":
      return {
        slow: PERFORMANCE_THRESHOLDS.DATABASE_SLOW,
        critical: PERFORMANCE_THRESHOLDS.DATABASE_CRITICAL,
      };
    case "external_api":
      return {
        slow: PERFORMANCE_THRESHOLDS.EXTERNAL_API_SLOW,
        critical: PERFORMANCE_THRESHOLDS.EXTERNAL_API_CRITICAL,
      };
    default:
      return {
        slow: PERFORMANCE_THRESHOLDS.API_SLOW,
        critical: PERFORMANCE_THRESHOLDS.API_CRITICAL,
      };
  }
}

/**
 * Track performance metrics and send to Sentry
 */
export function trackPerformance(metric: PerformanceMetric): void {
  const severity = getPerformanceSeverity(metric.type, metric.duration);

  // Set user context if available
  if (metric.userId) {
    Sentry.setUser({ id: metric.userId });
  }

  // Add tags for filtering
  Sentry.setTags({
    performance_type: metric.type,
    performance_severity: severity,
    session_id: metric.sessionId || "unknown",
  });

  // Set level based on severity
  const sentryLevel =
    severity === "critical"
      ? "error"
      : severity === "error"
        ? "warning"
        : "info";

  // Send performance data to Sentry
  Sentry.addBreadcrumb({
    category: "performance",
    message: `${metric.type}: ${metric.name}`,
    level: sentryLevel,
    data: {
      duration: metric.duration,
      threshold_exceeded: severity !== "info",
      ...metric.metadata,
    },
  });

  // For slow/critical performance, capture as an issue
  if (severity === "error" || severity === "critical") {
    Sentry.captureMessage(
      `Slow ${metric.type}: ${metric.name} took ${metric.duration}ms`,
      sentryLevel
    );
  }
}

/**
 * Performance timer utility for measuring execution time
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;
  private type: PerformanceMetricType;
  private metadata: Record<string, any>;

  constructor(
    name: string,
    type: PerformanceMetricType,
    metadata: Record<string, any> = {}
  ) {
    this.name = name;
    this.type = type;
    this.metadata = metadata;
    this.startTime = performance.now();
  }

  /**
   * Stop the timer and track the performance metric
   */
  stop(additionalMetadata: Record<string, any> = {}): number {
    const duration = performance.now() - this.startTime;

    trackPerformance({
      name: this.name,
      type: this.type,
      duration,
      timestamp: Date.now(),
      metadata: { ...this.metadata, ...additionalMetadata },
    });

    return duration;
  }
}

/**
 * Decorator for measuring function execution time
 */
export function measurePerformance(
  name: string,
  type: PerformanceMetricType,
  metadata: Record<string, any> = {}
) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const timer = new PerformanceTimer(name, type, metadata);

      try {
        const result = await originalMethod?.apply(this, args);
        timer.stop({ success: true });
        return result;
      } catch (error) {
        timer.stop({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    } as T;

    return descriptor;
  };
}

/**
 * Higher-order function for wrapping async functions with performance monitoring
 */
export function withPerformanceMonitoring<
  T extends (...args: any[]) => Promise<any>,
>(
  fn: T,
  name: string,
  type: PerformanceMetricType,
  metadata: Record<string, any> = {}
): T {
  return (async (...args: any[]) => {
    const timer = new PerformanceTimer(name, type, metadata);

    try {
      const result = await fn(...args);
      timer.stop({ success: true });
      return result;
    } catch (error) {
      timer.stop({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }) as T;
}

/**
 * Track API request performance
 */
export function trackApiPerformance(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
  metadata: Record<string, any> = {}
): void {
  trackPerformance({
    name: `${method} ${endpoint}`,
    type: "api_request",
    duration,
    timestamp: Date.now(),
    metadata: {
      endpoint,
      method,
      statusCode,
      ...metadata,
    },
  });
}

/**
 * Track database query performance
 */
export function trackDatabasePerformance(
  query: string,
  duration: number,
  metadata: Record<string, any> = {}
): void {
  trackPerformance({
    name: `Database Query: ${query}`,
    type: "database_query",
    duration,
    timestamp: Date.now(),
    metadata: {
      query,
      ...metadata,
    },
  });
}

/**
 * Track external API call performance
 */
export function trackExternalApiPerformance(
  service: string,
  endpoint: string,
  duration: number,
  metadata: Record<string, any> = {}
): void {
  trackPerformance({
    name: `${service}: ${endpoint}`,
    type: "external_api",
    duration,
    timestamp: Date.now(),
    metadata: {
      service,
      endpoint,
      ...metadata,
    },
  });
}

/**
 * Track page load performance (client-side)
 */
export function trackPageLoadPerformance(
  pageName: string,
  loadTime: number,
  metadata: Record<string, any> = {}
): void {
  trackPerformance({
    name: `Page Load: ${pageName}`,
    type: "page_load",
    duration: loadTime,
    timestamp: Date.now(),
    metadata: {
      pageName,
      ...metadata,
    },
  });
}

/**
 * Browser performance monitoring utilities (client-side only)
 */
export const BrowserPerformance = {
  /**
   * Monitor page load performance using Navigation Timing API
   */
  monitorPageLoad(pageName: string): void {
    if (typeof window === "undefined") return;

    window.addEventListener("load", () => {
      // Use setTimeout to ensure all resources are loaded
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          const domContentLoaded =
            navigation.domContentLoadedEventEnd - navigation.fetchStart;
          const firstPaint =
            performance.getEntriesByName("first-paint")[0]?.startTime || 0;
          const firstContentfulPaint =
            performance.getEntriesByName("first-contentful-paint")[0]
              ?.startTime || 0;

          trackPageLoadPerformance(pageName, loadTime, {
            domContentLoaded,
            firstPaint,
            firstContentfulPaint,
            dnsLookup:
              navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnect: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseEnd - navigation.requestStart,
          });
        }
      }, 100);
    });
  },

  /**
   * Monitor Core Web Vitals (simplified version without PerformanceObserver)
   */
  monitorCoreWebVitals(): void {
    if (typeof window === "undefined") return;

    // Monitor basic page load metrics
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          // Track basic load performance
          trackPerformance({
            name: "Page Load Performance",
            type: "page_load",
            duration: navigation.loadEventEnd - navigation.fetchStart,
            timestamp: Date.now(),
            metadata: {
              domContentLoaded:
                navigation.domContentLoadedEventEnd - navigation.fetchStart,
              firstByte: navigation.responseStart - navigation.fetchStart,
            },
          });
        }
      }, 100);
    });
  },
};

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window !== "undefined") {
    // Initialize browser-specific monitoring
    BrowserPerformance.monitorCoreWebVitals();

    // Monitor route changes in Next.js (simplified)
    const handleRouteChange = (url: string) => {
      BrowserPerformance.monitorPageLoad(url);
    };

    // Basic route change monitoring
    let currentUrl = window.location.pathname;
    const checkUrlChange = () => {
      if (window.location.pathname !== currentUrl) {
        currentUrl = window.location.pathname;
        handleRouteChange(currentUrl);
      }
    };

    // Poll for URL changes (fallback for route monitoring)
    setInterval(checkUrlChange, 1000);
  }
}
