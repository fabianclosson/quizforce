import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    // Create Supabase client safely inside the function
    const supabase = await createServerSupabaseClient();
    
    // Test admin access by checking admin users
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("role", "admin");

    if (error) {
      return NextResponse.json(
        { error: "Failed to check admin access", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      adminUsers: profiles?.length || 0,
      admins: profiles || [],
      message: "Admin endpoint accessible",
    });
  } catch (error) {
    console.error("Admin test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
