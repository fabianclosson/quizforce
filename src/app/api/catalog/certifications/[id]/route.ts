import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Certification ID is required" },
        { status: 400 }
      );
    }

    // Fetch the certification with its category and practice exams for accurate counts
    const { data: certification, error } = await supabase
      .from("certifications")
      .select(
        `
        id,
        name,
        slug,
        description,
        price_cents,
        exam_count,
        total_questions,
        is_active,
        is_featured,
        created_at,
        updated_at,
        certification_categories(
          id,
          name,
          slug
        ),
        practice_exams(
          id,
          question_count
        )
      `
      )
      .eq("id", id)
      .eq("is_active", true)
      .eq("practice_exams.is_active", true)
      .single();

    if (error) {
      console.error("Database error fetching certification:", error);

      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          { error: "Certification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch certification", details: error.message },
        { status: 500 }
      );
    }

    // Also fetch related knowledge areas for this certification
    const { data: knowledgeAreas, error: kaError } = await supabase
      .from("knowledge_areas")
      .select("id, name, description, weight_percentage, sort_order")
      .eq("certification_id", id)
      .order("sort_order", { ascending: true });

    if (kaError) {
      console.error("Error fetching knowledge areas:", kaError);
      // Don't fail the whole request, just continue without knowledge areas
    }

    // Calculate correct exam counts and question totals
    const practiceExams = certification.practice_exams || [];
    const calculatedExamCount = practiceExams.length;
    const calculatedQuestionTotal = practiceExams.reduce(
      (sum: number, exam: { question_count?: number }) => sum + (exam.question_count || 0),
      0
    );

    // Remove practice_exams from the response and add calculated values
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { practice_exams: _, ...certWithoutExams } = certification;

    // Return certification with category and knowledge areas
    const response = {
      certification: {
        ...certWithoutExams,
        exam_count: calculatedExamCount,
        total_questions: calculatedQuestionTotal,
        knowledge_areas: knowledgeAreas || [],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/catalog/certifications/[id]:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
