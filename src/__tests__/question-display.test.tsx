import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QuestionDisplay } from "@/components/exam/question-display";
import { QuestionWithAnswers } from "@/types/exam";

const mockQuestion: QuestionWithAnswers = {
  id: "q1",
  practice_exam_id: "exam_1",
  knowledge_area_id: "ka_1",
  question_text:
    "Which of the following is the correct way to create a new user in Salesforce?",
  explanation:
    "Creating users in Salesforce requires proper permissions and following the correct navigation path.",
  difficulty_level: "easy",
  question_number: 1,
  required_selections: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  answers: [
    {
      id: "a1",
      question_id: "q1",
      answer_text: "Setup → Users → New User",
      explanation:
        "This is the correct path to create new users in Salesforce.",
      is_correct: true,
      answer_letter: "A",
      created_at: new Date().toISOString(),
    },
    {
      id: "a2",
      question_id: "q1",
      answer_text: "Home → Users → Add User",
      explanation: "Users cannot be created from the Home tab.",
      is_correct: false,
      answer_letter: "B",
      created_at: new Date().toISOString(),
    },
    {
      id: "a3",
      question_id: "q1",
      answer_text: "App Launcher → User Management",
      explanation:
        "While the App Launcher can access many features, user creation is done through Setup.",
      is_correct: false,
      answer_letter: "C",
      created_at: new Date().toISOString(),
    },
    {
      id: "a4",
      question_id: "q1",
      answer_text: "Reports → User Reports → New",
      explanation: "Reports are for viewing data, not creating users.",
      is_correct: false,
      answer_letter: "D",
      created_at: new Date().toISOString(),
    },
  ],
  knowledge_area: {
    id: "ka_1",
    name: "User Management",
    description: "Managing users, profiles, and permissions",
    weight_percentage: 20,
  },
};

describe("QuestionDisplay", () => {
  const mockOnAnswerSelect = jest.fn();

  beforeEach(() => {
    mockOnAnswerSelect.mockClear();
  });

  it("renders question text and answers correctly", () => {
    render(
      <QuestionDisplay
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        questionNumber={1}
        totalQuestions={60}
      />
    );

    // Check if question text is rendered
    expect(screen.getByText(mockQuestion.question_text)).toBeInTheDocument();

    // Check if all answers are rendered
    mockQuestion.answers.forEach(answer => {
      expect(screen.getByText(answer.answer_text)).toBeInTheDocument();
    });

    // Check if question number badge is displayed
    expect(screen.getByText("Question 1 of 60")).toBeInTheDocument();

    // Check if difficulty badge is displayed
    expect(screen.getByText("Easy")).toBeInTheDocument();

    // Check if knowledge area is displayed
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("calls onAnswerSelect when an answer is clicked", () => {
    render(
      <QuestionDisplay
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        questionNumber={1}
        totalQuestions={60}
      />
    );

    // Click on the first answer
    const firstAnswer = screen.getByText(mockQuestion.answers[0].answer_text);
    fireEvent.click(firstAnswer);

    expect(mockOnAnswerSelect).toHaveBeenCalledWith("a1");
  });

  it("highlights selected answer", () => {
    render(
      <QuestionDisplay
        question={mockQuestion}
        selectedAnswerIds={["a2"]}
        onAnswerSelect={mockOnAnswerSelect}
        questionNumber={1}
        totalQuestions={60}
      />
    );

    // The selected answer should have different styling
    const selectedAnswerButton = screen
      .getByText(mockQuestion.answers[1].answer_text)
      .closest("button");
    expect(selectedAnswerButton).toHaveClass("border-primary");
  });

  it("shows explanation when showExplanation is true", () => {
    render(
      <QuestionDisplay
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        questionNumber={1}
        totalQuestions={60}
        showExplanation={true}
      />
    );

    expect(screen.getByText("Explanation:")).toBeInTheDocument();
    expect(screen.getByText(mockQuestion.explanation!)).toBeInTheDocument();
  });

  it("disables answer selection in review mode", () => {
    render(
      <QuestionDisplay
        question={mockQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        questionNumber={1}
        totalQuestions={60}
        isReviewMode={true}
      />
    );

    // Click on an answer in review mode
    const firstAnswer = screen.getByText(mockQuestion.answers[0].answer_text);
    fireEvent.click(firstAnswer);

    // onAnswerSelect should not be called in review mode
    expect(mockOnAnswerSelect).not.toHaveBeenCalled();

    // All answer buttons should be disabled
    mockQuestion.answers.forEach(answer => {
      const button = screen.getByText(answer.answer_text).closest("button");
      expect(button).toBeDisabled();
    });
  });

  it("shows correct answer styling in review mode with explanation", () => {
    render(
      <QuestionDisplay
        question={mockQuestion}
        selectedAnswerIds={["a2"]} // Wrong answer selected
        onAnswerSelect={mockOnAnswerSelect}
        questionNumber={1}
        totalQuestions={60}
        isReviewMode={true}
        showExplanation={true}
      />
    );

    // Correct answer (a1) should have green styling
    const correctAnswerButton = screen
      .getByText(mockQuestion.answers[0].answer_text)
      .closest("button");
    expect(correctAnswerButton).toHaveClass("border-green-500");

    // Selected wrong answer (a2) should have red styling
    const wrongAnswerButton = screen
      .getByText(mockQuestion.answers[1].answer_text)
      .closest("button");
    expect(wrongAnswerButton).toHaveClass("border-red-500");
  });

  it("shows answer explanation when answer is selected and showExplanation is true", () => {
    render(
      <QuestionDisplay
        question={mockQuestion}
        selectedAnswerIds={["a1"]}
        onAnswerSelect={mockOnAnswerSelect}
        questionNumber={1}
        totalQuestions={60}
        showExplanation={true}
      />
    );

    expect(screen.getByText("Answer Explanation:")).toBeInTheDocument();
    expect(
      screen.getByText(mockQuestion.answers[0].explanation!)
    ).toBeInTheDocument();
  });

  it("displays difficulty colors correctly", () => {
    const hardQuestion = { ...mockQuestion, difficulty_level: "hard" as const };

    render(
      <QuestionDisplay
        question={hardQuestion}
        onAnswerSelect={mockOnAnswerSelect}
        questionNumber={1}
        totalQuestions={60}
      />
    );

    expect(screen.getByText("Hard")).toBeInTheDocument();
    const difficultyBadge = screen.getByText("Hard").closest("span");
    expect(difficultyBadge).toHaveClass("bg-red-100");
  });
});
