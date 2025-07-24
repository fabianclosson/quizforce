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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  BookOpen,
  TrendingUp,
  BarChart3,
  Home,
  RotateCcw,
} from "lucide-react";

interface KnowledgeAreaResult {
  id: string;
  name: string;
  correct: number;
  total: number;
  percentage: number;
  weight_percentage: number;
}

interface ExamResultsData {
  attempt_id: string;
  exam_name: string;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  passing_threshold: number;
  time_spent_minutes: number;
  time_limit_minutes: number;
  knowledge_areas: KnowledgeAreaResult[];
  overall_performance: "excellent" | "good" | "needs_improvement" | "poor";
}

interface ExamResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetakeExam: () => void;
  onGoToDashboard: () => void;
  results: ExamResultsData;
}

export function ExamResultsDialog({
  isOpen,
  onClose,
  onRetakeExam,
  onGoToDashboard,
  results,
}: ExamResultsDialogProps) {
  const {
    exam_name,
    score_percentage,
    correct_answers,
    total_questions,
    passed,
    passing_threshold,
    time_spent_minutes,
    time_limit_minutes,
    knowledge_areas,
    overall_performance,
  } = results;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getPerformanceBadge = () => {
    switch (overall_performance) {
      case "excellent":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Excellent
          </Badge>
        );
      case "good":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Good
          </Badge>
        );
      case "needs_improvement":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Needs Improvement
          </Badge>
        );
      case "poor":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Needs Work
          </Badge>
        );
      default:
        return <Badge variant="outline">Complete</Badge>;
    }
  };

  const timeEfficiency = Math.round(
    (time_spent_minutes / time_limit_minutes) * 100
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            {passed ? (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <span>Congratulations! You Passed!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-full">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                <span>Exam Complete</span>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {exam_name} - Here's your detailed performance breakdown
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Overall Score Card */}
          <Card
            className={`border-2 ${passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold ${passed ? "text-green-600" : "text-red-600"}`}
                    >
                      {score_percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Your Score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-muted-foreground">
                      {passing_threshold}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Required
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getPerformanceBadge()}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {passed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {passed ? "PASSED" : "NOT PASSED"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {correct_answers}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Correct Answers
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">
                    {total_questions - correct_answers}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Incorrect Answers
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {total_questions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Questions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatTime(time_spent_minutes)}
                  </div>
                  <div className="text-sm text-muted-foreground">Time Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {formatTime(time_limit_minutes)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time Allowed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {timeEfficiency}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time Efficiency
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={timeEfficiency} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  {timeEfficiency < 50
                    ? "Very Fast"
                    : timeEfficiency < 80
                      ? "Good Pace"
                      : "Used Most Time"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Areas Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Knowledge Areas Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledge_areas.map(area => (
                  <div key={area.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{area.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {area.weight_percentage}% weight
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${getPerformanceColor(area.percentage)}`}
                        >
                          {area.percentage}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({area.correct}/{area.total})
                        </span>
                      </div>
                    </div>
                    <Progress value={area.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {knowledge_areas.map(area => {
                  if (area.percentage >= 80) {
                    return (
                      <div
                        key={`strength-${area.id}`}
                        className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          <strong>Strength:</strong> Excellent performance in{" "}
                          {area.name} ({area.percentage}%)
                        </span>
                      </div>
                    );
                  }
                  if (area.percentage < 60) {
                    return (
                      <div
                        key={`weakness-${area.id}`}
                        className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded"
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">
                          <strong>Focus Area:</strong> Consider reviewing{" "}
                          {area.name} ({area.percentage}%)
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}

                {timeEfficiency < 50 && (
                  <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-2 rounded">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      <strong>Time Management:</strong> You completed the exam
                      quickly. Consider reviewing answers more thoroughly.
                    </span>
                  </div>
                )}

                {timeEfficiency > 95 && (
                  <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      <strong>Time Management:</strong> You used most of your
                      time. Practice time management for better performance.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onGoToDashboard}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          <Button onClick={onRetakeExam} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Exam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
