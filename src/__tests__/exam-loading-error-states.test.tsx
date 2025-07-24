import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ExamLoadingState,
  QuestionLoadingState,
  SubmissionLoadingState,
  AutoSaveLoadingState,
  ConnectionErrorState,
  DataSyncErrorState,
} from "@/components/exam/exam-loading-states";
import { ExamErrorBoundary } from "@/components/exam/exam-error-boundary";

describe("Exam Loading States", () => {
  describe("ExamLoadingState", () => {
    it("renders full exam interface skeleton", () => {
      const { container } = render(<ExamLoadingState />);

      // Check for skeleton elements with animation
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(10);

      // Check for main content structure
      expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
      expect(container.querySelector(".border-b.bg-card")).toBeInTheDocument();
    });

    it("displays proper skeleton structure", () => {
      const { container } = render(<ExamLoadingState />);

      // Check for skeleton elements
      const skeletons = container.querySelectorAll(
        '[data-testid], .animate-pulse, [class*="skeleton"]'
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("QuestionLoadingState", () => {
    it("renders question loading state", () => {
      render(<QuestionLoadingState />);

      expect(screen.getByText("Loading question...")).toBeInTheDocument();
      expect(
        screen.getByRole("status", { name: /loading/i })
      ).toBeInTheDocument();
    });
  });

  describe("SubmissionLoadingState", () => {
    it("renders submission loading overlay", () => {
      render(<SubmissionLoadingState />);

      expect(screen.getByText("Submitting Your Exam")).toBeInTheDocument();
      expect(
        screen.getByText("Please wait while we process your submission...")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("status", { name: /loading/i })
      ).toBeInTheDocument();
    });

    it("renders as an overlay with proper z-index", () => {
      const { container } = render(<SubmissionLoadingState />);

      const overlay = container.querySelector(".fixed.inset-0");
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass("z-50");
    });
  });

  describe("AutoSaveLoadingState", () => {
    it("renders auto-save loading indicator", () => {
      render(<AutoSaveLoadingState />);

      expect(screen.getByText("Saving...")).toBeInTheDocument();

      // Check for animated pulse dot
      const pulseElement = screen
        .getByText("Saving...")
        .parentElement?.querySelector(".animate-pulse");
      expect(pulseElement).toBeInTheDocument();
    });
  });

  describe("ConnectionErrorState", () => {
    const mockOnRetry = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders connection error message", () => {
      render(<ConnectionErrorState onRetry={mockOnRetry} />);

      expect(screen.getByText("Connection Lost")).toBeInTheDocument();
      expect(
        screen.getByText(/We've lost connection to the server/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Your progress has been saved locally/)
      ).toBeInTheDocument();
    });

    it("calls onRetry when reconnect button is clicked", () => {
      render(<ConnectionErrorState onRetry={mockOnRetry} />);

      const reconnectButton = screen.getByRole("button", {
        name: /reconnect/i,
      });
      fireEvent.click(reconnectButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it("shows timer continuation message", () => {
      render(<ConnectionErrorState onRetry={mockOnRetry} />);

      expect(
        screen.getByText(/Your exam timer continues to run/)
      ).toBeInTheDocument();
    });
  });

  describe("DataSyncErrorState", () => {
    const mockOnRetry = jest.fn();
    const mockOnContinueOffline = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders sync error notification", () => {
      render(
        <DataSyncErrorState
          onRetry={mockOnRetry}
          onContinueOffline={mockOnContinueOffline}
        />
      );

      expect(screen.getByText("Sync Failed")).toBeInTheDocument();
      expect(
        screen.getByText(/Unable to save your progress/)
      ).toBeInTheDocument();
      expect(screen.getByText(/You can continue offline/)).toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", () => {
      render(
        <DataSyncErrorState
          onRetry={mockOnRetry}
          onContinueOffline={mockOnContinueOffline}
        />
      );

      const retryButton = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it("calls onContinueOffline when continue offline button is clicked", () => {
      render(
        <DataSyncErrorState
          onRetry={mockOnRetry}
          onContinueOffline={mockOnContinueOffline}
        />
      );

      const continueButton = screen.getByRole("button", {
        name: /continue offline/i,
      });
      fireEvent.click(continueButton);

      expect(mockOnContinueOffline).toHaveBeenCalledTimes(1);
    });

    it("renders as bottom-right notification", () => {
      const { container } = render(
        <DataSyncErrorState
          onRetry={mockOnRetry}
          onContinueOffline={mockOnContinueOffline}
        />
      );

      const notification = container.querySelector(".fixed.bottom-4.right-4");
      expect(notification).toBeInTheDocument();
    });
  });
});

describe("ExamErrorBoundary", () => {
  // Component that throws an error for testing
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error("Test error for error boundary");
    }
    return <div>No error</div>;
  };

  // Suppress console.error for error boundary tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <ExamErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ExamErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders error UI when there is an error", () => {
    render(
      <ExamErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ExamErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your progress has been automatically saved/)
    ).toBeInTheDocument();
  });

  it("displays error message when available", () => {
    render(
      <ExamErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ExamErrorBoundary>
    );

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
    expect(
      screen.getByText("Test error for error boundary")
    ).toBeInTheDocument();
  });

  it("provides action buttons for error recovery", () => {
    render(
      <ExamErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ExamErrorBoundary>
    );

    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reload page/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go home/i })
    ).toBeInTheDocument();
  });

  it("shows support message", () => {
    render(
      <ExamErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ExamErrorBoundary>
    );

    expect(screen.getByText(/If this problem persists/)).toBeInTheDocument();
    expect(screen.getByText(/contact support/)).toBeInTheDocument();
  });

  it("try again button is clickable", () => {
    render(
      <ExamErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ExamErrorBoundary>
    );

    // Error boundary should show error UI
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Try again button should be present and clickable
    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
    expect(tryAgainButton).not.toBeDisabled();
  });
});
