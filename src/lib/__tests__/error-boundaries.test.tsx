import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as Sentry from "@sentry/nextjs";
import {
  ErrorBoundary,
  DefaultErrorFallback,
  PageErrorBoundary,
  ComponentErrorBoundary,
  CriticalErrorBoundary,
} from "@/components/ui/error-boundary";
import { ExamErrorBoundary } from "@/components/exam/exam-error-boundary";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(() => "test-event-id"),
  showReportDialog: jest.fn(),
}));

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

beforeEach(() => {
  jest.clearAllMocks();
});

// Test component that throws errors on demand
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error for error boundary");
  }
  return <div>Component working correctly</div>;
};

describe("ErrorBoundary", () => {
  it("renders children when there are no errors", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("catches errors and displays fallback UI", () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong with this component/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("sends errors to Sentry with correct context", () => {
    render(
      <ErrorBoundary level="page" name="Test Page">
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        contexts: expect.objectContaining({
          errorBoundary: expect.objectContaining({
            level: "page",
            name: "Test Page",
          }),
        }),
        tags: expect.objectContaining({
          errorBoundary: true,
          level: "page",
          component: "Test Page",
        }),
      })
    );
  });

  it("calls custom error handler when provided", () => {
    const mockErrorHandler = jest.fn();

    render(
      <ErrorBoundary onError={mockErrorHandler}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("resets error state when retry button is clicked", async () => {
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error("Test error for error boundary");
      }
      return <div>Component working correctly</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Initially shows error
    expect(screen.getByText(/Something went wrong with this component/)).toBeInTheDocument();

    // Fix the error condition and click retry
    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    // Re-render to trigger the component again
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Should now show working component
    expect(screen.getByText("Component working correctly")).toBeInTheDocument();
  });
});

describe("DefaultErrorFallback", () => {
  const mockResetError = jest.fn();

  beforeEach(() => {
    mockResetError.mockClear();
  });

  it("renders component-level fallback correctly", () => {
    render(
      <DefaultErrorFallback
        error={new Error("Test error")}
        errorInfo={{ componentStack: "test stack" } as React.ErrorInfo}
        eventId="test-event-id"
        resetError={mockResetError}
        level="component"
        name="Test Component"
      />
    );

    expect(screen.getByText("Test Component Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong with this component")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("renders page-level fallback correctly", () => {
    render(
      <DefaultErrorFallback
        error={new Error("Test error")}
        errorInfo={{ componentStack: "test stack" } as React.ErrorInfo}
        eventId="test-event-id"
        resetError={mockResetError}
        level="page"
        name="Test Page"
      />
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();
  });

  it("renders critical-level fallback correctly", () => {
    render(
      <DefaultErrorFallback
        error={new Error("Critical test error")}
        errorInfo={{ componentStack: "test stack" } as React.ErrorInfo}
        eventId="test-event-id"
        resetError={mockResetError}
        level="critical"
        name="Critical Component"
      />
    );

    expect(screen.getByText("Critical Error")).toBeInTheDocument();
    expect(screen.getByText(/A critical error occurred that requires immediate attention/)).toBeInTheDocument();
  });

  it("shows error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    // Mock the environment for this test
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true
    });

    render(
      <DefaultErrorFallback
        error={new Error("Test error with stack")}
        errorInfo={{ componentStack: "test component stack" } as React.ErrorInfo}
        eventId="test-event-id"
        resetError={mockResetError}
        level="page"
      />
    );

    expect(screen.getByText("Technical Details (Development Only)")).toBeInTheDocument();

    // Restore original environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true
    });
  });

  it("shows report issue button when eventId is provided", () => {
    render(
      <DefaultErrorFallback
        error={new Error("Test error")}
        errorInfo={{ componentStack: "test stack" } as React.ErrorInfo}
        eventId="test-event-id"
        resetError={mockResetError}
        level="page"
      />
    );

    const reportButton = screen.getByRole("button", { name: /report issue/i });
    expect(reportButton).toBeInTheDocument();

    fireEvent.click(reportButton);
    expect(Sentry.showReportDialog).toHaveBeenCalledWith({ eventId: "test-event-id" });
  });
});

describe("Specialized Error Boundaries", () => {
  it("PageErrorBoundary sets correct level", () => {
    render(
      <PageErrorBoundary name="Test Page">
        <ErrorThrowingComponent shouldThrow={true} />
      </PageErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: expect.objectContaining({
          level: "page",
        }),
      })
    );
  });

  it("ComponentErrorBoundary sets correct level", () => {
    render(
      <ComponentErrorBoundary name="Test Component">
        <ErrorThrowingComponent shouldThrow={true} />
      </ComponentErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: expect.objectContaining({
          level: "component",
        }),
      })
    );
  });

  it("CriticalErrorBoundary sets correct level", () => {
    render(
      <CriticalErrorBoundary name="Critical Component">
        <ErrorThrowingComponent shouldThrow={true} />
      </CriticalErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: expect.objectContaining({
          level: "critical",
        }),
        level: "fatal",
      })
    );
  });
});

describe("ExamErrorBoundary", () => {
  it("renders exam-specific error boundary", () => {
    render(
      <ExamErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ExamErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error while loading your exam/)).toBeInTheDocument();
    expect(screen.getByText(/Your progress has been automatically saved/)).toBeInTheDocument();
  });

  it("sends exam-specific context to Sentry", () => {
    render(
      <ExamErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ExamErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        contexts: expect.objectContaining({
          exam: expect.objectContaining({
            component: "ExamErrorBoundary",
          }),
        }),
        tags: expect.objectContaining({
          component: "exam",
          level: "critical",
        }),
      })
    );
  });

  it("provides exam-specific recovery options", () => {
    render(
      <ExamErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ExamErrorBoundary>
    );

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();
  });
});

describe("Error Boundary Integration", () => {
  it("handles nested error boundaries correctly", () => {
    render(
      <PageErrorBoundary name="Page">
        <ComponentErrorBoundary name="Component">
          <ErrorThrowingComponent shouldThrow={true} />
        </ComponentErrorBoundary>
      </PageErrorBoundary>
    );

    // Should catch at component level first
    expect(screen.getByText("Component Error")).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: expect.objectContaining({
          level: "component",
        }),
      })
    );
  });

  it("works with custom fallback components", () => {
    const CustomFallback = ({ error }: { error: Error | null }) => (
      <div>Custom error: {error?.message}</div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback as any}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error: Test error for error boundary")).toBeInTheDocument();
  });
});

describe("Error Boundary Performance", () => {
  it("does not re-render children unnecessarily", () => {
    let renderCount = 0;
    const TestComponent = React.memo(() => {
      renderCount++;
      return <div>Render count: {renderCount}</div>;
    });

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Render count: 1")).toBeInTheDocument();

    // Re-render the error boundary with same props
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Child should not re-render unnecessarily (with memo)
    expect(screen.getByText("Render count: 1")).toBeInTheDocument();
  });

  it("properly cleans up state on unmount", () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should not throw any warnings or errors during unmount
    expect(() => unmount()).not.toThrow();
  });
}); 