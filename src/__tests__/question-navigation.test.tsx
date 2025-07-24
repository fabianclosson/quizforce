import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionNavigation } from "@/components/exam/question-navigation";

const defaultProps = {
  currentQuestion: 1,
  totalQuestions: 5,
  answeredQuestions: new Set([1, 3]),
  flaggedQuestions: new Set([2]),
  onQuestionSelect: jest.fn(),
  onPrevious: jest.fn(),
  onNext: jest.fn(),
  onToggleFlag: jest.fn(),
  canGoPrevious: false,
  canGoNext: true,
  isCurrentQuestionFlagged: false,
};

describe("QuestionNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation controls correctly", () => {
    render(<QuestionNavigation {...defaultProps} />);

    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("1 of 5")).toBeInTheDocument();
    expect(screen.getByText("Flag")).toBeInTheDocument();
  });

  it("disables previous button when canGoPrevious is false", () => {
    render(<QuestionNavigation {...defaultProps} canGoPrevious={false} />);

    const previousButton = screen.getByText("Previous");
    expect(previousButton).toBeDisabled();
  });

  it("disables next button when canGoNext is false", () => {
    render(<QuestionNavigation {...defaultProps} canGoNext={false} />);

    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  it("calls onPrevious when previous button is clicked", () => {
    render(<QuestionNavigation {...defaultProps} canGoPrevious={true} />);

    const previousButton = screen.getByText("Previous");
    fireEvent.click(previousButton);

    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button is clicked", () => {
    render(<QuestionNavigation {...defaultProps} />);

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onToggleFlag when flag button is clicked", () => {
    render(<QuestionNavigation {...defaultProps} />);

    const flagButton = screen.getByText("Flag");
    fireEvent.click(flagButton);

    expect(defaultProps.onToggleFlag).toHaveBeenCalledTimes(1);
  });

  it("shows flagged state when current question is flagged", () => {
    render(
      <QuestionNavigation {...defaultProps} isCurrentQuestionFlagged={true} />
    );

    // Check for the flag button specifically (not the legend text)
    const flagButton = screen.getByRole("button", { name: /flagged/i });
    expect(flagButton).toBeInTheDocument();
    expect(flagButton).toHaveClass("bg-yellow-500");
  });

  it("renders question palette with correct number of questions", () => {
    render(<QuestionNavigation {...defaultProps} />);

    // Check that all question numbers are rendered
    for (let i = 1; i <= defaultProps.totalQuestions; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it("calls onQuestionSelect when a question number is clicked", () => {
    render(<QuestionNavigation {...defaultProps} />);

    const questionButton = screen.getByText("3");
    fireEvent.click(questionButton);

    expect(defaultProps.onQuestionSelect).toHaveBeenCalledWith(3);
  });

  it("displays legend for question status indicators", () => {
    render(<QuestionNavigation {...defaultProps} />);

    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("Answered")).toBeInTheDocument();
    expect(screen.getByText("Flagged")).toBeInTheDocument();
    expect(screen.getByText("Answered + Flagged")).toBeInTheDocument();
    expect(screen.getByText("Not Answered")).toBeInTheDocument();
  });

  it("applies correct styling for different question states", () => {
    render(<QuestionNavigation {...defaultProps} />);

    // Current question (1) should have primary styling
    const currentQuestionButton = screen.getByText("1");
    expect(currentQuestionButton).toHaveClass("bg-primary");

    // Answered question (3) should have green styling
    const answeredQuestionButton = screen.getByText("3");
    expect(answeredQuestionButton).toHaveClass("bg-green-100");

    // Flagged question (2) should have yellow styling
    const flaggedQuestionButton = screen.getByText("2");
    expect(flaggedQuestionButton).toHaveClass("bg-yellow-100");
  });
});
