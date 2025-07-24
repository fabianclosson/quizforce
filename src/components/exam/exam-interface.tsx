"use client";

import React, { useState, useEffect } from "react";
import { ExamSessionData } from "@/types/exam";
import { ExamMode } from "@/types/exam";
import { QuestionDisplay } from "./question-display";
import { QuestionNavigation } from "./question-navigation";
import { QuestionControls } from "./question-controls";
import { ExamSubmissionDialog } from "./exam-submission-dialog";
import { ExamResultsDialog } from "./exam-results-dialog";
import { ExamTimer } from "./exam-timer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Clock, Save, Send, Grid3X3, ChevronUp } from "lucide-react";
import { useSubmitExam } from "@/hooks/use-exam";

interface ExamInterfaceProps {
  sessionData: ExamSessionData;
  examMode: ExamMode;
  onExamComplete: () => void;
}

export function ExamInterface({
  sessionData,
  examMode,
  onExamComplete,
}: ExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    sessionData.current_question_index || 0
  );

  // Updated to support multi-answer questions - store arrays of answer IDs
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});

  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [timeRemaining, setTimeRemaining] = useState(
    sessionData.time_remaining_seconds
  );
  const [isPaused, setIsPaused] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [examResults, setExamResults] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileNavigation, setShowMobileNavigation] = useState(false);

  // Add submit exam hook
  const submitExamMutation = useSubmitExam();

  // Add practice mode specific state
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    correctAnswers: string[];
    userAnswers: string[];
  } | null>(null);

  const currentQuestion = sessionData.questions[currentQuestionIndex];
  const totalQuestions = sessionData.questions.length;
  const currentQuestionNumber = currentQuestionIndex + 1;

  // Effect to update timeRemaining when sessionData changes (for continued exams)
  useEffect(() => {
    setTimeRemaining(sessionData.time_remaining_seconds);
  }, [sessionData.time_remaining_seconds]);

  // Effect to sync timer with server periodically (every 30 seconds) to prevent drift
  useEffect(() => {
    if (
      examMode === "exam" &&
      !isPaused &&
      sessionData.attempt.status === "in_progress"
    ) {
      const syncInterval = setInterval(() => {
        // Refetch session data to sync timer
        // This will update timeRemaining automatically via the above effect
        window.dispatchEvent(new Event("focus")); // Trigger refetch
      }, 30000); // Sync every 30 seconds

      return () => clearInterval(syncInterval);
    }
  }, [examMode, isPaused, sessionData.attempt.status]);

  // Effect to restore user answers from sessionData when continuing an exam
  useEffect(() => {
    if (sessionData.user_answers && sessionData.user_answers.length > 0) {
      const restoredAnswers: Record<string, string[]> = {};
      sessionData.user_answers.forEach(userAnswer => {
        if (userAnswer.answer_id) {
          // Single answer - convert to array format
          restoredAnswers[userAnswer.question_id] = [userAnswer.answer_id];
        }
      });
      setUserAnswers(restoredAnswers);
    }
  }, [sessionData.user_answers]);

  // Timer effect removed - ExamTimer component handles all timer logic
  // The ExamTimer component now manages time countdown and auto-submit

  // Auto-save effect
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (Object.keys(userAnswers).length > 0) {
        handleAutoSave();
      }
    }, 2000); // Auto-save 2 seconds after last change

    return () => clearTimeout(autoSaveTimer);
  }, [userAnswers]);

  const handleAutoSave = async () => {
    setAutoSaveStatus("saving");
    try {
      // TODO: Implement actual auto-save API call for multi-answer support
      // Need to save multiple user_answer records per question
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 2000);
    } catch (error) {
      setAutoSaveStatus("error");
      console.error("Auto-save failed:", error);
    }
  };

  // Updated to handle array of answer IDs for multi-answer questions
  const handleAnswerSelect = (answerIds: string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIds,
    }));

    // In practice mode, show immediate feedback when user has made selection
    if (examMode === "practice" && answerIds.length > 0) {
      // For single-answer questions, show feedback immediately
      if (currentQuestion.required_selections === 1) {
        handleSubmitAnswer(answerIds);
      }
      // For multi-answer questions, show feedback when required number is selected
      else if (answerIds.length === currentQuestion.required_selections) {
        handleSubmitAnswer(answerIds);
      }
    }
  };

  const handleSubmitAnswer = (answerIds: string[]) => {
    if (examMode !== "practice") return;

    // Get all correct answers for this question
    const correctAnswers = currentQuestion.answers
      .filter(answer => answer.is_correct)
      .map(answer => answer.answer_text);

    const userSelectedAnswers = currentQuestion.answers
      .filter(answer => answerIds.includes(answer.id))
      .map(answer => answer.answer_text);

    // Determine if the answer is correct based on question type
    let isCorrect = false;

    if (currentQuestion.required_selections === 1) {
      // Single-answer question: check if the one selected answer is correct
      const selectedAnswer = currentQuestion.answers.find(answer =>
        answerIds.includes(answer.id)
      );
      isCorrect = selectedAnswer?.is_correct || false;
    } else {
      // Multi-answer question: check if ALL correct answers are selected and NO incorrect ones
      const correctAnswerIds = currentQuestion.answers
        .filter(answer => answer.is_correct)
        .map(answer => answer.id);

      const allCorrectSelected = correctAnswerIds.every(id =>
        answerIds.includes(id)
      );
      const noIncorrectSelected = answerIds.every(id =>
        correctAnswerIds.includes(id)
      );
      const correctCount =
        answerIds.length === currentQuestion.required_selections;

      isCorrect = allCorrectSelected && noIncorrectSelected && correctCount;
    }

    setCurrentFeedback({
      isCorrect,
      explanation: currentQuestion.explanation || "No explanation available.",
      correctAnswers,
      userAnswers: userSelectedAnswers,
    });
    setShowFeedback(true);
  };

  const handleQuestionSelect = (questionNumber: number) => {
    setCurrentQuestionIndex(questionNumber - 1);
    setShowMobileNavigation(false); // Close mobile navigation after selection
    // Hide feedback when navigating to different question
    setShowFeedback(false);
    setCurrentFeedback(null);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Hide feedback when navigating
      setShowFeedback(false);
      setCurrentFeedback(null);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Hide feedback when navigating
      setShowFeedback(false);
      setCurrentFeedback(null);
    }
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionNumber)) {
        newSet.delete(currentQuestionNumber);
      } else {
        newSet.add(currentQuestionNumber);
      }
      return newSet;
    });
  };

  const getAnsweredQuestions = (): Set<number> => {
    const answered = new Set<number>();
    sessionData.questions.forEach((question, index) => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer && userAnswer.length > 0) {
        answered.add(index + 1);
      }
    });
    return answered;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return "text-red-600"; // Less than 5 minutes
    if (timeRemaining < 900) return "text-yellow-600"; // Less than 15 minutes
    return "text-foreground";
  };

  const handleSubmitClick = () => {
    setShowSubmissionDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Final auto-save before submission
      if (Object.keys(userAnswers).length > 0) {
        await handleAutoSave();
      }

      // Submit the exam
      const result = await submitExamMutation.mutateAsync({
        examAttemptId: sessionData.attempt.id,
      });

      console.log("Exam submitted successfully:", result);

      // Store the results and show the results dialog
      setExamResults(result.results);
      setShowSubmissionDialog(false);
      setShowResultsDialog(true);
    } catch (error) {
      console.error("Exam submission failed:", error);
      // TODO: Show error message to user - could use a toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSubmissionDialog = () => {
    if (!isSubmitting) {
      setShowSubmissionDialog(false);
    }
  };

  const answeredQuestions = getAnsweredQuestions();
  const progressPercentage = (answeredQuestions.size / totalQuestions) * 100;

  const handleNextAfterFeedback = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Handle exam completion for practice mode
      onExamComplete();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">
              No Questions Available
            </h2>
            <p className="text-muted-foreground">
              There are no questions available for this exam.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4 max-w-7xl">
          {/* Mobile header layout */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">
                {examMode === "practice" ? "Practice Mode" : "Practice Exam"}
              </h1>
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {currentQuestionNumber}/{totalQuestions}
              </Badge>
            </div>

            {/* Mobile timer - only show in exam mode */}
            <ExamTimer
              timeRemainingSeconds={timeRemaining}
              examMode={examMode}
              onTimeUp={() => {
                if (examMode === "exam") {
                  setShowSubmissionDialog(true);
                  onExamComplete(); // Auto-submit when time expires
                }
              }}
              onTimeUpdate={setTimeRemaining}
              onPauseChange={setIsPaused}
              isPaused={isPaused}
              isSubmitting={showSubmissionDialog}
            />

            {/* Mobile navigation toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <QuestionNavigation
                  currentQuestion={currentQuestionNumber}
                  totalQuestions={totalQuestions}
                  answeredQuestions={answeredQuestions}
                  flaggedQuestions={flaggedQuestions}
                  onQuestionSelect={handleQuestionSelect}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onToggleFlag={handleToggleFlag}
                  canGoPrevious={currentQuestionIndex > 0}
                  canGoNext={currentQuestionIndex < totalQuestions - 1}
                  isCurrentQuestionFlagged={flaggedQuestions.has(
                    currentQuestionNumber
                  )}
                  showNavigationControls={false}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop header layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {examMode === "practice" ? "Practice Mode" : "Practice Exam"}
              </h1>
              <Badge variant="outline">
                Question {currentQuestionNumber} of {totalQuestions}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Auto-save status - show in both modes but different text for practice */}
              <div className="flex items-center gap-2 text-sm">
                <Save className="h-4 w-4" />
                <span
                  className={`${
                    autoSaveStatus === "saving"
                      ? "text-yellow-600"
                      : autoSaveStatus === "saved"
                        ? "text-green-600"
                        : autoSaveStatus === "error"
                          ? "text-red-600"
                          : "text-muted-foreground"
                  }`}
                >
                  {autoSaveStatus === "saving"
                    ? "Saving..."
                    : autoSaveStatus === "saved"
                      ? "Saved"
                      : autoSaveStatus === "error"
                        ? "Save Error"
                        : examMode === "practice"
                          ? "Progress Saved"
                          : "Auto-save"}
                </span>
              </div>

              <ExamTimer
                timeRemainingSeconds={timeRemaining}
                examMode={examMode}
                onTimeUp={() => {
                  if (examMode === "exam") {
                    setShowSubmissionDialog(true);
                    onExamComplete(); // Auto-submit when time expires
                  }
                }}
                onTimeUpdate={setTimeRemaining}
                onPauseChange={setIsPaused}
                isPaused={isPaused}
                isSubmitting={showSubmissionDialog}
              />

              {/* Submit button - only show in exam mode */}
              {examMode === "exam" && (
                <Button
                  onClick={handleSubmitClick}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Send className="h-4 w-4" />
                  Submit Exam
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 md:mt-4">
            <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mb-2">
              <span>
                Progress: {answeredQuestions.size} of {totalQuestions} answered
              </span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Question area */}
          <div className="lg:col-span-3">
            {/* Question Controls - Above the question */}
            <QuestionControls
              currentQuestion={currentQuestionNumber}
              totalQuestions={totalQuestions}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleFlag={handleToggleFlag}
              canGoPrevious={currentQuestionIndex > 0}
              canGoNext={currentQuestionIndex < totalQuestions - 1}
              isCurrentQuestionFlagged={flaggedQuestions.has(
                currentQuestionNumber
              )}
            />

            <QuestionDisplay
              question={currentQuestion}
              selectedAnswerIds={userAnswers[currentQuestion.id] || []}
              onAnswerSelect={handleAnswerSelect}
              questionNumber={currentQuestionNumber}
              totalQuestions={totalQuestions}
              examMode={examMode}
              showFeedback={showFeedback}
              feedback={currentFeedback}
              onNextAfterFeedback={handleNextAfterFeedback}
            />
          </div>

          {/* Desktop question navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <QuestionNavigation
              currentQuestion={currentQuestionNumber}
              totalQuestions={totalQuestions}
              answeredQuestions={answeredQuestions}
              flaggedQuestions={flaggedQuestions}
              onQuestionSelect={handleQuestionSelect}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleFlag={handleToggleFlag}
              canGoPrevious={currentQuestionIndex > 0}
              canGoNext={currentQuestionIndex < totalQuestions - 1}
              isCurrentQuestionFlagged={flaggedQuestions.has(
                currentQuestionNumber
              )}
              showNavigationControls={false}
            />
          </div>
        </div>
      </div>

      {/* Submit dialog - only show in exam mode */}
      {examMode === "exam" && (
        <ExamSubmissionDialog
          isOpen={showSubmissionDialog}
          onClose={handleCloseSubmissionDialog}
          onConfirmSubmit={handleConfirmSubmit}
          totalQuestions={totalQuestions}
          answeredQuestions={answeredQuestions}
          flaggedQuestions={flaggedQuestions}
          timeRemaining={timeRemaining}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Results dialog - show after exam submission */}
      {examResults && (
        <ExamResultsDialog
          isOpen={showResultsDialog}
          onClose={() => setShowResultsDialog(false)}
          onRetakeExam={() => {
            setShowResultsDialog(false);
            // Navigate to restart exam
            window.location.href = window.location.pathname + "?restart=true";
          }}
          onGoToDashboard={() => {
            setShowResultsDialog(false);
            onExamComplete();
          }}
          results={examResults}
        />
      )}
    </div>
  );
}
