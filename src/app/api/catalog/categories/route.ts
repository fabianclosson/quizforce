import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all unique categories from certifications
    const { data: certifications, error } = await supabase
      .from("certifications")
      .select("category")
      .not("category", "is", null);

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    // Extract unique categories
    const categories = [
      ...new Set(certifications?.map((cert: { category: string }) => cert.category)),
    ].filter(Boolean);

    return NextResponse.json({
      categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
