import { NextRequest, NextResponse } from "next/server";
import { authenticated } from "@/lib/auth-middleware";

export const GET = authenticated(async (request: NextRequest, { user, supabase }) => {
  try {

    // Get user enrollments with certification and practice exam details
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        enrolled_at,
        expires_at,
        source,
        package_id,
        certification:certifications!inner (
          id,
          name,
          slug,
          description,
          price_cents,
          certification_categories!inner (
            name,
            icon
          ),
          practice_exams (
            id,
            name,
            question_count,
            passing_threshold_percentage,
            time_limit_minutes,
            is_active
          )
        )
      `
      )
      .eq("user_id", user.id)
      .gte("expires_at", new Date().toISOString()) // Only active enrollments
      .order("enrolled_at", { ascending: false });

    if (enrollmentsError) {
      console.error("Error fetching user enrollments:", enrollmentsError);
      return NextResponse.json(
        { error: `Failed to fetch enrollments: ${enrollmentsError.message}` },
        { status: 500 }
      );
    }

    // Get all exam attempts for the user
    const { data: examAttempts, error: attemptsError } = await supabase
      .from("exam_attempts")
      .select(
        `
        id,
        practice_exam_id,
        status,
        started_at,
        completed_at,
        score_percentage,
        passed,
        mode
      `
      )
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    if (attemptsError) {
      console.error("Error fetching exam attempts:", attemptsError);
      // Continue without attempt data rather than failing
    }

    // Transform enrollments to filter practice exams and add attempt status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalEnrollments = (enrollments || []).map((enrollment: any) => {
      if (enrollment.certification) {
        // Filter only active practice exams and add attempt status
        if (Array.isArray(enrollment.certification.practice_exams)) {
          enrollment.certification.practice_exams =
            enrollment.certification.practice_exams
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((exam: any) => exam.is_active)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((exam: any) => {
                // Find attempts for this practice exam (ONLY practice mode for button logic)
                const practiceAttempts = (examAttempts || []).filter(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (attempt: any) =>
                    attempt.practice_exam_id === exam.id &&
                    attempt.mode === "practice"
                );

                // Find exam mode attempts for best score calculation
                const examModeAttempts = (examAttempts || []).filter(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (attempt: any) =>
                    attempt.practice_exam_id === exam.id &&
                    attempt.mode === "exam"
                );

                // Determine attempt status (based on practice mode only)
                let attemptStatus: "start" | "continue" | "restart" = "start";
                let currentAttemptId: string | undefined;
                let currentAttemptMode: "exam" | "practice" | undefined;
                let lastScore: number | undefined;
                const attemptCount = practiceAttempts.length;

                if (practiceAttempts.length > 0) {
                  // Check for in-progress attempts first
                  const inProgressAttempt = practiceAttempts.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (attempt: any) => attempt.status === "in_progress"
                  );

                  if (inProgressAttempt) {
                    attemptStatus = "continue";
                    currentAttemptId = inProgressAttempt.id;
                    currentAttemptMode = inProgressAttempt.mode;
                  } else {
                    // Has completed/abandoned attempts
                    attemptStatus = "restart";
                  }

                  // Get last score from most recent completed practice attempt
                  const completedPracticeAttempts = practiceAttempts.filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (attempt: any) =>
                      attempt.status === "completed" &&
                      attempt.score_percentage !== null
                  );
                  if (completedPracticeAttempts.length > 0) {
                    // Get the most recent completed attempt (attempts are already ordered by started_at desc)
                    lastScore = completedPracticeAttempts[0].score_percentage;
                  }
                }

                // Calculate best score from exam mode attempts
                let bestScore: number | undefined;
                let bestScorePassed: boolean | undefined;

                if (examModeAttempts.length > 0) {
                  const completedExamAttempts = examModeAttempts.filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (attempt: any) =>
                      attempt.status === "completed" &&
                      attempt.score_percentage !== null
                  );

                  if (completedExamAttempts.length > 0) {
                    // Find the highest score
                    bestScore = Math.max(
                      ...completedExamAttempts.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (attempt: any) => attempt.score_percentage
                      )
                    );
                    // Check if the best score passed (assuming 70% is passing threshold)
                    bestScorePassed = bestScore >= 70;
                  }
                }

                return {
                  ...exam,
                  attempt_status: attemptStatus,
                  current_attempt_id: currentAttemptId,
                  current_attempt_mode: currentAttemptMode,
                  last_score: lastScore,
                  attempt_count: attemptCount,
                  best_score: bestScore,
                  best_score_passed: bestScorePassed,
                };
              });
        }
      }
      return enrollment;
    });

    return NextResponse.json({
      enrollments: finalEnrollments,
      total_count: finalEnrollments.length,
    });
  } catch (error) {
    console.error("Error in user enrollments API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
