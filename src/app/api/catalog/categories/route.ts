import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();
    
    // Get all active categories from certification_categories table
    const { data: categories, error } = await supabase
      .from("certification_categories")
      .select("name, slug, description, icon, color, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      categories: categories || [],
      count: categories?.length || 0,
    });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
