import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const priceType = searchParams.get("priceType") || "all";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Fetch certifications with calculated exam counts and question totals
    let certQuery = supabase
      .from("certifications")
      .select(
        `
        *,
        certification_categories(*),
        practice_exams!inner(
          id,
          question_count
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .eq("practice_exams.is_active", true);

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

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    certQuery = certQuery.range(from, to);
    certQuery = certQuery.order("is_featured", { ascending: false });
    certQuery = certQuery.order("name", { ascending: true });

    // Fetch packages (simplified for now)
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

    const [certResult, packageResult] = await Promise.all([
      certQuery,
      packageQuery,
    ]);

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
    const processedCertifications = (certResult.data || []).map((cert: { practice_exams?: { question_count?: number }[] }) => {
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
