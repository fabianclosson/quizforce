"use client";

import React, { Suspense } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary, ErrorFallbackProps } from "./error-boundary";
import { LoadingSpinner } from "./loading-spinner";
import { Alert, AlertDescription } from "./alert";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { AlertTriangle, RefreshCw, WifiOff, Clock } from "lucide-react";

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<AsyncErrorFallbackProps>;
  loadingFallback?: React.ReactNode;
  name?: string;
  level?: "page" | "component" | "critical";
  timeout?: number; // Timeout for async operations in ms
}

interface AsyncErrorFallbackProps extends ErrorFallbackProps {
  isNetworkError: boolean;
  isTimeoutError: boolean;
  retryCount: number;
  onRetry: () => void;
}

interface AsyncErrorBoundaryState {
  retryCount: number;
  lastRetry: number;
}

// Network error detection
function isNetworkError(error: Error): boolean {
  return (
    error.name === "NetworkError" ||
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("Failed to fetch") ||
    error.message.includes("ERR_NETWORK") ||
    error.message.includes("ERR_INTERNET_DISCONNECTED")
  );
}

// Timeout error detection
function isTimeoutError(error: Error): boolean {
  return (
    error.name === "TimeoutError" ||
    error.message.includes("timeout") ||
    error.message.includes("timed out") ||
    error.message.includes("Request timeout")
  );
}

// Enhanced error boundary for async operations
export class AsyncErrorBoundary extends React.Component<
  AsyncErrorBoundaryProps,
  AsyncErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.state = {
      retryCount: 0,
      lastRetry: 0,
    };
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const now = Date.now();
    const timeSinceLastRetry = now - this.state.lastRetry;
    const minRetryInterval = 1000; // Minimum 1 second between retries

    if (timeSinceLastRetry < minRetryInterval) {
      // Prevent rapid retries
      return;
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
      lastRetry: now,
    }));

    // Force re-render by updating key
    this.forceUpdate();
  };

  render() {
    const {
      children,
      fallback: FallbackComponent,
      loadingFallback,
      name,
      level = "component",
      timeout = 30000, // 30 seconds default timeout
    } = this.props;

    // Create a unique key that changes on retry to force remount
    const key = `async-boundary-${this.state.retryCount}`;

    return (
      <ErrorBoundary
        level={level}
        name={name}
        fallback={({ error, errorInfo, eventId, resetError, level, name }) => {
          const isNetwork = error ? isNetworkError(error) : false;
          const isTimeout = error ? isTimeoutError(error) : false;

          const asyncProps: AsyncErrorFallbackProps = {
            error,
            errorInfo,
            eventId,
            resetError,
            level,
            name,
            isNetworkError: isNetwork,
            isTimeoutError: isTimeout,
            retryCount: this.state.retryCount,
            onRetry: this.handleRetry,
          };

          if (FallbackComponent) {
            return <FallbackComponent {...asyncProps} />;
          }

          return (
            <DefaultAsyncErrorFallback {...asyncProps} />
          );
        }}
        onError={(error, errorInfo) => {
          // Enhanced error reporting for async errors
          Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
              async: {
                isNetworkError: isNetworkError(error),
                isTimeoutError: isTimeoutError(error),
                retryCount: this.state.retryCount,
                component: name || "AsyncErrorBoundary",
                timeout,
              },
            },
            tags: {
              errorBoundary: true,
              async: true,
              level,
              component: name || "Unknown",
              networkError: isNetworkError(error),
              timeoutError: isTimeoutError(error),
            },
            level: level === "critical" ? "fatal" : "error",
          });
        }}
      >
        <Suspense
          fallback={
            loadingFallback || (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="lg" />
              </div>
            )
          }
        >
          <div key={key}>
            {children}
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  }
}

// Default fallback component for async errors
export function DefaultAsyncErrorFallback({
  error,
  errorInfo,
  eventId,
  resetError,
  level,
  name,
  isNetworkError,
  isTimeoutError,
  retryCount,
  onRetry,
}: AsyncErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isComponentLevel = level === "component";

  // Determine error type and messaging
  let errorIcon = AlertTriangle;
  let errorTitle = "Something went wrong";
  let errorDescription = "An unexpected error occurred. Please try again.";

  if (isNetworkError) {
    errorIcon = WifiOff;
    errorTitle = "Connection Error";
    errorDescription = "Unable to connect to the server. Please check your internet connection and try again.";
  } else if (isTimeoutError) {
    errorIcon = Clock;
    errorTitle = "Request Timeout";
    errorDescription = "The request took too long to complete. Please try again.";
  }

  const Icon = errorIcon;

  // Component-level fallback
  if (isComponentLevel) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {errorTitle}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errorDescription}
              </p>
              {retryCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Retry attempt: {retryCount}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                disabled={retryCount >= 3}
                className="flex items-center gap-1 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                {retryCount >= 3 ? "Max retries" : "Retry"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetError}
                className="flex items-center gap-1 text-xs"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Page-level fallback
  return (
    <div className="min-h-[400px] bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-950 p-4">
                <Icon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {errorTitle}
              </h1>
              <p className="text-muted-foreground">
                {errorDescription}
              </p>
              {retryCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Retry attempts: {retryCount}/3
                </p>
              )}
            </div>

            {/* Network-specific help */}
            {isNetworkError && (
              <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connection Tips:</strong>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                    <li>Disable VPN or proxy if enabled</li>
                    <li>Clear browser cache and cookies</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Timeout-specific help */}
            {isTimeoutError && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Timeout Help:</strong>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    <li>The server may be experiencing high load</li>
                    <li>Try again in a few moments</li>
                    <li>Check your connection speed</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Details */}
            {error && (
              <Alert className="text-left">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Error:</strong> {error.message}
                  {eventId && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Error ID: {eventId}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Development Details */}
            {isDevelopment && errorInfo && (
              <details className="text-left bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">
                  Technical Details (Development Only)
                </summary>
                <pre className="text-xs overflow-auto max-h-40 text-muted-foreground">
                  {error?.stack}
                  {"\n\n"}
                  Component Stack:
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onRetry}
                disabled={retryCount >= 3}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {retryCount >= 3 ? "Max Retries Reached" : "Try Again"}
              </Button>

              <Button
                variant="outline"
                onClick={resetError}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Component
              </Button>

              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Convenience wrappers
export function AsyncPageErrorBoundary({
  children,
  name,
  timeout,
  loadingFallback,
}: {
  children: React.ReactNode;
  name?: string;
  timeout?: number;
  loadingFallback?: React.ReactNode;
}) {
  return (
    <AsyncErrorBoundary
      level="page"
      name={name}
      timeout={timeout}
      loadingFallback={loadingFallback}
    >
      {children}
    </AsyncErrorBoundary>
  );
}

export function AsyncComponentErrorBoundary({
  children,
  name,
  timeout,
  loadingFallback,
}: {
  children: React.ReactNode;
  name?: string;
  timeout?: number;
  loadingFallback?: React.ReactNode;
}) {
  return (
    <AsyncErrorBoundary
      level="component"
      name={name}
      timeout={timeout}
      loadingFallback={loadingFallback}
    >
      {children}
    </AsyncErrorBoundary>
  );
}

// Hook for handling async errors in components
export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    // This will be caught by the nearest error boundary
    throw error;
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    captureError,
    clearError,
  };
}

// Promise-based error boundary for React 19 async components
// Note: React.use is only available in React 19+, so we provide a fallback
export function AsyncPromiseBoundary({
  children,
  promise,
  fallback,
  errorFallback,
}: {
  children: React.ReactNode;
  promise?: Promise<any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}) {
  const [retryCount, setRetryCount] = React.useState(0);
  const [currentPromise, setCurrentPromise] = React.useState(promise);

  const retry = React.useCallback(() => {
    setRetryCount(count => count + 1);
    setCurrentPromise(promise);
  }, [promise]);

  // Check if React.use is available (React 19+)
  if (currentPromise && typeof (React as any).use === 'function') {
    try {
      (React as any).use(currentPromise);
    } catch (error) {
      if (errorFallback) {
        const ErrorFallback = errorFallback;
        return <ErrorFallback error={error as Error} retry={retry} />;
      }
      throw error;
    }
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
} 