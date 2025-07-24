import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  PracticeExamTable,
  PracticeExamList,
  CertificationGroup,
} from "@/components/exam";
import {
  PracticeExamWithStatus,
  GroupedPracticeExams,
} from "@/types/practice-exams";

const mockExam: PracticeExamWithStatus = {
  id: "1",
  certification_id: "cert-1",
  name: "Test Exam",
  description: "Test exam description",
  question_count: 50,
  time_limit_minutes: 60,
  passing_threshold_percentage: 70,
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
      name: "Test Category",
      slug: "test-category",
      color: "#3B82F6",
    },
  },
  status: "not_started",
  is_enrolled: true,
  best_score: undefined,
  attempt_count: 0,
  latest_attempt: undefined,
};

const mockGroupedExam: GroupedPracticeExams = {
  certification: {
    id: "cert-1",
    name: "Test Certification",
    slug: "test-certification",
    category: {
      name: "Test Category",
      slug: "test-category",
      color: "#3B82F6",
    },
    price_cents: 0,
    exam_count: 1,
    total_questions: 50,
  },
  exams: [mockExam],
  is_enrolled: true,
};

describe("Practice Exam Error States", () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PracticeExamTable Error State", () => {
    it("displays error message when error prop is provided", () => {
      render(
        <PracticeExamTable
          exams={[]}
          error="Failed to load exams"
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText("Error Loading Exams")).toBeInTheDocument();
      expect(screen.getByText("Failed to load exams")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("displays default error message when error is empty string", () => {
      render(<PracticeExamTable exams={[]} error="" onRetry={mockOnRetry} />);

      expect(
        screen.getByText("Failed to load practice exams. Please try again.")
      ).toBeInTheDocument();
    });

    it("calls onRetry when Try Again button is clicked", () => {
      render(
        <PracticeExamTable
          exams={[]}
          error="Network error"
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it("does not show Try Again button when onRetry is not provided", () => {
      render(<PracticeExamTable exams={[]} error="Network error" />);

      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });

    it("displays error icon in error state", () => {
      render(
        <PracticeExamTable
          exams={[]}
          error="Network error"
          onRetry={mockOnRetry}
        />
      );

      const errorIcon = document.querySelector("svg");
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe("PracticeExamList Error State", () => {
    it("displays error message when error prop is provided", () => {
      render(
        <PracticeExamList
          groupedExams={[]}
          error="Failed to fetch data"
          onRetry={mockOnRetry}
        />
      );

      expect(
        screen.getByText("Failed to Load Practice Exams")
      ).toBeInTheDocument();
      expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Refresh Page")).toBeInTheDocument();
    });

    it("displays default error message when error is empty", () => {
      render(
        <PracticeExamList groupedExams={[]} error="" onRetry={mockOnRetry} />
      );

      expect(
        screen.getByText(
          "An unexpected error occurred while loading the practice exams."
        )
      ).toBeInTheDocument();
    });

    it("calls onRetry when Try Again button is clicked", () => {
      render(
        <PracticeExamList
          groupedExams={[]}
          error="Network error"
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it("does not show Try Again button when onRetry is not provided", () => {
      render(<PracticeExamList groupedExams={[]} error="Network error" />);

      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
      expect(screen.getByText("Refresh Page")).toBeInTheDocument();
    });

    it("displays error icon in error state", () => {
      render(
        <PracticeExamList
          groupedExams={[]}
          error="Network error"
          onRetry={mockOnRetry}
        />
      );

      const errorIcon = document.querySelector("svg");
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe("CertificationGroup Error State", () => {
    it("passes error props to PracticeExamTable", () => {
      render(
        <CertificationGroup
          group={mockGroupedExam}
          error="Test error"
          onRetry={mockOnRetry}
        />
      );

      // The error should be displayed by the PracticeExamTable component
      expect(screen.getByText("Error Loading Exams")).toBeInTheDocument();
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });
  });

  describe("Loading State Priority", () => {
    it("shows loading state when both loading and error are true", () => {
      render(
        <PracticeExamTable
          exams={[]}
          loading={true}
          error="Some error"
          onRetry={mockOnRetry}
        />
      );

      // Loading state should take priority
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
      expect(screen.queryByText("Error Loading Exams")).not.toBeInTheDocument();
    });

    it("shows error state when loading is false and error exists", () => {
      render(
        <PracticeExamTable
          exams={[]}
          loading={false}
          error="Some error"
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText("Error Loading Exams")).toBeInTheDocument();
      expect(screen.queryByText(".animate-pulse")).not.toBeInTheDocument();
    });
  });
});
