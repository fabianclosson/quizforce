"use client";

import React from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  touchSpacing,
  touchTargetSizes,
  responsiveHover,
} from "@/lib/touch-utils";

interface QuestionNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onQuestionSelect: (questionNumber: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isCurrentQuestionFlagged: boolean;
  showNavigationControls?: boolean;
  className?: string;
}

export function QuestionNavigation({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  flaggedQuestions,
  onQuestionSelect,
  onPrevious,
  onNext,
  onToggleFlag,
  canGoPrevious,
  canGoNext,
  isCurrentQuestionFlagged,
  showNavigationControls = true,
  className,
}: QuestionNavigationProps) {
  const getQuestionStatus = (questionNumber: number) => {
    const isAnswered = answeredQuestions.has(questionNumber);
    const isFlagged = flaggedQuestions.has(questionNumber);
    const isCurrent = questionNumber === currentQuestion;

    if (isCurrent) {
      return "current";
    }
    if (isAnswered && isFlagged) {
      return "answered-flagged";
    }
    if (isAnswered) {
      return "answered";
    }
    if (isFlagged) {
      return "flagged";
    }
    return "unanswered";
  };

  const getQuestionButtonClassName = (questionNumber: number) => {
    const status = getQuestionStatus(questionNumber);

    switch (status) {
      case "current":
        return "bg-primary text-primary-foreground border-primary";
      case "answered-flagged":
        return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 active:bg-orange-300";
      case "answered":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 active:bg-green-300";
      case "flagged":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 active:bg-yellow-300";
      default:
        return "bg-background text-muted-foreground border-border hover:bg-muted active:bg-muted/70";
    }
  };

  const getQuestionNumbers = () => {
    return Array.from({ length: totalQuestions }, (_, i) => i + 1);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Navigation Controls - Only show if requested */}
      {showNavigationControls && (
        <div
          className={cn(
            "flex items-center justify-between",
            touchSpacing.comfortable
          )}
        >
          <Button
            variant="outline"
            size="default"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className={cn("flex items-center", touchSpacing.comfortable)}>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {currentQuestion} of {totalQuestions}
            </Badge>

            <Button
              variant={isCurrentQuestionFlagged ? "default" : "outline"}
              size="default"
              onClick={onToggleFlag}
              className={cn(
                "flex items-center gap-2",
                isCurrentQuestionFlagged &&
                  "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white"
              )}
            >
              <Flag className="h-4 w-4" />
              {isCurrentQuestionFlagged ? "Flagged" : "Flag"}
            </Button>
          </div>

          <Button
            variant="outline"
            size="default"
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Question Palette */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Question Palette
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Question grid with maximum 6 per row */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            {getQuestionNumbers().map(questionNumber => (
              <Button
                key={questionNumber}
                variant="outline"
                className={cn(
                  "h-8 w-8 p-0 text-xs font-medium rounded-md min-w-8",
                  "active:scale-95 transition-all duration-150",
                  getQuestionButtonClassName(questionNumber)
                )}
                onClick={() => onQuestionSelect(questionNumber)}
              >
                {questionNumber}
              </Button>
            ))}
          </div>

          {/* Legend moved to bottom with better spacing */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-3 border-t">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-primary rounded border"></div>
              <span className="text-xs">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-100 border-green-300 rounded border"></div>
              <span className="text-xs">Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-100 border-yellow-300 rounded border"></div>
              <span className="text-xs">Flagged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-orange-100 border-orange-300 rounded border"></div>
              <span className="text-xs">Answered + Flagged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-background border-border rounded border"></div>
              <span className="text-xs">Not Answered</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
