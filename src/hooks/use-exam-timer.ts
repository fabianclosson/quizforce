import { useState, useEffect, useRef } from "react";
import { ExamMode } from "@/types/exam";

interface UseExamTimerProps {
  initialTimeSeconds: number;
  examMode: ExamMode;
  onTimeUp: () => void;
  examAttemptId: string;
}

export function useExamTimer({
  initialTimeSeconds,
  examMode,
  onTimeUp,
  examAttemptId,
}: UseExamTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle timer countdown
  useEffect(() => {
    if (examMode === "practice" || isPaused || isTimeUp) {
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastUpdateRef.current) / 1000);
      lastUpdateRef.current = now;

      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - elapsed);

        // Save time to localStorage for persistence
        localStorage.setItem(
          `exam_timer_${examAttemptId}`,
          JSON.stringify({
            timeRemaining: newTime,
            lastUpdate: now,
          })
        );

        if (newTime <= 0 && !isTimeUp) {
          setIsTimeUp(true);
          onTimeUp();
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [examMode, isPaused, isTimeUp, onTimeUp, examAttemptId]);

  // Load saved timer state on mount
  useEffect(() => {
    if (examMode === "practice") return;

    const savedTimer = localStorage.getItem(`exam_timer_${examAttemptId}`);
    if (savedTimer) {
      try {
        const { timeRemaining: savedTime, lastUpdate } = JSON.parse(savedTimer);
        const now = Date.now();
        const elapsed = Math.floor((now - lastUpdate) / 1000);
        const adjustedTime = Math.max(0, savedTime - elapsed);

        setTimeRemaining(adjustedTime);
        lastUpdateRef.current = now;

        if (adjustedTime <= 0) {
          setIsTimeUp(true);
          onTimeUp();
        }
      } catch (error) {
        console.warn("Failed to load saved timer state:", error);
      }
    }
  }, [examAttemptId, examMode, onTimeUp]);

  // Pause/resume functionality
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Get time warnings
  const getTimeWarnings = () => {
    const fifteenMinutes = 15 * 60;
    const fiveMinutes = 5 * 60;
    const oneMinute = 60;

    if (timeRemaining <= oneMinute) {
      return { level: "critical", message: "Less than 1 minute remaining!" };
    } else if (timeRemaining <= fiveMinutes) {
      return { level: "critical", message: "Less than 5 minutes remaining!" };
    } else if (timeRemaining <= fifteenMinutes) {
      return { level: "warning", message: "Less than 15 minutes remaining." };
    }
    return null;
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean up timer data when exam is submitted
  const clearTimerData = () => {
    localStorage.removeItem(`exam_timer_${examAttemptId}`);
  };

  return {
    timeRemaining,
    isPaused,
    isTimeUp,
    togglePause,
    getTimeWarnings,
    formatTime,
    clearTimerData,
    setTimeRemaining,
  };
}
