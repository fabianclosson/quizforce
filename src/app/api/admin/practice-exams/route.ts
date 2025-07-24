import { NextRequest, NextResponse } from "next/server";
import { adminRouteGuard } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const supabase = createClient();

    let query = supabase
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
      .order("created_at", { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: practiceExams, error } = await query;

    if (error) {
      console.error("Error fetching practice exams:", error);
      return NextResponse.json(
        { error: "Failed to fetch practice exams" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      practiceExams: practiceExams || [],
    });
  } catch (error) {
    console.error("Error in practice exams API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

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
      !passing_threshold_percentage
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, certification_id, question_count, time_limit_minutes, passing_threshold_percentage",
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

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

    // Create practice exam
    const { data: practiceExam, error } = await supabase
      .from("practice_exams")
      .insert({
        name,
        description: description || null,
        certification_id,
        question_count: parseInt(question_count),
        time_limit_minutes: parseInt(time_limit_minutes),
        passing_threshold_percentage: parseInt(passing_threshold_percentage),
        sort_order: parseInt(sort_order) || 0,
        is_active: Boolean(is_active),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating practice exam:", error);
      return NextResponse.json(
        { error: "Failed to create practice exam" },
        { status: 500 }
      );
    }

    return NextResponse.json(practiceExam, { status: 201 });
  } catch (error) {
    console.error("Error in POST practice exams API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await adminRouteGuard();
    if (adminCheck) return adminCheck;

    const body = await request.json();
    const { id, is_active } = body;

    if (!id || is_active === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: id, is_active" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: practiceExam, error } = await supabase
      .from("practice_exams")
      .update({ is_active })
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
    console.error("Error in PUT practice exams API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Delete the practice exam (cascade will handle related records)
    const { error } = await supabase
      .from("practice_exams")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting practice exam:", error);
      return NextResponse.json(
        { error: "Failed to delete practice exam" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE practice exams API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
