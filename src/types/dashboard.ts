/**
 * Dashboard Types
 *
 * TypeScript types for user dashboard data including exam progress,
 * certifications, and statistics.
 */

export interface ExamInProgress {
  id: string;
  practice_exam_id: string; // ID of the practice exam
  certification_id: string;
  certification_name: string;
  certification_slug: string;
  current_question: number;
  total_questions: number;
  progress_percentage: number;
  time_remaining?: number; // in minutes
  started_at: string;
  last_activity: string;
  status: "in_progress" | "paused";
  difficulty_level: "beginner" | "intermediate" | "advanced";
  category: string;
  mode: "Exam" | "Practice";
}

export interface UserCertification {
  id: string;
  certification_id: string;
  certification_name: string;
  certification_slug: string;
  status: "enrolled" | "in_progress" | "completed" | "expired";
  enrolled_at: string;
  expires_at: string | null;
  completion_date: string | null;
  score?: number;
  passing_score: number;
  attempts_count: number;
  max_attempts: number;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  category: string;
  certificate_url?: string;
  is_premium: boolean;
}

export interface DashboardStats {
  total_certifications: number;
  completed_certifications: number;
  in_progress_certifications: number;
  expired_certifications: number;
  total_exams_taken: number;
  average_score: number;
  completion_rate: number;
  study_streak_days: number;
  total_study_time_hours: number;
  certificates_earned: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "exam_started"
    | "exam_completed"
    | "certification_enrolled"
    | "certificate_earned";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    certification_name?: string;
    score?: number;
    duration?: number;
  };
}

export interface StudyProgress {
  date: string;
  minutes_studied: number;
  exams_completed: number;
  questions_answered: number;
}

export interface UpcomingDeadlines {
  id: string;
  certification_name: string;
  certification_slug: string;
  deadline_type: "expiration" | "exam_window";
  deadline_date: string;
  days_remaining: number;
  is_urgent: boolean; // less than 7 days
}

export interface DashboardData {
  exams_in_progress: ExamInProgress[];
  user_certifications: UserCertification[];
  dashboard_stats: DashboardStats;
  recent_activity: RecentActivity[];
  study_progress: StudyProgress[];
  upcoming_deadlines: UpcomingDeadlines[];
}

export interface DashboardFilters {
  status?: UserCertification["status"][];
  category?: string[];
  difficulty?: UserCertification["difficulty_level"][];
  is_premium?: boolean;
}

export interface DashboardSortOptions {
  field: "name" | "enrolled_at" | "expires_at" | "completion_date" | "score";
  direction: "asc" | "desc";
}

// API Response types
export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  error?: string;
}

export interface CertificationProgressUpdate {
  certification_id: string;
  progress_percentage: number;
  current_question: number;
  time_spent_minutes: number;
}
