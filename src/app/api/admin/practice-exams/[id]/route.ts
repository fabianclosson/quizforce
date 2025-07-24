import { NextRequest, NextResponse } from "next/server";
import { adminRouteGuard } from "@/lib/admin-auth";
import { createServerSupabaseClient } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const { id } = await params;

    const supabase = await createServerSupabaseClient();

    const { data: practiceExam, error } = await supabase
      .from("practice_exams")
      .select(
        `
        id,
        certification_id,
        name,
        description,
        question_count,
        time_limit_minutes,
        passing_threshold_percentage,
        sort_order,
        is_active,
        created_at,
        updated_at,
        certifications (
          id,
          name,
          slug
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching practice exam:", error);
      return NextResponse.json(
        { error: "Practice exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ practiceExam });
  } catch (error) {
    console.error("Error in GET practice exam API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      certification_id,
      question_count,
      time_limit_minutes,
      passing_threshold_percentage,
      sort_order,
      is_active,
    } = body;

    // Basic validation
    if (
      !name ||
      !certification_id ||
      !question_count ||
      !time_limit_minutes ||
      passing_threshold_percentage === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, certification_id, question_count, time_limit_minutes, passing_threshold_percentage",
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check if certification exists
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("id, name")
      .eq("id", certification_id)
      .single();

    if (certError || !certification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // Update practice exam
    const { data: practiceExam, error } = await supabase
      .from("practice_exams")
      .update({
        name,
        description: description || null,
        certification_id,
        question_count: parseInt(question_count),
        time_limit_minutes: parseInt(time_limit_minutes),
        passing_threshold_percentage: parseInt(passing_threshold_percentage),
        sort_order: parseInt(sort_order) || 0,
        is_active: Boolean(is_active),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating practice exam:", error);
      return NextResponse.json(
        { error: "Failed to update practice exam" },
        { status: 500 }
      );
    }

    return NextResponse.json(practiceExam);
  } catch (error) {
    console.error("Error in PATCH practice exam API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const { id } = await params;

    const supabase = await createServerSupabaseClient();

    // Check if practice exam exists
    const { data: practiceExam, error: fetchError } = await supabase
      .from("practice_exams")
      .select("id, name")
      .eq("id", id)
      .single();

    if (fetchError || !practiceExam) {
      return NextResponse.json(
        { error: "Practice exam not found" },
        { status: 404 }
      );
    }

    // Delete practice exam
    const { error: deleteError } = await supabase
      .from("practice_exams")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting practice exam:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete practice exam" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Practice exam deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE practice exam API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
