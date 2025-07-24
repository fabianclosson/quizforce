"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { KnowledgeAreaBreakdown } from "@/components/exam/knowledge-area-breakdown";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Target,
  TrendingUp,
  Trophy,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { DetailedExamResults } from "@/lib/exam-scoring";

// Mock detailed results for development
const mockDetailedResults: DetailedExamResults = {
  attempt_id: "attempt_1",
  score_percentage: 78,
  correct_answers: 47,
  total_questions: 60,
  passed: true,
  time_spent_minutes: 82,
  question_results: [],
  knowledge_area_scores: [
    {
      id: "ka_1",
      name: "User Management",
      weight_percentage: 20,
      correct_answers: 9,
      total_questions: 12,
      score_percentage: 75,
      performance_level: "good",
    },
    {
      id: "ka_2",
      name: "Data Security",
      weight_percentage: 15,
      correct_answers: 7,
      total_questions: 9,
      score_percentage: 78,
      performance_level: "good",
    },
    {
      id: "ka_3",
      name: "Process Automation",
      weight_percentage: 25,
      correct_answers: 12,
      total_questions: 15,
      score_percentage: 80,
      performance_level: "good",
    },
    {
      id: "ka_4",
      name: "Reports and Dashboards",
      weight_percentage: 20,
      correct_answers: 10,
      total_questions: 12,
      score_percentage: 83,
      performance_level: "excellent",
    },
    {
      id: "ka_5",
      name: "Data Management",
      weight_percentage: 20,
      correct_answers: 9,
      total_questions: 12,
      score_percentage: 75,
      performance_level: "good",
    },
  ],
  overall_performance_level: "good",
  time_efficiency: "good",
  difficulty_breakdown: {
    easy: { correct: 18, total: 20, percentage: 90 },
    medium: { correct: 20, total: 25, percentage: 80 },
    hard: { correct: 9, total: 15, percentage: 60 },
  },
};

export default function KnowledgeAreasAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const examId = params.examId as string;
  const attemptId = searchParams.get("attemptId");

  // In a real application, you would fetch the results here
  // const { data: results, isLoading, error } = useExamResults(attemptId);

  const examName = "Salesforce Administrator Practice Exam 1";
  const isLoading = false;
  const error = null;

  const handleBackToResults = () => {
    router.push(`/exam/${examId}/results?attemptId=${attemptId}`);
  };

  // Calculate summary statistics
  const strongAreas = mockDetailedResults.knowledge_area_scores.filter(
    area =>
      area.performance_level === "excellent" ||
      area.performance_level === "good"
  );
  const weakAreas = mockDetailedResults.knowledge_area_scores.filter(
    area =>
      area.performance_level === "poor" ||
      area.performance_level === "needs_improvement"
  );
  const topPerformingArea = mockDetailedResults.knowledge_area_scores.reduce(
    (max, area) => (area.score_percentage > max.score_percentage ? area : max)
  );
  const lowestPerformingArea = mockDetailedResults.knowledge_area_scores.reduce(
    (min, area) => (area.score_percentage < min.score_percentage ? area : min)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading knowledge area analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !attemptId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">
                Analysis Not Available
              </h2>
              <p className="text-gray-600">
                Unable to load the knowledge area analysis for this exam
                attempt.
              </p>
              <Button onClick={handleBackToResults} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handleBackToResults}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Knowledge Area Analysis
            </h1>
            <p className="text-gray-600 mt-2">{examName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {mockDetailedResults.score_percentage}%
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {strongAreas.length}
                  </div>
                  <div className="text-sm text-gray-600">Strong Areas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {weakAreas.length}
                  </div>
                  <div className="text-sm text-gray-600">Need Improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {topPerformingArea.score_percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Best Area</div>
                  <div className="text-xs text-gray-500">
                    {topPerformingArea.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-600" />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {lowestPerformingArea.score_percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Focus Area</div>
                  <div className="text-xs text-gray-500">
                    {lowestPerformingArea.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance by Difficulty Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">
                    Easy Questions
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {mockDetailedResults.difficulty_breakdown.easy.percentage}%
                  </Badge>
                </div>
                <Progress
                  value={
                    mockDetailedResults.difficulty_breakdown.easy.percentage
                  }
                  className="h-2"
                />
                <div className="text-sm text-gray-600">
                  {mockDetailedResults.difficulty_breakdown.easy.correct} /{" "}
                  {mockDetailedResults.difficulty_breakdown.easy.total} correct
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">
                    Medium Questions
                  </span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {mockDetailedResults.difficulty_breakdown.medium.percentage}
                    %
                  </Badge>
                </div>
                <Progress
                  value={
                    mockDetailedResults.difficulty_breakdown.medium.percentage
                  }
                  className="h-2"
                />
                <div className="text-sm text-gray-600">
                  {mockDetailedResults.difficulty_breakdown.medium.correct} /{" "}
                  {mockDetailedResults.difficulty_breakdown.medium.total}{" "}
                  correct
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">
                    Hard Questions
                  </span>
                  <Badge className="bg-red-100 text-red-800">
                    {mockDetailedResults.difficulty_breakdown.hard.percentage}%
                  </Badge>
                </div>
                <Progress
                  value={
                    mockDetailedResults.difficulty_breakdown.hard.percentage
                  }
                  className="h-2"
                />
                <div className="text-sm text-gray-600">
                  {mockDetailedResults.difficulty_breakdown.hard.correct} /{" "}
                  {mockDetailedResults.difficulty_breakdown.hard.total} correct
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Knowledge Area Breakdown */}
        <KnowledgeAreaBreakdown
          knowledgeAreaScores={mockDetailedResults.knowledge_area_scores}
        />

        {/* Study Plan Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Personalized Study Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority Areas */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Priority Study Areas
                </h3>
                <div className="space-y-3">
                  {weakAreas.length > 0 ? (
                    weakAreas
                      .sort((a, b) => b.weight_percentage - a.weight_percentage)
                      .map(area => (
                        <div
                          key={area.id}
                          className="p-3 border rounded-lg bg-red-50 border-red-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">
                                {area.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {area.score_percentage}% •{" "}
                                {area.weight_percentage}% of exam
                              </div>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              Priority
                            </Badge>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">
                          No weak areas identified! Consider reviewing all
                          topics lightly.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance Areas */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Maintenance Review
                </h3>
                <div className="space-y-3">
                  {strongAreas.slice(0, 3).map(area => (
                    <div
                      key={area.id}
                      className="p-3 border rounded-lg bg-green-50 border-green-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {area.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {area.score_percentage}% • Light review recommended
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Strong
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Allocation Recommendation */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Recommended Study Time Allocation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">60%</div>
                  <div className="text-sm text-gray-600">Weak Areas</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">30%</div>
                  <div className="text-sm text-gray-600">Practice Exams</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">10%</div>
                  <div className="text-sm text-gray-600">
                    Review Strong Areas
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleBackToResults} variant="outline" size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Results
          </Button>
          <Button
            onClick={() =>
              router.push(`/exam/${examId}/review?attemptId=${attemptId}`)
            }
            size="lg"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Review Answers
          </Button>
        </div>
      </div>
    </div>
  );
}
