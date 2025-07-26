import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const priceType = searchParams.get("priceType");
    const enrollmentFilter = searchParams.get("enrollmentFilter") || "all";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Get user enrollments if enrollment filtering is requested
    let userEnrollments: string[] = [];
    if (enrollmentFilter !== "all") {
      try {
        const clientSupabase = createClient();
        const { data: { user } } = await clientSupabase.auth.getUser();
        
        if (user) {
          const { data: enrollmentData } = await supabase
            .from("enrollments")
            .select("certification_id")
            .eq("user_id", user.id)
            .gte("expires_at", new Date().toISOString());
          
          userEnrollments = (enrollmentData || []).map((e: any) => e.certification_id);
        }
      } catch (error) {
        console.error("Error fetching user enrollments:", error);
        // Continue without enrollment filtering if there's an error
      }
    }

    let query = supabase
      .from("certifications")
      .select(
        `
        id,
        name,
        slug,
        description,
        detailed_description,
        price_cents,
        exam_count,
        total_questions,
        is_active,
        is_featured,
        created_at,
        updated_at,
        certification_categories(
          name,
          slug,
          description,
          icon,
          color,
          sort_order
        ),
        practice_exams(
          id,
          question_count,
          is_active
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true);

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

    // Apply enrollment filter
    if (enrollmentFilter === "enrolled" && userEnrollments.length > 0) {
      query = query.in("id", userEnrollments);
    } else if (enrollmentFilter === "not_enrolled" && userEnrollments.length > 0) {
      query = query.not("id", "in", `(${userEnrollments.join(",")})`);
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

    // Filter out certifications without active practice exams and calculate correct exam counts
    const processedCertifications = (data || [])
      .filter((cert: any) => {
        const activeExams = cert.practice_exams?.filter((exam: any) => exam.is_active) || [];
        return activeExams.length > 0;
      })
      .map((cert: any) => {
        const activeExams = cert.practice_exams?.filter((exam: any) => exam.is_active) || [];
        const calculatedExamCount = activeExams.length;
        const calculatedQuestionTotal = activeExams.reduce(
          (sum: number, exam: any) => sum + (exam.question_count || 0),
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
      total: processedCertifications.length,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
