import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { ExamInterface } from "@/components/exam/exam-interface";
import { ExamSessionData } from "@/types/exam";

// Mock the exam session data
const mockSessionData: ExamSessionData = {
  attempt: {
    id: "attempt_1",
    user_id: "user_1",
    practice_exam_id: "exam_1",
    started_at: new Date().toISOString(),
    correct_answers: 0,
    total_questions: 3,
    time_spent_minutes: 0,
    status: "in_progress",
    mode: "exam" as const,
    created_at: new Date().toISOString(),
  },
  questions: [
    {
      id: "q1",
      practice_exam_id: "exam_1",
      knowledge_area_id: "ka_1",
      question_text: "Test question 1?",
      explanation: "Test explanation",
      difficulty_level: "easy" as const,
      question_number: 1,
      required_selections: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      answers: [
        {
          id: "a1",
          question_id: "q1",
          answer_text: "Option A",
          explanation: "Explanation A",
          is_correct: true,
          answer_letter: "A" as const,
          created_at: new Date().toISOString(),
        },
        {
          id: "a2",
          question_id: "q1",
          answer_text: "Option B",
          explanation: "Explanation B",
          is_correct: false,
          answer_letter: "B" as const,
          created_at: new Date().toISOString(),
        },
      ],
      knowledge_area: {
        id: "ka_1",
        name: "Test Area",
        description: "Test description",
        weight_percentage: 30,
      },
    },
    {
      id: "q2",
      practice_exam_id: "exam_1",
      knowledge_area_id: "ka_1",
      question_text: "Test question 2?",
      explanation: "Test explanation 2",
      difficulty_level: "medium" as const,
      question_number: 2,
      required_selections: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      answers: [
        {
          id: "a3",
          question_id: "q2",
          answer_text: "Option A",
          explanation: "Explanation A",
          is_correct: false,
          answer_letter: "A" as const,
          created_at: new Date().toISOString(),
        },
        {
          id: "a4",
          question_id: "q2",
          answer_text: "Option B",
          explanation: "Explanation B",
          is_correct: true,
          answer_letter: "B" as const,
          created_at: new Date().toISOString(),
        },
      ],
      knowledge_area: {
        id: "ka_1",
        name: "Test Area",
        description: "Test description",
        weight_percentage: 30,
      },
    },
  ],
  user_answers: [],
  current_question_index: 0,
  time_remaining_seconds: 3600, // 1 hour for testing
  is_flagged: {},
};

describe("ExamInterface Auto-save", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("displays auto-save status indicator", () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Should display auto-save indicator
    expect(screen.getByText("Auto-save")).toBeInTheDocument();
  });

  it("triggers auto-save when user selects an answer", async () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Select an answer
    const optionA = screen.getByText("Option A");
    fireEvent.click(optionA);

    // Auto-save should trigger after 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should show "Saving..." status
    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });

  it('shows "Saved" status after successful auto-save', async () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Select an answer
    const optionA = screen.getByText("Option A");
    fireEvent.click(optionA);

    // Advance time to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Wait for saving status
    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    // Advance time to complete the simulated save (500ms)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should show "Saved" status
    await waitFor(() => {
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });
  });

  it("returns to idle status after showing saved confirmation", async () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Select an answer
    const optionA = screen.getByText("Option A");
    fireEvent.click(optionA);

    // Trigger auto-save
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Complete the save
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Wait for saved status
    await waitFor(() => {
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });

    // Advance time for the saved status timeout (2000ms)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should return to idle status
    await waitFor(() => {
      expect(screen.getByText("Auto-save")).toBeInTheDocument();
    });
  });

  it("shows correct color coding for auto-save status", async () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Initial state should be muted
    const autoSaveElement = screen.getByText("Auto-save");
    expect(autoSaveElement).toHaveClass("text-muted-foreground");

    // Select an answer to trigger auto-save
    const optionA = screen.getByText("Option A");
    fireEvent.click(optionA);

    // Trigger auto-save
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Saving status should be yellow
    await waitFor(() => {
      const savingElement = screen.getByText("Saving...");
      expect(savingElement).toHaveClass("text-yellow-600");
    });

    // Complete the save
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Saved status should be green
    await waitFor(() => {
      const savedElement = screen.getByText("Saved");
      expect(savedElement).toHaveClass("text-green-600");
    });
  });

  it("auto-saves when switching between questions with answers", async () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Answer the first question
    const optionA = screen.getByText("Option A");
    fireEvent.click(optionA);

    // Navigate to next question
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    // Auto-save should trigger for the previous answer
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });

  it("does not trigger auto-save when no answers are selected", () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Advance time without selecting any answers
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should remain in idle state
    expect(screen.getByText("Auto-save")).toBeInTheDocument();
    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
  });

  it("resets auto-save timer when answer changes", async () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Select first answer
    const optionA = screen.getByText("Option A");
    fireEvent.click(optionA);

    // Wait 1 second (less than auto-save delay)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Select different answer
    const optionB = screen.getByText("Option B");
    fireEvent.click(optionB);

    // Wait another 1 second (total 2 seconds, but timer should have reset)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should not have triggered auto-save yet
    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();

    // Wait the full delay from the second answer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Now auto-save should trigger
    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });
});
