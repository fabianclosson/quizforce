/**
 * Optimized Dashboard Service
 * 
 * Uses query optimization, caching, and parallel execution for improved performance.
 * This replaces the original dashboard.ts with performance-focused implementations.
 */

import { QueryOptimizer } from "@/lib/query-optimizer";
import { createClient } from "@/lib/supabase";
import type {
  DashboardData,
  ExamInProgress,
  UserCertification,
  DashboardStats,
} from "@/types/dashboard";

/**
 * Get comprehensive dashboard data with optimized queries
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Get current user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Create optimizer instance for this user
    const optimizer = new QueryOptimizer(supabase, user.id);

    // Use the optimized dashboard data method
    const dashboardData = await optimizer.getUserDashboardData(user.id);

    return {
      exams_in_progress: dashboardData.examsInProgress || [],
      user_certifications: dashboardData.userCertifications || [],
      dashboard_stats: await getDashboardStats(user.id), // Still use original for now
      recent_activity: [], // Can be implemented later
      study_progress: [], // Can be implemented later
      upcoming_deadlines: [], // Can be implemented later
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}

/**
 * Get dashboard statistics with caching
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    const supabase = createClient();
    const optimizer = new QueryOptimizer(supabase, userId);

    // Get stats in parallel with caching
    const [enrollmentStats, attemptStats, completionStats] = await Promise.all([
      // Enrollment statistics
      optimizer.cachedQuery(
        'enrollments',
        (query) => query
          .select('id, certification_id, enrolled_at, expires_at')
          .eq('user_id', userId)
          .gte('expires_at', new Date().toISOString()),
        'user_enrollments',
        { userId, customTTL: 900 } // 15 minutes
      ),

      // Recent attempt statistics
      optimizer.cachedQuery(
        'exam_attempts',
        (query) => query
          .select('id, status, score, completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(20),
        'exam_attempts',
        { userId, customTTL: 300 } // 5 minutes
      ),

      // Completion rate calculation
      optimizer.cachedQuery(
        'exam_attempts',
        (query) => query
          .select('id, status, score')
          .eq('user_id', userId)
          .in('status', ['completed', 'submitted'])
          .gte('score', 70), // Assuming 70% is passing
        'exam_attempts',
        { userId, customTTL: 600 } // 10 minutes
      ),
    ]);

    // Calculate statistics
    const totalEnrollments = enrollmentStats?.length || 0;
    const totalAttempts = attemptStats?.length || 0;
    const passedAttempts = completionStats?.length || 0;
    const completionRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

    // Calculate average score
    const validScores = attemptStats?.filter((attempt: any) => 
      attempt.score !== null && attempt.status === 'completed'
    ) || [];
    const averageScore = validScores.length > 0 
      ? validScores.reduce((sum: number, attempt: any) => sum + attempt.score, 0) / validScores.length
      : 0;

    return {
      total_certifications: totalEnrollments,
      completed_certifications: passedAttempts,
      in_progress_certifications: totalEnrollments - passedAttempts,
      expired_certifications: 0, // Would need separate query
      total_exams_taken: totalAttempts,
      average_score: Math.round(averageScore),
      completion_rate: Math.round(completionRate),
      study_streak_days: 0, // Can be implemented later
      total_study_time_hours: 0, // Can be implemented later
      certificates_earned: passedAttempts,
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
 * Get user's active certifications with caching
 */
export async function getUserCertifications(userId: string): Promise<UserCertification[]> {
  try {
    const supabase = createClient();
    const optimizer = new QueryOptimizer(supabase, userId);

    const enrollments = await optimizer.cachedQuery(
      'enrollments',
      (query) => query
        .select(`
          id,
          enrolled_at,
          expires_at,
          certifications!inner (
            id,
            name,
            slug,
            price_cents,
            exam_count,
            total_questions,
            certification_categories!category_id (
              id,
              name,
              slug,
              icon,
              color
            )
          )
        `)
        .eq('user_id', userId)
        .gte('expires_at', new Date().toISOString())
        .order('enrolled_at', { ascending: false }),
      'user_enrollments',
      { userId }
    );

    if (!enrollments) return [];

    // Get progress for each certification in parallel
    const certificationsWithProgress = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        const progress = await getCertificationProgress(userId, enrollment.certifications.id, optimizer);
        
        return {
          id: enrollment.certifications.id,
          name: enrollment.certifications.name,
          slug: enrollment.certifications.slug,
          category: enrollment.certifications.certification_categories,
          enrollment_id: enrollment.id,
          enrolled_at: enrollment.enrolled_at,
          expires_at: enrollment.expires_at,
          progress: progress.progress,
          completed_exams: progress.completed_exams,
          total_exams: enrollment.certifications.exam_count || 0,
          best_score: progress.best_score,
          last_activity: progress.last_activity,
        };
      })
    );

    return certificationsWithProgress;
  } catch (error) {
    console.error("Error fetching user certifications:", error);
    return [];
  }
}

/**
 * Get certification progress with caching
 */
async function getCertificationProgress(
  userId: string, 
  certificationId: string, 
  optimizer: QueryOptimizer
) {
  try {
    const attempts = await optimizer.cachedQuery(
      'exam_attempts',
      (query) => query
        .select(`
          id,
          score,
          status,
          completed_at,
          practice_exams!inner (
            id,
            certification_id
          )
        `)
        .eq('user_id', userId)
        .eq('practice_exams.certification_id', certificationId)
        .in('status', ['completed', 'submitted'])
        .order('completed_at', { ascending: false }),
      'exam_attempts',
      { userId, customTTL: 600 } // 10 minutes
    );

    if (!attempts || attempts.length === 0) {
      return {
        progress: 0,
        completed_exams: 0,
        best_score: 0,
        last_activity: null,
      };
    }

    // Calculate progress metrics
    const completedExams = new Set(attempts.map((attempt: any) => attempt.practice_exams.id)).size;
    const bestScore = Math.max(...attempts.map((attempt: any) => attempt.score || 0));
    const lastActivity = attempts[0]?.completed_at || null;

    // Calculate progress percentage (this could be more sophisticated)
    const progress = completedExams > 0 ? Math.min((completedExams / 5) * 100, 100) : 0; // Assuming ~5 exams per cert

    return {
      progress: Math.round(progress),
      completed_exams: completedExams,
      best_score: Math.round(bestScore),
      last_activity: lastActivity,
    };
  } catch (error) {
    console.error("Error fetching certification progress:", error);
    return {
      progress: 0,
      completed_exams: 0,
      best_score: 0,
      last_activity: null,
    };
  }
}

/**
 * Invalidate user dashboard cache
 */
export async function invalidateUserDashboardCache(userId: string): Promise<void> {
  const optimizer = new QueryOptimizer();
  await optimizer.invalidateUserCache(userId);
}

/**
 * Invalidate all dashboard caches (for admin operations)
 */
export async function invalidateAllDashboardCaches(): Promise<void> {
  const optimizer = new QueryOptimizer();
  await optimizer.invalidateContentCache();
} 