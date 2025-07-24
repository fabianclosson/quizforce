import { NextRequest, NextResponse } from "next/server";
import { authenticated } from "@/lib/auth-middleware";
import { startExamAttempt } from "@/services/practice-exams";
import { StartExamResponse } from "@/types/exam";

export const POST = authenticated(async (request: NextRequest, { user, supabase }) => {
  try {
    const { practice_exam_id, mode = "exam" } = await request.json();

    console.log("🚀 Starting exam with data:", { practice_exam_id, mode });

    if (!practice_exam_id) {
      return NextResponse.json(
        { error: "Practice exam ID is required" },
        { status: 400 }
      );
    }

    console.log("🔐 Auth check:", {
      hasUser: !!user,
      userId: user?.id,
    });

    // Debug: Check if practice exam exists
    const { data: examCheck, error: examCheckError } = await supabase
      .from("practice_exams")
      .select("id, name, certification_id, is_active")
      .eq("id", practice_exam_id);

    console.log("🔍 Practice exam check:", {
      practiceExamId: practice_exam_id,
      examCheck,
      examCheckError: examCheckError?.message,
    });

    // Start the exam attempt
    const examSession = await startExamAttempt(practice_exam_id, mode, user);

    console.log("✅ Exam started successfully:", {
      attemptId: examSession.exam_attempt_id,
    });

    const response: StartExamResponse = {
      exam_attempt_id: examSession.exam_attempt_id,
      session_data: {
        attempt: {
          id: examSession.exam_attempt_id,
          user_id: user.id,
          practice_exam_id: examSession.practice_exam_id,
          started_at: examSession.started_at,
          correct_answers: 0,
          total_questions: examSession.total_questions,
          time_spent_minutes: 0,
          status: examSession.status,
          mode: examSession.mode,
          created_at: examSession.started_at,
        },
        questions: [], // Will be loaded by the session data endpoint
        user_answers: [],
        current_question_index: 0,
        time_remaining_seconds: examSession.time_remaining_minutes
          ? examSession.time_remaining_minutes * 60
          : 0,
        is_flagged: {},
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error starting exam:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to start exam",
      },
      { status: 500 }
    );
  }
});
