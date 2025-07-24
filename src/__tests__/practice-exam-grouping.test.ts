import {
  groupExamsByCertification,
  groupExamsByCategory,
  sortGroupedExamsByCertification,
  filterGroupsByEnrollment,
  filterGroupsByExamStatus,
  getGroupedExamStats,
  getAvailableExams,
  getNextRecommendedExam,
} from "@/utils/practice-exam-grouping";
import { PracticeExamWithStatus } from "@/types/practice-exams";

// Mock data for testing
const mockExams: PracticeExamWithStatus[] = [
  {
    id: "1",
    certification_id: "cert-1",
    name: "Admin Exam 1",
    description: "First admin exam",
    question_count: 60,
    time_limit_minutes: 90,
    passing_threshold_percentage: 65,
    sort_order: 1,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    certification: {
      id: "cert-1",
      name: "Salesforce Administrator",
      slug: "salesforce-administrator",
      price_cents: 0,
      exam_count: 2,
      total_questions: 120,
      is_active: true,
      category: {
        id: "cat-1",
        name: "Administration",
        slug: "administration",
        icon: "shield",
        color: "blue",
      },
    },
    latest_attempt: undefined,
    best_score: undefined,
    attempt_count: 0,
    status: "not_started",
    is_enrolled: true,
  },
  {
    id: "2",
    certification_id: "cert-1",
    name: "Admin Exam 2",
    description: "Second admin exam",
    question_count: 60,
    time_limit_minutes: 90,
    passing_threshold_percentage: 65,
    sort_order: 2,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    certification: {
      id: "cert-1",
      name: "Salesforce Administrator",
      slug: "salesforce-administrator",
      price_cents: 0,
      exam_count: 2,
      total_questions: 120,
      is_active: true,
      category: {
        id: "cat-1",
        name: "Administration",
        slug: "administration",
        icon: "shield",
        color: "blue",
      },
    },
    latest_attempt: undefined,
    best_score: 85,
    attempt_count: 1,
    status: "completed",
    is_enrolled: true,
  },
  {
    id: "3",
    certification_id: "cert-2",
    name: "Developer Exam 1",
    description: "First developer exam",
    question_count: 60,
    time_limit_minutes: 105,
    passing_threshold_percentage: 68,
    sort_order: 1,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    certification: {
      id: "cert-2",
      name: "Platform Developer I",
      slug: "platform-developer-i",
      price_cents: 4900,
      exam_count: 1,
      total_questions: 60,
      is_active: true,
      category: {
        id: "cat-2",
        name: "Developer",
        slug: "developer",
        icon: "dev-icon",
        color: "#10B981",
      },
    },
    latest_attempt: undefined,
    best_score: undefined,
    attempt_count: 0,
    status: "not_started",
    is_enrolled: false,
  },
];

describe("Practice Exam Grouping Utilities", () => {
  describe("groupExamsByCertification", () => {
    it("should group exams by certification correctly", () => {
      const grouped = groupExamsByCertification(mockExams);

      expect(grouped).toHaveLength(2);
      expect(grouped[0].certification.name).toBe("Salesforce Administrator");
      expect(grouped[0].exams).toHaveLength(2);
      expect(grouped[1].certification.name).toBe("Platform Developer I");
      expect(grouped[1].exams).toHaveLength(1);
    });

    it("should preserve enrollment status in groups", () => {
      const grouped = groupExamsByCertification(mockExams);

      expect(grouped[0].is_enrolled).toBe(true);
      expect(grouped[1].is_enrolled).toBe(false);
    });
  });

  describe("groupExamsByCategory", () => {
    it("should group certifications by category", () => {
      const categorized = groupExamsByCategory(mockExams);

      expect(Object.keys(categorized)).toHaveLength(2);
      expect(categorized["Administrator"]).toHaveLength(1);
      expect(categorized["Developer"]).toHaveLength(1);
    });
  });

  describe("sortGroupedExamsByCertification", () => {
    it("should sort groups by certification name", () => {
      const grouped = groupExamsByCertification(mockExams);
      const sorted = sortGroupedExamsByCertification(grouped, "asc");

      expect(sorted[0].certification.name).toBe("Platform Developer I");
      expect(sorted[1].certification.name).toBe("Salesforce Administrator");
    });
  });

  describe("filterGroupsByEnrollment", () => {
    it("should filter to only enrolled certifications", () => {
      const grouped = groupExamsByCertification(mockExams);
      const filtered = filterGroupsByEnrollment(grouped, true);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].certification.name).toBe("Salesforce Administrator");
    });

    it("should return all groups when enrolledOnly is false", () => {
      const grouped = groupExamsByCertification(mockExams);
      const filtered = filterGroupsByEnrollment(grouped, false);

      expect(filtered).toHaveLength(2);
    });
  });

  describe("filterGroupsByExamStatus", () => {
    it("should filter groups by exam status", () => {
      const grouped = groupExamsByCertification(mockExams);
      const filtered = filterGroupsByExamStatus(grouped, "completed");

      expect(filtered).toHaveLength(1);
      expect(filtered[0].exams).toHaveLength(1);
      expect(filtered[0].exams[0].status).toBe("completed");
    });

    it("should return empty groups when no exams match status", () => {
      const grouped = groupExamsByCertification(mockExams);
      const filtered = filterGroupsByExamStatus(grouped, "in_progress");

      expect(filtered).toHaveLength(0);
    });
  });

  describe("getGroupedExamStats", () => {
    it("should calculate correct statistics", () => {
      const grouped = groupExamsByCertification(mockExams);
      const stats = getGroupedExamStats(grouped);

      expect(stats.total_certifications).toBe(2);
      expect(stats.total_exams).toBe(3);
      expect(stats.enrolled_certifications).toBe(1);
      expect(stats.completed_exams).toBe(1);
      expect(stats.not_started_exams).toBe(2);
      expect(stats.best_score).toBe(85);
      expect(stats.average_score).toBe(85);
    });
  });

  describe("getAvailableExams", () => {
    it("should return available exams from enrolled certifications", () => {
      const grouped = groupExamsByCertification(mockExams);
      const available = getAvailableExams(grouped);

      expect(available).toHaveLength(1);
      expect(available[0].name).toBe("Admin Exam 1");
      expect(available[0].status).toBe("not_started");
    });
  });

  describe("getNextRecommendedExam", () => {
    it("should recommend not_started exam from enrolled certification", () => {
      const grouped = groupExamsByCertification(mockExams);
      const recommended = getNextRecommendedExam(grouped);

      expect(recommended).not.toBeNull();
      expect(recommended?.name).toBe("Admin Exam 1");
      expect(recommended?.status).toBe("not_started");
    });

    it("should recommend free exam when no enrolled exams available", () => {
      const modifiedExams = mockExams.map(exam => ({
        ...exam,
        is_enrolled: false,
        certification: {
          ...exam.certification,
          price_cents: exam.certification.id === "cert-1" ? 0 : 4900,
        },
      }));

      const grouped = groupExamsByCertification(modifiedExams);
      const recommended = getNextRecommendedExam(grouped);

      expect(recommended).not.toBeNull();
      expect(recommended?.certification.price_cents).toBe(0);
    });
  });
});
