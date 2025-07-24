"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Certification, Enrollment, PracticeExam } from "@/types/database";

interface TestResult {
  step: string;
  status: "pass" | "fail" | "skip";
  message: string;
  data?: unknown;
  error?: string;
  duration?: number;
}

interface SystemTestResults {
  overall_status: "pass" | "fail";
  test_timestamp: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  results: TestResult[];
  summary: string;
}

interface EnrollmentTestResults {
  user?: { id: string; email: string | undefined };
  available_certifications?: {
    total: number;
    free: number;
    test_certification: Certification;
  };
  enrollment_status?: { enrolled: boolean };
  enrollment_attempt?: { success: boolean; message: string };
  user_enrollments?: { enrollments: Enrollment[]; error?: string };
  practice_exams_access?: { exams: PracticeExam[]; error?: string };
  timestamp?: string;
  error?: string;
}

interface FixResults {
  success?: boolean;
  message?: string;
  deleted_count?: number;
  created_count?: number;
  error?: string;
  timestamp?: string;
  results?: unknown[];
}

export default function SystemTestPage() {
  const { user, loading } = useAuth();
  const [systemTestResults, setSystemTestResults] =
    useState<SystemTestResults | null>(null);
  const [enrollmentTestResults, setEnrollmentTestResults] =
    useState<EnrollmentTestResults | null>(null);
  const [fixResults, setFixResults] = useState<FixResults | null>(null);
  const [isRunningSystemTest, setIsRunningSystemTest] = useState(false);
  const [isRunningEnrollmentTest, setIsRunningEnrollmentTest] = useState(false);
  const [isRunningFix, setIsRunningFix] = useState(false);

  const runSystemTest = async () => {
    setIsRunningSystemTest(true);
    try {
      const response = await fetch("/api/system-test");
      const results = await response.json();
      setSystemTestResults(results);
    } catch (error) {
      setSystemTestResults({
        overall_status: "fail",
        test_timestamp: new Date().toISOString(),
        total_tests: 1,
        passed_tests: 0,
        failed_tests: 1,
        results: [
          {
            step: "System Test Execution",
            status: "fail",
            message: "Failed to run system test",
            error: error instanceof Error ? error.message : String(error),
          },
        ],
        summary: "System test execution failed",
      });
    } finally {
      setIsRunningSystemTest(false);
    }
  };

  const runEnrollmentTest = async () => {
    if (!user) {
      setEnrollmentTestResults({
        error: "Please sign in to test enrollment functionality",
      });
      return;
    }

    setIsRunningEnrollmentTest(true);
    try {
      // Step 1: Get available certifications
      const certsResponse = await fetch("/api/certifications");
      const certsData = await certsResponse.json();

      if (!certsResponse.ok) {
        throw new Error(`Failed to fetch certifications: ${certsData.error}`);
      }

      const freeCertifications =
        certsData.certifications?.filter(
          (cert: Certification) => cert.price_cents === 0
        ) || [];

      if (freeCertifications.length === 0) {
        setEnrollmentTestResults({
          error: "No free certifications available for testing",
        });
        return;
      }

      const testCert = freeCertifications[0];

      // Step 2: Check current enrollment status
      const statusResponse = await fetch(
        `/api/certifications/${testCert.id}/enroll`
      );
      const statusData = await statusResponse.json();

      // Step 3: Try to enroll (if not already enrolled)
      let enrollmentResult = null;
      if (!statusData.enrolled) {
        const enrollResponse = await fetch(
          `/api/certifications/${testCert.id}/enroll`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        enrollmentResult = await enrollResponse.json();
      }

      // Step 4: Fetch user enrollments
      const userEnrollmentsResponse = await fetch("/api/user/enrollments");
      const userEnrollmentsData = await userEnrollmentsResponse.json();

      // Step 5: Test practice exams access
      const practiceExamsResponse = await fetch("/api/practice-exams");
      const practiceExamsData = await practiceExamsResponse.json();

      setEnrollmentTestResults({
        user: { id: user.id, email: user.email },
        available_certifications: {
          total: certsData.certifications?.length || 0,
          free: freeCertifications.length,
          test_certification: testCert,
        },
        enrollment_status: statusData,
        enrollment_attempt: enrollmentResult,
        user_enrollments: userEnrollmentsData,
        practice_exams_access: practiceExamsData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setEnrollmentTestResults({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsRunningEnrollmentTest(false);
    }
  };

  const runEnrollmentFix = async () => {
    if (!user) {
      setFixResults({
        error: "Please sign in to fix enrollment issues",
      });
      return;
    }

    setIsRunningFix(true);
    try {
      const response = await fetch("/api/fix-enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const results = await response.json();
      setFixResults(results);
    } catch (error) {
      setFixResults({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsRunningFix(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "skip":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant =
      status === "pass"
        ? "default"
        : status === "fail"
          ? "destructive"
          : "secondary";
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">QuizForce System Test</h1>
          <p className="text-muted-foreground">
            Comprehensive testing suite for diagnosing enrollment system issues
          </p>
        </div>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Authentication Status
              {loading ? (
                <Clock className="h-5 w-5 text-yellow-600" />
              ) : user ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading authentication...</p>
            ) : user ? (
              <div>
                <p className="text-green-600 font-semibold">✅ Authenticated</p>
                <p>Email: {user.email}</p>
                <p>User ID: {user.id}</p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-semibold">
                  ❌ Not authenticated
                </p>
                <p>Please sign in to test enrollment functionality</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Test */}
        <Card>
          <CardHeader>
            <CardTitle>System Infrastructure Test</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tests database connectivity, RLS policies, table access, and core
              functionality
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runSystemTest}
              disabled={isRunningSystemTest}
              className="w-full"
            >
              {isRunningSystemTest
                ? "Running System Test..."
                : "Run System Test"}
            </Button>

            {systemTestResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Overall Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {systemTestResults.summary}
                    </p>
                  </div>
                  {getStatusBadge(systemTestResults.overall_status)}
                </div>

                <div className="space-y-2">
                  {systemTestResults.results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{result.step}</h4>
                          {result.duration && (
                            <span className="text-xs text-muted-foreground">
                              {result.duration}ms
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.message}
                        </p>
                        {result.error && (
                          <p className="text-xs text-red-600 mt-1">
                            Error: {result.error}
                          </p>
                        )}
                        {result.data != null && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-blue-600">
                              View Data
                            </summary>
                            <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-32">
                              {typeof result.data === "string"
                                ? result.data
                                : JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrollment Flow Test */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Flow Test</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tests the complete enrollment process from certification discovery
              to practice exam access
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runEnrollmentTest}
              disabled={isRunningEnrollmentTest || !user}
              className="w-full"
            >
              {isRunningEnrollmentTest
                ? "Running Enrollment Test..."
                : user
                  ? "Run Enrollment Test"
                  : "Sign In Required"}
            </Button>

            {enrollmentTestResults && (
              <div className="space-y-4">
                {enrollmentTestResults.error ? (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="font-semibold text-red-800">Test Failed</h3>
                    <p className="text-red-600">
                      {enrollmentTestResults.error}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">
                          Available Certifications
                        </h4>
                        <p>
                          Total:{" "}
                          {enrollmentTestResults.available_certifications
                            ?.total || 0}
                        </p>
                        <p>
                          Free:{" "}
                          {enrollmentTestResults.available_certifications
                            ?.free || 0}
                        </p>
                        {enrollmentTestResults.available_certifications
                          ?.test_certification && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Test Cert:{" "}
                            {
                              enrollmentTestResults.available_certifications
                                .test_certification.name
                            }
                          </p>
                        )}
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">User Enrollments</h4>
                        <p>
                          Count:{" "}
                          {enrollmentTestResults.user_enrollments?.enrollments
                            ?.length || 0}
                        </p>
                        {enrollmentTestResults.user_enrollments?.error && (
                          <p className="text-red-600 text-sm">
                            Error:{" "}
                            {enrollmentTestResults.user_enrollments.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <details className="border rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium">
                        View Full Test Results
                      </summary>
                      <pre className="p-4 bg-gray-100 text-xs overflow-auto max-h-96">
                        {JSON.stringify(enrollmentTestResults, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrollment Fix */}
        <Card>
          <CardHeader>
            <CardTitle>🚑 Emergency Enrollment Fix</CardTitle>
            <p className="text-sm text-muted-foreground">
              Automatically fixes broken enrollments and creates test data if
              needed
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runEnrollmentFix}
              disabled={isRunningFix || !user}
              className="w-full"
              variant="destructive"
            >
              {isRunningFix
                ? "Running Fix..."
                : user
                  ? "🔧 Fix My Enrollments"
                  : "Sign In Required"}
            </Button>

            {fixResults && (
              <div className="space-y-4">
                {fixResults.error ? (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="font-semibold text-red-800">Fix Failed</h3>
                    <p className="text-red-600">{fixResults.error}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={`p-4 border rounded-lg ${fixResults.success ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
                    >
                      <h3
                        className={`font-semibold ${fixResults.success ? "text-green-800" : "text-yellow-800"}`}
                      >
                        {fixResults.success
                          ? "✅ Fix Completed Successfully"
                          : "⚠️ Fix Completed with Warnings"}
                      </h3>
                      <p
                        className={
                          fixResults.success
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {fixResults.message}
                      </p>
                    </div>

                    {fixResults.results && (
                      <div className="space-y-2">
                        {fixResults.results.map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (result: any, index: number) => (
                            <div
                              key={index}
                              className={`flex items-start gap-3 p-3 border rounded-lg ${
                                result.status === "success"
                                  ? "bg-green-50"
                                  : result.status === "error"
                                    ? "bg-red-50"
                                    : "bg-gray-50"
                              }`}
                            >
                              {getStatusIcon(result.status)}
                              <div className="flex-1">
                                <h4 className="font-medium">{result.step}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {result.message}
                                </p>
                                {result.data != null && (
                                  <details className="mt-2">
                                    <summary className="text-xs cursor-pointer text-blue-600">
                                      View Details
                                    </summary>
                                    <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-32">
                                      {typeof result.data === "string"
                                        ? result.data
                                        : JSON.stringify(result.data, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={() => window.open("/practice-exams", "_blank")}
              >
                Open Practice Exams
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/certifications", "_blank")}
              >
                Open Certifications
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/dashboard", "_blank")}
              >
                Open Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
