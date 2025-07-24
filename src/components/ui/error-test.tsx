"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComponentErrorBoundary,
  PageErrorBoundary,
} from "@/components/ui/error-boundary";

// Test component that throws errors on demand
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error for Sentry integration");
  }

  return (
    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
      <p className="text-green-800 dark:text-green-200">
        Component is working correctly!
      </p>
    </div>
  );
}

// Component-level error test
function ComponentErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Error Boundary Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ComponentErrorBoundary name="Test Component">
          <ErrorThrowingComponent shouldThrow={shouldThrow} />
        </ComponentErrorBoundary>

        <div className="flex gap-2">
          <Button
            onClick={() => setShouldThrow(true)}
            variant="destructive"
            size="sm"
          >
            Trigger Component Error
          </Button>
          <Button
            onClick={() => setShouldThrow(false)}
            variant="outline"
            size="sm"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Page-level error test
function PageErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Error Boundary Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PageErrorBoundary name="Test Page">
          <ErrorThrowingComponent shouldThrow={shouldThrow} />
        </PageErrorBoundary>

        <div className="flex gap-2">
          <Button
            onClick={() => setShouldThrow(true)}
            variant="destructive"
            size="sm"
          >
            Trigger Page Error
          </Button>
          <Button
            onClick={() => setShouldThrow(false)}
            variant="outline"
            size="sm"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main test component
export function ErrorBoundaryTest() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Error Boundary Testing
        </h1>
        <p className="text-muted-foreground">
          Test the error boundary implementations with Sentry integration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ComponentErrorTest />
        <PageErrorTest />
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • Click &quot;Trigger Component Error&quot; to test component-level error
            handling
          </li>
          <li>
            • Click &quot;Trigger Page Error&quot; to test page-level error handling
          </li>
          <li>• Errors will be automatically sent to Sentry with context</li>
          <li>• Use &quot;Reset&quot; buttons to clear error states</li>
          <li>
            • Check browser console and Sentry dashboard for error reports
          </li>
        </ul>
      </div>
    </div>
  );
}
