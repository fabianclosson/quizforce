"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { PracticeExamTable } from "./practice-exam-table";
import { GroupedPracticeExams } from "@/types/practice-exams";
import { BookOpen, Clock, DollarSign, Users } from "lucide-react";

interface CertificationGroupProps {
  group: GroupedPracticeExams;
  onStartExam?: (examId: string) => void;
  onContinueExam?: (examId: string) => void;
  onRestartExam?: (examId: string) => void;
  onViewResults?: (examId: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const formatPrice = (priceCents: number) => {
  if (priceCents === 0) return "Free";
  return `$${(priceCents / 100).toFixed(2)}`;
};

const getCategoryBadgeColor = (color: string) => {
  // Map category colors to Tailwind classes
  const colorMap: Record<string, string> = {
    "#3B82F6": "bg-blue-100 text-blue-800 border-blue-200",
    "#10B981": "bg-green-100 text-green-800 border-green-200",
    "#F59E0B": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "#EF4444": "bg-red-100 text-red-800 border-red-200",
    "#8B5CF6": "bg-purple-100 text-purple-800 border-purple-200",
    "#06B6D4": "bg-cyan-100 text-cyan-800 border-cyan-200",
  };

  return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
};

export function CertificationGroup({
  group,
  onStartExam,
  onContinueExam,
  onRestartExam,
  onViewResults,
  loading = false,
  error,
  onRetry,
}: CertificationGroupProps) {
  const { certification, exams, is_enrolled } = group;

  // Calculate statistics
  const completedExams = exams.filter(
    exam => exam.status === "completed"
  ).length;
  const inProgressExams = exams.filter(
    exam => exam.status === "in_progress"
  ).length;
  const totalExams = exams.length;
  const averageScore = exams
    .filter(exam => exam.best_score !== undefined)
    .reduce((sum, exam, _, arr) => sum + exam.best_score! / arr.length, 0);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{certification.name}</CardTitle>
              <Badge
                variant="outline"
                className={getCategoryBadgeColor(certification.category.color)}
              >
                {certification.category.name}
              </Badge>
              {is_enrolled ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  Enrolled
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {formatPrice(certification.price_cents)}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>
                  {totalExams} exam{totalExams !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{certification.total_questions} total questions</span>
              </div>

              {completedExams > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {completedExams}/{totalExams} completed
                  </span>
                </div>
              )}

              {averageScore > 0 && (
                <div className="flex items-center gap-1">
                  <span>Avg: {Math.round(averageScore)}%</span>
                </div>
              )}
            </div>
          </div>

          {!is_enrolled && certification.price_cents > 0 && (
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">
                {formatPrice(certification.price_cents)}
              </div>
              <div className="text-xs text-muted-foreground">
                Enrollment required
              </div>
            </div>
          )}
        </div>

        {/* Progress bar for enrolled certifications */}
        {is_enrolled && totalExams > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>
                {completedExams}/{totalExams} exams completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedExams / totalExams) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <PracticeExamTable
          exams={exams}
          onStartExam={onStartExam}
          onContinueExam={onContinueExam}
          onRestartExam={onRestartExam}
          onViewResults={onViewResults}
          loading={loading}
          error={error}
          onRetry={onRetry}
        />
      </CardContent>
    </Card>
  );
}
