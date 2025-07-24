import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isEnrolled: false }, { status: 200 });
    }

    // Check if user is enrolled in this certification
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("certification_id", id)
      .maybeSingle();

    if (enrollmentError) {
      console.error("Error checking enrollment:", enrollmentError);
      return NextResponse.json({ isEnrolled: false }, { status: 200 });
    }

    return NextResponse.json({ isEnrolled: !!enrollment }, { status: 200 });
  } catch (error) {
    console.error("Error in enrollment status check:", error);
    return NextResponse.json({ isEnrolled: false }, { status: 200 });
  }
}
