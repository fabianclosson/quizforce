"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Separator } from "@/components/ui";
import { RadioGroup, RadioGroupItem, Label } from "@/components/ui";
import { PreExamData } from "@/types/exam";
import { ExamMode } from "@/types/exam";
import { useStartExam, useRestartExam } from "@/hooks/use-exam";
import {
  Clock,
  FileText,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Timer,
  Lightbulb,
  PlayCircle,
  TvMinimalPlay,
  Info,
  Bookmark,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface PreExamPageProps {
  preExamData: PreExamData;
  onStartExam: (attemptId: string, mode: ExamMode) => void;
  isRestart?: boolean;
}

export function PreExamPage({
  preExamData,
  onStartExam,
  isRestart = false,
}: PreExamPageProps) {
  const [selectedMode, setSelectedMode] = useState<ExamMode>("exam");
  const { practice_exam, user_status, knowledge_areas } = preExamData;

  const startExamMutation = useStartExam();
  const restartExamMutation = useRestartExam();

  const handleStartExam = async () => {
    try {
      const mutation = isRestart ? restartExamMutation : startExamMutation;
      const result = await mutation.mutateAsync({
        practice_exam_id: practice_exam.id,
        mode: selectedMode,
      });

      // Call the parent callback with the real attempt ID
      onStartExam(result.exam_attempt_id, selectedMode);
    } catch (error) {
      console.error(
        `Failed to ${isRestart ? "restart" : "start"} exam:`,
        error
      );
      // Handle error - could show a toast or error message
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getCategoryColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500",
    };
    return colorMap[color] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-8 rounded-full bg-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">{practice_exam.name}</h1>
              <p className="text-muted-foreground">
                {practice_exam.certification.name} •{" "}
                {practice_exam.certification.category.name}
              </p>
            </div>
          </div>

          {practice_exam.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {practice_exam.description}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Exam Details */}
          <div className="space-y-6">
            {/* Exam Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Choose Your Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedMode}
                  onValueChange={value => setSelectedMode(value as ExamMode)}
                  className="grid gap-4"
                >
                  <div
                    className={`flex items-start space-x-3 p-4 border rounded-lg transition-all duration-200 ${
                      selectedMode === "exam"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="exam" id="exam" />
                    <div className="flex-1">
                      <Label
                        htmlFor="exam"
                        className="text-base font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <Timer className="h-4 w-4" />
                        Exam Mode
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Traditional exam simulation with{" "}
                        {formatTime(practice_exam.time_limit_minutes)} time
                        limit. Results and explanations shown at the end.
                        Perfect for exam preparation.
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Timed
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Scored
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Final Results
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex items-start space-x-3 p-4 border rounded-lg transition-all duration-200 ${
                      selectedMode === "practice"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="practice" id="practice" />
                    <div className="flex-1">
                      <Label
                        htmlFor="practice"
                        className="text-base font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <Lightbulb className="h-4 w-4" />
                        Practice Mode
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Self-paced learning with immediate feedback and detailed
                        explanations after each question. Ideal for studying and
                        understanding concepts.
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Self-Paced
                        </span>
                        <span className="flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          Instant Feedback
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Learn & Review
                        </span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  {selectedMode === "exam"
                    ? "Exam Instructions"
                    : "Practice Mode Instructions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {selectedMode === "exam" ? (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Time Management</p>
                          <p className="text-sm text-muted-foreground">
                            You have{" "}
                            {formatTime(practice_exam.time_limit_minutes)} to
                            complete all {practice_exam.question_count}{" "}
                            questions. The exam will auto-submit when time
                            expires.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Question Navigation</p>
                          <p className="text-sm text-muted-foreground">
                            You can navigate between questions using the
                            Next/Previous buttons or by clicking question
                            numbers in the sidebar.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Auto-Save</p>
                          <p className="text-sm text-muted-foreground">
                            Your answers are automatically saved as you
                            progress. You can safely refresh the page if needed.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Question Flagging</p>
                          <p className="text-sm text-muted-foreground">
                            You can flag questions for review and return to them
                            before submitting your exam.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Exam Results</p>
                          <p className="text-sm text-muted-foreground">
                            Your score and detailed explanations will be shown
                            only after you complete and submit the entire exam.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Self-Paced Learning</p>
                          <p className="text-sm text-muted-foreground">
                            Take your time to learn and understand each
                            question. There's no time limit in practice mode.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Immediate Feedback</p>
                          <p className="text-sm text-muted-foreground">
                            After answering each question, you'll see instant
                            feedback showing whether your answer was correct
                            along with detailed explanations.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Question Navigation</p>
                          <p className="text-sm text-muted-foreground">
                            Navigate through questions at your own pace. Review
                            explanations and continue when you're ready.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Auto-Save</p>
                          <p className="text-sm text-muted-foreground">
                            Your progress is automatically saved. You can stop
                            and resume your practice session anytime.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Learning Focus</p>
                          <p className="text-sm text-muted-foreground">
                            Focus on understanding concepts rather than speed.
                            Practice mode is designed for learning and
                            improvement.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Start Exam Panel */}
          <div className="space-y-6">
            {/* User Progress with Begin Exam Button at top */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                {/* Begin Exam Button moved to top */}
                <Button
                  onClick={handleStartExam}
                  disabled={
                    !user_status.is_enrolled ||
                    !user_status.can_retake ||
                    startExamMutation.isPending ||
                    restartExamMutation.isPending
                  }
                  className="w-full h-12 text-lg bg-black text-white hover:bg-blue-600 hover:text-white"
                  size="lg"
                >
                  {startExamMutation.isPending ||
                  restartExamMutation.isPending ? (
                    <>
                      <Spinner size="small" className="mr-2 text-white" />
                      {isRestart ? "Restarting" : "Starting"}{" "}
                      {selectedMode === "exam" ? "Exam" : "Practice"}
                      ...
                    </>
                  ) : (
                    <>
                      <TvMinimalPlay className="h-5 w-5 mr-2" />
                      Begin {selectedMode === "exam" ? "Exam" : "Practice"}
                    </>
                  )}
                </Button>

                {!user_status.can_retake && user_status.is_enrolled && (
                  <p className="text-sm text-muted-foreground text-center">
                    You have reached the maximum number of attempts for this
                    exam
                  </p>
                )}

                {user_status.best_score && (
                  <div>
                    <p className="text-sm text-muted-foreground">Best Score</p>
                    <p className="text-2xl font-bold text-green-600">
                      {user_status.best_score}%
                    </p>
                  </div>
                )}

                {/* Exam Information */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Questions
                        </p>
                        <p className="font-medium">
                          {practice_exam.question_count}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Time Limit
                        </p>
                        <p className="font-medium">
                          {selectedMode === "exam"
                            ? formatTime(practice_exam.time_limit_minutes)
                            : "Self-paced"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Passing Score
                        </p>
                        <p className="font-medium">
                          {selectedMode === "exam"
                            ? `${practice_exam.passing_threshold_percentage}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Previous Attempts
                        </p>
                        <p className="font-medium">
                          {user_status.previous_attempts}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!user_status.is_enrolled && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Enrollment required to take this exam
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Knowledge Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Knowledge Areas Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {knowledge_areas.map(area => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{area.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {area.question_count} questions
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {area.weight_percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
