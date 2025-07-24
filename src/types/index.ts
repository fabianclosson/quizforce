// Export catalog types (replaces old types with database-aligned ones)
export * from "./catalog";
export * from "./dashboard";
export type { Database } from "./database";
export * from "./practice-exams";
export * from "./exam";

// Import specific types for use in this file
import type { CertificationPackage, Certification } from "./catalog";

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Exam types
export interface PracticeExam {
  id: string;
  name: string;
  certificationId: string;
  questionCount: number;
  timeLimit: number; // in minutes
  passingThreshold: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  practiceExamId: string;
  areaId: string;
  questionText: string;
  type: "multiple-choice" | "multiple-select" | "true-false";
  explanation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
  explanation?: string;
}

// Knowledge Area types
export interface KnowledgeArea {
  id: string;
  certificationId: string;
  name: string;
  weighting: number; // percentage
  description: string;
}

// User Progress types
export interface Enrollment {
  id: string;
  userId: string;
  certificationId: string;
  enrolledAt: Date;
  expiresAt: Date;
  paymentId?: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  practiceExamId: string;
  score: number; // percentage
  passed: boolean;
  timeSpent: number; // in minutes
  startedAt: Date;
  completedAt?: Date;
  status: "in-progress" | "completed" | "abandoned";
}

export interface UserAnswer {
  id: string;
  examAttemptId: string;
  questionId: string;
  selectedAnswerIds: string[];
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentIntentId: string; // Stripe payment intent ID
  productType: "certification" | "package";
  productId: string;
  couponCode?: string;
  discountAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review types
export interface Review {
  id: string;
  userId: string;
  certificationId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Additional package types for admin management (extends catalog types)
export interface AdminCertificationPackage extends CertificationPackage {
  certification_count: number;
  individual_total_cents: number;
  savings_cents: number;
  savings_percentage: number;
  certifications: Certification[];
}

export interface PackageCertification {
  id: string;
  package_id: string;
  certification_id: string;
  sort_order: number;
  created_at: string;
}

export interface PackageFormData {
  name: string;
  slug: string;
  description?: string;
  detailed_description?: string;
  price_cents: number;
  discount_percentage: number;
  is_active: boolean;
  is_featured: boolean;
  valid_months: number;
  sort_order: number;
  certification_ids: string[];
}
