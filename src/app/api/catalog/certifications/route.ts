import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const priceType = searchParams.get("priceType");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    let query = supabase
      .from("certifications")
      .select(
        `
        *,
        certification_categories!inner(*),
        practice_exams!inner(
          id,
          question_count
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .eq("practice_exams.is_active", true);

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("certification_categories.slug", category);
    }

    if (priceType === "free") {
      query = query.eq("price_cents", 0);
    } else if (priceType === "premium") {
      query = query.gt("price_cents", 0);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by featured first, then by name
    query = query.order("is_featured", { ascending: false });
    query = query.order("name", { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching certifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch certifications" },
        { status: 500 }
      );
    }

    // Calculate correct exam counts and question totals for certifications
    const processedCertifications = (data || []).map((cert: { practice_exams?: { question_count?: number }[] }) => {
      const practiceExams = cert.practice_exams || [];
      const calculatedExamCount = practiceExams.length;
      const calculatedQuestionTotal = practiceExams.reduce(
        (sum: number, exam: { question_count?: number }) => sum + (exam.question_count || 0),
        0
      );

      // Remove practice_exams from the response and add calculated values
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { practice_exams: _, ...certWithoutExams } = cert;

      return {
        ...certWithoutExams,
        exam_count: calculatedExamCount,
        total_questions: calculatedQuestionTotal,
      };
    });

    return NextResponse.json({
      certifications: processedCertifications,
      total: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
