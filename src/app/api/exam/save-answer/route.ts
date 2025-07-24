import { NextRequest, NextResponse } from "next/server";
import { saveUserAnswer } from "@/services/practice-exams";
import { SaveAnswerRequest, SaveAnswerResponse } from "@/types/exam";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body: SaveAnswerRequest = await request.json();
    const {
      exam_attempt_id,
      question_id,
      answer_id,
      answer_ids,
      time_spent_seconds,
    } = body;

    // Validate required fields
    if (!exam_attempt_id) {
      return NextResponse.json(
        { error: "Exam attempt ID is required" },
        { status: 400 }
      );
    }

    if (!question_id) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    if (time_spent_seconds === undefined || time_spent_seconds < 0) {
      return NextResponse.json(
        { error: "Valid time spent is required" },
        { status: 400 }
      );
    }

    // Determine answer IDs - prioritize answer_ids array over single answer_id
    let answerIds: string[] = [];
    if (answer_ids && answer_ids.length > 0) {
      answerIds = answer_ids;
    } else if (answer_id) {
      answerIds = [answer_id];
    } else {
      // Allow empty answer (user cleared their selection)
      answerIds = [];
    }

    // Get question details to validate answer count
    const supabase = await createServerSupabaseClient();
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id, required_selections")
      .eq("id", question_id)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Validate answer count matches required selections (if answers are provided)
    if (answerIds.length > 0) {
      const requiredSelections = question.required_selections || 1;

      if (answerIds.length !== requiredSelections) {
        const questionType =
          requiredSelections === 1 ? "single-answer" : "multi-answer";
        const expectedCount =
          requiredSelections === 1
            ? "exactly 1 answer"
            : `exactly ${requiredSelections} answers`;

        return NextResponse.json(
          {
            error: `Invalid answer count for ${questionType} question. Expected ${expectedCount}, but received ${answerIds.length}.`,
            required_selections: requiredSelections,
            submitted_count: answerIds.length,
          },
          { status: 400 }
        );
      }
    }

    // Save the answer(s)
    const result = await saveUserAnswer(
      exam_attempt_id,
      question_id,
      answerIds,
      time_spent_seconds
    );

    const response: SaveAnswerResponse = {
      success: result.success,
      user_answer: result.user_answers[0] || null, // For backward compatibility
      user_answers: result.user_answers,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error saving answer:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to save answer";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
