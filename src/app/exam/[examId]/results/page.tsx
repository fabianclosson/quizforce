"use client";

import React, { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ExamResultsSummary } from "@/components/exam/exam-results-summary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { DetailedExamResults } from "@/lib/exam-scoring";

// Mock results data for development
const mockExamResults: DetailedExamResults = {
  attempt_id: "attempt_1",
  score_percentage: 78,
  correct_answers: 47,
  total_questions: 60,
  passed: true,
  time_spent_minutes: 82,
  question_results: [
    {
      question_id: "q1",
      question_number: 1,
      user_answer_id: "a1",
      correct_answer_id: "a1",
      is_correct: true,
      time_spent_seconds: 90,
      knowledge_area: "User Management",
    },
    // Additional question results would be here...
  ],
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
      performance_level: "good",
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

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const examId = params.examId as string;
  const attemptId = searchParams.get("attemptId");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // In a real application, you would fetch the results here
  // const { data: results, isLoading, error } = useExamResults(attemptId);

  // Mock exam data
  const examName = "Salesforce Administrator Practice Exam 1";
  const passingThreshold = 65;

  const handleReviewAnswers = () => {
    router.push(`/exam/${examId}/review?attemptId=${attemptId}`);
  };

  const handleRetakeExam = () => {
    router.push(`/exam/${examId}`);
  };

  const handleReturnToDashboard = () => {
    router.push("/dashboard");
  };

  const handleViewKnowledgeAreas = () => {
    router.push(
      `/exam/${examId}/results/knowledge-areas?attemptId=${attemptId}`
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading your exam results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Unable to Load Results
                </h2>
                <p className="text-gray-600 mt-2">
                  We couldn&apos;t load your exam results. This might be
                  because:
                </p>
                <ul className="text-sm text-gray-500 mt-2 space-y-1 text-left">
                  <li>• The exam session has expired</li>
                  <li>• The results are still being processed</li>
                  <li>• There was a network error</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleReturnToDashboard}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Missing attempt ID
  if (!attemptId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="w-12 h-12 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Results Not Found
                </h2>
                <p className="text-gray-600 mt-2">
                  We couldn&apos;t find the exam results you&apos;re looking
                  for. Please make sure you&apos;ve completed an exam.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push(`/exam/${examId}`)}
                  className="w-full"
                >
                  Take Exam
                </Button>
                <Button
                  onClick={handleReturnToDashboard}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ExamResultsSummary
        results={mockExamResults}
        examName={examName}
        passingThreshold={passingThreshold}
        onReviewAnswers={handleReviewAnswers}
        onRetakeExam={handleRetakeExam}
        onReturnToDashboard={handleReturnToDashboard}
        onViewKnowledgeAreas={handleViewKnowledgeAreas}
      />
    </div>
  );
}
