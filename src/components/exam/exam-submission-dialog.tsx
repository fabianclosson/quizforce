import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Flag,
  Send,
  ArrowLeft,
  FileText,
} from "lucide-react";

interface ExamSubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  totalQuestions: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  timeRemaining: number;
  isSubmitting?: boolean;
}

export function ExamSubmissionDialog({
  isOpen,
  onClose,
  onConfirmSubmit,
  totalQuestions,
  answeredQuestions,
  flaggedQuestions,
  timeRemaining,
  isSubmitting = false,
}: ExamSubmissionDialogProps) {
  const unansweredCount = totalQuestions - answeredQuestions.size;
  const answeredCount = answeredQuestions.size;
  const flaggedCount = flaggedQuestions.size;
  const completionPercentage = Math.round(
    (answeredCount / totalQuestions) * 100
  );

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getUnansweredQuestions = (): number[] => {
    const unanswered: number[] = [];
    for (let i = 1; i <= totalQuestions; i++) {
      if (!answeredQuestions.has(i)) {
        unanswered.push(i);
      }
    }
    return unanswered;
  };

  const unansweredQuestionNumbers = getUnansweredQuestions();
  const hasUnanswered = unansweredCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Submit Practice Exam
          </DialogTitle>
          <DialogDescription>
            Review your progress before submitting. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Exam Progress Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Progress
                </h3>
                <Badge
                  variant={
                    completionPercentage === 100 ? "default" : "secondary"
                  }
                >
                  {completionPercentage}%
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Answered Questions */}
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {answeredCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Answered</div>
                </div>

                {/* Unanswered Questions */}
                <div className="text-center">
                  <div
                    className={`text-xl font-bold flex items-center justify-center gap-1 ${
                      hasUnanswered
                        ? "text-orange-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    <AlertCircle className="h-4 w-4" />
                    {unansweredCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Unanswered
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Remaining */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Time Remaining</span>
                </div>
                <div
                  className={`font-mono text-lg font-bold ${
                    timeRemaining < 300
                      ? "text-red-600"
                      : timeRemaining < 900
                        ? "text-yellow-600"
                        : "text-foreground"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings - Compact versions */}
          {hasUnanswered && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">
                      {unansweredCount} Unanswered Questions
                    </h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      These will be marked as incorrect if you submit now.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {flaggedCount > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Flag className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">
                      {flaggedCount} Flagged Questions
                    </h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Review your flagged questions before submitting.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Exam
          </Button>
          <Button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
