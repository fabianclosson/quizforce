import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PracticeExamTable } from "@/components/exam/practice-exam-table";
import { PracticeExamWithStatus } from "@/types/practice-exams";

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "2 days ago"),
}));

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
      name: "Test Certification",
      slug: "test-certification",
      price_cents: 0,
      exam_count: 1,
      total_questions: 50,
      is_active: true,
      category: {
        id: "cat-1",
        name: "Administrator",
        slug: "administrator",
        color: "#3B82F6",
      },
    },
    status: "not_started",
    is_enrolled: true,
    best_score: undefined,
    attempt_count: 0,
    latest_attempt: undefined,
  },
  {
    id: "2",
    certification_id: "cert-1",
    name: "Admin Exam 2",
    description: "Second admin exam",
    question_count: 65,
    time_limit_minutes: 105,
    passing_threshold_percentage: 70,
    sort_order: 2,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    certification: {
      id: "cert-1",
      name: "Test Certification",
      slug: "test-certification",
      price_cents: 0,
      exam_count: 1,
      total_questions: 50,
      is_active: true,
      category: {
        id: "cat-1",
        name: "Administrator",
        slug: "administrator",
        color: "#3B82F6",
      },
    },
    status: "completed",
    is_enrolled: true,
    best_score: 85,
    attempt_count: 2,
    latest_attempt: {
      id: "attempt-1",
      practice_exam_id: "2",
      user_id: "user-1",
      started_at: "2024-01-15T10:00:00Z",
      completed_at: "2024-01-15T11:30:00Z",
      score_percentage: 85,
      correct_answers: 55,
      total_questions: 65,
      passed: true,
      time_spent_minutes: 90,
      status: "completed",
      mode: "exam" as const,
      created_at: "2024-01-15T10:00:00Z",
    },
  },
];

describe("PracticeExamTable", () => {
  const mockOnStartExam = jest.fn();
  const mockOnContinueExam = jest.fn();
  const mockOnViewResults = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders table with exam data", () => {
    render(
      <PracticeExamTable
        exams={mockExams}
        onStartExam={mockOnStartExam}
        onContinueExam={mockOnContinueExam}
        onViewResults={mockOnViewResults}
      />
    );

    expect(screen.getByText("Admin Exam 1")).toBeInTheDocument();
    expect(screen.getByText("Admin Exam 2")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("90m")).toBeInTheDocument();
    expect(screen.getByText("Not Started")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<PracticeExamTable exams={[]} loading={true} />);

    // Should show loading skeletons
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when no exams", () => {
    render(<PracticeExamTable exams={[]} />);

    expect(screen.getByText("No Practice Exams Found")).toBeInTheDocument();
  });

  it("calls onStartExam when start button is clicked", () => {
    render(
      <PracticeExamTable
        exams={mockExams}
        onStartExam={mockOnStartExam}
        onContinueExam={mockOnContinueExam}
        onViewResults={mockOnViewResults}
      />
    );

    const startButton = screen.getByText("Start Exam");
    fireEvent.click(startButton);

    expect(mockOnStartExam).toHaveBeenCalledWith("1");
  });

  it("calls onViewResults when view results button is clicked", () => {
    render(
      <PracticeExamTable
        exams={mockExams}
        onStartExam={mockOnStartExam}
        onContinueExam={mockOnContinueExam}
        onViewResults={mockOnViewResults}
      />
    );

    const viewResultsButton = screen.getByText("View Results");
    fireEvent.click(viewResultsButton);

    expect(mockOnViewResults).toHaveBeenCalledWith("2");
  });

  it("displays score with trophy icon for passing score", () => {
    render(
      <PracticeExamTable
        exams={mockExams}
        onStartExam={mockOnStartExam}
        onContinueExam={mockOnContinueExam}
        onViewResults={mockOnViewResults}
      />
    );

    expect(screen.getByText("85%")).toBeInTheDocument();
    // Trophy icon should be present for passing score
    const trophyIcon = document.querySelector(".lucide-trophy");
    expect(trophyIcon).toBeInTheDocument();
  });

  it("shows enrollment required for non-enrolled premium exams", () => {
    const premiumExam = {
      ...mockExams[0],
      is_enrolled: false,
      certification: {
        ...mockExams[0].certification,
        price_cents: 4999,
      },
    };

    render(
      <PracticeExamTable
        exams={[premiumExam]}
        onStartExam={mockOnStartExam}
        onContinueExam={mockOnContinueExam}
        onViewResults={mockOnViewResults}
      />
    );

    expect(screen.getByText("Enrollment Required")).toBeInTheDocument();
  });

  it("displays attempt count", () => {
    render(
      <PracticeExamTable
        exams={mockExams}
        onStartExam={mockOnStartExam}
        onContinueExam={mockOnContinueExam}
        onViewResults={mockOnViewResults}
      />
    );

    expect(screen.getByText("0")).toBeInTheDocument(); // First exam
    expect(screen.getByText("2")).toBeInTheDocument(); // Second exam
  });

  it("displays last attempt information", () => {
    render(
      <PracticeExamTable
        exams={mockExams}
        onStartExam={mockOnStartExam}
        onContinueExam={mockOnContinueExam}
        onViewResults={mockOnViewResults}
      />
    );

    expect(screen.getByText("Never attempted")).toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });
});
