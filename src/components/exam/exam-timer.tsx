"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui";
import { Button } from "@/components/ui";
import { ExamMode } from "@/types/exam";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  timeRemainingSeconds: number;
  examMode: ExamMode;
  onTimeUp: () => void;
  onTimeUpdate: (seconds: number) => void;
  onPauseChange?: (isPaused: boolean) => void;
  isPaused?: boolean; // Add controlled pause state
  isSubmitting?: boolean;
  className?: string;
}

export function ExamTimer({
  timeRemainingSeconds,
  examMode,
  onTimeUp,
  onTimeUpdate,
  onPauseChange,
  isPaused = false,
  isSubmitting = false,
  className,
}: ExamTimerProps) {
  const [warningShown, setWarningShown] = useState(false);
  const [criticalWarningShown, setCriticalWarningShown] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Timer countdown effect - only run in exam mode
  // Note: Removed lastUpdateTime from dependency array to prevent timer restarts
  // that could interfere with pause state
  useEffect(() => {
    if (
      examMode === "practice" ||
      timeRemainingSeconds <= 0 ||
      isPaused ||
      isSubmitting
    ) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();

      // Calculate new time
      const newTime = Math.max(0, timeRemainingSeconds - 1);

      // Update the timer
      onTimeUpdate(newTime);

      // Auto-submit when time is up
      if (newTime <= 0) {
        onTimeUp();
      }

      setLastUpdateTime(now);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    examMode,
    timeRemainingSeconds,
    isPaused,
    isSubmitting,
    onTimeUpdate,
    onTimeUp,
  ]);

  // Update last update time when timer resumes
  useEffect(() => {
    if (!isPaused) {
      setLastUpdateTime(Date.now());
    }
  }, [isPaused]);

  // Warning effects - only run in exam mode
  useEffect(() => {
    if (examMode === "practice") {
      return;
    }

    const fifteenMinutes = 15 * 60;
    const fiveMinutes = 5 * 60;

    if (timeRemainingSeconds <= fiveMinutes && !criticalWarningShown) {
      setCriticalWarningShown(true);
    } else if (timeRemainingSeconds <= fifteenMinutes && !warningShown) {
      setWarningShown(true);
    }
  }, [examMode, timeRemainingSeconds, warningShown, criticalWarningShown]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Don't render timer in practice mode
  if (examMode === "practice") {
    return null;
  }

  const getTimeStatus = (): "normal" | "warning" | "critical" => {
    const fifteenMinutes = 15 * 60;
    const fiveMinutes = 5 * 60;

    if (timeRemainingSeconds <= fiveMinutes) return "critical";
    if (timeRemainingSeconds <= fifteenMinutes) return "warning";
    return "normal";
  };

  const togglePause = () => {
    const newPausedState = !isPaused;
    onPauseChange?.(newPausedState);
  };

  const timeStatus = getTimeStatus();
  const formattedTime = formatTime(Math.max(0, timeRemainingSeconds));

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Timer Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock
              className={cn("h-5 w-5", {
                "text-muted-foreground": timeStatus === "normal",
                "text-yellow-600": timeStatus === "warning",
                "text-red-600": timeStatus === "critical",
              })}
            />
            <span className="text-sm font-medium text-muted-foreground">
              Time Remaining
            </span>
          </div>

          <Badge
            variant={
              timeStatus === "critical"
                ? "destructive"
                : timeStatus === "warning"
                  ? "secondary"
                  : "outline"
            }
            className={cn("font-mono text-base px-3 py-1", {
              "bg-red-50 text-red-700 border-red-200":
                timeStatus === "critical",
              "bg-yellow-50 text-yellow-700 border-yellow-200":
                timeStatus === "warning",
            })}
          >
            {formattedTime}
          </Badge>

          {/* Pause/Resume Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePause}
            disabled={isSubmitting || timeRemainingSeconds <= 0}
            className="h-8 w-8 p-0"
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Timer Status Indicator */}
        {isPaused && (
          <Badge variant="secondary" className="text-xs">
            Paused
          </Badge>
        )}
      </div>

      {/* Warning Alerts */}
      {timeStatus === "critical" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical:</strong> Less than 5 minutes remaining! The exam
            will auto-submit when time expires.
          </AlertDescription>
        </Alert>
      )}

      {timeStatus === "warning" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Warning:</strong> Less than 15 minutes remaining. Please
            review your answers.
          </AlertDescription>
        </Alert>
      )}

      {/* Time Up Alert */}
      {timeRemainingSeconds <= 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Time Expired:</strong> The exam will be automatically
            submitted.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
