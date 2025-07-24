/**
 * Exam navigation utilities
 *
 * Helper functions for navigating between exam-related pages
 */

/**
 * Navigate to start a new exam
 */
export function navigateToStartExam(examId: string): string {
  return `/exam/${examId}`;
}

/**
 * Navigate to continue an existing exam attempt
 */
export function navigateToContinueExam(
  examId: string,
  attemptId: string
): string {
  return `/exam/${examId}?attempt=${attemptId}`;
}

/**
 * Navigate to restart an exam (abandon current attempts and start fresh)
 */
export function navigateToRestartExam(examId: string): string {
  return `/exam/${examId}?restart=true`;
}

/**
 * Navigate to exam results
 */
export function navigateToExamResults(
  examId: string,
  attemptId: string
): string {
  return `/exam/${examId}/results?attemptId=${attemptId}`;
}

/**
 * Navigate to exam review
 */
export function navigateToExamReview(
  examId: string,
  attemptId: string
): string {
  return `/exam/${examId}/results/review?attemptId=${attemptId}`;
}

/**
 * Client-side navigation function for restarting an exam
 */
export function handleRestartExam(examId: string): void {
  if (typeof window !== "undefined") {
    window.location.href = navigateToRestartExam(examId);
  }
}

/**
 * Client-side navigation function for starting an exam
 */
export function handleStartExam(examId: string): void {
  if (typeof window !== "undefined") {
    window.location.href = navigateToStartExam(examId);
  }
}

/**
 * Client-side navigation function for continuing an exam
 */
export function handleContinueExam(examId: string, attemptId: string): void {
  if (typeof window !== "undefined") {
    window.location.href = navigateToContinueExam(examId, attemptId);
  }
}
