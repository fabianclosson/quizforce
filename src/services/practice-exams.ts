import {
  createClient,
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase";
import {
  PracticeExamsResponse,
  GroupedPracticeExams,
  PracticeExamWithStatus,
  PracticeExamFilters,
  PracticeExamSortOptions,
  PracticeExamStats,
  ExamSession,
} from "@/types/practice-exams";
import {
  groupExamsByCertification,
  sortGroupedExamsByCertification,
  sortExamsWithinGroups,
  filterGroupsByEnrollment,
  filterGroupsByExamStatus,
} from "@/utils/practice-exam-grouping";

const supabase = createClient();
const serviceSupabase = createServiceSupabaseClient();

/**
 * Fetch practice exams grouped by certification with user status
 */
export async function getPracticeExams(
  filters: PracticeExamFilters = {},
  sort: PracticeExamSortOptions = { field: "name", direction: "asc" }
): Promise<PracticeExamsResponse> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Base query for practice exams with certification and category data
    let query = supabase
      .from("practice_exams")
      .select(
        `
        id,
        certification_id,
        name,
        description,
        question_count,
        time_limit_minutes,
        passing_threshold_percentage,
        sort_order,
        is_active,
        created_at,
        updated_at,
        certifications!certification_id (
          id,
          name,
          slug,
          category_id,
          price_cents,
          exam_count,
          total_questions,
          is_active,
          certification_categories!category_id (
            id,
            name,
            slug,
            icon,
            color
          )
        )
      `
      )
      .eq("is_active", true)
      .eq("certifications.is_active", true);

    // Apply filters
    if (filters.category_id) {
      query = query.eq("certifications.category_id", filters.category_id);
    }

    if (filters.certification_id) {
      query = query.eq("certification_id", filters.certification_id);
    }

    if (filters.free_only) {
      query = query.eq("certifications.price_cents", 0);
    }

    // Execute the query
    const { data: practiceExams, error } = await query;

    if (error) {
      console.error("Error fetching practice exams:", error);
      throw new Error(`Failed to fetch practice exams: ${error.message}`);
    }

    if (!practiceExams) {
      return { grouped_exams: [], total_count: 0 };
    }

    // Get user enrollments and exam attempts if user is authenticated
    let enrollments: any[] = [];
    let examAttempts: any[] = [];

    if (user) {
      // Fetch user enrollments
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("certification_id, expires_at")
        .eq("user_id", user.id)
        .gte("expires_at", new Date().toISOString());

      enrollments = enrollmentData || [];

      // Fetch user exam attempts
      const examIds = practiceExams.map(exam => exam.id);
      const { data: attemptData } = await supabase
        .from("exam_attempts")
        .select(
          `
          id,
          practice_exam_id,
          started_at,
          completed_at,
          score_percentage,
          correct_answers,
          total_questions,
          passed,
          time_spent_minutes,
          status,
          mode,
          created_at
        `
        )
        .eq("user_id", user.id)
        .in("practice_exam_id", examIds)
        .order("created_at", { ascending: false });

      examAttempts = attemptData || [];
    }

    // Build array of exams with status for processing
    const examsWithStatus: PracticeExamWithStatus[] = [];

    for (const exam of practiceExams) {
      // Handle Supabase's array response for joined tables
      const certificationData = Array.isArray(exam.certifications)
        ? exam.certifications[0]
        : exam.certifications;
      if (!certificationData) continue;

      const categoryData = Array.isArray(
        certificationData.certification_categories
      )
        ? certificationData.certification_categories[0]
        : certificationData.certification_categories;
      if (!categoryData) continue;

      const certification = {
        id: certificationData.id,
        name: certificationData.name,
        slug: certificationData.slug,
        price_cents: certificationData.price_cents,
        exam_count: certificationData.exam_count,
        total_questions: certificationData.total_questions,
        is_active: certificationData.is_active,
        category: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          icon: categoryData.icon,
          color: categoryData.color,
        },
      };

      const certificationId = certification.id;

      // Check if user is enrolled in this certification
      const isEnrolled = enrollments.some(
        e => e.certification_id === certificationId
      );

      // Get user's attempts for this exam
      const userAttempts = examAttempts.filter(
        a => a.practice_exam_id === exam.id
      );
      const latestAttempt = userAttempts[0]; // Already sorted by created_at desc
      const bestScore =
        userAttempts.length > 0
          ? Math.max(...userAttempts.map(a => a.score_percentage || 0))
          : undefined;

      // Determine exam status and current attempt mode
      let status: "not_started" | "in_progress" | "completed" = "not_started";
      let currentAttemptMode: "exam" | "practice" | undefined = undefined;

      if (latestAttempt) {
        if (latestAttempt.status === "in_progress") {
          status = "in_progress";
          currentAttemptMode = latestAttempt.mode;
        } else if (latestAttempt.status === "completed") {
          status = "completed";
        }
      }

      // Apply status filter
      if (filters.status && status !== filters.status) {
        continue;
      }

      // Apply enrollment filter
      if (filters.enrolled_only && !isEnrolled) {
        continue;
      }

      const examWithStatus: PracticeExamWithStatus = {
        id: exam.id,
        certification_id: exam.certification_id,
        name: exam.name,
        description: exam.description,
        question_count: exam.question_count,
        time_limit_minutes: exam.time_limit_minutes,
        passing_threshold_percentage: exam.passing_threshold_percentage,
        sort_order: exam.sort_order,
        is_active: exam.is_active,
        created_at: exam.created_at,
        updated_at: exam.updated_at,
        certification,
        latest_attempt: latestAttempt,
        best_score: bestScore,
        attempt_count: userAttempts.length,
        status,
        is_enrolled: isEnrolled,
        current_attempt_mode: currentAttemptMode,
      };

      examsWithStatus.push(examWithStatus);
    }

    // Use utility functions for grouping and sorting
    let groupedExams = groupExamsByCertification(examsWithStatus);

    // Apply additional filters using utility functions
    if (filters.enrolled_only) {
      groupedExams = filterGroupsByEnrollment(groupedExams, true);
    }

    if (filters.status) {
      groupedExams = filterGroupsByExamStatus(groupedExams, filters.status);
    }

    // Sort certifications and exams within groups
    groupedExams = sortGroupedExamsByCertification(groupedExams, "asc");
    groupedExams = sortExamsWithinGroups(groupedExams, sort);

    const totalCount = groupedExams.reduce(
      (sum, group) => sum + group.exams.length,
      0
    );

    return {
      grouped_exams: groupedExams,
      total_count: totalCount,
    };
  } catch (error) {
    console.error("Error in getPracticeExams:", error);
    throw error;
  }
}

/**
 * Get practice exam statistics for the current user
 */
export async function getPracticeExamStats(): Promise<PracticeExamStats> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        total_exams_available: 0,
        total_exams_enrolled: 0,
        total_attempts: 0,
        completed_exams: 0,
        in_progress_count: 0,
      };
    }

    // Get total available exams
    const { count: totalExams } = await supabase
      .from("practice_exams")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get user enrollments
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("certification_id")
      .eq("user_id", user.id)
      .gte("expires_at", new Date().toISOString());

    // Get enrolled exam count
    let totalEnrolledExams = 0;
    if (enrollments && enrollments.length > 0) {
      const { count: enrolledCount } = await supabase
        .from("practice_exams")
        .select("*", { count: "exact", head: true })
        .in(
          "certification_id",
          enrollments.map(e => e.certification_id)
        )
        .eq("is_active", true);

      totalEnrolledExams = enrolledCount || 0;
    }

    // Get exam attempts stats
    const { data: attempts } = await supabase
      .from("exam_attempts")
      .select("status, score_percentage")
      .eq("user_id", user.id);

    const totalAttempts = attempts?.length || 0;
    const completedExams =
      attempts?.filter(a => a.status === "completed").length || 0;
    const inProgressCount =
      attempts?.filter(a => a.status === "in_progress").length || 0;

    const completedScores =
      attempts
        ?.filter(a => a.status === "completed" && a.score_percentage !== null)
        .map(a => a.score_percentage!) || [];

    const averageScore =
      completedScores.length > 0
        ? completedScores.reduce((sum, score) => sum + score, 0) /
          completedScores.length
        : undefined;

    return {
      total_exams_available: totalExams || 0,
      total_exams_enrolled: totalEnrolledExams,
      total_attempts: totalAttempts,
      completed_exams: completedExams,
      average_score: averageScore,
      in_progress_count: inProgressCount,
    };
  } catch (error) {
    console.error("Error fetching practice exam stats:", error);
    throw error;
  }
}

/**
 * Start a new exam attempt with mode support
 */
export async function startExamAttempt(
  practiceExamId: string,
  mode: "exam" | "practice" = "exam",
  authenticatedUser?: any
): Promise<ExamSession> {
  try {
    console.log("🎯 startExamAttempt called with:", {
      practiceExamId,
      mode,
      hasUser: !!authenticatedUser,
    });

    let user = authenticatedUser;
    let supabase = createClient();

    // If no user provided, try to get from auth (for backwards compatibility)
    if (!user) {
      console.log("🔄 No user provided, trying to get from auth...");
      // Try server-side client first (for API routes)
      try {
        const serverSupabase = await createServerSupabaseClient();
        const {
          data: { user: serverUser },
          error: serverError,
        } = await serverSupabase.auth.getUser();

        console.log("🖥️ Server auth result:", {
          hasUser: !!serverUser,
          error: serverError?.message,
        });

        if (serverUser && !serverError) {
          user = serverUser;
          supabase = serverSupabase;
        }
      } catch (serverErr) {
        console.log(
          "⚠️ Server auth failed, falling back to client:",
          serverErr
        );
      }

      // Fallback to browser client if server-side fails
      if (!user) {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        console.log("🌐 Client auth result:", {
          hasUser: !!authUser,
          error: authError?.message,
        });
        user = authUser;
      }
    } else {
      console.log("✅ Using provided authenticated user");
    }

    if (!user) {
      throw new Error("User must be authenticated to start an exam");
    }

    console.log("👤 User authenticated:", { userId: user.id });

    // Check if user is enrolled in the certification
    console.log("🔍 Looking up practice exam:", practiceExamId);

    // Use service role client to bypass RLS for practice exam lookup
    const serviceSupabase = createServiceSupabaseClient();
    const { data: exam, error: examError } = await serviceSupabase
      .from("practice_exams")
      .select("certification_id, question_count, time_limit_minutes")
      .eq("id", practiceExamId)
      .eq("is_active", true)
      .single();

    console.log("📊 Practice exam lookup result:", {
      exam,
      examError: examError?.message,
      examErrorCode: examError?.code,
    });

    if (!exam) {
      throw new Error("Practice exam not found");
    }

    console.log(
      "🎓 Checking enrollment for certification:",
      exam.certification_id
    );
    // Use service role client to bypass RLS for enrollment check
    const { data: enrollment, error: enrollmentError } = await serviceSupabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("certification_id", exam.certification_id)
      .gte("expires_at", new Date().toISOString())
      .single();

    console.log("📝 Enrollment check result:", {
      enrollment,
      enrollmentError: enrollmentError?.message,
      enrollmentErrorCode: enrollmentError?.code,
    });

    if (!enrollment) {
      throw new Error("User is not enrolled in this certification");
    }

    console.log("🚀 Creating exam attempt...");
    // Create new exam attempt with mode support - use service role client to bypass RLS
    const { data: attempt, error } = await serviceSupabase
      .from("exam_attempts")
      .insert({
        user_id: user.id,
        practice_exam_id: practiceExamId,
        total_questions: exam.question_count,
        status: "in_progress",
        mode: mode, // Store the selected exam mode
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to create exam attempt:", error);
      throw new Error(`Failed to start exam: ${error.message}`);
    }

    console.log("✅ Exam attempt created successfully:", attempt.id);

    return {
      exam_attempt_id: attempt.id,
      practice_exam_id: practiceExamId,
      status: "in_progress",
      current_question: 1,
      total_questions: exam.question_count,
      time_remaining_minutes: mode === "exam" ? exam.time_limit_minutes : null, // No time limit for practice mode
      started_at: attempt.started_at,
      mode: mode,
    };
  } catch (error) {
    console.error("Error starting exam attempt:", error);
    throw error;
  }
}

/**
 * Get exam session data for an active attempt
 */
export async function getExamSessionData(
  examAttemptId: string,
  authenticatedUser?: any
): Promise<{
  attempt: any;
  questions: any[];
  user_answers: any[];
}> {
  try {
    let user = authenticatedUser;

    // If no user provided, try to get from auth (for backwards compatibility)
    if (!user) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;
    }

    if (!user) {
      throw new Error("User must be authenticated to access exam data");
    }

    // Get exam attempt details
    const { data: attempt, error: attemptError } = await serviceSupabase
      .from("exam_attempts")
      .select(
        `
        id,
        user_id,
        practice_exam_id,
        started_at,
        completed_at,
        score_percentage,
        correct_answers,
        total_questions,
        passed,
        time_spent_minutes,
        status,
        mode,
        created_at,
        practice_exams!practice_exam_id (
          name,
          time_limit_minutes
        )
      `
      )
      .eq("id", examAttemptId)
      .eq("user_id", user.id)
      .single();

    if (attemptError || !attempt) {
      throw new Error("Exam attempt not found or access denied");
    }

    // Get questions for this exam with answers and knowledge areas
    const { data: questions, error: questionsError } = await serviceSupabase
      .from("questions")
      .select(
        `
        id,
        practice_exam_id,
        knowledge_area_id,
        question_text,
        explanation,
        difficulty_level,
        question_number,
        required_selections,
        created_at,
        updated_at,
        answers (*),
        knowledge_areas (
          id,
          name,
          description,
          weight_percentage
        )
      `
      )
      .eq("practice_exam_id", attempt.practice_exam_id)
      .order("question_number");

    if (questionsError) {
      throw new Error(`Failed to load questions: ${questionsError.message}`);
    }

    // Get user's existing answers for this attempt
    const { data: userAnswers, error: answersError } = await serviceSupabase
      .from("user_answers")
      .select("*")
      .eq("exam_attempt_id", examAttemptId);

    if (answersError) {
      throw new Error(`Failed to load user answers: ${answersError.message}`);
    }

    return {
      attempt,
      questions: questions || [],
      user_answers: userAnswers || [],
    };
  } catch (error) {
    console.error("Error getting exam session data:", error);
    throw error;
  }
}

/**
 * Save user answer for a question (supports both single and multi-answer)
 */
export async function saveUserAnswer(
  examAttemptId: string,
  questionId: string,
  answerIds: string[],
  timeSpentSeconds: number
): Promise<{ success: boolean; user_answers: any[] }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User must be authenticated to save answers");
    }

    // Verify the exam attempt belongs to the user
    const { data: attempt } = await serviceSupabase
      .from("exam_attempts")
      .select("id, user_id")
      .eq("id", examAttemptId)
      .eq("user_id", user.id)
      .single();

    if (!attempt) {
      throw new Error("Exam attempt not found or access denied");
    }

    // Delete existing answers for this question (to handle answer changes)
    await serviceSupabase
      .from("user_answers")
      .delete()
      .eq("exam_attempt_id", examAttemptId)
      .eq("question_id", questionId);

    // Insert new answers (supports multiple answers for multi-answer questions)
    const newAnswers = answerIds.map(answerId => ({
      exam_attempt_id: examAttemptId,
      question_id: questionId,
      answer_id: answerId,
      answered_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds,
    }));

    const { data: savedAnswers, error } = await serviceSupabase
      .from("user_answers")
      .insert(newAnswers)
      .select();

    if (error) {
      throw new Error(`Failed to save answer: ${error.message}`);
    }

    return {
      success: true,
      user_answers: savedAnswers || [],
    };
  } catch (error) {
    console.error("Error saving user answer:", error);
    throw error;
  }
}
