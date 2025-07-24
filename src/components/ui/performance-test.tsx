"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PerformanceTimer,
  trackApiPerformance,
  trackDatabasePerformance,
  trackExternalApiPerformance,
  trackPageLoadPerformance,
  PERFORMANCE_THRESHOLDS,
} from "@/lib/performance-monitoring";
import * as Sentry from "@sentry/nextjs";

interface TestResult {
  id: string;
  name: string;
  type: "success" | "warning" | "error";
  duration?: number;
  message: string;
  timestamp: Date;
}

export function PerformanceTestComponent() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: Omit<TestResult, "id" | "timestamp">) => {
    setResults(prev => [
      {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      },
      ...prev.slice(0, 9),
    ]); // Keep only last 10 results
  };

  // Performance test functions
  const testApiPerformance = async () => {
    const timer = new PerformanceTimer("Test API Performance", "api_request", {
      endpoint: "/api/test",
      method: "GET",
    });

    // Simulate API delay
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 3000 + 500)
    );

    const duration = timer.stop({ statusCode: 200, success: true });

    trackApiPerformance("/api/test", "GET", duration, 200, {
      testType: "performance_monitoring",
      simulated: true,
    });

    addResult({
      name: "API Performance Test",
      type: duration > PERFORMANCE_THRESHOLDS.API_SLOW ? "error" : "success",
      duration,
      message: `API request completed in ${duration.toFixed(2)}ms`,
    });
  };

  const testDatabasePerformance = async () => {
    const timer = new PerformanceTimer(
      "Test Database Query",
      "database_query",
      {
        query: "SELECT * FROM test_table",
        table: "test_table",
      }
    );

    // Simulate database delay
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 2000 + 200)
    );

    const duration = timer.stop({ rowCount: 150, success: true });

    trackDatabasePerformance("SELECT * FROM test_table LIMIT 100", duration, {
      testType: "performance_monitoring",
      simulated: true,
      rowCount: 150,
    });

    addResult({
      name: "Database Performance Test",
      type:
        duration > PERFORMANCE_THRESHOLDS.DATABASE_SLOW ? "error" : "success",
      duration,
      message: `Database query completed in ${duration.toFixed(2)}ms`,
    });
  };

  const testExternalApiPerformance = async () => {
    const timer = new PerformanceTimer("Test External API", "external_api", {
      service: "stripe",
      endpoint: "/v1/test",
    });

    // Simulate external API delay
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 4000 + 1000)
    );

    const duration = timer.stop({ statusCode: 200, success: true });

    trackExternalApiPerformance("stripe", "/v1/test", duration, {
      testType: "performance_monitoring",
      simulated: true,
      statusCode: 200,
    });

    addResult({
      name: "External API Performance Test",
      type:
        duration > PERFORMANCE_THRESHOLDS.EXTERNAL_API_SLOW
          ? "error"
          : "success",
      duration,
      message: `External API call completed in ${duration.toFixed(2)}ms`,
    });
  };

  const testPageLoadPerformance = () => {
    const loadTime = Math.random() * 4000 + 1000;

    trackPageLoadPerformance("Test Page", loadTime, {
      testType: "performance_monitoring",
      simulated: true,
      domContentLoaded: loadTime * 0.6,
      firstPaint: loadTime * 0.3,
      firstContentfulPaint: loadTime * 0.4,
    });

    addResult({
      name: "Page Load Performance Test",
      type:
        loadTime > PERFORMANCE_THRESHOLDS.PAGE_LOAD_SLOW ? "error" : "success",
      duration: loadTime,
      message: `Page load simulated in ${loadTime.toFixed(2)}ms`,
    });
  };

  // Error test functions for Sentry alerts
  const testValidationError = () => {
    try {
      throw new Error("Test validation error: Invalid user input");
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test_type: "validation_error",
          component: "performance_test",
        },
        contexts: {
          test: {
            description: "Testing validation error alerts",
            simulated: true,
          },
        },
      });

      addResult({
        name: "Validation Error Test",
        type: "warning",
        message: "Validation error sent to Sentry",
      });
    }
  };

  const testAuthenticationError = () => {
    try {
      throw new Error("Test authentication error: Invalid token");
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test_type: "authentication_error",
          component: "performance_test",
        },
        level: "error",
        contexts: {
          test: {
            description: "Testing authentication error alerts",
            simulated: true,
          },
        },
      });

      addResult({
        name: "Authentication Error Test",
        type: "error",
        message: "Authentication error sent to Sentry",
      });
    }
  };

  const testCriticalError = () => {
    try {
      throw new Error("Test critical error: Database connection failed");
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test_type: "critical_error",
          component: "performance_test",
        },
        level: "fatal",
        contexts: {
          test: {
            description: "Testing critical error alerts",
            simulated: true,
          },
        },
      });

      addResult({
        name: "Critical Error Test",
        type: "error",
        message: "Critical error sent to Sentry",
      });
    }
  };

  const testCustomMessage = () => {
    Sentry.withScope(scope => {
      scope.setTags({
        test_type: "custom_message",
        component: "performance_test",
      });
      scope.setContext("test", {
        description: "Testing custom message alerts",
        simulated: true,
      });
      Sentry.captureMessage(
        "Test custom message: Performance monitoring active",
        "info"
      );
    });

    addResult({
      name: "Custom Message Test",
      type: "success",
      message: "Custom message sent to Sentry",
    });
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Performance tests
      await testApiPerformance();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testDatabasePerformance();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testExternalApiPerformance();
      await new Promise(resolve => setTimeout(resolve, 500));

      testPageLoadPerformance();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Error tests
      testValidationError();
      await new Promise(resolve => setTimeout(resolve, 500));

      testAuthenticationError();
      await new Promise(resolve => setTimeout(resolve, 500));

      testCriticalError();
      await new Promise(resolve => setTimeout(resolve, 500));

      testCustomMessage();

      addResult({
        name: "All Tests Completed",
        type: "success",
        message: "All performance and error tests completed successfully",
      });
    } catch (error) {
      addResult({
        name: "Test Suite Error",
        type: "error",
        message: `Error running tests: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getResultIcon = (type: TestResult["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "📊";
    }
  };

  const getResultColor = (type: TestResult["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Performance Monitoring & Alert Testing
        </h1>
        <p className="text-muted-foreground mt-2">
          Test Sentry integration, performance monitoring, and alert
          configuration
        </p>
      </div>

      <Alert>
        <AlertDescription>
          This testing interface allows you to verify that performance
          monitoring and error tracking are working correctly. All tests are
          simulated and will send data to Sentry for alert verification.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance Tests</TabsTrigger>
          <TabsTrigger value="errors">Error Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring Tests</CardTitle>
              <CardDescription>
                Test different types of performance monitoring and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={testApiPerformance}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test API Performance
                </Button>
                <Button
                  onClick={testDatabasePerformance}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test Database Performance
                </Button>
                <Button
                  onClick={testExternalApiPerformance}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test External API Performance
                </Button>
                <Button
                  onClick={testPageLoadPerformance}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test Page Load Performance
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Performance Thresholds</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>API Slow: {PERFORMANCE_THRESHOLDS.API_SLOW}ms</div>
                  <div>
                    API Critical: {PERFORMANCE_THRESHOLDS.API_CRITICAL}ms
                  </div>
                  <div>
                    Database Slow: {PERFORMANCE_THRESHOLDS.DATABASE_SLOW}ms
                  </div>
                  <div>
                    Database Critical:{" "}
                    {PERFORMANCE_THRESHOLDS.DATABASE_CRITICAL}ms
                  </div>
                  <div>
                    External API Slow:{" "}
                    {PERFORMANCE_THRESHOLDS.EXTERNAL_API_SLOW}ms
                  </div>
                  <div>
                    Page Load Slow: {PERFORMANCE_THRESHOLDS.PAGE_LOAD_SLOW}ms
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Tracking & Alert Tests</CardTitle>
              <CardDescription>
                Test different error types and Sentry alert configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={testValidationError}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test Validation Error
                </Button>
                <Button
                  onClick={testAuthenticationError}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test Authentication Error
                </Button>
                <Button
                  onClick={testCriticalError}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test Critical Error
                </Button>
                <Button
                  onClick={testCustomMessage}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test Custom Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Test Results
                <Button
                  onClick={clearResults}
                  variant="outline"
                  size="sm"
                  disabled={results.length === 0}
                >
                  Clear Results
                </Button>
              </CardTitle>
              <CardDescription>
                Results from performance and error tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No test results yet. Run some tests to see results here.
                </p>
              ) : (
                <div className="space-y-3">
                  {results.map(result => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {getResultIcon(result.type)}
                        </span>
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.message}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.duration && (
                          <Badge variant="outline">
                            {result.duration.toFixed(2)}ms
                          </Badge>
                        )}
                        <Badge className={getResultColor(result.type)}>
                          {result.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={runAllTests}
          disabled={isRunning}
          size="lg"
          className="min-w-[200px]"
        >
          {isRunning ? "Running Tests..." : "Run All Tests"}
        </Button>
      </div>
    </div>
  );
}
