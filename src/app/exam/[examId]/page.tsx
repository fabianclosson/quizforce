"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PreExamPage, ExamInterface } from "@/components/exam";
import { usePreExamData, useExamSession } from "@/hooks";
import { LoadingSpinner } from "@/components/ui";
import { ExamMode } from "@/types/exam";
import { ExamErrorBoundary } from "@/components/exam/exam-error-boundary";

export default function ExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;
  const attemptParam = searchParams.get("attempt");
  const restartParam = searchParams.get("restart") === "true";

  const [examStarted, setExamStarted] = useState(false);
  const [examAttemptId, setExamAttemptId] = useState<string | null>(null);
  const [examMode, setExamMode] = useState<ExamMode>("exam");

  // Fetch pre-exam data
  const {
    data: preExamData,
    isLoading: isLoadingPreExam,
    error: preExamError,
  } = usePreExamData(examId);

  // Fetch exam session data (only when exam is started)
  const {
    data: examSessionData,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useExamSession(examAttemptId, {
    enabled: examStarted && !!examAttemptId,
  });

  // Effect to handle continuing an existing exam from URL parameter
  useEffect(() => {
    if (attemptParam && !examStarted && !examAttemptId) {
      // Auto-start exam with existing attempt ID
      setExamAttemptId(attemptParam);
      // Don't set mode here - let it be set from the session data
      setExamStarted(true);
    }
  }, [attemptParam, examStarted, examAttemptId]);

  // Effect to set exam mode from session data when continuing
  useEffect(() => {
    if (examSessionData && examSessionData.attempt.mode) {
      setExamMode(examSessionData.attempt.mode);
    }
  }, [examSessionData]);

  const handleStartExam = (attemptId: string, mode: ExamMode) => {
    setExamAttemptId(attemptId);
    setExamMode(mode);
    setExamStarted(true);
  };

  const handleExamComplete = () => {
    // Reset state and redirect to dashboard
    setExamStarted(false);
    setExamAttemptId(null);
    setExamMode("exam");

    // Redirect to dashboard to show updated progress
    window.location.href = "/dashboard";
  };

  // Show loading state
  if (isLoadingPreExam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ExamErrorBoundary>
        {/* Show error state */}
        {preExamError && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Error Loading Exam
              </h1>
              <p className="text-muted-foreground mb-4">
                {preExamError.message ||
                  "Failed to load exam data. Please try again."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:underline"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        {/* Show pre-exam page if exam hasn't started */}
        {!examStarted && preExamData && (
          <PreExamPage
            preExamData={preExamData}
            onStartExam={handleStartExam}
            isRestart={restartParam}
          />
        )}

        {/* Show exam interface if exam has started */}
        {examStarted && examSessionData && (
          <ExamInterface
            sessionData={examSessionData}
            examMode={examMode}
            onExamComplete={handleExamComplete}
          />
        )}

        {/* Show loading state for session data */}
        {examStarted && isLoadingSession && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-muted-foreground">Starting your exam...</p>
            </div>
          </div>
        )}

        {/* Show session error */}
        {examStarted && sessionError && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Error Starting Exam
              </h1>
              <p className="text-muted-foreground mb-4">
                {sessionError.message || "Failed to start exam. Please try again."}
              </p>
              <button
                onClick={() => setExamStarted(false)}
                className="text-blue-600 hover:underline"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Fallback loading state */}
        {!preExamError && !preExamData && !examSessionData && !isLoadingSession && !sessionError && (
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
          </div>
                 )}
     </ExamErrorBoundary>
   );
}
