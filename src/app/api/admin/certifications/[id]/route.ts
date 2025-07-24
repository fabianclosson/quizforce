import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  handleApiError,
  createDatabaseError,
  createAuthorizationError,
  createNotFoundError,
} from "@/lib/api-error-handler";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/certifications/[id]
 * Get a single certification by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

    // Verify admin authentication
    const { isAdmin } = await verifyAdminAccess();

    if (!isAdmin) {
      return NextResponse.json(
        createAuthorizationError("Admin access required"),
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Fetch the certification with its category
    const { data: certification, error } = await supabase
      .from("certifications")
      .select(
        `
        id,
        name,
        slug,
        description,
        price_cents,
        exam_count,
        total_questions,
        is_active,
        is_featured,
        category,
        image_url,
        created_at,
        updated_at,
        certification_categories!inner(
          id,
          name,
          slug
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          createNotFoundError("Certification not found"),
          { status: 404 }
        );
      }

      console.error("Database error fetching certification:", error);
      return NextResponse.json(
        createDatabaseError("Failed to fetch certification", {
          error: error.message,
        }),
        { status: 500 }
      );
    }

    return NextResponse.json({ certification });
  } catch (error) {
    console.error("Error in GET /api/admin/certifications/[id]:", error);
    return handleApiError(error, request);
  }
}
