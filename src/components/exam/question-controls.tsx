"use client";

import React from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { touchSpacing } from "@/lib/touch-utils";

interface QuestionControlsProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isCurrentQuestionFlagged: boolean;
  className?: string;
}

export function QuestionControls({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onToggleFlag,
  canGoPrevious,
  canGoNext,
  isCurrentQuestionFlagged,
  className,
}: QuestionControlsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-4",
        touchSpacing.comfortable,
        className
      )}
    >
      <div className="flex items-center">
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
      </div>

      <div className="flex items-center gap-2">
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
    </div>
  );
}
