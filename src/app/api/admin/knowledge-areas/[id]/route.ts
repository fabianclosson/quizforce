import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  handleApiError,
  createDatabaseError,
  createAuthorizationError,
  createNotFoundError,
  createValidationError,
} from "@/lib/api-error-handler";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/knowledge-areas/[id]
 * Get a single knowledge area by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { isAdmin } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        createAuthorizationError("Admin access required"),
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: knowledgeArea, error } = await supabase
      .from("knowledge_areas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          createNotFoundError("Knowledge area not found"),
          { status: 404 }
        );
      }
      return NextResponse.json(
        createDatabaseError("Failed to fetch knowledge area"),
        { status: 500 }
      );
    }

    return NextResponse.json({ knowledgeArea });
  } catch (error) {
    return handleApiError(error, request);
  }
}

/**
 * PATCH /api/admin/knowledge-areas/[id]
 * Update a knowledge area
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify admin authentication
    const { isAdmin } = await verifyAdminAccess();

    if (!isAdmin) {
      return NextResponse.json(
        createAuthorizationError("Admin access required"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, weight_percentage, sort_order } = body;

    // Basic validation
    if (!name || weight_percentage === undefined) {
      return NextResponse.json(
        createValidationError(
          "Missing required fields: name, weight_percentage"
        ),
        { status: 400 }
      );
    }

    // Validate weight percentage range
    if (weight_percentage < 1 || weight_percentage > 100) {
      return NextResponse.json(
        createValidationError("Weight percentage must be between 1 and 100"),
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check if knowledge area exists
    const { data: existingArea } = await supabase
      .from("knowledge_areas")
      .select("id, certification_id")
      .eq("id", id)
      .single();

    if (!existingArea) {
      return NextResponse.json(
        createNotFoundError("Knowledge area not found"),
        { status: 404 }
      );
    }

    // Update knowledge area
    const { data: knowledgeArea, error } = await supabase
      .from("knowledge_areas")
      .update({
        name,
        description: description || null,
        weight_percentage: parseInt(weight_percentage),
        sort_order: sort_order !== undefined ? parseInt(sort_order) : 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating knowledge area:", error);
      return NextResponse.json(
        createDatabaseError("Failed to update knowledge area", {
          error: error.message,
        }),
        { status: 500 }
      );
    }

    return NextResponse.json({ knowledgeArea });
  } catch (error) {
    console.error("Error in PATCH /api/admin/knowledge-areas/[id]:", error);
    return handleApiError(error, request);
  }
}

/**
 * DELETE /api/admin/knowledge-areas/[id]
 * Delete a knowledge area
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
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

    // Check if knowledge area exists
    const { data: existingArea } = await supabase
      .from("knowledge_areas")
      .select("id, name")
      .eq("id", id)
      .single();

    if (!existingArea) {
      return NextResponse.json(
        createNotFoundError("Knowledge area not found"),
        { status: 404 }
      );
    }

    // Delete the knowledge area
    const { error } = await supabase
      .from("knowledge_areas")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting knowledge area:", error);
      return NextResponse.json(
        createDatabaseError("Failed to delete knowledge area", {
          error: error.message,
        }),
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Knowledge area deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/knowledge-areas/[id]:", error);
    return handleApiError(error, request);
  }
}
