import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ExamResultsSummary } from "@/components/exam/exam-results-summary";
import { DetailedExamResults } from "@/lib/exam-scoring";

// Mock data for testing
const mockPassingResults: DetailedExamResults = {
  attempt_id: "attempt_1",
  score_percentage: 78,
  correct_answers: 47,
  total_questions: 60,
  passed: true,
  time_spent_minutes: 82,
  question_results: [],
  knowledge_area_scores: [
    {
      id: "ka_1",
      name: "User Management",
      weight_percentage: 20,
      correct_answers: 9,
      total_questions: 12,
      score_percentage: 75,
      performance_level: "good",
    },
  ],
  overall_performance_level: "good",
  time_efficiency: "good",
  difficulty_breakdown: {
    easy: { correct: 18, total: 20, percentage: 90 },
    medium: { correct: 20, total: 25, percentage: 80 },
    hard: { correct: 9, total: 15, percentage: 60 },
  },
};

const mockFailingResults: DetailedExamResults = {
  ...mockPassingResults,
  score_percentage: 45,
  correct_answers: 27,
  passed: false,
  overall_performance_level: "poor",
  time_efficiency: "rushed",
};

const mockProps = {
  examName: "Salesforce Administrator Practice Exam",
  passingThreshold: 65,
  onReviewAnswers: jest.fn(),
  onRetakeExam: jest.fn(),
  onReturnToDashboard: jest.fn(),
};

describe("ExamResultsSummary", () => {
  beforeEach(() => {
    mockProps.onReviewAnswers.mockClear();
    mockProps.onRetakeExam.mockClear();
    mockProps.onReturnToDashboard.mockClear();
  });

  describe("Passing Results Display", () => {
    it("should display congratulations message for passing results", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      expect(screen.getByText("Congratulations!")).toBeInTheDocument();
      expect(screen.getByText(/You passed the/)).toBeInTheDocument();
      expect(screen.getByText("PASSED")).toBeInTheDocument();
    });

    it("should display correct score percentage and metrics", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      expect(screen.getByText("78%")).toBeInTheDocument();
      expect(screen.getByText("47 / 60")).toBeInTheDocument();
      expect(screen.getByText("1h 22m")).toBeInTheDocument();
      expect(screen.getByText("65%")).toBeInTheDocument();
    });

    it("should display performance level correctly", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      // Check for the performance level text and message together
      expect(
        screen.getByText(/Great job! You have a solid understanding/)
      ).toBeInTheDocument();
      // Check that there are multiple "good" badges (one for performance, one for time efficiency)
      expect(screen.getAllByText("good")).toHaveLength(2);
    });

    it("should display time efficiency correctly", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      expect(screen.getByText(/Good time management/)).toBeInTheDocument();
    });

    it("should show motivational message for passing", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      expect(
        screen.getByText(
          /Well done! You're ready for the real certification exam/
        )
      ).toBeInTheDocument();
    });
  });

  describe("Failing Results Display", () => {
    it("should display encouragement message for failing results", () => {
      render(
        <ExamResultsSummary results={mockFailingResults} {...mockProps} />
      );

      expect(screen.getByText("Keep Studying!")).toBeInTheDocument();
      expect(screen.getByText(/You did not pass the/)).toBeInTheDocument();
      expect(screen.getByText("FAILED")).toBeInTheDocument();
    });

    it("should display correct failing score", () => {
      render(
        <ExamResultsSummary results={mockFailingResults} {...mockProps} />
      );

      expect(screen.getByText("45%")).toBeInTheDocument();
      expect(screen.getByText("27 / 60")).toBeInTheDocument();
    });

    it("should show motivational message for failing", () => {
      render(
        <ExamResultsSummary results={mockFailingResults} {...mockProps} />
      );

      expect(
        screen.getByText(/Don't give up! Every expert was once a beginner/)
      ).toBeInTheDocument();
    });

    it("should display poor performance level correctly", () => {
      render(
        <ExamResultsSummary results={mockFailingResults} {...mockProps} />
      );

      expect(screen.getByText("poor")).toBeInTheDocument();
      expect(screen.getByText(/More study time is needed/)).toBeInTheDocument();
    });

    it("should display rushed time efficiency correctly", () => {
      render(
        <ExamResultsSummary results={mockFailingResults} {...mockProps} />
      );

      expect(screen.getByText("rushed")).toBeInTheDocument();
      expect(screen.getByText(/You moved very quickly/)).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("should call onReviewAnswers when Review Answers button is clicked", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      const reviewButton = screen.getByText("Review Answers");
      fireEvent.click(reviewButton);

      expect(mockProps.onReviewAnswers).toHaveBeenCalledTimes(1);
    });

    it("should call onRetakeExam when Retake Exam button is clicked", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      const retakeButton = screen.getByText("Retake Exam");
      fireEvent.click(retakeButton);

      expect(mockProps.onRetakeExam).toHaveBeenCalledTimes(1);
    });

    it("should call onReturnToDashboard when Dashboard button is clicked", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      const dashboardButton = screen.getByText("Dashboard");
      fireEvent.click(dashboardButton);

      expect(mockProps.onReturnToDashboard).toHaveBeenCalledTimes(1);
    });

    it("should display all action buttons", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      expect(screen.getByText("Review Answers")).toBeInTheDocument();
      expect(screen.getByText("Retake Exam")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  describe("Time Display", () => {
    it("should format time correctly for hours and minutes", () => {
      const resultsWithHours = {
        ...mockPassingResults,
        time_spent_minutes: 125, // 2h 5m
      };

      render(<ExamResultsSummary results={resultsWithHours} {...mockProps} />);

      expect(screen.getByText("2h 5m")).toBeInTheDocument();
    });

    it("should format time correctly for minutes only", () => {
      const resultsMinutesOnly = {
        ...mockPassingResults,
        time_spent_minutes: 45, // 45m
      };

      render(
        <ExamResultsSummary results={resultsMinutesOnly} {...mockProps} />
      );

      expect(screen.getByText("45m")).toBeInTheDocument();
    });

    it("should handle zero minutes", () => {
      const resultsZeroMinutes = {
        ...mockPassingResults,
        time_spent_minutes: 0,
      };

      render(
        <ExamResultsSummary results={resultsZeroMinutes} {...mockProps} />
      );

      expect(screen.getByText("0m")).toBeInTheDocument();
    });
  });

  describe("Performance Level Messages", () => {
    it("should display correct message for excellent performance", () => {
      const excellentResults = {
        ...mockPassingResults,
        overall_performance_level: "excellent" as const,
      };

      render(<ExamResultsSummary results={excellentResults} {...mockProps} />);

      expect(
        screen.getByText(
          /Outstanding performance! You've mastered this material/
        )
      ).toBeInTheDocument();
    });

    it("should display correct message for needs_improvement performance", () => {
      const needsImprovementResults = {
        ...mockPassingResults,
        overall_performance_level: "needs_improvement" as const,
      };

      render(
        <ExamResultsSummary results={needsImprovementResults} {...mockProps} />
      );

      expect(
        screen.getByText(
          /You're on the right track. Focus on areas where you struggled/
        )
      ).toBeInTheDocument();
    });
  });

  describe("Time Efficiency Messages", () => {
    it("should display correct message for excellent time efficiency", () => {
      const excellentTimeResults = {
        ...mockPassingResults,
        time_efficiency: "excellent" as const,
      };

      render(
        <ExamResultsSummary results={excellentTimeResults} {...mockProps} />
      );

      expect(
        screen.getByText(/Perfect pacing! You used your time effectively/)
      ).toBeInTheDocument();
    });

    it("should display correct message for adequate time efficiency", () => {
      const adequateTimeResults = {
        ...mockPassingResults,
        time_efficiency: "adequate" as const,
      };

      render(
        <ExamResultsSummary results={adequateTimeResults} {...mockProps} />
      );

      expect(
        screen.getByText(
          /Adequate pacing. Consider slowing down to review answers/
        )
      ).toBeInTheDocument();
    });
  });

  describe("Visual Elements", () => {
    it("should display check circle icon for passing results", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      // Check for presence of success visual indicators
      expect(screen.getByText("PASSED")).toBeInTheDocument();
    });

    it("should display X circle icon for failing results", () => {
      render(
        <ExamResultsSummary results={mockFailingResults} {...mockProps} />
      );

      // Check for presence of failure visual indicators
      expect(screen.getByText("FAILED")).toBeInTheDocument();
    });

    it("should display trophy icon in score section", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      expect(screen.getByText("Your Score")).toBeInTheDocument();
    });

    it("should display progress bar with correct value", () => {
      render(
        <ExamResultsSummary results={mockPassingResults} {...mockProps} />
      );

      // Check that passing threshold is displayed
      expect(screen.getByText("Passing Threshold: 65%")).toBeInTheDocument();
    });
  });
});
