import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const priceType = searchParams.get("priceType") || "all";
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

    // Fetch certifications with calculated exam counts and question totals
    let certQuery = supabase
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

    if (category && category !== "all") {
      certQuery = certQuery.eq("certification_categories.slug", category);
    }

    if (priceType === "free") {
      certQuery = certQuery.eq("price_cents", 0);
    } else if (priceType === "premium") {
      certQuery = certQuery.gt("price_cents", 0);
    }

    if (search) {
      certQuery = certQuery.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Apply enrollment filter
    if (enrollmentFilter === "enrolled" && userEnrollments.length > 0) {
      certQuery = certQuery.in("id", userEnrollments);
    } else if (enrollmentFilter === "not_enrolled" && userEnrollments.length > 0) {
      certQuery = certQuery.not("id", "in", `(${userEnrollments.join(",")})`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    certQuery = certQuery.range(from, to);
    certQuery = certQuery.order("is_featured", { ascending: false });
    certQuery = certQuery.order("name", { ascending: true });

    // Fetch packages (simplified for now - packages don't have enrollment filtering yet)
    let packageQuery = supabase
      .from("certification_packages")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .limit(limit);

    if (search) {
      packageQuery = packageQuery.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Skip packages if user is filtering for enrolled items only
    let packageResult = { data: [], count: 0, error: null };
    if (enrollmentFilter !== "enrolled") {
      packageResult = await packageQuery;
    }

    const certResult = await certQuery;

    if (certResult.error) {
      console.error("Error fetching certifications:", certResult.error);
      return NextResponse.json(
        { error: "Failed to fetch certifications" },
        { status: 500 }
      );
    }

    if (packageResult.error) {
      console.error("Error fetching packages:", packageResult.error);
      return NextResponse.json(
        { error: "Failed to fetch packages" },
        { status: 500 }
      );
    }

    // Calculate correct exam counts and question totals for certifications
    const processedCertifications = (certResult.data || []).map((cert: any) => {
      // Filter for active practice exams only
      const activePracticeExams = (cert.practice_exams || []).filter(
        (exam: any) => exam.is_active === true
      );
      
      const calculatedExamCount = activePracticeExams.length;
      const calculatedQuestionTotal = activePracticeExams.reduce(
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
      packages: packageResult.data || [],
      pagination: {
        page,
        limit,
        total: (certResult.count || 0) + (packageResult.count || 0),
        totalPages: Math.ceil(
          ((certResult.count || 0) + (packageResult.count || 0)) / limit
        ),
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
