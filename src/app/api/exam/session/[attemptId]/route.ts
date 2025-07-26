import { NextRequest, NextResponse } from "next/server";
import { getExamSessionData } from "@/services/practice-exams";
import { ExamSessionData } from "@/types/exam";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    if (!attemptId) {
      return NextResponse.json(
        { error: "Attempt ID is required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get exam session data
    const sessionData = await getExamSessionData(attemptId, user);

    // Calculate current question index based on answered questions
    const answeredQuestionIds = new Set(sessionData.user_answers.map(ua => ua.question_id));
    const currentQuestionIndex = sessionData.questions.findIndex(q => !answeredQuestionIds.has(q.id));
    
    const response: ExamSessionData = {
      attempt: {
        id: sessionData.attempt.id,
        user_id: sessionData.attempt.user_id,
        practice_exam_id: sessionData.attempt.practice_exam_id,
        started_at: sessionData.attempt.started_at,
        completed_at: sessionData.attempt.completed_at,
        score_percentage: sessionData.attempt.score_percentage,
        correct_answers: sessionData.attempt.correct_answers,
        total_questions: sessionData.attempt.total_questions,
        time_spent_minutes: sessionData.attempt.time_spent_minutes,
        passed: sessionData.attempt.passed,
        status: sessionData.attempt.status,
        mode: sessionData.attempt.mode,
        created_at: sessionData.attempt.created_at,
      },
      questions: sessionData.questions.map(q => ({
        id: q.id,
        practice_exam_id: q.practice_exam_id,
        knowledge_area_id: q.knowledge_area_id,
        question_text: q.question_text,
        explanation: q.explanation,
        difficulty_level: q.difficulty_level,
        question_number: q.question_number,
        required_selections: q.required_selections,
        created_at: q.created_at,
        updated_at: q.updated_at,
        answers: q.answers.map(
          (a: {
            id: string;
            question_id: string;
            answer_text: string;
            explanation: string;
            is_correct: boolean;
            answer_letter: string;
            created_at: string;
          }) => ({
            id: a.id,
            question_id: a.question_id,
            answer_text: a.answer_text,
            explanation: a.explanation,
            is_correct: a.is_correct,
            answer_letter: a.answer_letter,
            created_at: a.created_at,
          })
        ),
        knowledge_area: Array.isArray(q.knowledge_areas)
          ? q.knowledge_areas[0]
          : q.knowledge_areas,
      })),
      user_answers: sessionData.user_answers.map(ua => ({
        id: ua.id,
        exam_attempt_id: ua.exam_attempt_id,
        question_id: ua.question_id,
        answer_id: ua.answer_id,
        answered_at: ua.answered_at,
        is_correct: ua.is_correct,
        time_spent_seconds: ua.time_spent_seconds,
      })),
      current_question_index: currentQuestionIndex >= 0 ? currentQuestionIndex : 0, // Use calculated progress
      time_remaining_seconds: calculateTimeRemaining(sessionData.attempt),
      is_flagged: {}, // This will be managed on the frontend
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error getting exam session:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to get exam session";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function calculateTimeRemaining(attempt: {
  mode: string;
  status: string;
  started_at: string;
  practice_exams:
    | { time_limit_minutes: number }[]
    | { time_limit_minutes: number };
}): number {
  // For practice mode, return a large number to indicate unlimited time
  if (attempt.mode === "practice") {
    return 999999; // Effectively unlimited
  }

  // For exam mode, calculate remaining time
  if (attempt.status !== "in_progress") {
    return 0;
  }

  const startTime = new Date(attempt.started_at);
  const now = new Date();
  const elapsedSeconds = Math.floor(
    (now.getTime() - startTime.getTime()) / 1000
  );

  // Get time limit from practice exam data
  const practiceExamData = Array.isArray(attempt.practice_exams)
    ? attempt.practice_exams[0]
    : attempt.practice_exams;

  const timeLimitSeconds = practiceExamData?.time_limit_minutes * 60 || 5400; // Default 90 minutes

  return Math.max(0, timeLimitSeconds - elapsedSeconds);
}
