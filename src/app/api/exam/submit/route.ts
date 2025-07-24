import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Submitting exam...");

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exam_attempt_id } = await request.json();

    if (!exam_attempt_id) {
      return NextResponse.json(
        { error: "exam_attempt_id is required" },
        { status: 400 }
      );
    }

    console.log("📝 Submitting attempt:", exam_attempt_id);

    // Get the exam attempt details with practice exam info
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select(
        `
        id,
        user_id,
        practice_exam_id,
        started_at,
        mode,
        practice_exams!inner (
          id,
          name,
          question_count,
          passing_threshold_percentage,
          time_limit_minutes
        )
      `
      )
      .eq("id", exam_attempt_id)
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .single();

    if (attemptError || !attempt) {
      console.error("❌ Attempt not found:", attemptError);
      return NextResponse.json(
        { error: "Exam attempt not found or already completed" },
        { status: 404 }
      );
    }

    // Get user answers with question and knowledge area details
    const { data: userAnswers, error: answersError } = await supabase
      .from("user_answers")
      .select(
        `
        id,
        question_id,
        answer_id,
        is_correct,
        questions!inner (
          id,
          knowledge_area_id,
          knowledge_areas!inner (
            id,
            name,
            weight_percentage
          )
        )
      `
      )
      .eq("exam_attempt_id", exam_attempt_id);

    if (answersError) {
      console.error("❌ Error fetching user answers:", answersError);
      return NextResponse.json(
        { error: "Failed to fetch user answers" },
        { status: 500 }
      );
    }

    // Calculate score
    const correctAnswers =
      userAnswers?.filter(answer => answer.is_correct)?.length || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalQuestions = (attempt.practice_exams as any).question_count;
    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passed = scorePercentage >= (attempt.practice_exams as any).passing_threshold_percentage;

    // Calculate time spent
    const startedAt = new Date(attempt.started_at);
    const completedAt = new Date();
    const timeSpentMinutes = Math.round(
      (completedAt.getTime() - startedAt.getTime()) / (1000 * 60)
    );

    console.log("📊 Exam results:", {
      correctAnswers,
      totalQuestions,
      scorePercentage,
      passed,
      timeSpentMinutes,
    });

    // Update the exam attempt as completed
    const updateData = {
      status: "completed",
      completed_at: completedAt.toISOString(),
      score_percentage: scorePercentage,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      passed,
      time_spent_minutes: timeSpentMinutes,
    };

    console.log("🔄 Updating attempt with data:", updateData);

    const { error: updateError } = await supabase
      .from("exam_attempts")
      .update(updateData)
      .eq("id", exam_attempt_id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("❌ Error updating attempt:", updateError);
      return NextResponse.json(
        { error: "Failed to update exam attempt" },
        { status: 500 }
      );
    }

    console.log("✅ Attempt updated successfully");

    // Calculate knowledge area breakdown
    const knowledgeAreaStats = new Map();

    userAnswers?.forEach(answer => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const knowledgeArea = (answer as any).questions.knowledge_areas;
      const areaId = knowledgeArea.id;

      if (!knowledgeAreaStats.has(areaId)) {
        knowledgeAreaStats.set(areaId, {
          id: areaId,
          name: knowledgeArea.name,
          weight_percentage: knowledgeArea.weight_percentage,
          correct: 0,
          total: 0,
        });
      }

      const stats = knowledgeAreaStats.get(areaId);
      stats.total++;
      if (answer.is_correct) {
        stats.correct++;
      }
    });

    // Convert to array and calculate percentages
    const knowledge_areas = Array.from(knowledgeAreaStats.values()).map(
      area => ({
        ...area,
        percentage:
          area.total > 0 ? Math.round((area.correct / area.total) * 100) : 0,
      })
    );

    // Determine overall performance
    let overall_performance:
      | "excellent"
      | "good"
      | "needs_improvement"
      | "poor";
    if (scorePercentage >= 90) {
      overall_performance = "excellent";
    } else if (scorePercentage >= 80) {
      overall_performance = "good";
    } else if (scorePercentage >= 60) {
      overall_performance = "needs_improvement";
    } else {
      overall_performance = "poor";
    }

    console.log("✅ Exam submitted successfully");

    return NextResponse.json({
      success: true,
      results: {
        attempt_id: exam_attempt_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exam_name: (attempt.practice_exams as any).name,
        score_percentage: scorePercentage,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        passed,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        passing_threshold: (attempt.practice_exams as any).passing_threshold_percentage,
        time_spent_minutes: timeSpentMinutes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        time_limit_minutes: (attempt.practice_exams as any).time_limit_minutes,
        knowledge_areas,
        overall_performance,
      },
    });
  } catch (error) {
    console.error("❌ Exam submission failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
