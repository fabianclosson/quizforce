// Database types for QuizForce
// Generated from database schema migrations

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: UserPreferencesInsert;
        Update: UserPreferencesUpdate;
      };
      user_sessions: {
        Row: UserSession;
        Insert: UserSessionInsert;
        Update: UserSessionUpdate;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
      };
      certification_categories: {
        Row: CertificationCategory;
        Insert: CertificationCategoryInsert;
        Update: CertificationCategoryUpdate;
      };
      certifications: {
        Row: Certification;
        Insert: CertificationInsert;
        Update: CertificationUpdate;
      };
      certification_packages: {
        Row: CertificationPackage;
        Insert: CertificationPackageInsert;
        Update: CertificationPackageUpdate;
      };
      package_certifications: {
        Row: PackageCertification;
        Insert: PackageCertificationInsert;
        Update: PackageCertificationUpdate;
      };
      knowledge_areas: {
        Row: KnowledgeArea;
        Insert: KnowledgeAreaInsert;
        Update: KnowledgeAreaUpdate;
      };
      practice_exams: {
        Row: PracticeExam;
        Insert: PracticeExamInsert;
        Update: PracticeExamUpdate;
      };
      questions: {
        Row: Question;
        Insert: QuestionInsert;
        Update: QuestionUpdate;
      };
      answers: {
        Row: Answer;
        Insert: AnswerInsert;
        Update: AnswerUpdate;
      };
      enrollments: {
        Row: Enrollment;
        Insert: EnrollmentInsert;
        Update: EnrollmentUpdate;
      };
      exam_attempts: {
        Row: ExamAttempt;
        Insert: ExamAttemptInsert;
        Update: ExamAttemptUpdate;
      };
      user_answers: {
        Row: UserAnswer;
        Insert: UserAnswerInsert;
        Update: UserAnswerUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
      coupon_codes: {
        Row: CouponCode;
        Insert: CouponCodeInsert;
        Update: CouponCodeUpdate;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: {
      user_role: "user" | "admin" | "instructor";
      account_status: "active" | "suspended" | "banned" | "pending";
      theme: "light" | "dark" | "system";
      study_time: "morning" | "afternoon" | "evening" | "night";
      difficulty_level: "easy" | "medium" | "hard";
      enrollment_source: "direct" | "package";
      attempt_status: "in_progress" | "completed" | "abandoned";
      answer_letter: "A" | "B" | "C" | "D" | "E";
      payment_status: "pending" | "completed" | "failed" | "refunded";
      product_type: "certification" | "package";
      discount_type: "percentage" | "fixed_amount";
    };
  };
}

// User Profile Types (Simplified to match PRD)
export interface Profile {
  id: string; // UUID from auth.users
  first_name: string | null; // From registration or Google OAuth
  last_name: string | null; // From registration or Google OAuth
  avatar_url: string | null; // Profile picture from Google OAuth or uploaded
  role: Database["public"]["Enums"]["user_role"];
  email_verified: boolean;
  marketing_consent: boolean;
  terms_accepted_at: string | null; // ISO timestamp
  privacy_policy_accepted_at: string | null; // ISO timestamp
  last_login_at: string | null; // ISO timestamp
  login_count: number;
  account_status: Database["public"]["Enums"]["account_status"];
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface ProfileInsert {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  role?: Database["public"]["Enums"]["user_role"];
  email_verified?: boolean;
  marketing_consent?: boolean;
  terms_accepted_at?: string | null;
  privacy_policy_accepted_at?: string | null;
  last_login_at?: string | null;
  login_count?: number;
  account_status?: Database["public"]["Enums"]["account_status"];
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  role?: Database["public"]["Enums"]["user_role"];
  email_verified?: boolean;
  marketing_consent?: boolean;
  terms_accepted_at?: string | null;
  privacy_policy_accepted_at?: string | null;
  last_login_at?: string | null;
  login_count?: number;
  account_status?: Database["public"]["Enums"]["account_status"];
  updated_at?: string;
}

// User Preferences Types
export interface UserPreferences {
  id: string;
  user_id: string;
  theme: Database["public"]["Enums"]["theme"];
  email_notifications: boolean;
  exam_reminders: boolean;
  marketing_emails: boolean;
  study_goal_hours: number; // 1-12 hours daily goal
  preferred_study_time: Database["public"]["Enums"]["study_time"];
  auto_save_progress: boolean;
  show_hints: boolean;
  show_explanations: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInsert {
  id?: string;
  user_id: string;
  theme?: Database["public"]["Enums"]["theme"];
  email_notifications?: boolean;
  exam_reminders?: boolean;
  marketing_emails?: boolean;
  study_goal_hours?: number;
  preferred_study_time?: Database["public"]["Enums"]["study_time"];
  auto_save_progress?: boolean;
  show_hints?: boolean;
  show_explanations?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferencesUpdate {
  theme?: Database["public"]["Enums"]["theme"];
  email_notifications?: boolean;
  exam_reminders?: boolean;
  marketing_emails?: boolean;
  study_goal_hours?: number;
  preferred_study_time?: Database["public"]["Enums"]["study_time"];
  auto_save_progress?: boolean;
  show_hints?: boolean;
  show_explanations?: boolean;
  updated_at?: string;
}

// User Session Types
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string | null;
  device_info: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  location_info: Record<string, unknown> | null;
  started_at: string;
  last_activity_at: string;
  ended_at: string | null;
  session_duration: string | null; // PostgreSQL interval as string
  is_active: boolean;
}

export interface UserSessionInsert {
  id?: string;
  user_id: string;
  session_token?: string | null;
  device_info?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  location_info?: Record<string, unknown> | null;
  started_at?: string;
  last_activity_at?: string;
  ended_at?: string | null;
  session_duration?: string | null;
  is_active?: boolean;
}

export interface UserSessionUpdate {
  session_token?: string | null;
  device_info?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  location_info?: Record<string, unknown> | null;
  last_activity_at?: string;
  ended_at?: string | null;
  session_duration?: string | null;
  is_active?: boolean;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogInsert {
  id?: string;
  user_id?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

export interface AuditLogUpdate {
  action?: string;
  resource_type?: string | null;
  resource_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

// Helper types for user data
export interface ProfileWithPreferences extends Profile {
  preferences: UserPreferences;
}

export interface UserActivity {
  profile: Profile;
  recent_sessions: UserSession[];
  recent_actions: AuditLog[];
}

// Type guards for runtime validation
export const isProfile = (obj: unknown): obj is Profile => {
  return (
    typeof obj === "object" && obj !== null && "id" in obj && "role" in obj
  );
};

export const isUserPreferences = (obj: unknown): obj is UserPreferences => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "user_id" in obj &&
    "theme" in obj
  );
};

// ============================================================================
// CERTIFICATION STRUCTURE TYPES (SIMPLIFIED)
// ============================================================================

// Certification categories (Associates, Admins, Developers, etc.)
export interface CertificationCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificationCategoryInsert {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CertificationCategoryUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
  updated_at?: string;
}

// Individual certification practice bundles
export interface Certification {
  id: string;
  name: string; // e.g., "Salesforce Administrator Practice Bundle"
  slug: string;
  description: string | null;
  detailed_description: string | null;
  category_id: string;
  price_cents: number; // 0 = free, >0 = premium
  exam_count: number; // Number of practice exams
  total_questions: number; // Total questions across all exams
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificationInsert {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  detailed_description?: string | null;
  category_id: string;
  price_cents?: number;
  exam_count?: number;
  total_questions?: number;
  is_active?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CertificationUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  detailed_description?: string | null;
  category_id?: string;
  price_cents?: number;
  exam_count?: number;
  total_questions?: number;
  is_active?: boolean;
  is_featured?: boolean;
  updated_at?: string;
}

// Multi-certification bundle packages
export interface CertificationPackage {
  id: string;
  name: string; // e.g., "Administrator Career Path"
  slug: string;
  description: string | null;
  detailed_description: string | null;
  price_cents: number; // Package price
  discount_percentage: number; // Discount vs individual purchases
  is_active: boolean;
  is_featured: boolean;
  valid_months: number; // 12-month access as per PRD
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CertificationPackageInsert {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  detailed_description?: string | null;
  price_cents?: number;
  discount_percentage?: number;
  is_active?: boolean;
  is_featured?: boolean;
  valid_months?: number;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CertificationPackageUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  detailed_description?: string | null;
  price_cents?: number;
  discount_percentage?: number;
  is_active?: boolean;
  is_featured?: boolean;
  valid_months?: number;
  sort_order?: number;
  updated_at?: string;
}

// Package certifications junction table
export interface PackageCertification {
  id: string;
  package_id: string;
  certification_id: string;
  sort_order: number;
  created_at: string;
}

export interface PackageCertificationInsert {
  id?: string;
  package_id: string;
  certification_id: string;
  sort_order?: number;
  created_at?: string;
}

export interface PackageCertificationUpdate {
  sort_order?: number;
}

// Helper types for certification data with relationships
export interface CertificationWithCategory extends Certification {
  category: CertificationCategory;
}

export interface CertificationPackageWithCertifications
  extends CertificationPackage {
  certifications: Array<{
    certification: CertificationWithCategory;
    sort_order: number;
  }>;
}

// Catalog display types
export interface CertificationCatalogItem {
  certification: CertificationWithCategory;
  packages: CertificationPackage[]; // Packages that include this certification
  user_enrolled?: boolean;
}

export interface PackageCatalogItem {
  package: CertificationPackageWithCertifications;
  total_individual_price: number; // Sum of individual certification prices
  savings_amount: number; // Discount amount in cents
  user_enrolled?: boolean;
}

// Type guards for certification types
export const isCertification = (obj: unknown): obj is Certification => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "category_id" in obj &&
    "price_cents" in obj
  );
};

export const isCertificationPackage = (
  obj: unknown
): obj is CertificationPackage => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "price_cents" in obj &&
    "valid_months" in obj
  );
};

// Constants matching database constraints
export const USER_ROLES = ["user", "admin", "instructor"] as const;
export const ACCOUNT_STATUSES = [
  "active",
  "suspended",
  "banned",
  "pending",
] as const;
export const THEMES = ["light", "dark", "system"] as const;
export const STUDY_TIMES = [
  "morning",
  "afternoon",
  "evening",
  "night",
] as const;
export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;
export const ENROLLMENT_SOURCES = ["direct", "package"] as const;
export const ATTEMPT_STATUSES = [
  "in_progress",
  "completed",
  "abandoned",
] as const;
export const ANSWER_LETTERS = ["A", "B", "C", "D", "E"] as const;

// ============================================================================
// EXAM CONTENT TYPES
// ============================================================================

// Knowledge Area Types
export interface KnowledgeArea {
  id: string;
  certification_id: string;
  name: string; // e.g., "Data Cloud Setup"
  description: string | null;
  weight_percentage: number; // e.g., 12 for 12%
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeAreaInsert {
  id?: string;
  certification_id: string;
  name: string;
  description?: string | null;
  weight_percentage: number;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeAreaUpdate {
  name?: string;
  description?: string | null;
  weight_percentage?: number;
  sort_order?: number;
  updated_at?: string;
}

// Practice Exam Types
export interface PracticeExam {
  id: string;
  certification_id: string;
  name: string; // e.g., "Administrator Practice Exam 1"
  description: string | null;
  question_count: number;
  time_limit_minutes: number;
  passing_threshold_percentage: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeExamInsert {
  id?: string;
  certification_id: string;
  name: string;
  description?: string | null;
  question_count: number;
  time_limit_minutes?: number;
  passing_threshold_percentage?: number;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PracticeExamUpdate {
  name?: string;
  description?: string | null;
  question_count?: number;
  time_limit_minutes?: number;
  passing_threshold_percentage?: number;
  sort_order?: number;
  is_active?: boolean;
  updated_at?: string;
}

// Question Types
export interface Question {
  id: string;
  practice_exam_id: string;
  knowledge_area_id: string;
  question_text: string;
  explanation: string | null;
  difficulty_level: Database["public"]["Enums"]["difficulty_level"];
  question_number: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionInsert {
  id?: string;
  practice_exam_id: string;
  knowledge_area_id: string;
  question_text: string;
  explanation?: string | null;
  difficulty_level?: Database["public"]["Enums"]["difficulty_level"];
  question_number: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionUpdate {
  question_text?: string;
  explanation?: string | null;
  difficulty_level?: Database["public"]["Enums"]["difficulty_level"];
  question_number?: number;
  updated_at?: string;
}

// Answer Types
export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  explanation: string | null;
  is_correct: boolean;
  answer_letter: Database["public"]["Enums"]["answer_letter"];
  created_at: string;
}

export interface AnswerInsert {
  id?: string;
  question_id: string;
  answer_text: string;
  explanation?: string | null;
  is_correct?: boolean;
  answer_letter: Database["public"]["Enums"]["answer_letter"];
  created_at?: string;
}

export interface AnswerUpdate {
  answer_text?: string;
  explanation?: string | null;
  is_correct?: boolean;
  answer_letter?: Database["public"]["Enums"]["answer_letter"];
}

// Enrollment Types
export interface Enrollment {
  id: string;
  user_id: string;
  certification_id: string;
  enrolled_at: string;
  expires_at: string; // 12-month access period
  purchase_price_cents: number;
  payment_id: string | null;
  source: Database["public"]["Enums"]["enrollment_source"];
  package_id: string | null;
  created_at: string;
}

export interface EnrollmentInsert {
  id?: string;
  user_id: string;
  certification_id: string;
  enrolled_at?: string;
  expires_at?: string; // Auto-calculated by trigger
  purchase_price_cents?: number;
  payment_id?: string | null;
  source?: Database["public"]["Enums"]["enrollment_source"];
  package_id?: string | null;
  created_at?: string;
}

export interface EnrollmentUpdate {
  expires_at?: string;
  purchase_price_cents?: number;
  payment_id?: string | null;
}

// Exam Attempt Types
export interface ExamAttempt {
  id: string;
  user_id: string;
  practice_exam_id: string;
  started_at: string;
  completed_at: string | null;
  score_percentage: number | null;
  correct_answers: number;
  total_questions: number;
  passed: boolean | null;
  time_spent_minutes: number | null;
  status: Database["public"]["Enums"]["attempt_status"];
  created_at: string;
}

export interface ExamAttemptInsert {
  id?: string;
  user_id: string;
  practice_exam_id: string;
  started_at?: string;
  completed_at?: string | null;
  score_percentage?: number | null;
  correct_answers?: number;
  total_questions?: number;
  passed?: boolean | null;
  time_spent_minutes?: number | null;
  status?: Database["public"]["Enums"]["attempt_status"];
  created_at?: string;
}

export interface ExamAttemptUpdate {
  completed_at?: string | null;
  score_percentage?: number | null;
  correct_answers?: number;
  total_questions?: number;
  passed?: boolean | null;
  time_spent_minutes?: number | null;
  status?: Database["public"]["Enums"]["attempt_status"];
}

// User Answer Types
export interface UserAnswer {
  id: string;
  exam_attempt_id: string;
  question_id: string;
  answer_id: string | null;
  answered_at: string;
  is_correct: boolean | null;
  time_spent_seconds: number;
}

export interface UserAnswerInsert {
  id?: string;
  exam_attempt_id: string;
  question_id: string;
  answer_id?: string | null;
  answered_at?: string;
  is_correct?: boolean | null; // Auto-calculated by trigger
  time_spent_seconds?: number;
}

export interface UserAnswerUpdate {
  answer_id?: string | null;
  answered_at?: string;
  is_correct?: boolean | null;
  time_spent_seconds?: number;
}

// ============================================================================
// PAYMENT PROCESSING TYPES
// ============================================================================

// Payment Types
export interface Payment {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string;
  stripe_session_id: string | null;
  product_type: Database["public"]["Enums"]["product_type"];
  product_id: string;
  product_name: string;
  amount_cents: number;
  currency: string;
  discount_amount_cents: number;
  final_amount_cents: number;
  status: Database["public"]["Enums"]["payment_status"];
  coupon_code: string | null;
  created_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface PaymentInsert {
  id?: string;
  user_id: string;
  stripe_payment_intent_id: string;
  stripe_session_id?: string | null;
  product_type: Database["public"]["Enums"]["product_type"];
  product_id: string;
  product_name: string;
  amount_cents: number;
  currency?: string;
  discount_amount_cents?: number;
  final_amount_cents: number;
  status?: Database["public"]["Enums"]["payment_status"];
  coupon_code?: string | null;
  created_at?: string;
  completed_at?: string | null;
  metadata?: Record<string, unknown>;
}

export interface PaymentUpdate {
  stripe_session_id?: string | null;
  status?: Database["public"]["Enums"]["payment_status"];
  completed_at?: string | null;
  metadata?: Record<string, unknown>;
}

// Coupon Code Types
export interface CouponCode {
  id: string;
  code: string;
  discount_type: Database["public"]["Enums"]["discount_type"];
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponCodeInsert {
  id?: string;
  code: string;
  discount_type: Database["public"]["Enums"]["discount_type"];
  discount_value: number;
  max_uses?: number | null;
  current_uses?: number;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CouponCodeUpdate {
  code?: string;
  discount_type?: Database["public"]["Enums"]["discount_type"];
  discount_value?: number;
  max_uses?: number | null;
  current_uses?: number;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

// Payment Processing Helper Types
export interface PaymentWithProduct extends Payment {
  product?: Certification | CertificationPackage;
}

export interface PurchaseHistoryItem {
  payment: Payment;
  product: Certification | CertificationPackage;
  enrollments: Enrollment[];
  access_status: "active" | "expired" | "pending";
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discount_type?: Database["public"]["Enums"]["discount_type"];
  discount_value?: number;
  code?: string;
}

// Type guards for payment processing
export const isPayment = (obj: unknown): obj is Payment => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "user_id" in obj &&
    "stripe_payment_intent_id" in obj &&
    "product_type" in obj &&
    "amount_cents" in obj
  );
};

export const isCouponCode = (obj: unknown): obj is CouponCode => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "code" in obj &&
    "discount_type" in obj &&
    "discount_value" in obj
  );
};

// ============================================================================
// REVIEW SYSTEM TYPES
// ============================================================================

// Review Types
export interface Review {
  id: string;
  user_id: string;
  certification_id: string;
  rating: number; // 1-5 star rating
  review_text: string | null; // Optional comment
  created_at: string;
  updated_at: string;
}

export interface ReviewInsert {
  id?: string;
  user_id: string;
  certification_id: string;
  rating: number;
  review_text?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewUpdate {
  rating?: number;
  review_text?: string | null;
  updated_at?: string;
}

// Review with user profile information
export interface ReviewWithUser extends Review {
  user: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Certification with review statistics
export interface CertificationWithReviews extends Certification {
  average_rating: number;
  review_count: number;
  reviews?: ReviewWithUser[];
}

// Type guard for review types
export const isReview = (obj: unknown): obj is Review => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "user_id" in obj &&
    "certification_id" in obj &&
    "rating" in obj
  );
};
