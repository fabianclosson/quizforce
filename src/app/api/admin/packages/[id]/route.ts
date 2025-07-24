import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { z } from "zod";
import { Validators } from "@/lib/validators";

// Use centralized validation schema with extensions for API-specific fields
const updatePackageSchema = Validators.Admin.packageUpdate.extend({
  name: z.string().min(1, "Package name is required").optional(),
  slug: z.string().min(1, "Package slug is required").optional(),
  detailed_description: z.string().optional(),
  price_cents: z.number({ message: "Price must be a number" }).min(0, "Price must be non-negative").optional(),
  discount_percentage: z.number({ message: "Discount must be a number" }).min(0).max(100).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  valid_months: z.number({ message: "Valid months must be a number" }).min(1).optional(),
  sort_order: z.number({ message: "Sort order must be a number" }).optional(),
  certification_ids: z
    .array(Validators.Patterns.uuid)
    .min(1, "At least one certification is required")
    .optional(),
});

// GET /api/admin/packages/[id] - Get package details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = createClient();

    // Get package with certifications
    const { data: packageData, error } = await supabase
      .from("certification_packages")
      .select(
        `
        id,
        name,
        slug,
        description,
        detailed_description,
        price_cents,
        discount_percentage,
        is_active,
        is_featured,
        valid_months,
        sort_order,
        created_at,
        updated_at,
        package_certifications(
          certification_id,
          sort_order,
          certifications(
            id,
            name,
            price_cents,
            category_id,
            certification_categories!inner(
              name
            )
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching package:", error);
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Calculate package statistics
    interface PackageCertification {
      certifications: Array<{
        id: string;
        name: string;
        price_cents: number | null;
      }> | null;
    }

    const certifications = (packageData.package_certifications || []).flatMap(
      (pc: PackageCertification) => pc.certifications ?? []
    );
    const individualTotal = certifications.reduce(
      (
        sum: number,
        cert: {
          price_cents: number | null;
        }
      ) => sum + (cert.price_cents || 0),
      0
    );
    const savings = individualTotal - (packageData.price_cents || 0);
    const savingsPercentage =
      individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0;

    const processedPackage = {
      ...packageData,
      certification_count: certifications.length,
      individual_total_cents: individualTotal,
      savings_cents: savings,
      savings_percentage: savingsPercentage,
      certifications,
    };

    return NextResponse.json({ package: processedPackage });
  } catch (error) {
    console.error("Error in GET /api/admin/packages/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/packages/[id] - Update package
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePackageSchema.parse(body);

    const supabase = createClient();

    // Extract certification_ids for separate handling
    const { certification_ids, ...packageUpdates } = validatedData;

    // Update package details if provided
    if (Object.keys(packageUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from("certification_packages")
        .update(packageUpdates)
        .eq("id", id);

      if (updateError) {
        console.error("Error updating package:", updateError);
        return NextResponse.json(
          { error: "Failed to update package" },
          { status: 500 }
        );
      }
    }

    // Update certification associations if provided
    if (certification_ids) {
      // Delete existing associations
      const { error: deleteError } = await supabase
        .from("package_certifications")
        .delete()
        .eq("package_id", id);

      if (deleteError) {
        console.error("Error deleting package associations:", deleteError);
        return NextResponse.json(
          { error: "Failed to update package associations" },
          { status: 500 }
        );
      }

      // Create new associations
      const packageCertifications = certification_ids.map((certId, index) => ({
        package_id: id,
        certification_id: certId,
        sort_order: index,
      }));

      const { error: insertError } = await supabase
        .from("package_certifications")
        .insert(packageCertifications);

      if (insertError) {
        console.error("Error creating package associations:", insertError);
        return NextResponse.json(
          { error: "Failed to update package associations" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Package updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error in PATCH /api/admin/packages/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/packages/[id] - Delete package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = createClient();

    // Check if package exists
    const { data: existingPackage, error: fetchError } = await supabase
      .from("certification_packages")
      .select("id, name")
      .eq("id", id)
      .single();

    if (fetchError || !existingPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Delete package (associations will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from("certification_packages")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting package:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete package" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/packages/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
