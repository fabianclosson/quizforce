/**
 * Exams In Progress Component
 *
 * Displays user's active exam sessions with progress tracking,
 * resume functionality, and pause/continue options.
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useExamsInProgress } from "@/hooks/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import {
  Play,
  Pause,
  Clock,
  Target,
  AlertCircle,
  BookOpen,
  Timer,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExamsInProgressProps {
  className?: string;
  showHeader?: boolean;
  maxItems?: number;
}

export function ExamsInProgress({
  className,
  showHeader = true,
  maxItems,
}: ExamsInProgressProps) {
  const {
    data: examsInProgress,
    isLoading,
    error,
    refetch,
  } = useExamsInProgress();

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load exams in progress.
          <Button
            variant="link"
            className="p-0 h-auto ml-2"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const displayExams = maxItems
    ? examsInProgress?.slice(0, maxItems)
    : examsInProgress;

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Exams in Progress
            {examsInProgress?.length ? (
              <Badge variant="secondary" className="ml-auto">
                {examsInProgress.length}
              </Badge>
            ) : null}
          </CardTitle>
          <CardDescription>Continue where you left off</CardDescription>
        </CardHeader>
      )}

      <CardContent className={cn(!showHeader && "pt-6")}>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : displayExams?.length ? (
          <div className="space-y-4">
            {displayExams.map(exam => {
              const progressPercentage = Math.round(exam.progress_percentage);
              const isRecentlyActive =
                new Date().getTime() - new Date(exam.last_activity).getTime() <
                30 * 60 * 1000; // 30 minutes
              const timeRemaining = exam.time_remaining;

              return (
                <div
                  key={exam.id}
                  className={cn(
                    "p-4 border rounded-lg transition-all hover:shadow-md",
                    isRecentlyActive &&
                      "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base mb-1 truncate">
                        {exam.certification_name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            exam.difficulty_level === "beginner" &&
                              "border-green-200 text-green-700",
                            exam.difficulty_level === "intermediate" &&
                              "border-yellow-200 text-yellow-700",
                            exam.difficulty_level === "advanced" &&
                              "border-red-200 text-red-700"
                          )}
                        >
                          {exam.difficulty_level}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {exam.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {exam.status === "paused" && (
                        <Badge variant="secondary" className="text-xs">
                          <Pause className="h-3 w-3 mr-1" />
                          Paused
                        </Badge>
                      )}
                      <Button size="sm" asChild>
                        <Link
                          href={`/exam/${exam.certification_slug}?continue=${exam.id}`}
                        >
                          <Play className="h-3 w-3 mr-2" />
                          Continue
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Question {exam.current_question} of{" "}
                        {exam.total_questions}
                      </span>
                      <span className="font-medium">
                        {progressPercentage}% complete
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Status Information */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last activity:{" "}
                        {formatDistanceToNow(new Date(exam.last_activity), {
                          addSuffix: true,
                        })}
                      </span>

                      {timeRemaining && (
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {timeRemaining} min remaining
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Started{" "}
                      {formatDistanceToNow(new Date(exam.started_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Show More Link */}
            {maxItems &&
              examsInProgress &&
              examsInProgress.length > maxItems && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/exams">
                      View All Exams ({examsInProgress.length})
                    </Link>
                  </Button>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-muted">
                <Play className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">No exams in progress</p>
                <p className="text-sm">
                  Start practicing to see your active exams here
                </p>
              </div>
              <Button size="sm" asChild className="mt-2">
                <Link href="/catalog">Browse Certifications</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
