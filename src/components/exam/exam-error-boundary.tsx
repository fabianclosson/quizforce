import React from "react";
import * as Sentry from "@sentry/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from "lucide-react";

interface ExamErrorBoundaryProps {
  children: React.ReactNode;
}

interface ExamErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

export class ExamErrorBoundary extends React.Component<
  ExamErrorBoundaryProps,
  ExamErrorBoundaryState
> {
  constructor(props: ExamErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ExamErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error("Exam Error Boundary caught an error:", error, errorInfo);

    // Send error to Sentry with exam-specific context
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        exam: {
          component: "ExamErrorBoundary",
          errorMessage: error.message,
          errorStack: error.stack,
        },
      },
      tags: {
        errorBoundary: true,
        component: "exam",
        level: "critical",
      },
      level: "error",
    });

    this.setState({ eventId });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportFeedback = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
                    Something went wrong
                  </h1>
                  <p className="text-muted-foreground">
                    We encountered an unexpected error while loading your exam.
                    Your progress has been automatically saved.
                  </p>
                </div>

                {/* Error Message */}
                {this.state.error && (
                  <Alert className="text-left">
                    <Bug className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Error:</strong> {this.state.error.message}
                      {this.state.eventId && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Error ID: {this.state.eventId}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Development Error Details */}
                {isDevelopment && this.state.errorInfo && (
                  <details className="text-left bg-muted p-4 rounded-lg">
                    <summary className="cursor-pointer font-medium mb-2">
                      Technical Details (Development Only)
                    </summary>
                    <pre className="text-xs overflow-auto max-h-40 text-muted-foreground">
                      {this.state.error?.stack}
                      {"\n\n"}
                      Component Stack:
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>

                  <Button
                    variant="outline"
                    onClick={this.handleReload}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={this.handleGoHome}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>

                  {this.state.eventId && (
                    <Button
                      variant="outline"
                      onClick={this.handleReportFeedback}
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
                    If this problem persists, please contact support with the
                    error details above
                    {this.state.eventId && ` (Error ID: ${this.state.eventId})`}
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
