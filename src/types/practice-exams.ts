// Practice Exam Types
// Based on database schema in database/migrations/003_exam_content_schema.sql

import { ExamMode } from "./exam";

export interface PracticeExam {
  id: string;
  certification_id: string;
  name: string;
  description?: string;
  question_count: number;
  time_limit_minutes: number;
  passing_threshold_percentage: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeExamWithCertification extends PracticeExam {
  certification: {
    id: string;
    name: string;
    slug: string;
    price_cents: number;
    exam_count: number;
    total_questions: number;
    is_active: boolean;
    category: {
      id: string;
      name: string;
      slug: string;
      icon?: string;
      color: string;
    };
  };
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  practice_exam_id: string;
  started_at: string;
  completed_at?: string;
  score_percentage?: number;
  correct_answers: number;
  total_questions: number;
  passed?: boolean;
  time_spent_minutes?: number;
  status: "in_progress" | "completed" | "abandoned";
  mode: ExamMode;
  created_at: string;
}

export interface PracticeExamWithStatus extends PracticeExamWithCertification {
  // User-specific status information
  latest_attempt?: ExamAttempt;
  best_score?: number;
  attempt_count: number;
  status: "not_started" | "in_progress" | "completed";
  is_enrolled: boolean;
  current_attempt_mode?: "exam" | "practice";
}

export interface GroupedPracticeExams {
  certification: {
    id: string;
    name: string;
    slug: string;
    category: {
      name: string;
      slug: string;
      icon?: string;
      color: string;
    };
    price_cents: number;
    exam_count: number;
    total_questions: number;
  };
  exams: PracticeExamWithStatus[];
  is_enrolled: boolean;
}

// API Response types
export interface PracticeExamsResponse {
  grouped_exams: GroupedPracticeExams[];
  total_count: number;
}

// Filter and sort options
export interface PracticeExamFilters {
  category_id?: string;
  certification_id?: string;
  status?: "not_started" | "in_progress" | "completed";
  enrolled_only?: boolean;
  free_only?: boolean;
}

export interface PracticeExamSortOptions {
  field: "name" | "category" | "status" | "score" | "updated_at";
  direction: "asc" | "desc";
}

// Exam session types for starting/continuing exams
export interface ExamSession {
  exam_attempt_id: string;
  practice_exam_id: string;
  status: "in_progress" | "completed";
  current_question?: number;
  total_questions: number;
  time_remaining_minutes?: number;
  started_at: string;
  mode: ExamMode;
}

// Statistics for dashboard
export interface PracticeExamStats {
  total_exams_available: number;
  total_exams_enrolled: number;
  total_attempts: number;
  completed_exams: number;
  average_score?: number;
  in_progress_count: number;
}

export interface PracticeExamSelection {
  id: string;
  name: string;
  question_count: number;
  passing_threshold_percentage: number;
  time_limit_minutes: number;
  is_active: boolean;
  attempt_status?: "start" | "continue" | "restart";
  current_attempt_id?: string;
  current_attempt_mode?: "exam" | "practice";
  last_score?: number;
  attempt_count?: number;
  best_score?: number;
  best_score_passed?: boolean;
}
