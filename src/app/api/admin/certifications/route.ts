import { NextRequest, NextResponse } from "next/server";
import { adminRouteGuard } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase";

/**
 * GET /api/admin/certifications
 * List all certifications for admin management
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const supabase = createClient();

    // Build query
    let query = supabase
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
        created_at,
        updated_at,
        certification_categories!inner(
          id,
          name,
          slug
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Apply category filter
    if (category) {
      query = query.eq("certification_categories.slug", category);
    }

    const { data: certifications, error } = await query;

    if (error) {
      console.error("Error fetching certifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch certifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ certifications });
  } catch (error) {
    console.error("Admin certifications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/certifications
 * Create a new certification
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const body = await request.json();
    const {
      name,
      slug,
      description,
      detailed_description,
      price_cents,
      is_featured,
      is_active,
      image_url,
    } = body;

    // Basic validation
    if (!name || !slug || !description || price_cents === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, slug, description, price_cents",
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if slug already exists
    const { data: existingCert } = await supabase
      .from("certifications")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingCert) {
      return NextResponse.json(
        { error: "A certification with this slug already exists" },
        { status: 409 }
      );
    }

    // Create certification
    const { data: certification, error } = await supabase
      .from("certifications")
      .insert({
        name,
        slug,
        description,
        detailed_description: detailed_description || null,
        price_cents: parseInt(price_cents),
        is_featured: Boolean(is_featured),
        is_active: Boolean(is_active),
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating certification:", error);
      return NextResponse.json(
        { error: "Failed to create certification" },
        { status: 500 }
      );
    }

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/certifications:", error);
    return NextResponse.json(
      { error: "Failed to create certification" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/certifications
 * Update an existing certification
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const body = await request.json();
    const {
      id,
      name,
      slug,
      description,
      detailed_description,
      price_cents,
      is_featured,
      is_active,
      image_url,
    } = body;

    // Basic validation
    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if certification exists
    const { data: existingCert } = await supabase
      .from("certifications")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingCert) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug) {
      const { data: slugCheck } = await supabase
        .from("certifications")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (slugCheck) {
        return NextResponse.json(
          { error: "A certification with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Update certification
    const updateData: {
      name?: string;
      slug?: string;
      description?: string;
      detailed_description?: string;
      price_cents?: number;
      is_featured?: boolean;
      is_active?: boolean;
      image_url?: string;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (detailed_description !== undefined)
      updateData.detailed_description = detailed_description;
    if (price_cents !== undefined)
      updateData.price_cents = parseInt(price_cents as string);
    if (is_featured !== undefined)
      updateData.is_featured = Boolean(is_featured);
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);
    if (image_url !== undefined) updateData.image_url = image_url;

    const { data: certification, error } = await supabase
      .from("certifications")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating certification:", error);
      return NextResponse.json(
        { error: "Failed to update certification" },
        { status: 500 }
      );
    }

    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error in PUT /api/admin/certifications:", error);
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/certifications
 * Delete a certification
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if certification exists
    const { data: existingCert } = await supabase
      .from("certifications")
      .select("id, name")
      .eq("id", id)
      .single();

    if (!existingCert) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // Delete certification
    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting certification:", error);
      return NextResponse.json(
        { error: "Failed to delete certification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Certification deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/certifications:", error);
    return NextResponse.json(
      { error: "Failed to delete certification" },
      { status: 500 }
    );
  }
}
