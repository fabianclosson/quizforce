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

    console.log("Certifications API - Building query with filters:", {
      category,
      priceType,
      search,
      page,
      limit
    });

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

    console.log("Base query created");

    // Apply filters
    if (category && category !== "all") {
      console.log("Applying category filter:", category);
      query = query.eq("certification_categories.slug", category);
    }

    if (priceType === "free") {
      console.log("Applying free price filter");
      query = query.eq("price_cents", 0);
    } else if (priceType === "premium") {
      console.log("Applying premium price filter");
      query = query.gt("price_cents", 0);
    }

    if (search) {
      console.log("Applying search filter:", search);
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by featured first, then by name
    query = query.order("is_featured", { ascending: false });
    query = query.order("name", { ascending: true });

    console.log("Executing query...");
    const { data, error, count } = await query;

    console.log("Query result:", {
      dataCount: data?.length || 0,
      totalCount: count,
      error: error?.message || null,
      sampleData: data?.[0] || null
    });

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

    console.log("Processed certifications:", processedCertifications.length);

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
