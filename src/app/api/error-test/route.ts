import { NextRequest, NextResponse } from "next/server";
import {
  withApiErrorHandler,
  createValidationError,
  createAuthenticationError,
  createNotFoundError,
  createRateLimitError,
  createInternalServerError,
  withDatabaseErrorHandling,
  withExternalApiErrorHandling,
} from "@/lib/api-error-handler";

async function handleErrorTest(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const errorType = url.searchParams.get("type");
  const message = url.searchParams.get("message") || "Test error message";

  switch (errorType) {
    case "validation":
      throw createValidationError(message, {
        field: "testField",
        value: "invalidValue",
        expectedFormat: "email",
      });

    case "authentication":
      throw createAuthenticationError(message);

    case "not-found":
      throw createNotFoundError(message);

    case "rate-limit":
      throw createRateLimitError(message);

    case "database":
      // Simulate database error with wrapper
      await withDatabaseErrorHandling(
        async () => {
          throw new Error("Database connection failed");
        },
        {
          operation: "test_database_operation",
          table: "test_table",
        }
      );
      break;

    case "external-api":
      // Simulate external API error with wrapper
      await withExternalApiErrorHandling(
        async () => {
          throw new Error("External service unavailable");
        },
        "TestAPI",
        {
          endpoint: "/test",
          timeout: 5000,
        }
      );
      break;

    case "internal":
      throw createInternalServerError(message, {
        component: "error-test",
        operation: "test_internal_error",
      });

    case "unhandled":
      // Simulate an unhandled error
      throw new Error("This is an unhandled error for testing");

    case "async":
      // Simulate an async error
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Async operation failed"));
        }, 100);
      });
      break;

    default:
      return NextResponse.json({
        message: "Error test API endpoint",
        availableTypes: [
          "validation",
          "authentication",
          "not-found",
          "rate-limit",
          "database",
          "external-api",
          "internal",
          "unhandled",
          "async",
        ],
        usage:
          "Add ?type=<errorType>&message=<customMessage> to test different error types",
        examples: [
          "/api/error-test?type=validation&message=Invalid email format",
          "/api/error-test?type=database&message=Connection timeout",
          "/api/error-test?type=external-api&message=Payment service down",
        ],
      });
  }

  // This should never be reached due to errors above
  return NextResponse.json({ message: "Error test completed" });
}

// Export with error handling wrapper
export const GET = withApiErrorHandler(handleErrorTest);
export const POST = withApiErrorHandler(handleErrorTest);
