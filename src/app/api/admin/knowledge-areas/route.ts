import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  handleApiError,
  createValidationError,
  createDatabaseError,
  createAuthorizationError,
} from "@/lib/api-error-handler";

interface KnowledgeAreaWithCertification {
  id: string;
  certification_id: string;
  name: string;
  description: string | null;
  weight_percentage: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  certification: {
    name: string;
    slug: string;
  };
}

interface RawKnowledgeArea {
  id: string;
  certification_id: string;
  name: string;
  description: string | null;
  weight_percentage: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  certification: {
    name: string;
    slug: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const { isAdmin } = await verifyAdminAccess();

    if (!isAdmin) {
      return NextResponse.json(
        createAuthorizationError("Admin access required"),
        { status: 403 }
      );
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        createValidationError("Invalid pagination parameters"),
        { status: 400 }
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the base query with join
    let query = supabase.from("knowledge_areas").select(
      `
        id,
        certification_id,
        name,
        description,
        weight_percentage,
        sort_order,
        created_at,
        updated_at,
        certification:certifications!inner(name, slug)
      `,
      { count: "exact" }
    );

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: rawData, error, count } = await query;

    if (error) {
      console.error("Database error fetching knowledge areas:", error);
      return NextResponse.json(
        createDatabaseError("Failed to fetch knowledge areas", {
          error: error.message,
        }),
        { status: 500 }
      );
    }

    // Transform the data to match our interface
    const knowledgeAreas: KnowledgeAreaWithCertification[] =
      rawData?.map((item: RawKnowledgeArea) => ({
        id: item.id,
        certification_id: item.certification_id,
        name: item.name,
        description: item.description,
        weight_percentage: item.weight_percentage,
        sort_order: item.sort_order,
        created_at: item.created_at,
        updated_at: item.updated_at,
        certification: Array.isArray(item.certification)
          ? item.certification[0]
          : item.certification,
      })) || [];

    // Calculate pagination metadata
    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      knowledge_areas: knowledgeAreas,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error in knowledge areas GET:", error);
    return handleApiError(error, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const { isAdmin } = await verifyAdminAccess();

    if (!isAdmin) {
      return NextResponse.json(
        createAuthorizationError("Admin access required"),
        { status: 403 }
      );
    }

    const supabase = createClient();
    const body = await request.json();

    // Validate required fields
    const {
      certification_id,
      name,
      description,
      weight_percentage,
      sort_order = 0,
    } = body;

    if (!certification_id || !name || weight_percentage === undefined) {
      return NextResponse.json(
        createValidationError(
          "Missing required fields: certification_id, name, weight_percentage"
        ),
        { status: 400 }
      );
    }

    // Validate weight percentage
    if (weight_percentage < 1 || weight_percentage > 100) {
      return NextResponse.json(
        createValidationError("Weight percentage must be between 1 and 100"),
        { status: 400 }
      );
    }

    // Verify certification exists
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("id")
      .eq("id", certification_id)
      .single();

    if (certError || !certification) {
      return NextResponse.json(
        createValidationError("Invalid certification ID"),
        { status: 400 }
      );
    }

    // Insert the knowledge area
    const { data: knowledgeArea, error: insertError } = await supabase
      .from("knowledge_areas")
      .insert({
        certification_id,
        name: name.trim(),
        description: description?.trim() || null,
        weight_percentage,
        sort_order,
      })
      .select(
        `
        id,
        certification_id,
        name,
        description,
        weight_percentage,
        sort_order,
        created_at,
        updated_at,
        certification:certifications!inner(name, slug)
      `
      )
      .single();

    if (insertError) {
      console.error("Database error creating knowledge area:", insertError);

      // Handle unique constraint violation
      if (insertError.code === "23505") {
        return NextResponse.json(
          createValidationError(
            "A knowledge area with this name already exists for this certification"
          ),
          { status: 409 }
        );
      }

      return NextResponse.json(
        createDatabaseError("Failed to create knowledge area", {
          error: insertError.message,
        }),
        { status: 500 }
      );
    }

    // Transform the response data
    const transformedKnowledgeArea = {
      ...knowledgeArea,
      certification: Array.isArray(knowledgeArea.certification)
        ? knowledgeArea.certification[0]
        : knowledgeArea.certification,
    };

    return NextResponse.json(
      {
        message: "Knowledge area created successfully",
        knowledge_area: transformedKnowledgeArea,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in knowledge areas POST:", error);
    return handleApiError(error, request);
  }
}
