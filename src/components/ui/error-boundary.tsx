import React from "react";
import * as Sentry from "@sentry/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: "page" | "component" | "critical";
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
  resetError: () => void;
  level: "page" | "component" | "critical";
  name?: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { level = "component", name, onError } = this.props;

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error(
      `Error Boundary (${level}${name ? ` - ${name}` : ""}) caught an error:`,
      error,
      errorInfo
    );

    // Send error to Sentry with context
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        errorBoundary: {
          level,
          name: name || "Unknown",
          errorMessage: error.message,
          errorStack: error.stack,
        },
      },
      tags: {
        errorBoundary: true,
        level,
        component: name || "Unknown",
      },
      level: level === "critical" ? "fatal" : "error",
    });

    this.setState({ eventId });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const {
        fallback: FallbackComponent,
        level = "component",
        name,
      } = this.props;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            eventId={this.state.eventId}
            resetError={this.resetError}
            level={level}
            name={name}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          eventId={this.state.eventId}
          resetError={this.resetError}
          level={level}
          name={name}
        />
      );
    }

    return this.props.children;
  }
}

// Default fallback component
export function DefaultErrorFallback({
  error,
  errorInfo,
  eventId,
  resetError,
  level,
  name,
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isPageLevel = level === "page" || level === "critical";

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleReportFeedback = () => {
    if (eventId) {
      Sentry.showReportDialog({ eventId });
    }
  };

  if (level === "component") {
    // Minimal fallback for component-level errors
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {name ? `${name} Error` : "Component Error"}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Something went wrong with this component
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={resetError}
              className="flex items-center gap-1 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full-page fallback for page-level and critical errors
  return (
    <div
      className={`${isPageLevel ? "min-h-screen" : "min-h-[400px]"} bg-background flex items-center justify-center p-4`}
    >
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-950 p-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {level === "critical"
                  ? "Critical Error"
                  : "Something went wrong"}
              </h1>
              <p className="text-muted-foreground">
                {level === "critical"
                  ? "A critical error occurred that requires immediate attention."
                  : "We encountered an unexpected error. Please try again or contact support if the problem persists."}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert className="text-left">
                <Bug className="h-4 w-4" />
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

            {/* Development Error Details */}
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
              <Button onClick={resetError} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              {isPageLevel && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleReload}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleGoHome}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                </>
              )}

              {eventId && (
                <Button
                  variant="outline"
                  onClick={handleReportFeedback}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Report Issue
                </Button>
              )}
            </div>

            {/* Support Message */}
            <div className="text-sm text-muted-foreground">
              <p>
                If this problem persists, please contact support
                {eventId && ` with error ID: ${eventId}`}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specialized error boundaries for different use cases
export function PageErrorBoundary({
  children,
  name,
}: {
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <ErrorBoundary level="page" name={name}>
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({
  children,
  name,
}: {
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <ErrorBoundary level="component" name={name}>
      {children}
    </ErrorBoundary>
  );
}

export function CriticalErrorBoundary({
  children,
  name,
}: {
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <ErrorBoundary level="critical" name={name}>
      {children}
    </ErrorBoundary>
  );
}
