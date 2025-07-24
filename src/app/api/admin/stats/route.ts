import { NextResponse } from "next/server";
import { adminRouteGuard, getAdminStats } from "@/lib/admin-auth";

export async function GET() {
  try {
    // Check admin access
    const accessDenied = await adminRouteGuard();
    if (accessDenied) {
      return accessDenied;
    }

    // Get admin statistics
    const stats = await getAdminStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Admin stats API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
