import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExamSubmissionDialog } from "@/components/exam/exam-submission-dialog";

describe("ExamSubmissionDialog", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirmSubmit: jest.fn(),
    totalQuestions: 5,
    answeredQuestions: new Set([1, 3, 5]),
    flaggedQuestions: new Set([2, 4]),
    timeRemaining: 1800, // 30 minutes
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays exam progress summary correctly", () => {
    render(<ExamSubmissionDialog {...defaultProps} />);

    expect(screen.getByText("Submit Practice Exam")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Total questions
    expect(screen.getByText("3")).toBeInTheDocument(); // Answered questions
    expect(screen.getByText("60% Complete")).toBeInTheDocument();

    // Check for unanswered and flagged counts in their respective sections
    expect(screen.getByText("Total Questions")).toBeInTheDocument();
    expect(screen.getByText("Answered")).toBeInTheDocument();
    expect(screen.getByText("Unanswered")).toBeInTheDocument();
    expect(screen.getByText("Flagged")).toBeInTheDocument();
  });

  it("shows time remaining correctly formatted", () => {
    render(<ExamSubmissionDialog {...defaultProps} />);

    expect(screen.getByText("30:00")).toBeInTheDocument(); // 30 minutes
  });

  it("displays unanswered questions warning", () => {
    render(<ExamSubmissionDialog {...defaultProps} />);

    expect(screen.getByText("Unanswered Questions")).toBeInTheDocument();
    expect(
      screen.getByText(/You have 2 unanswered questions/)
    ).toBeInTheDocument();
  });

  it("displays flagged questions info", () => {
    render(<ExamSubmissionDialog {...defaultProps} />);

    expect(screen.getByText("Flagged Questions")).toBeInTheDocument();
    expect(
      screen.getByText(/You have 2 flagged questions for review/)
    ).toBeInTheDocument();
  });

  it("calls onConfirmSubmit when Submit Exam button is clicked", () => {
    render(<ExamSubmissionDialog {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: /submit exam/i });
    fireEvent.click(submitButton);

    expect(defaultProps.onConfirmSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Continue Exam button is clicked", () => {
    render(<ExamSubmissionDialog {...defaultProps} />);

    const continueButton = screen.getByRole("button", {
      name: /continue exam/i,
    });
    fireEvent.click(continueButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("shows submitting state when isSubmitting is true", () => {
    const props = { ...defaultProps, isSubmitting: true };
    render(<ExamSubmissionDialog {...props} />);

    expect(screen.getByText("Submitting...")).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /submitting/i });
    const continueButton = screen.getByRole("button", {
      name: /continue exam/i,
    });

    expect(submitButton).toBeDisabled();
    expect(continueButton).toBeDisabled();
  });

  it("shows critical time warning when time is low", () => {
    const props = { ...defaultProps, timeRemaining: 120 }; // 2 minutes
    render(<ExamSubmissionDialog {...props} />);

    const timeDisplay = screen.getByText("2:00");
    expect(timeDisplay).toHaveClass("text-red-600");
  });

  it("shows no warnings when all questions are answered", () => {
    const props = {
      ...defaultProps,
      answeredQuestions: new Set([1, 2, 3, 4, 5]),
      flaggedQuestions: new Set([]),
    };
    render(<ExamSubmissionDialog {...props} />);

    expect(screen.getByText("100% Complete")).toBeInTheDocument();
    expect(screen.queryByText("Unanswered Questions")).not.toBeInTheDocument();
    expect(screen.queryByText("Flagged Questions")).not.toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const props = { ...defaultProps, isOpen: false };
    render(<ExamSubmissionDialog {...props} />);

    expect(screen.queryByText("Submit Practice Exam")).not.toBeInTheDocument();
  });
});
