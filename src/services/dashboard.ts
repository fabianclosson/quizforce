import { createClient } from "@/lib/supabase";
import type {
  DashboardData,
  ExamInProgress,
  UserCertification,
  DashboardStats,
  RecentActivity,
  StudyProgress,
  UpcomingDeadlines,
  CertificationProgressUpdate,
  DashboardFilters,
  DashboardSortOptions,
} from "@/types/dashboard";

const supabase = createClient();

/**
 * Fetch comprehensive dashboard data for the authenticated user
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Fetch data in parallel for better performance
    const [examsInProgress, userCertifications, dashboardStats] =
      await Promise.all([
        getExamsInProgress(user.id),
        getUserCertifications(user.id),
        getDashboardStats(user.id),
      ]);

    return {
      exams_in_progress: examsInProgress,
      user_certifications: userCertifications,
      dashboard_stats: dashboardStats,
      recent_activity: [],
      study_progress: [],
      upcoming_deadlines: [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}

/**
 * Fetch exams currently in progress for the user
 */
export async function getExamsInProgress(
  userId: string
): Promise<ExamInProgress[]> {
  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // Return empty array for unauthenticated users instead of throwing
      return [];
    }

    const { data, error } = await supabase
      .from("exam_attempts")
      .select(
        `
        id,
        started_at,
        status,
        mode,
        practice_exams!inner (
          id,
          name,
          question_count,
          time_limit_minutes,
          certifications!inner (
            id,
            name,
            slug,
            certification_categories (
              name
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .eq("mode", "practice")
      .not("started_at", "is", null)
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error fetching exams in progress:", error);
      // For database errors, still throw to show error state
      throw new Error("Failed to fetch exams in progress");
    }

    // Deduplicate attempts: keep only the latest attempt for each practice exam
    const uniqueAttempts = new Map();
    (data || []).forEach((attempt: any) => {
      const examId = attempt.practice_exams.id;
      const existingAttempt = uniqueAttempts.get(examId);

      // Keep the latest attempt (data is already ordered by started_at DESC)
      if (
        !existingAttempt ||
        new Date(attempt.started_at) > new Date(existingAttempt.started_at)
      ) {
        uniqueAttempts.set(examId, attempt);
      }
    });

    // Fetch user answers for all attempts
    const attemptIds = Array.from(uniqueAttempts.values()).map(
      (attempt: any) => attempt.id
    );
    let userAnswersMap = new Map();

    if (attemptIds.length > 0) {
      const { data: userAnswers, error: answersError } = await supabase
        .from("user_answers")
        .select("exam_attempt_id, question_id, answered_at")
        .in("exam_attempt_id", attemptIds);

      if (!answersError && userAnswers) {
        // Group answers by attempt ID
        userAnswers.forEach((answer: any) => {
          if (!userAnswersMap.has(answer.exam_attempt_id)) {
            userAnswersMap.set(answer.exam_attempt_id, []);
          }
          userAnswersMap.get(answer.exam_attempt_id).push(answer);
        });
      }
    }

    return Array.from(uniqueAttempts.values()).map((attempt: any) => {
      // Get user answers for this attempt
      const attemptAnswers = userAnswersMap.get(attempt.id) || [];

      // Count distinct questions answered (not total answer records)
      const uniqueQuestionIds = new Set(
        attemptAnswers.map((answer: any) => answer.question_id).filter(Boolean)
      );
      const answeredQuestions = uniqueQuestionIds.size;
      const totalQuestions = attempt.practice_exams.question_count;
      const progressPercentage =
        totalQuestions > 0
          ? Math.round((answeredQuestions / totalQuestions) * 100)
          : 0;

      console.log(`Progress calculation for attempt ${attempt.id}:`, {
        examName: attempt.practice_exams.name,
        totalUserAnswers: attemptAnswers.length,
        uniqueQuestionsAnswered: answeredQuestions,
        totalQuestions,
        progressPercentage,
        questionIds: Array.from(uniqueQuestionIds),
      });

      // Remove "General" from practice exam name if it exists
      let examName = attempt.practice_exams.name || "";
      if (examName.includes("General")) {
        examName = examName.replace(/\s*-?\s*General\s*/gi, "").trim();
        // Clean up any double spaces or leading/trailing dashes
        examName = examName
          .replace(/\s+/g, " ")
          .replace(/^-\s*|-\s*$/g, "")
          .trim();
      }

      return {
        id: attempt.id,
        practice_exam_id: attempt.practice_exams.id, // Add the practice exam ID
        certification_id: attempt.practice_exams.certifications.id,
        certification_name: examName, // Now using practice exam name instead of certification name
        certification_slug: attempt.practice_exams.certifications.slug,
        current_question: answeredQuestions + 1, // Next question to answer (1-indexed)
        total_questions: totalQuestions,
        progress_percentage: progressPercentage,
        time_remaining: attempt.practice_exams.time_limit_minutes,
        started_at: attempt.started_at,
        last_activity: attempt.updated_at || attempt.started_at,
        status: attempt.status as "in_progress" | "paused",
        difficulty_level: "intermediate" as const,
        category:
          attempt.practice_exams.certifications.certification_categories
            ?.name || "General",
        mode: attempt.mode === "practice" ? "Practice" : "Exam", // Use mode field directly
      };
    });
  } catch (error: any) {
    // If it's an auth error, return empty array
    if (
      error.message?.includes("not authenticated") ||
      error.message?.includes("Auth session missing")
    ) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetch user certifications with enrollment details
 */
export async function getUserCertifications(
  userId: string,
  filters?: DashboardFilters,
  sort?: DashboardSortOptions
): Promise<UserCertification[]> {
  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // Return empty array for unauthenticated users instead of throwing
      return [];
    }

    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        enrolled_at,
        expires_at,
        source,
        certifications!inner (
          id,
          name,
          slug,
          description,
          price_cents,
          exam_count,
          total_questions,
          certification_categories (
            name,
            color
          ),
          practice_exams (
            id,
            name,
            question_count,
            passing_threshold_percentage
          )
        )
      `
      )
      .eq("user_id", userId)
      .gte("expires_at", new Date().toISOString())
      .order("enrolled_at", { ascending: false });

    if (error) {
      console.error("Error fetching user certifications:", error);
      throw new Error("Failed to fetch user certifications");
    }

    // For each certification, get the user's exam attempts and calculate stats
    const certificationsWithStats = await Promise.all(
      (data || []).map(async (enrollment: any) => {
        const certification = enrollment.certifications;

        // Get exam attempts for this certification
        const { data: attempts } = await supabase
          .from("exam_attempts")
          .select(
            `
          id,
          practice_exam_id,
          completed_at,
          score_percentage,
          passed,
          status
        `
          )
          .eq("user_id", userId)
          .in(
            "practice_exam_id",
            certification.practice_exams.map((exam: any) => exam.id)
          )
          .order("completed_at", { ascending: false });

        // Calculate stats
        const totalAttempts = attempts?.length || 0;
        const completedAttempts =
          attempts?.filter(a => a.status === "completed") || [];
        const passedAttempts = completedAttempts.filter(a => a.passed) || [];
        const bestScore =
          completedAttempts.length > 0
            ? Math.max(...completedAttempts.map(a => a.score_percentage || 0))
            : null;
        const lastAttemptDate =
          completedAttempts.length > 0
            ? completedAttempts[0].completed_at
            : null;

        // Clean up certification name by removing "Practice Bundle" suffix
        let cleanedName = certification.name || "";
        if (cleanedName.includes("Practice Bundle")) {
          cleanedName = cleanedName
            .replace(/\s*Practice Bundle\s*$/i, "")
            .trim();
        }

        return {
          id: enrollment.id,
          certification_id: certification.id,
          certification_name: cleanedName,
          certification_slug: certification.slug,
          status:
            completedAttempts.length > 0
              ? ("completed" as const)
              : ("enrolled" as const),
          enrolled_at: enrollment.enrolled_at,
          expires_at: enrollment.expires_at,
          completion_date:
            completedAttempts.length > 0
              ? completedAttempts[0].completed_at
              : null,
          score: bestScore || undefined,
          passing_score:
            certification.practice_exams[0]?.passing_threshold_percentage || 70,
          attempts_count: totalAttempts,
          max_attempts: 3, // Default max attempts
          difficulty_level: "intermediate" as const, // Default difficulty
          category: certification.certification_categories?.name || "General",
          is_premium: false, // Default premium status
        };
      })
    );

    return certificationsWithStats;
  } catch (error: any) {
    // If it's an auth error, return empty array
    if (
      error.message?.includes("not authenticated") ||
      error.message?.includes("Auth session missing")
    ) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetch dashboard statistics for the user
 */
export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  try {
    // Get total enrollments
    const { count: totalEnrollments } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("expires_at", new Date().toISOString());

    // Get total completed exams
    const { count: completedExams } = await supabase
      .from("exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");

    // Get exams in progress
    const { count: examsInProgress } = await supabase
      .from("exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "in_progress");

    // Get passed exams
    const { count: passedExams } = await supabase
      .from("exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed")
      .eq("passed", true);

    // Calculate average score from completed exams
    const { data: scoreData } = await supabase
      .from("exam_attempts")
      .select("score_percentage")
      .eq("user_id", userId)
      .eq("status", "completed")
      .not("score_percentage", "is", null);

    const averageScore =
      scoreData && scoreData.length > 0
        ? Math.round(
            scoreData.reduce(
              (sum, attempt) => sum + (attempt.score_percentage || 0),
              0
            ) / scoreData.length
          )
        : null;

    return {
      total_certifications: totalEnrollments || 0,
      completed_certifications: passedExams || 0,
      in_progress_certifications: examsInProgress || 0,
      expired_certifications: 0,
      total_exams_taken: completedExams || 0,
      average_score: averageScore || 0,
      completion_rate:
        (totalEnrollments || 0) > 0
          ? ((passedExams || 0) / (totalEnrollments || 1)) * 100
          : 0,
      study_streak_days: 0,
      total_study_time_hours: 0,
      certificates_earned: passedExams || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      total_certifications: 0,
      completed_certifications: 0,
      in_progress_certifications: 0,
      expired_certifications: 0,
      total_exams_taken: 0,
      average_score: 0,
      completion_rate: 0,
      study_streak_days: 0,
      total_study_time_hours: 0,
      certificates_earned: 0,
    };
  }
}

/**
 * Get recent exam activity for the user
 */
export async function getRecentActivity(
  userId: string,
  limit = 5
): Promise<any[]> {
  const { data, error } = await supabase
    .from("exam_attempts")
    .select(
      `
      id,
      started_at,
      completed_at,
      status,
      score_percentage,
      passed,
      practice_exams!inner (
        name,
        certifications!inner (
          name,
          slug
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }

  return data || [];
}

/**
 * Resume an exam in progress
 */
export async function resumeExam(attemptId: string): Promise<string> {
  try {
    // Get the exam attempt details
    const { data: attempt, error } = await supabase
      .from("exam_attempts")
      .select(
        `
        id,
        practice_exams!inner (
          id,
          certifications!inner (
            slug
          )
        )
      `
      )
      .eq("id", attemptId)
      .eq("status", "in_progress")
      .single();

    if (error || !attempt) {
      throw new Error("Exam attempt not found or not in progress");
    }

    // Return the URL to resume the exam
    const practiceExam = Array.isArray(attempt.practice_exams)
      ? attempt.practice_exams[0]
      : attempt.practice_exams;
    const certification = Array.isArray(practiceExam.certifications)
      ? practiceExam.certifications[0]
      : practiceExam.certifications;
    const certificationSlug = certification?.slug;
    const examId = practiceExam?.id;

    return `/exam/${certificationSlug}/${examId}?attempt=${attemptId}`;
  } catch (error) {
    console.error("Error resuming exam:", error);
    throw new Error("Failed to resume exam");
  }
}

/**
 * Get user's study progress over time
 */
export async function getStudyProgress(
  userId: string,
  days: number = 30
): Promise<StudyProgress[]> {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get study progress data from exam attempts and sessions
    const { data, error } = await supabase
      .from("exam_attempts")
      .select(
        `
        completed_at,
        time_spent,
        practice_exams (
          question_count
        ),
        user_answers (
          id
        )
      `
      )
      .eq("user_id", userId)
      .gte("completed_at", startDate.toISOString())
      .lte("completed_at", endDate.toISOString())
      .not("completed_at", "is", null);

    if (error) throw error;

    // Group by date and aggregate
    const progressMap = new Map<string, StudyProgress>();

    data?.forEach(attempt => {
      if (!attempt.completed_at) return;

      const date = attempt.completed_at.split("T")[0];
      const existing = progressMap.get(date) || {
        date,
        minutes_studied: 0,
        exams_completed: 0,
        questions_answered: 0,
      };

      existing.minutes_studied += attempt.time_spent || 0;
      existing.exams_completed += 1;
      existing.questions_answered += attempt.user_answers?.length || 0;

      progressMap.set(date, existing);
    });

    return Array.from(progressMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  } catch (error) {
    console.error("Error fetching study progress:", error);
    throw error;
  }
}

/**
 * Get upcoming deadlines for user's enrollments
 */
export async function getUpcomingDeadlines(
  userId: string
): Promise<UpcomingDeadlines[]> {
  try {
    const currentDate = new Date();
    const futureDate = new Date(
      currentDate.getTime() + 90 * 24 * 60 * 60 * 1000
    ); // 90 days ahead

    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        expires_at,
        certifications (
          id,
          name,
          slug
        )
      `
      )
      .eq("user_id", userId)
      .not("expires_at", "is", null)
      .gte("expires_at", currentDate.toISOString())
      .lte("expires_at", futureDate.toISOString())
      .order("expires_at", { ascending: true });

    if (error) throw error;

    return (
      data?.map(enrollment => {
        const expirationDate = new Date(enrollment.expires_at!);
        const daysRemaining = Math.ceil(
          (expirationDate.getTime() - currentDate.getTime()) /
            (24 * 60 * 60 * 1000)
        );

        const certification = Array.isArray(enrollment.certifications)
          ? enrollment.certifications[0]
          : enrollment.certifications;
        return {
          id: enrollment.id,
          certification_name: certification?.name || "Unknown Certification",
          certification_slug: certification?.slug || "",
          deadline_type: "expiration" as const,
          deadline_date: enrollment.expires_at!,
          days_remaining: daysRemaining,
          is_urgent: daysRemaining <= 7,
        };
      }) || []
    );
  } catch (error) {
    console.error("Error fetching upcoming deadlines:", error);
    throw error;
  }
}

/**
 * Update exam progress for a user
 */
export async function updateExamProgress(
  update: CertificationProgressUpdate
): Promise<void> {
  try {
    // Find the current exam attempt
    const { data: examAttempt, error: findError } = await supabase
      .from("exam_attempts")
      .select("id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .eq("status", "in-progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (findError) throw findError;

    if (examAttempt) {
      // Update the exam attempt with new progress
      const { error: updateError } = await supabase
        .from("exam_attempts")
        .update({
          // Note: We'll need to add progress tracking fields to the exam_attempts table
          // For now, we'll update the time_spent
          time_spent: update.time_spent_minutes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", examAttempt.id);

      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error("Error updating exam progress:", error);
    throw error;
  }
}
