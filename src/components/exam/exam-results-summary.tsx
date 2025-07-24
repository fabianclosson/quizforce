"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  RotateCcw,
  Home,
  BookOpen,
} from "lucide-react";
import { DetailedExamResults } from "@/lib/exam-scoring";
import {
  getPerformanceLevelColor,
  getTimeEfficiencyColor,
} from "@/lib/exam-scoring";

interface ExamResultsSummaryProps {
  results: DetailedExamResults;
  examName: string;
  passingThreshold: number;
  onReviewAnswers: () => void;
  onRetakeExam: () => void;
  onReturnToDashboard: () => void;
  onViewKnowledgeAreas?: () => void;
}

export function ExamResultsSummary({
  results,
  examName,
  passingThreshold,
  onReviewAnswers,
  onRetakeExam,
  onReturnToDashboard,
  onViewKnowledgeAreas,
}: ExamResultsSummaryProps) {
  const {
    score_percentage,
    correct_answers,
    total_questions,
    passed,
    time_spent_minutes,
    overall_performance_level,
    time_efficiency,
  } = results;

  // Calculate time display
  const hours = Math.floor(time_spent_minutes / 60);
  const minutes = time_spent_minutes % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Get performance colors
  const performanceColor = getPerformanceLevelColor(overall_performance_level);
  const timeEfficiencyColor = getTimeEfficiencyColor(time_efficiency);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {passed ? (
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 border-4 border-green-500">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 border-4 border-red-500">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {passed ? "Congratulations!" : "Keep Studying!"}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            You {passed ? "passed" : "did not pass"} the {examName}
          </p>
        </div>

        {/* Pass/Fail Badge */}
        <Badge
          variant={passed ? "default" : "destructive"}
          className="text-lg px-4 py-2 font-semibold"
        >
          {passed ? "PASSED" : "FAILED"}
        </Badge>
      </div>

      {/* Main Score Card */}
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" />
            Your Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Circle */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{
                    background: `conic-gradient(${passed ? "#10b981" : "#ef4444"} ${score_percentage * 3.6}deg, transparent 0deg)`,
                    borderRadius: "50%",
                  }}
                />
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center z-10">
                  <span className="text-3xl font-bold text-gray-900">
                    {score_percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">
                  Correct Answers
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {correct_answers} / {total_questions}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Time Spent</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {timeDisplay}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Required</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {passingThreshold}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>0%</span>
              <span className="font-medium">
                Passing Threshold: {passingThreshold}%
              </span>
              <span>100%</span>
            </div>
            <Progress
              value={score_percentage}
              className="h-3"
              style={
                {
                  "--progress-background": passed ? "#10b981" : "#ef4444",
                } as React.CSSProperties
              }
            />
            {/* Passing threshold indicator */}
            <div className="relative">
              <div
                className="absolute w-0.5 h-6 bg-gray-400 -mt-6"
                style={{ left: `${passingThreshold}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={`${performanceColor} text-sm px-3 py-1 font-medium capitalize`}
            >
              {overall_performance_level.replace("_", " ")}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              {overall_performance_level === "excellent" &&
                "Outstanding performance! You've mastered this material."}
              {overall_performance_level === "good" &&
                "Great job! You have a solid understanding of the material."}
              {overall_performance_level === "needs_improvement" &&
                "You're on the right track. Focus on areas where you struggled."}
              {overall_performance_level === "poor" &&
                "More study time is needed. Review the material and try again."}
            </p>
          </CardContent>
        </Card>

        {/* Time Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={`${timeEfficiencyColor} bg-opacity-10 border text-sm px-3 py-1 font-medium capitalize`}
            >
              {time_efficiency}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              {time_efficiency === "excellent" &&
                "Perfect pacing! You used your time effectively."}
              {time_efficiency === "good" &&
                "Good time management. You completed the exam comfortably."}
              {time_efficiency === "adequate" &&
                "Adequate pacing. Consider slowing down to review answers."}
              {time_efficiency === "rushed" &&
                "You moved very quickly. Take more time to consider each question."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Separator />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onReviewAnswers}
            variant="default"
            size="lg"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Review Answers
          </Button>

          {onViewKnowledgeAreas && (
            <Button
              onClick={onViewKnowledgeAreas}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Knowledge Areas
            </Button>
          )}

          <Button
            onClick={onRetakeExam}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Exam
          </Button>

          <Button
            onClick={onReturnToDashboard}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </Button>
        </div>

        {/* Motivational Message */}
        <div className="text-center text-sm text-gray-600 mt-6">
          {passed ? (
            <p>
              🎉 Well done! You&apos;re ready for the real certification exam.
              <br />
              Keep practicing to maintain your knowledge.
            </p>
          ) : (
            <p>
              💪 Don&apos;t give up! Every expert was once a beginner.
              <br />
                              Review your answers and try again when you&apos;re ready.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
