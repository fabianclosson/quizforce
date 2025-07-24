import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ExamReviewInterface,
  ExamReviewData,
} from "@/components/exam/exam-review-interface";

// Mock data for testing
const mockReviewData: ExamReviewData = {
  exam_id: "exam_1",
  exam_title: "Salesforce Administrator Practice Exam",
  total_questions: 5,
  correct_answers: 3,
  score_percentage: 60,
  time_taken: 1800, // 30 minutes
  questions: [
    {
      id: "q1",
      question_text: "What is a custom object in Salesforce?",
      question_type: "single_choice",
      options: [
        { id: "opt1", text: "A pre-built object", is_correct: false },
        { id: "opt2", text: "A database table", is_correct: true },
        { id: "opt3", text: "A report", is_correct: false },
        { id: "opt4", text: "A workflow", is_correct: false },
      ],
      knowledge_area: "Data Management",
      difficulty: "medium",
      explanation:
        "Custom objects are database tables for storing organization-specific information.",
      user_answer: "opt2",
      correct_answer: "opt2",
      is_correct: true,
      time_spent: 120,
    },
    {
      id: "q2",
      question_text: "What is the maximum number of custom fields?",
      question_type: "single_choice",
      options: [
        { id: "opt1", text: "500", is_correct: false },
        { id: "opt2", text: "800", is_correct: true },
        { id: "opt3", text: "1000", is_correct: false },
        { id: "opt4", text: "Unlimited", is_correct: false },
      ],
      knowledge_area: "Data Management",
      difficulty: "hard",
      explanation: "Custom objects can have up to 800 custom fields.",
      user_answer: "opt1",
      correct_answer: "opt2",
      is_correct: false,
      time_spent: 90,
    },
    {
      id: "q3",
      question_text: "Which are valid sharing settings? (Select all)",
      question_type: "multiple_choice",
      options: [
        { id: "opt1", text: "Private", is_correct: true },
        { id: "opt2", text: "Public Read Only", is_correct: true },
        { id: "opt3", text: "Public Read/Write", is_correct: true },
        { id: "opt4", text: "Public Full Access", is_correct: false },
      ],
      knowledge_area: "Security and Access",
      difficulty: "medium",
      explanation:
        "Valid settings are Private, Public Read Only, and Public Read/Write.",
      user_answer: ["opt1", "opt2", "opt4"],
      correct_answer: ["opt1", "opt2", "opt3"],
      is_correct: false,
      time_spent: 180,
    },
    {
      id: "q4",
      question_text: "What is a Junction Object?",
      question_type: "single_choice",
      options: [
        {
          id: "opt1",
          text: "Connects objects in many-to-many relationship",
          is_correct: true,
        },
        { id: "opt2", text: "Used for reporting only", is_correct: false },
        { id: "opt3", text: "A standard object", is_correct: false },
        { id: "opt4", text: "Stores user preferences", is_correct: false },
      ],
      knowledge_area: "Data Management",
      difficulty: "easy",
      explanation: "A junction object creates many-to-many relationships.",
      user_answer: "opt1",
      correct_answer: "opt1",
      is_correct: true,
      time_spent: 75,
    },
    {
      id: "q5",
      question_text: "Which tool imports data into Salesforce?",
      question_type: "single_choice",
      options: [
        { id: "opt1", text: "Data Loader", is_correct: true },
        { id: "opt2", text: "Process Builder", is_correct: false },
        { id: "opt3", text: "Workflow Rules", is_correct: false },
        { id: "opt4", text: "Approval Process", is_correct: false },
      ],
      knowledge_area: "Data Management",
      difficulty: "easy",
      explanation:
        "Data Loader is the primary tool for importing large amounts of data.",
      user_answer: undefined, // Not answered
      correct_answer: "opt1",
      is_correct: false,
      time_spent: 0,
    },
  ],
};

const mockProps = {
  reviewData: mockReviewData,
  onBackToResults: jest.fn(),
};

describe("ExamReviewInterface", () => {
  beforeEach(() => {
    mockProps.onBackToResults.mockClear();
  });

  describe("Header and Navigation", () => {
    it("should display exam title and question progress", () => {
      render(<ExamReviewInterface {...mockProps} />);

      expect(screen.getByText("Exam Review")).toBeInTheDocument();
      expect(
        screen.getByText("Salesforce Administrator Practice Exam")
      ).toBeInTheDocument();
      expect(screen.getByText("Question 1 of 5")).toBeInTheDocument();
    });

    it("should call onBackToResults when back button is clicked", () => {
      render(<ExamReviewInterface {...mockProps} />);

      const backButton = screen.getByText("Back to Results");
      fireEvent.click(backButton);

      expect(mockProps.onBackToResults).toHaveBeenCalledTimes(1);
    });

    it("should display progress bar with correct percentage", () => {
      render(<ExamReviewInterface {...mockProps} />);

      expect(screen.getByText("20%")).toBeInTheDocument(); // 1 of 5 questions = 20%
    });
  });

  describe("Question Navigation Grid", () => {
    it("should display all question numbers with correct/incorrect indicators", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Check that all question numbers are displayed
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it("should navigate to selected question when grid button is clicked", () => {
      render(<ExamReviewInterface {...mockProps} />);

      const question3Button = screen.getByText("3");
      fireEvent.click(question3Button);

      expect(screen.getByText("Question 3")).toBeInTheDocument();
      expect(
        screen.getByText("Which are valid sharing settings? (Select all)")
      ).toBeInTheDocument();
    });

    it("should highlight current question in navigation grid", () => {
      render(<ExamReviewInterface {...mockProps} />);

      const question1Button = screen.getByText("1");
      expect(question1Button.closest("button")).toHaveClass("bg-primary"); // Current question should be highlighted
    });
  });

  describe("Question Display", () => {
    it("should display question details with badges", () => {
      render(<ExamReviewInterface {...mockProps} />);

      expect(screen.getByText("medium")).toBeInTheDocument();
      expect(screen.getByText("Data Management")).toBeInTheDocument();
      expect(screen.getByText("2m 0s")).toBeInTheDocument();
      expect(
        screen.getByText("What is a custom object in Salesforce?")
      ).toBeInTheDocument();
    });

    it("should display correct/incorrect status", () => {
      render(<ExamReviewInterface {...mockProps} />);

      expect(screen.getByText("Correct")).toBeInTheDocument();
    });

    it("should show incorrect status for wrong answers", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Navigate to question 2 (incorrect)
      const question2Button = screen.getByText("2");
      fireEvent.click(question2Button);

      expect(screen.getByText("Incorrect")).toBeInTheDocument();
    });
  });

  describe("Answer Options Display", () => {
    it("should display all answer options with correct styling", () => {
      render(<ExamReviewInterface {...mockProps} />);

      expect(screen.getByText("A pre-built object")).toBeInTheDocument();
      expect(screen.getAllByText("A database table")).toHaveLength(3); // Appears in options and summary
      expect(screen.getByText("A report")).toBeInTheDocument();
      expect(screen.getByText("A workflow")).toBeInTheDocument();
    });

    it("should highlight correct answer in green", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Check that there is at least one element with green styling for correct answers
      // Since question 1 has the correct answer selected, we should see green styling
      expect(screen.getByText("Correct Answer")).toBeInTheDocument();

      // Also check that the correct answer badge has the proper green styling
      const correctAnswerBadge = screen.getByText("Correct Answer");
      expect(correctAnswerBadge).toHaveClass("bg-green-100", "text-green-800");
    });

    it('should display "Correct Answer" and "Your Selection" badges', () => {
      render(<ExamReviewInterface {...mockProps} />);

      expect(screen.getByText("Correct Answer")).toBeInTheDocument();
      expect(screen.getByText("Your Selection")).toBeInTheDocument();
    });

    it("should handle multiple choice questions correctly", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Navigate to question 3 (multiple choice)
      const question3Button = screen.getByText("3");
      fireEvent.click(question3Button);

      // Should show multiple selections
      expect(screen.getAllByText("Your Selection")).toHaveLength(3); // User selected 3 options
      expect(screen.getAllByText("Correct Answer")).toHaveLength(3); // 3 correct options
    });
  });

  describe("Answer Summary", () => {
    it("should display user answer and correct answer summary", () => {
      render(<ExamReviewInterface {...mockProps} />);

      expect(screen.getByText("Your Answer:")).toBeInTheDocument();
      expect(screen.getByText("Correct Answer:")).toBeInTheDocument();
      expect(screen.getAllByText("A database table")).toHaveLength(3); // Both user and correct answer plus option
    });

    it('should show "Not answered" for unanswered questions', () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Navigate to question 5 (not answered)
      const question5Button = screen.getByText("5");
      fireEvent.click(question5Button);

      expect(screen.getByText("Not answered")).toBeInTheDocument();
    });
  });

  describe("Explanations", () => {
    it("should display question explanation when available", () => {
      render(<ExamReviewInterface {...mockProps} />);

      expect(screen.getByText("Explanation:")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Custom objects are database tables for storing organization-specific information."
        )
      ).toBeInTheDocument();
    });

    it("should not display explanation section when not available", () => {
      // Create mock data without explanation
      const dataWithoutExplanation = {
        ...mockReviewData,
        questions: [
          {
            ...mockReviewData.questions[0],
            explanation: undefined,
          },
        ],
      };

      render(
        <ExamReviewInterface
          reviewData={dataWithoutExplanation}
          onBackToResults={mockProps.onBackToResults}
        />
      );

      expect(screen.queryByText("Explanation:")).not.toBeInTheDocument();
    });
  });

  describe("Navigation Controls", () => {
    it("should disable Previous button on first question", () => {
      render(<ExamReviewInterface {...mockProps} />);

      const previousButton = screen.getByText("Previous");
      expect(previousButton).toBeDisabled();
    });

    it("should enable Next button when not on last question", () => {
      render(<ExamReviewInterface {...mockProps} />);

      const nextButton = screen.getByText("Next");
      expect(nextButton).toBeEnabled();
    });

    it("should navigate to next question when Next is clicked", () => {
      render(<ExamReviewInterface {...mockProps} />);

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      expect(screen.getByText("Question 2")).toBeInTheDocument();
      expect(
        screen.getByText("What is the maximum number of custom fields?")
      ).toBeInTheDocument();
    });

    it("should navigate to previous question when Previous is clicked", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Go to question 2 first
      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      // Then go back
      const previousButton = screen.getByText("Previous");
      fireEvent.click(previousButton);

      expect(screen.getByText("Question 1")).toBeInTheDocument();
    });

    it("should disable Next button on last question", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Navigate to last question
      const question5Button = screen.getByText("5");
      fireEvent.click(question5Button);

      const nextButton = screen.getByText("Next");
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Time Formatting", () => {
    it("should format time correctly for seconds only", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Navigate to question 4 (75 seconds)
      const question4Button = screen.getByText("4");
      fireEvent.click(question4Button);

      expect(screen.getByText("1m 15s")).toBeInTheDocument();
    });

    it("should handle zero time spent", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Navigate to question 5 (0 seconds) - this question won't show time badge if time_spent is 0
      const question5Button = screen.getByText("5");
      fireEvent.click(question5Button);

      // Question 5 has 0 time spent, so the time badge shouldn't be rendered
      expect(screen.queryByText("0m 0s")).not.toBeInTheDocument();
    });
  });

  describe("Difficulty Colors", () => {
    it("should apply correct colors for different difficulty levels", () => {
      render(<ExamReviewInterface {...mockProps} />);

      // Check medium difficulty (question 1)
      const mediumBadge = screen.getByText("medium");
      expect(mediumBadge).toHaveClass("bg-yellow-100", "text-yellow-800");

      // Navigate to hard difficulty (question 2)
      const question2Button = screen.getByText("2");
      fireEvent.click(question2Button);

      const hardBadge = screen.getByText("hard");
      expect(hardBadge).toHaveClass("bg-red-100", "text-red-800");

      // Navigate to easy difficulty (question 4)
      const question4Button = screen.getByText("4");
      fireEvent.click(question4Button);

      const easyBadge = screen.getByText("easy");
      expect(easyBadge).toHaveClass("bg-green-100", "text-green-800");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className when provided", () => {
      const { container } = render(
        <ExamReviewInterface {...mockProps} className="custom-test-class" />
      );

      expect(container.firstChild).toHaveClass("custom-test-class");
    });
  });
});
