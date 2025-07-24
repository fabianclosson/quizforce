// Exam Taking Interface Types
// Based on database schema in database/migrations/003_exam_content_schema.sql

export type ExamMode = "exam" | "practice";

export interface Question {
  id: string;
  practice_exam_id: string;
  knowledge_area_id: string;
  question_text: string;
  explanation?: string;
  difficulty_level: "easy" | "medium" | "hard";
  question_number: number;
  required_selections: number; // Number of answers student must select (1=single, 2-4=multi)
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  explanation?: string;
  is_correct: boolean;
  answer_letter: "A" | "B" | "C" | "D" | "E";
  created_at: string;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
  knowledge_area: {
    id: string;
    name: string;
    description?: string;
    weight_percentage: number;
  };
}

export interface UserAnswer {
  id?: string;
  exam_attempt_id: string;
  question_id: string;
  answer_id?: string;
  answered_at?: string;
  is_correct?: boolean;
  time_spent_seconds: number;
}

export interface ExamAttemptDetails {
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

export interface ExamSessionData {
  attempt: ExamAttemptDetails;
  questions: QuestionWithAnswers[];
  user_answers: UserAnswer[];
  current_question_index: number;
  time_remaining_seconds: number;
  is_flagged: Record<string, boolean>; // question_id -> flagged status
}

export interface ExamProgress {
  answered_count: number;
  flagged_count: number;
  total_questions: number;
  current_question: number;
  time_remaining_seconds: number;
  auto_save_status: "saving" | "saved" | "error" | "idle";
}

export interface QuestionStatus {
  answered: boolean;
  flagged: boolean;
  current: boolean;
}

export interface ExamSubmissionData {
  exam_attempt_id: string;
  answers: UserAnswer[];
  completed_at: string;
  time_spent_minutes: number;
}

export interface ExamResults {
  attempt_id: string;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  time_spent_minutes: number;
  question_results: {
    question_id: string;
    question_number: number;
    user_answer_id?: string;
    correct_answer_id: string;
    is_correct: boolean;
    time_spent_seconds: number;
    knowledge_area: string;
  }[];
}

// Pre-exam page data
export interface PreExamData {
  practice_exam: {
    id: string;
    name: string;
    description?: string;
    question_count: number;
    time_limit_minutes: number;
    passing_threshold_percentage: number;
    certification: {
      name: string;
      category: {
        name: string;
        color: string;
      };
    };
  };
  user_status: {
    is_enrolled: boolean;
    previous_attempts: number;
    best_score?: number;
    can_retake: boolean;
  };
  knowledge_areas: {
    id: string;
    name: string;
    weight_percentage: number;
    question_count: number;
  }[];
}

// API request/response types
export interface StartExamRequest {
  practice_exam_id: string;
  mode: ExamMode;
}

export interface StartExamResponse {
  exam_attempt_id: string;
  session_data: ExamSessionData;
}

export interface SaveAnswerRequest {
  exam_attempt_id: string;
  question_id: string;
  answer_id?: string; // For backward compatibility (single answer)
  answer_ids?: string[]; // For multi-answer questions
  time_spent_seconds: number;
}

export interface SaveAnswerResponse {
  success: boolean;
  user_answer: UserAnswer; // For backward compatibility (single answer)
  user_answers?: UserAnswer[]; // For multi-answer questions
}

export interface SubmitExamRequest {
  exam_attempt_id: string;
  final_answers: UserAnswer[];
}

export interface SubmitExamResponse {
  success: boolean;
  results: ExamResults;
}
