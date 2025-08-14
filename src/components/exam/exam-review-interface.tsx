"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for the review interface
export interface ReviewQuestion {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "single_choice";
  options: {
    id: string;
    text: string;
    is_correct: boolean;
  }[];
  knowledge_area: string;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  user_answer?: string | string[];
  correct_answer: string | string[];
  is_correct: boolean;
  time_spent?: number; // in seconds
}

export interface ExamReviewData {
  exam_id: string;
  exam_title: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_taken: number; // in seconds
  questions: ReviewQuestion[];
}

interface ExamReviewInterfaceProps {
  reviewData: ExamReviewData;
  onBackToResults: () => void;
  className?: string;
}

export function ExamReviewInterface({
  reviewData,
  onBackToResults,
  className,
}: ExamReviewInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = reviewData.questions[currentQuestionIndex];

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < reviewData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };



  const getUserAnswerText = (question: ReviewQuestion) => {
    if (!question.user_answer) return "Not answered";

    if (Array.isArray(question.user_answer)) {
      return question.user_answer
        .map(
          answerId => question.options.find(opt => opt.id === answerId)?.text
        )
        .filter(Boolean)
        .join(", ");
    } else {
      return (
        question.options.find(opt => opt.id === question.user_answer)?.text ||
        "Not answered"
      );
    }
  };

  const getCorrectAnswerText = (question: ReviewQuestion) => {
    if (Array.isArray(question.correct_answer)) {
      return question.correct_answer
        .map(
          answerId => question.options.find(opt => opt.id === answerId)?.text
        )
        .filter(Boolean)
        .join(", ");
    } else {
      return (
        question.options.find(opt => opt.id === question.correct_answer)
          ?.text || "No correct answer"
      );
    }
  };

  const isOptionSelected = (optionId: string) => {
    if (!currentQuestion.user_answer) return false;
    if (Array.isArray(currentQuestion.user_answer)) {
      return currentQuestion.user_answer.includes(optionId);
    }
    return currentQuestion.user_answer === optionId;
  };

  const isOptionCorrect = (optionId: string) => {
    if (Array.isArray(currentQuestion.correct_answer)) {
      return currentQuestion.correct_answer.includes(optionId);
    }
    return currentQuestion.correct_answer === optionId;
  };

  const getOptionStyle = (optionId: string) => {
    const isSelected = isOptionSelected(optionId);
    const isCorrect = isOptionCorrect(optionId);

    if (isCorrect && isSelected) {
      return "border-green-500 bg-green-50 text-green-900";
    } else if (isCorrect) {
      return "border-green-500 bg-green-50 text-green-900";
    } else if (isSelected) {
      return "border-red-500 bg-red-50 text-red-900";
    }
    return "border-gray-200 bg-gray-50 text-gray-700";
  };

  const progress =
    ((currentQuestionIndex + 1) / reviewData.questions.length) * 100;

  return (
    <div className={cn("max-w-4xl mx-auto p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBackToResults}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Exam Review</h1>
          <p className="text-gray-600">{reviewData.exam_title}</p>
        </div>

        <div className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {reviewData.questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Navigation Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {reviewData.questions.map((question, index) => (
              <Button
                key={question.id}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                onClick={() => goToQuestion(index)}
                className={cn(
                  "w-full h-10 text-xs relative",
                  question.is_correct
                    ? "border-green-500 hover:bg-green-50"
                    : "border-red-500 hover:bg-red-50"
                )}
              >
                {index + 1}
                {question.is_correct ? (
                  <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600 bg-white rounded-full" />
                ) : (
                  <XCircle className="w-3 h-3 absolute -top-1 -right-1 text-red-600 bg-white rounded-full" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">

                <Badge variant="outline">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {currentQuestion.knowledge_area}
                </Badge>
                {currentQuestion.time_spent && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(currentQuestion.time_spent)}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">
                Question {currentQuestionIndex + 1}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {currentQuestion.is_correct ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <span
                className={cn(
                  "font-semibold",
                  currentQuestion.is_correct ? "text-green-600" : "text-red-600"
                )}
              >
                {currentQuestion.is_correct ? "Correct" : "Incorrect"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="prose max-w-none">
            <p className="text-lg text-gray-900 leading-relaxed">
              {currentQuestion.question_text}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Answer Options:</h3>
            <div className="space-y-2">
              {currentQuestion.options.map(option => (
                <div
                  key={option.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-colors",
                    getOptionStyle(option.id)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 mt-1">
                      {isOptionCorrect(option.id) && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {isOptionSelected(option.id) &&
                        !isOptionCorrect(option.id) && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{option.text}</p>
                      <div className="flex gap-2 mt-1">
                        {isOptionCorrect(option.id) && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            Correct Answer
                          </Badge>
                        )}
                        {isOptionSelected(option.id) && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800"
                          >
                            Your Selection
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Summary */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Your Answer:</h4>
              <p
                className={cn(
                  "font-medium",
                  currentQuestion.is_correct ? "text-green-600" : "text-red-600"
                )}
              >
                {getUserAnswerText(currentQuestion)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Correct Answer:
              </h4>
              <p className="font-medium text-green-600">
                {getCorrectAnswerText(currentQuestion)}
              </p>
            </div>
          </div>

          {/* Explanation */}
          {currentQuestion.explanation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-gray-600">
          {currentQuestionIndex + 1} of {reviewData.questions.length}
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentQuestionIndex === reviewData.questions.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
