import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { maybeAuthenticated } from "@/lib/auth-middleware";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export const GET = maybeAuthenticated(async (request: NextRequest, { user, supabase }, { params }: RouteParams) => {
  try {
    const { id } = await params;
    console.log("🔍 Practice exam API called with ID:", id);

    // Use service role client to bypass RLS for practice exam data
    const serviceSupabase = createServiceSupabaseClient();

    // Get practice exam with certification data using service role
    const { data: practiceExam, error } = await serviceSupabase
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
        updated_at
      `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching practice exam:", error);
      return NextResponse.json(
        { error: "Practice exam not found" },
        { status: 404 }
      );
    }

    if (!practiceExam) {
      return NextResponse.json(
        { error: "Practice exam not found" },
        { status: 404 }
      );
    }

    // Get certification data separately
    const { data: certification, error: certError } = await serviceSupabase
      .from("certifications")
      .select(
        `
        id,
        name,
        slug,
        description,
        price_cents,
        is_active,
        category_id
      `
      )
      .eq("id", practiceExam.certification_id)
      .single();

    if (certError || !certification) {
      console.error("Error fetching certification:", certError);
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // Get certification category separately
    const { data: category, error: categoryError } = await serviceSupabase
      .from("certification_categories")
      .select(
        `
        id,
        name,
        slug,
        icon,
        color
      `
      )
      .eq("id", certification.category_id)
      .single();

    if (categoryError) {
      console.error("Error fetching category:", categoryError);
      // Continue without category rather than failing
    }

    // Get knowledge areas for this certification separately
    const { data: knowledgeAreas, error: kaError } = await serviceSupabase
      .from("knowledge_areas")
      .select(
        `
        id,
        name,
        description,
        weight_percentage
      `
      )
      .eq("certification_id", practiceExam.certification_id)
      .order("sort_order");

    if (kaError) {
      console.error("Error fetching knowledge areas:", kaError);
      // Continue without knowledge areas rather than failing
    }

    // Get question counts per knowledge area for this practice exam
    let questionCounts: Record<string, number> = {};
    if (knowledgeAreas && knowledgeAreas.length > 0) {
      const knowledgeAreaIds = knowledgeAreas.map(ka => ka.id);
      const { data: questionCountData, error: questionCountError } =
        await serviceSupabase
          .from("questions")
          .select("knowledge_area_id")
          .eq("practice_exam_id", practiceExam.id)
          .in("knowledge_area_id", knowledgeAreaIds);

      if (questionCountError) {
        console.error("Error fetching question counts:", questionCountError);
        // Continue without question counts rather than failing
      } else if (questionCountData) {
        // Count questions per knowledge area
        questionCounts = questionCountData.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc: Record<string, number>, question: any) => {
            acc[question.knowledge_area_id] =
              (acc[question.knowledge_area_id] || 0) + 1;
            return acc;
          },
          {}
        );
      }
    }

    // Check if certification is active
    if (!certification?.is_active) {
      return NextResponse.json(
        { error: "This certification is no longer available" },
        { status: 404 }
      );
    }

    // Get user enrollment status if authenticated (user is already available from middleware)
    let isEnrolled = false;
    if (user && user.id) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("certification_id", practiceExam.certification_id)
        .gte("expires_at", new Date().toISOString())
        .single();

      isEnrolled = !!enrollment;
    }

    // Get user attempt statistics
    let previousAttempts = 0;
    let bestScore: number | undefined;
    if (user && user.id) {
      const { data: attempts } = await supabase
        .from("exam_attempts")
        .select("score_percentage")
        .eq("user_id", user.id)
        .eq("practice_exam_id", practiceExam.id)
        .eq("status", "completed");

      previousAttempts = attempts?.length || 0;
      if (attempts && attempts.length > 0) {
        bestScore = Math.max(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...attempts.map((a: any) => a.score_percentage || 0)
        );
      }
    }

    // Transform data to match expected PreExamData interface
    const preExamData = {
      practice_exam: {
        id: practiceExam.id,
        name: practiceExam.name,
        description: practiceExam.description,
        question_count: practiceExam.question_count,
        time_limit_minutes: practiceExam.time_limit_minutes,
        passing_threshold_percentage: practiceExam.passing_threshold_percentage,
        certification: {
          name: certification.name,
          category: {
            name: category?.name || "Unknown",
            color: category?.color || "#gray",
          },
        },
      },
      user_status: {
        is_enrolled: isEnrolled,
        previous_attempts: previousAttempts,
        best_score: bestScore,
        can_retake: true, // TODO: Implement retake logic based on business rules
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      knowledge_areas: (knowledgeAreas || []).map((ka: any) => ({
        id: ka.id,
        name: ka.name,
        weight_percentage: ka.weight_percentage,
        question_count: questionCounts[ka.id] || 0,
      })),
    };

    return NextResponse.json(preExamData);
  } catch (error) {
    console.error("Error in practice exam API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
