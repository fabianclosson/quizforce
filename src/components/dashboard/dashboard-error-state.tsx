"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  Server,
  ShieldAlert,
  Home,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function DashboardErrorState({
  error,
  onRetry,
  className,
}: DashboardErrorStateProps) {
  // Determine error type and appropriate message
  const getErrorInfo = () => {
    const errorMessage = error?.message?.toLowerCase() || "";

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        icon: Wifi,
        title: "Connection Error",
        description:
          "Unable to connect to our servers. Please check your internet connection and try again.",
        color: "text-orange-600",
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
      };
    }

    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("authentication")
    ) {
      return {
        icon: ShieldAlert,
        title: "Authentication Error",
        description:
          "Your session has expired. Please sign in again to continue.",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/20",
      };
    }

    if (errorMessage.includes("server") || errorMessage.includes("500")) {
      return {
        icon: Server,
        title: "Server Error",
        description:
          "Our servers are experiencing issues. Please try again in a few minutes.",
        color: "text-purple-600",
        bgColor: "bg-purple-100 dark:bg-purple-900/20",
      };
    }

    // Default error
    return {
      icon: AlertTriangle,
      title: "Something went wrong",
      description:
        "An unexpected error occurred while loading your dashboard. Please try refreshing the page.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    };
  };

  const errorInfo = getErrorInfo();
  const Icon = errorInfo.icon;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Error Card */}
      <Card className="text-center py-16">
        <CardContent className="space-y-6">
          {/* Error Icon */}
          <div
            className={cn(
              "mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6",
              errorInfo.bgColor
            )}
          >
            <Icon className={cn("h-10 w-10", errorInfo.color)} />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {errorInfo.title}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {errorInfo.description}
            </p>
          </div>

          {/* Error Details (in development) */}
          {process.env.NODE_ENV === "development" && error && (
            <Alert className="text-left max-w-md mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} className="min-w-[120px]">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/support">
                <HelpCircle className="h-4 w-4 mr-2" />
                Get Help
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Helpful Tips */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-muted-foreground" />
            Troubleshooting Tips
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium">Check your connection</div>
                <div className="text-muted-foreground">
                  Ensure you have a stable internet connection and try
                  refreshing the page.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium">Clear your cache</div>
                <div className="text-muted-foreground">
                  Try clearing your browser cache and cookies, then reload the
                  page.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium">Contact support</div>
                <div className="text-muted-foreground">
                  If the problem persists, please reach out to our support team
                  for assistance.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
