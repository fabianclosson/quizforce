import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
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
