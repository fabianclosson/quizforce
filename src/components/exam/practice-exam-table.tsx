"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Progress } from "@/components/ui";
import { PracticeExamWithStatus } from "@/types/practice-exams";
import { formatDistanceToNow } from "date-fns";
import { Clock, Trophy, Play, RotateCcw, Eye, StepForward } from "lucide-react";

interface PracticeExamTableProps {
  exams: PracticeExamWithStatus[];
  onStartExam?: (examId: string) => void;
  onContinueExam?: (examId: string) => void;
  onRestartExam?: (examId: string) => void;
  onViewResults?: (examId: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const getStatusBadge = (
  status: "not_started" | "in_progress" | "completed",
  currentAttemptMode?: "exam" | "practice",
  lastScore?: number,
  passingThreshold?: number
) => {
  const variants = {
    not_started: {
      variant: "secondary" as const,
      label: "Not Started",
      className: "whitespace-nowrap",
    },
    in_progress: {
      variant: "default" as const,
      label: `In Progress${currentAttemptMode ? ` (${currentAttemptMode === "exam" ? "Exam" : "Practice"})` : ""}`,
      className: "whitespace-nowrap",
    },
    completed: {
      variant: "outline" as const,
      label: "Finished",
      className: "whitespace-nowrap",
    },
  };

  const config = variants[status];

  // For completed exams, show score info if we have a score and it was taken in exam mode
  if (
    status === "completed" &&
    lastScore !== undefined &&
    passingThreshold !== undefined
  ) {
    const isPassing = lastScore >= passingThreshold;

    return (
      <div className="flex flex-col gap-1">
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
        <div className="text-xs text-muted-foreground">
          Last:{" "}
          <span
            className={
              isPassing
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {Math.round(lastScore)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const getActionButton = (
  exam: PracticeExamWithStatus,
  onStartExam?: (examId: string) => void,
  onContinueExam?: (examId: string) => void,
  onRestartExam?: (examId: string) => void,
  onViewResults?: (examId: string) => void
) => {
  if (!exam.is_enrolled && exam.certification.price_cents > 0) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Enrollment Required
      </Badge>
    );
  }

  switch (exam.status) {
    case "not_started":
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onStartExam?.(exam.id)}
          className="whitespace-nowrap inline-flex items-center justify-center min-w-fit hover:bg-blue-600 hover:border-blue-600 hover:text-white"
        >
          <Play className="w-4 h-4 mr-1" />
          Start Exam
        </Button>
      );
    case "in_progress":
      return (
        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            variant="default"
            onClick={() => onContinueExam?.(exam.id)}
            className="whitespace-nowrap inline-flex items-center justify-center min-w-fit hover:bg-blue-600 hover:border-blue-600 hover:text-white"
          >
            <StepForward className="w-4 h-4 mr-1" />
            Continue
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRestartExam?.(exam.id)}
            className="whitespace-nowrap inline-flex items-center justify-center min-w-fit hover:bg-blue-600 hover:border-blue-600 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>
        </div>
      );
    case "completed":
      return (
        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewResults?.(exam.id)}
            className="whitespace-nowrap inline-flex items-center justify-center min-w-fit"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Results
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onStartExam?.(exam.id)}
            className="whitespace-nowrap inline-flex items-center justify-center min-w-fit hover:bg-blue-600 hover:border-blue-600 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Retake
          </Button>
        </div>
      );
    default:
      return null;
  }
};

const getScoreDisplay = (exam: PracticeExamWithStatus) => {
  if (exam.best_score === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  const score = Math.round(exam.best_score);
  const isPassing = score >= exam.passing_threshold_percentage;

  return (
    <div className="flex items-center gap-2">
      <span
        className={
          isPassing ? "text-green-600 font-medium" : "text-red-600 font-medium"
        }
      >
        {score}%
      </span>
      {isPassing && <Trophy className="w-4 h-4 text-yellow-500" />}
    </div>
  );
};

const getLastAttemptInfo = (exam: PracticeExamWithStatus) => {
  if (!exam.latest_attempt) {
    return <span className="text-muted-foreground">Never attempted</span>;
  }

  const date = new Date(exam.latest_attempt.started_at);
  return (
    <span className="text-sm text-muted-foreground">
      {formatDistanceToNow(date, { addSuffix: true })}
    </span>
  );
};

export function PracticeExamTable({
  exams,
  onStartExam,
  onContinueExam,
  onRestartExam,
  onViewResults,
  loading = false,
  error,
  onRetry,
}: PracticeExamTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border border-dashed border-gray-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Best Score</TableHead>
              <TableHead>Last Attempt</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded animate-pulse w-16" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded animate-pulse w-20" />
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-muted rounded animate-pulse w-20" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded animate-pulse w-12" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded animate-pulse w-24" />
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-muted rounded animate-pulse w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error state
  if (error !== null && error !== undefined) {
    return (
      <div className="rounded-md border p-8 text-center">
        <div className="mx-auto max-w-sm">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Error Loading Exams
          </h3>
          <p className="text-muted-foreground mb-4">
            {error || "Failed to load practice exams. Please try again."}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <div className="mx-auto max-w-sm">
          <h3 className="text-lg font-semibold">No Practice Exams Found</h3>
          <p className="text-muted-foreground mt-2">
            There are no practice exams available for the selected criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-dashed border-gray-300">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Exam Name</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Time Limit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Best Score</TableHead>
            <TableHead>Last Attempt</TableHead>
            <TableHead className="min-w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map(exam => (
            <TableRow key={exam.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{exam.name}</div>
                  {exam.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {exam.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Pass: {exam.passing_threshold_percentage}%
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-medium">{exam.question_count}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{exam.time_limit_minutes}m</span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(
                  exam.status,
                  exam.current_attempt_mode,
                  exam.best_score,
                  exam.passing_threshold_percentage
                )}
              </TableCell>
              <TableCell>{getScoreDisplay(exam)}</TableCell>
              <TableCell>{getLastAttemptInfo(exam)}</TableCell>
              <TableCell className="w-fit">
                <div className="flex items-center justify-start gap-3 min-w-0">
                  {/* Show Last Score badge if available */}
                  {exam.latest_attempt?.score_percentage !== undefined &&
                    exam.latest_attempt?.score_percentage !== null && (
                      <Badge
                        variant="outline"
                        className="whitespace-nowrap text-xs"
                      >
                        Last Score:{" "}
                        {Math.round(exam.latest_attempt.score_percentage)}%
                      </Badge>
                    )}
                  {getActionButton(
                    exam,
                    onStartExam,
                    onContinueExam,
                    onRestartExam,
                    onViewResults
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
