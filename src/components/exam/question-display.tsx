"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui";
import { Checkbox } from "@/components/ui";
import { Label } from "@/components/ui";
import { QuestionWithAnswers } from "@/types/exam";
import { ExamMode } from "@/types/exam";
import { cn } from "@/lib/utils";
import {
  touchSpacing,
  touchTargetSizes,
  responsiveHover,
} from "@/lib/touch-utils";
import { CheckCircle, XCircle, ArrowRight, AlertCircle } from "lucide-react";

interface QuestionDisplayProps {
  question: QuestionWithAnswers;
  selectedAnswerIds?: string[];
  onAnswerSelect: (answerIds: string[]) => void;
  questionNumber: number;
  totalQuestions: number;
  showExplanation?: boolean;
  isReviewMode?: boolean;
  className?: string;
  // Practice mode props
  examMode?: ExamMode;
  showFeedback?: boolean;
  feedback?: {
    isCorrect: boolean;
    explanation: string;
    correctAnswers: string[];
    userAnswers: string[];
  } | null;
  onNextAfterFeedback?: () => void;
}

export function QuestionDisplay({
  question,
  selectedAnswerIds = [],
  onAnswerSelect,
  questionNumber,
  totalQuestions,
  showExplanation = false,
  isReviewMode = false,
  className,
  examMode = "exam",
  showFeedback = false,
  feedback = null,
  onNextAfterFeedback,
}: QuestionDisplayProps) {
  const isMultiAnswer = question.required_selections > 1;
  const selectedCount = selectedAnswerIds.length;
  const requiredSelections = question.required_selections;
  const isSelectionComplete = selectedCount === requiredSelections;
  const isOverSelected = selectedCount > requiredSelections;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAnswerClassName = (answer: { id: string; is_correct: boolean }) => {
    const isSelected = selectedAnswerIds.includes(answer.id);

    // In practice mode with feedback, show correct/incorrect states
    if (examMode === "practice" && showFeedback && feedback) {
      if (answer.is_correct) {
        return "border-green-500 bg-green-50 hover:bg-green-100 text-green-900";
      }
      if (isSelected && !answer.is_correct) {
        return "border-red-500 bg-red-50 hover:bg-red-100 text-red-900";
      }
    }

    if (isReviewMode && showExplanation) {
      if (answer.is_correct) {
        return "border-green-500 bg-green-50 hover:bg-green-100 text-green-900";
      }
      if (isSelected && !answer.is_correct) {
        return "border-red-500 bg-red-50 hover:bg-red-100 text-red-900";
      }
    }

    if (isSelected) {
      return "border-primary bg-primary/10 hover:bg-primary/20";
    }

    return "border-border hover:bg-accent";
  };

  const handleAnswerToggle = (answerId: string) => {
    if (isReviewMode || (examMode === "practice" && showFeedback)) {
      return;
    }

    if (isMultiAnswer) {
      // Multi-answer logic: toggle selection up to required limit
      const isCurrentlySelected = selectedAnswerIds.includes(answerId);

      if (isCurrentlySelected) {
        // Deselect: remove from array
        const newSelection = selectedAnswerIds.filter(id => id !== answerId);
        onAnswerSelect(newSelection);
      } else {
        // Only allow selection if under the limit
        if (selectedCount < requiredSelections) {
          const newSelection = [...selectedAnswerIds, answerId];
          onAnswerSelect(newSelection);
        }
      }
    } else {
      // Single-answer logic: replace entire selection array
      onAnswerSelect([answerId]);
    }
  };

  const getInstructionText = () => {
    if (requiredSelections === 1) {
      return "Select one answer";
    } else {
      return `Select ${requiredSelections} answers`;
    }
  };

  const shouldDisableAnswers =
    isReviewMode || (examMode === "practice" && showFeedback);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("flex items-center", touchSpacing.comfortable)}>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2 py-1",
                getDifficultyColor(question.difficulty_level)
              )}
            >
              {question.difficulty_level.charAt(0).toUpperCase() +
                question.difficulty_level.slice(1)}
            </Badge>
            {examMode === "practice" && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                Practice Mode
              </Badge>
            )}
          </div>

          {question.knowledge_area && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {question.knowledge_area.name}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold leading-relaxed">
            {question.question_text}
          </h2>

          {/* Instruction text */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{getInstructionText()}</span>
            {isMultiAnswer && (
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded",
                  isSelectionComplete
                    ? "bg-green-100 text-green-800"
                    : isOverSelected
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                )}
              >
                {selectedCount} of {requiredSelections} selected
              </span>
            )}
          </div>

          {/* Selection warning for multi-answer */}
          {isMultiAnswer && isOverSelected && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                You can only select {requiredSelections} answer
                {requiredSelections !== 1 ? "s" : ""}. Please deselect{" "}
                {selectedCount - requiredSelections} answer
                {selectedCount - requiredSelections !== 1 ? "s" : ""}.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardHeader>

      <CardContent className={touchSpacing.comfortable}>
        <div className={touchSpacing.comfortable}>
          {/* Single-answer rendering with RadioGroup */}
          {!isMultiAnswer && (
            <RadioGroup
              value={selectedAnswerIds[0] || ""}
              onValueChange={value =>
                !shouldDisableAnswers && onAnswerSelect([value])
              }
            >
              {question.answers
                .sort((a, b) => a.answer_letter.localeCompare(b.answer_letter))
                .map(answer => (
                  <div
                    key={answer.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border transition-all duration-200",
                      touchSpacing.touchPadding,
                      getAnswerClassName(answer),
                      shouldDisableAnswers ? "opacity-70" : "cursor-pointer"
                    )}
                    onClick={() =>
                      !shouldDisableAnswers && onAnswerSelect([answer.id])
                    }
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem
                        value={answer.id}
                        id={answer.id}
                        disabled={shouldDisableAnswers}
                      />
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                          "transition-colors duration-200",
                          selectedAnswerIds.includes(answer.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {answer.answer_letter}
                      </div>
                    </div>
                    <Label
                      htmlFor={answer.id}
                      className="flex-1 text-sm leading-relaxed py-1 cursor-pointer"
                    >
                      {answer.answer_text}
                    </Label>
                    {/* Show correct/incorrect icons in practice mode */}
                    {examMode === "practice" && showFeedback && feedback && (
                      <div className="flex-shrink-0 mt-1">
                        {answer.is_correct ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : selectedAnswerIds.includes(answer.id) &&
                          !answer.is_correct ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
            </RadioGroup>
          )}

          {/* Multi-answer rendering with Checkboxes */}
          {isMultiAnswer && (
            <div className="space-y-3">
              {question.answers
                .sort((a, b) => a.answer_letter.localeCompare(b.answer_letter))
                .map(answer => {
                  const isSelected = selectedAnswerIds.includes(answer.id);
                  const canSelect =
                    !shouldDisableAnswers &&
                    (!isSelected || selectedCount <= requiredSelections);
                  const isDisabled =
                    shouldDisableAnswers ||
                    (!isSelected && selectedCount >= requiredSelections);

                  return (
                    <div
                      key={answer.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border transition-all duration-200",
                        touchSpacing.touchPadding,
                        getAnswerClassName(answer),
                        isDisabled ? "opacity-70" : "cursor-pointer"
                      )}
                      onClick={() => canSelect && handleAnswerToggle(answer.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={answer.id}
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() =>
                            canSelect && handleAnswerToggle(answer.id)
                          }
                        />
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                            "transition-colors duration-200",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {answer.answer_letter}
                        </div>
                      </div>
                      <Label
                        htmlFor={answer.id}
                        className="flex-1 text-sm leading-relaxed py-1 cursor-pointer"
                      >
                        {answer.answer_text}
                      </Label>
                      {/* Show correct/incorrect icons in practice mode */}
                      {examMode === "practice" && showFeedback && feedback && (
                        <div className="flex-shrink-0 mt-1">
                          {answer.is_correct ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : isSelected && !answer.is_correct ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Practice mode feedback */}
        {examMode === "practice" && showFeedback && feedback && (
          <div className="mt-6 space-y-4">
            {/* Main feedback alert */}
            <Alert
              className={
                feedback.isCorrect
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <div className="flex items-center gap-3 pb-4 mb-6 border-b">
                {feedback.isCorrect ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <span
                  className={cn(
                    "font-bold text-lg",
                    feedback.isCorrect ? "text-green-800" : "text-red-800"
                  )}
                >
                  {feedback.isCorrect ? "Excellent!" : "Incorrect"}
                </span>
              </div>
              <AlertDescription>
                <div className="space-y-6">
                  {/* Question explanation */}
                  <div className="bg-white p-4 rounded-lg border-l-4 border-gray-300">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">
                      Explanation
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-800">
                      {feedback.explanation}
                    </p>
                  </div>

                  {/* Your answers vs correct answers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* User's selection */}
                    <div className="p-3 bg-white rounded-lg border">
                      <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Your Selection
                      </h4>
                      <div className="space-y-1">
                        {feedback.userAnswers.length > 0 ? (
                          feedback.userAnswers.map((answer, index) => (
                            <p key={index} className="text-sm font-medium">
                              {answer}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No answer selected
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Correct answers */}
                    <div className="p-3 bg-white rounded-lg border">
                      <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Correct Answer
                        {feedback.correctAnswers.length > 1 ? "s" : ""}
                      </h4>
                      <div className="space-y-1">
                        {feedback.correctAnswers.map((answer, index) => (
                          <p
                            key={index}
                            className="text-sm font-medium text-green-700"
                          >
                            {answer}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Study tip for incorrect answers */}
                  {!feedback.isCorrect && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-600 text-white rounded-full p-1 flex-shrink-0 mt-0.5">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-blue-900 mb-1">
                            Study Tip
                          </h4>
                          <p className="text-sm text-blue-800">
                            {isMultiAnswer
                              ? `For multi-select questions like this, you need to identify ALL correct answers (${requiredSelections} in total). Make sure to carefully read each option and select every answer that applies.`
                              : "Review the question carefully and consider all aspects of the scenario. Look for keywords that might indicate the best answer."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Encouragement for correct answers */}
                  {feedback.isCorrect && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2">
                        <div className="bg-green-600 text-white rounded-full p-1 flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-green-900 mb-1">
                            Well Done!
                          </h4>
                          <p className="text-sm text-green-800">
                            {isMultiAnswer
                              ? "Great work identifying all the correct answers for this multi-select question!"
                              : "You correctly identified the best answer. Keep up the excellent work!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Continue button */}
            {onNextAfterFeedback && (
              <div className="flex justify-between items-center pt-6 mt-6 border-t">
                <div className="text-xs text-muted-foreground">
                  {questionNumber < totalQuestions
                    ? `${totalQuestions - questionNumber} questions remaining`
                    : "Last question - you're almost done!"}
                </div>
                <Button
                  onClick={onNextAfterFeedback}
                  className="flex items-center gap-2"
                >
                  {questionNumber < totalQuestions
                    ? "Next Question"
                    : "Finish Practice"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {showExplanation && question.explanation && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium text-sm mb-2 text-muted-foreground">
              Explanation:
            </h3>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {showExplanation && selectedAnswerIds.length > 0 && (
          <div className="mt-4 space-y-3">
            {question.answers
              .filter(
                answer =>
                  selectedAnswerIds.includes(answer.id) && answer.explanation
              )
              .map(answer => (
                <div
                  key={answer.id}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <h3 className="font-medium text-sm mb-2 text-blue-900">
                    Answer {answer.answer_letter} Explanation:
                  </h3>
                  <p className="text-sm leading-relaxed text-blue-800">
                    {answer.explanation}
                  </p>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
