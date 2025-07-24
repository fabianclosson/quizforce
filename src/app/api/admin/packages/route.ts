import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { z } from "zod";

// Schema for package creation
const createPackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  slug: z.string().min(1, "Package slug is required"),
  description: z.string().optional(),
  detailed_description: z.string().optional(),
  price_cents: z.number().min(0, "Price must be non-negative"),
  discount_percentage: z.number().min(0).max(100),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  valid_months: z.number().min(1).default(12),
  sort_order: z.number().default(0),
  certification_ids: z
    .array(z.string().uuid())
    .min(1, "At least one certification is required"),
});

// GET /api/admin/packages - List all packages
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build query with search functionality
    let query = supabase
      .from("certification_packages")
      .select(
        `
        id,
        name,
        slug,
        description,
        price_cents,
        discount_percentage,
        is_active,
        is_featured,
        valid_months,
        sort_order,
        created_at,
        updated_at,
        package_certifications!inner(
          certification_id,
          certifications!inner(
            id,
            name,
            price_cents
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from("certification_packages")
      .select("*", { count: "exact", head: true });

    // Get paginated results
    const { data: packages, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching packages:", error);
      return NextResponse.json(
        { error: "Failed to fetch packages" },
        { status: 500 }
      );
    }

    // Calculate package statistics
    const processedPackages =
      packages?.map(pkg => {
        const certifications = (pkg.package_certifications || []).flatMap(
          (pc: {
            certifications:
              | {
                  id: string;
                  name: string;
                  price_cents: number | null;
                }[]
              | null;
          }) => pc.certifications ?? []
        );
        const individualTotal = certifications.reduce(
          (sum: number, cert: { price_cents: number | null }) =>
            sum + (cert.price_cents || 0),
          0
        );
        const savings = individualTotal - (pkg.price_cents || 0);
        const savingsPercentage =
          individualTotal > 0
            ? Math.round((savings / individualTotal) * 100)
            : 0;

        return {
          id: pkg.id,
          name: pkg.name,
          slug: pkg.slug,
          description: pkg.description,
          price_cents: pkg.price_cents,
          discount_percentage: pkg.discount_percentage,
          is_active: pkg.is_active,
          is_featured: pkg.is_featured,
          valid_months: pkg.valid_months,
          sort_order: pkg.sort_order,
          created_at: pkg.created_at,
          updated_at: pkg.updated_at,
          certification_count: certifications.length,
          individual_total_cents: individualTotal,
          savings_cents: savings,
          savings_percentage: savingsPercentage,
          certifications,
        };
      }) || [];

    return NextResponse.json({
      packages: processedPackages,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/packages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/packages - Create new package
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createPackageSchema.parse(body);

    const supabase = await createServerSupabaseClient();

    // Start a transaction by creating the package first
    const { data: newPackage, error: packageError } = await supabase
      .from("certification_packages")
      .insert({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        detailed_description: validatedData.detailed_description,
        price_cents: validatedData.price_cents,
        discount_percentage: validatedData.discount_percentage,
        is_active: validatedData.is_active,
        is_featured: validatedData.is_featured,
        valid_months: validatedData.valid_months,
        sort_order: validatedData.sort_order,
      })
      .select()
      .single();

    if (packageError) {
      console.error("Error creating package:", packageError);
      return NextResponse.json(
        { error: "Failed to create package" },
        { status: 500 }
      );
    }

    // Create package-certification associations
    const packageCertifications = validatedData.certification_ids.map(
      (certId, index) => ({
        package_id: newPackage.id,
        certification_id: certId,
        sort_order: index,
      })
    );

    const { error: associationError } = await supabase
      .from("package_certifications")
      .insert(packageCertifications);

    if (associationError) {
      console.error("Error creating package associations:", associationError);
      // Rollback: delete the package
      await supabase
        .from("certification_packages")
        .delete()
        .eq("id", newPackage.id);

      return NextResponse.json(
        { error: "Failed to create package associations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error in POST /api/admin/packages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
