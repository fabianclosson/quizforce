import { NextRequest, NextResponse } from "next/server";
import { getCSRFToken } from "@/lib/csrf";

/**
 * GET /api/csrf-token
 * Returns a CSRF token for the current session
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getCSRFToken();
    
    return NextResponse.json({
      csrfToken: token,
      success: true,
    });
  } catch (error) {
    console.error("Failed to generate CSRF token:", error);
    
    return NextResponse.json(
      {
        error: "Failed to generate CSRF token",
        success: false,
      },
      { status: 500 }
    );
  }
}
