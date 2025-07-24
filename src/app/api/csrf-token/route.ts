import { NextRequest, NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/csrf";
import { ApiValidationMiddleware } from "@/lib/api-validation-helpers";
import { SecurityValidators } from "@/lib/api-validation-helpers";

/**
 * GET /api/csrf-token
 *
 * Provides a CSRF token for client-side use.
 * This endpoint is used to get a valid CSRF token for forms and AJAX requests.
 */
export async function GET(request: NextRequest) {
  try {
    // Validate request security
    const securityValidation =
      SecurityValidators.validateRequestSecurity(request);

    if (!securityValidation.isValid) {
      console.warn(
        "CSRF token request failed security validation:",
        securityValidation.errors
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Request failed security validation",
            code: "SECURITY_VALIDATION_FAILED",
          },
        },
        { status: 400 }
      );
    }

    // Generate CSRF token
    const token = await generateCSRFToken();

    return ApiValidationMiddleware.createSuccessResponse(
      {
        csrfToken: token,
        message: "CSRF token generated successfully",
      },
      200
    );
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to generate CSRF token",
          code: "CSRF_GENERATION_FAILED",
        },
      },
      { status: 500 }
    );
  }
}
