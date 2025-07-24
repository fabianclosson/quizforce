import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ExamInterface } from "@/components/exam/exam-interface";
import { ExamSessionData } from "@/types/exam";

const mockSessionData: ExamSessionData = {
  attempt: {
    id: "test-attempt-1",
    user_id: "user-1",
    practice_exam_id: "exam_1",
    started_at: new Date().toISOString(),
    correct_answers: 0,
    total_questions: 1,
    time_spent_minutes: 0,
    status: "in_progress",
    mode: "exam",
    created_at: new Date().toISOString(),
  },
  questions: [
    {
      id: "q1",
      practice_exam_id: "exam_1",
      knowledge_area_id: "ka_1",
      question_text: "What is the capital of France?",
      explanation: "Test explanation",
      difficulty_level: "easy",
      question_number: 1,
      required_selections: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      answers: [
        {
          id: "a1",
          question_id: "q1",
          answer_text: "Paris",
          explanation: "Paris is the capital of France",
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
  ],
  user_answers: [],
  current_question_index: 0,
  time_remaining_seconds: 300, // 5 minutes for testing
  is_flagged: {},
};

describe("ExamInterface Timer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("displays timer correctly", () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Should display 5:00 for 300 seconds - get all timer elements
    const timerElements = screen.getAllByText("5:00");
    expect(timerElements.length).toBeGreaterThan(0);
    expect(timerElements[0]).toBeInTheDocument();
  });

  it("formats time correctly for hours, minutes, and seconds", () => {
    const mockOnExamComplete = jest.fn();
    const sessionWithLongTime = {
      ...mockSessionData,
      time_remaining_seconds: 3661, // 1 hour, 1 minute, 1 second
    };

    render(
      <ExamInterface
        examMode="exam"
        sessionData={sessionWithLongTime}
        onExamComplete={mockOnExamComplete}
      />
    );

    const timerElements = screen.getAllByText("1:01:01");
    expect(timerElements.length).toBeGreaterThan(0);
    expect(timerElements[0]).toBeInTheDocument();
  });

  it("counts down timer correctly", () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Initial time should be 5:00
    expect(screen.getAllByText("5:00").length).toBeGreaterThan(0);

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should now show 4:59
    expect(screen.getAllByText("4:59").length).toBeGreaterThan(0);

    // Advance by another 59 seconds
    act(() => {
      jest.advanceTimersByTime(59000);
    });

    // Should now show 4:00
    expect(screen.getAllByText("4:00").length).toBeGreaterThan(0);
  });

  it("shows yellow warning when time is low (less than 15 minutes)", () => {
    const mockOnExamComplete = jest.fn();
    const sessionWithLowTime = {
      ...mockSessionData,
      time_remaining_seconds: 600, // 10 minutes
    };

    render(
      <ExamInterface
        examMode="exam"
        sessionData={sessionWithLowTime}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Find the first timer element and check its color class
    const timerElements = screen.getAllByText("10:00");
    expect(timerElements.length).toBeGreaterThan(0);

    // Check that warning styles are applied (yellow background)
    const yellowElements = document.querySelectorAll(".bg-yellow-50");
    expect(yellowElements.length).toBeGreaterThan(0);
  });

  it("shows red warning when time is very low (less than 5 minutes)", () => {
    const mockOnExamComplete = jest.fn();
    const sessionWithVeryLowTime = {
      ...mockSessionData,
      time_remaining_seconds: 180, // 3 minutes
    };

    render(
      <ExamInterface
        examMode="exam"
        sessionData={sessionWithVeryLowTime}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Find the timer elements and check for red warning styles
    const timerElements = screen.getAllByText("3:00");
    expect(timerElements.length).toBeGreaterThan(0);

    // Check that critical warning styles are applied (red background)
    const redElements = document.querySelectorAll(".bg-red-50");
    expect(redElements.length).toBeGreaterThan(0);
  });

  it("auto-submits exam when timer reaches zero", () => {
    const mockOnExamComplete = jest.fn();
    const sessionWithMinimalTime = {
      ...mockSessionData,
      time_remaining_seconds: 2, // 2 seconds
    };

    render(
      <ExamInterface
        examMode="exam"
        sessionData={sessionWithMinimalTime}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Advance timer past the remaining time
    act(() => {
      jest.advanceTimersByTime(3000); // 3 seconds
    });

    // Should have called onExamComplete for auto-submission
    expect(mockOnExamComplete).toHaveBeenCalledTimes(1);
  });

  it("stops timer at zero and does not go negative", () => {
    const mockOnExamComplete = jest.fn();
    const sessionWithMinimalTime = {
      ...mockSessionData,
      time_remaining_seconds: 1, // 1 second
    };

    render(
      <ExamInterface
        examMode="exam"
        sessionData={sessionWithMinimalTime}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Advance timer past the remaining time
    act(() => {
      jest.advanceTimersByTime(5000); // 5 seconds
    });

    // Timer should show 0:00 and not go negative
    const timerElements = screen.getAllByText("0:00");
    expect(timerElements.length).toBeGreaterThan(0);
    expect(mockOnExamComplete).toHaveBeenCalled();
  });

  it("displays timer with clock icon", () => {
    const mockOnExamComplete = jest.fn();
    render(
      <ExamInterface
        examMode="exam"
        sessionData={mockSessionData}
        onExamComplete={mockOnExamComplete}
      />
    );

    // Check for the presence of timer section with clock icon
    const timerElements = screen.getAllByText("5:00");
    expect(timerElements.length).toBeGreaterThan(0);

    // Check for clock icons
    const clockIcons = document.querySelectorAll('svg[class*="lucide-clock"]');
    expect(clockIcons.length).toBeGreaterThan(0);
  });
});
