import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

interface TestResult {
  step: string;
  status: "pass" | "fail" | "skip";
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
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

interface FreeCert {
  id: string;
  name: string;
  price_cents: number;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const startTime = Date.now();
    const results: TestResult[] = [];

    // Test 1: Database Connection
    try {
      const testStart = Date.now();
      const { error } = await supabase
        .from("certifications")
        .select("count")
        .limit(1);

      results.push({
        step: "Database Connection",
        status: error ? "fail" : "pass",
        message: error
          ? `Database connection failed: ${error.message}`
          : "Database connection successful",
        duration: Date.now() - testStart,
        error: error?.message,
      });
    } catch (error) {
      results.push({
        step: "Database Connection",
        status: "fail",
        message: "Failed to create database client",
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json({
        overall_status: "fail",
        test_timestamp: new Date().toISOString(),
        total_tests: 1,
        passed_tests: 0,
        failed_tests: 1,
        results,
        summary: "Critical failure: Cannot connect to database",
      } as SystemTestResults);
    }

    // Test 2: Authentication
    try {
      const testStart = Date.now();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      results.push({
        step: "Authentication Check",
        status: user ? "pass" : "skip",
        message: user
          ? `Authenticated as: ${user.email}`
          : "No authenticated user (expected for system test)",
        data: user ? { id: user.id, email: user.email } : null,
        duration: Date.now() - testStart,
        error: authError?.message,
      });
    } catch (error) {
      results.push({
        step: "Authentication Check",
        status: "fail",
        message: "Authentication check failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 3: RLS Function Validation
    try {
      const testStart = Date.now();
      const { data, error } = await supabase.rpc("is_admin", {
        user_id: "00000000-0000-0000-0000-000000000000",
      });

      results.push({
        step: "RLS is_admin Function",
        status: error ? "fail" : "pass",
        message: error
          ? `is_admin function error: ${error.message}`
          : "is_admin function working correctly",
        data: { result: data },
        duration: Date.now() - testStart,
        error: error?.message,
      });
    } catch (error) {
      results.push({
        step: "RLS is_admin Function",
        status: "fail",
        message: "is_admin function test failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 4: Certifications Table Access
    try {
      const testStart = Date.now();
      const { data: certifications, error } = await supabase
        .from("certifications")
        .select("id, name, price_cents, is_active")
        .eq("is_active", true)
        .limit(5);

      results.push({
        step: "Certifications Table Access",
        status: error ? "fail" : "pass",
        message: error
          ? `Certifications query failed: ${error.message}`
          : `Found ${certifications?.length || 0} active certifications`,
        data: certifications,
        duration: Date.now() - testStart,
        error: error?.message,
      });
    } catch (error) {
      results.push({
        step: "Certifications Table Access",
        status: "fail",
        message: "Certifications table access failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 5: Enrollments Table Access & Structure
    try {
      const testStart = Date.now();
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select("*")
        .limit(5);

      const { data: enrollmentCount, error: countError } = await supabase
        .from("enrollments")
        .select("id", { count: "exact" });

      results.push({
        step: "Enrollments Table Access",
        status: error || countError ? "fail" : "pass",
        message:
          error || countError
            ? `Enrollments query failed: ${error?.message || countError?.message}`
            : `Enrollments table accessible. Current count: ${enrollmentCount?.length || 0}`,
        data: {
          sample_enrollments: enrollments,
          total_count: enrollmentCount?.length || 0,
        },
        duration: Date.now() - testStart,
        error: error?.message || countError?.message,
      });
    } catch (error) {
      results.push({
        step: "Enrollments Table Access",
        status: "fail",
        message: "Enrollments table access failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 6: Practice Exams Query (the problematic query)
    try {
      const testStart = Date.now();
      const { data: practiceExams, error } = await supabase
        .from("practice_exams")
        .select(
          `
        id,
        name,
        certification_id,
        certifications!practice_exams_certification_id_fkey (
          id,
          name,
          slug
        )
      `
        )
        .limit(5);

      results.push({
        step: "Practice Exams Query",
        status: error ? "fail" : "pass",
        message: error
          ? `Practice exams query failed: ${error.message}`
          : `Found ${practiceExams?.length || 0} practice exams`,
        data: practiceExams,
        duration: Date.now() - testStart,
        error: error?.message,
      });
    } catch (error) {
      results.push({
        step: "Practice Exams Query",
        status: "fail",
        message: "Practice exams query failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 7: User Enrollments Query (exact API query)
    try {
      const testStart = Date.now();
      const { data: userEnrollments, error } = await supabase
        .from("enrollments")
        .select(
          `
        id,
        enrolled_at,
        expires_at,
        source,
        package_id,
        certifications!enrollments_certification_id_fkey (
          id,
          name,
          slug,
          exam_count,
          total_questions
        )
      `
        )
        .gte("expires_at", new Date().toISOString())
        .limit(10);

      results.push({
        step: "User Enrollments API Query",
        status: error ? "fail" : "pass",
        message: error
          ? `User enrollments query failed: ${error.message}`
          : `Query successful. Found ${userEnrollments?.length || 0} active enrollments`,
        data: userEnrollments,
        duration: Date.now() - testStart,
        error: error?.message,
      });
    } catch (error) {
      results.push({
        step: "User Enrollments API Query",
        status: "fail",
        message: "User enrollments query failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 8: Comprehensive User Data Query
    try {
      const testStart = Date.now();
      // This query is designed to fail if RLS is not permissive enough
      const { data: userData, error } = await supabase
        .from("profiles")
        .select(
          `
        *,
        enrollments (
          *,
          certifications (
            *
          )
        )
      `
        )
        .limit(1);

      results.push({
        step: "Comprehensive User Data Query (RLS)",
        status: error ? "fail" : "pass",
        message: error
          ? `Comprehensive query failed: ${error.message}`
          : `Comprehensive query successful. Found data for ${userData?.length || 0} user(s)`,
        data: {
          user_count: userData?.length,
          first_user_enrollments:
            userData && userData.length > 0
              ? (userData[0] as { enrollments: unknown[] }).enrollments.length
              : 0,
        },
        duration: Date.now() - testStart,
        error: error?.message,
      });
    } catch (error) {
      results.push({
        step: "Comprehensive User Data Query (RLS)",
        status: "fail",
        message: "Comprehensive user data query failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 9: Test Data Creation (if no enrollments exist and user is authenticated)
    const enrollmentTestResult = results.find(
      r => r.step === "Enrollments Table Access"
    );
    const authTestResult = results.find(r => r.step === "Authentication Check");

    if (
      enrollmentTestResult?.status === "pass" &&
      enrollmentTestResult.data?.total_count === 0 &&
      authTestResult?.data?.id
    ) {
      try {
        const testStart = Date.now();

        // Get free certifications for test enrollment
        const { data: freeCerts, error: certError } = await supabase
          .from("certifications")
          .select("id, name, price_cents")
          .eq("is_active", true)
          .eq("price_cents", 0)
          .limit(2);

        if (freeCerts && freeCerts.length > 0 && !certError) {
          const authenticatedUserId = authTestResult.data.id;
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);

          // Create test enrollments for free certifications
          const enrollmentsToCreate = freeCerts.map((cert: FreeCert) => ({
            user_id: authenticatedUserId,
            certification_id: cert.id,
            purchase_price_cents: 0,
            source: "system_test",
            expires_at: expiryDate.toISOString(),
          }));

          const { data: testEnrollments, error: enrollError } = await supabase
            .from("enrollments")
            .insert(enrollmentsToCreate)
            .select();

          results.push({
            step: "Test Data Creation",
            status: enrollError ? "fail" : "pass",
            message: enrollError
              ? `Failed to create test enrollments: ${enrollError.message}`
              : `Created ${testEnrollments?.length || 0} test enrollments for authenticated user`,
            data: testEnrollments,
            duration: Date.now() - testStart,
            error: enrollError?.message,
          });
        } else {
          results.push({
            step: "Test Data Creation",
            status: "skip",
            message: certError
              ? `Error finding free certifications: ${certError.message}`
              : "No free certifications found for test data creation",
            duration: Date.now() - testStart,
            error: certError?.message,
          });
        }
      } catch (error) {
        results.push({
          step: "Test Data Creation",
          status: "fail",
          message: "Test data creation failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      let skipReason = "Skipped - ";
      if (enrollmentTestResult?.data?.total_count > 0) {
        skipReason += "enrollments already exist";
      } else if (!authTestResult?.data?.id) {
        skipReason +=
          "no authenticated user (RLS requires authentication for enrollment creation)";
      } else if (enrollmentTestResult?.status !== "pass") {
        skipReason += "enrollment table access test failed";
      } else {
        skipReason += "unknown reason";
      }

      results.push({
        step: "Test Data Creation",
        status: "skip",
        message: skipReason,
        duration: 0,
      });
    }

    // Calculate summary
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === "pass").length;
    const failedTests = results.filter(r => r.status === "fail").length;
    const overallStatus = failedTests === 0 ? "pass" : "fail";

    let summary = `System test completed. ${passedTests}/${totalTests} tests passed.`;
    if (failedTests > 0) {
      const failedSteps = results
        .filter(r => r.status === "fail")
        .map(r => r.step);
      summary += ` Failed tests: ${failedSteps.join(", ")}`;
    }

    const totalDuration = Date.now() - startTime;
    summary += ` Total duration: ${totalDuration}ms`;

    const finalResults: SystemTestResults = {
      overall_status: overallStatus,
      test_timestamp: new Date(startTime).toISOString(),
      total_tests: totalTests,
      passed_tests: passedTests,
      failed_tests: failedTests,
      results,
      summary,
    };

    return NextResponse.json(finalResults, {
      status: overallStatus === "fail" ? 500 : 200,
    });
  } catch (error) {
    // This catch block will now only catch errors during supabase client creation
    // or if the supabase client is not available for other tests.
    // The original error handling for database connection was moved to the top.
    return NextResponse.json({
      overall_status: "fail",
      test_timestamp: new Date().toISOString(),
      total_tests: 0,
      passed_tests: 0,
      failed_tests: 1,
      results: [],
      summary: `System test failed: ${error instanceof Error ? error.message : String(error)}`,
    }, { status: 500 });
  }
}
