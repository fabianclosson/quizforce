"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Eye,
  RotateCcw,
  CheckCircle,
  XCircle,
  Info,
  BookOpen,
} from "lucide-react";

interface PreviewAnswer {
  id: string;
  answer_text: string;
  answer_letter: string;
  is_correct: boolean;
  explanation?: string;
}

interface PreviewAnswerWithLetter extends PreviewAnswer {
  letter: string;
}

interface QuestionPreviewProps {
  // Question data from form
  questionText: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  questionNumber: number;
  answers: PreviewAnswer[];
  requiredSelections?: number;

  // Optional props
  certificationName?: string;
  knowledgeAreaName?: string;
  className?: string;
}

export function QuestionPreview({
  questionText,
  explanation,
  difficulty = "medium",
  questionNumber = 1,
  answers = [],
  requiredSelections = 1,
  certificationName,
  knowledgeAreaName,
  className,
}: QuestionPreviewProps) {
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<string[]>([]);
  const [showAnswerExplanation, setShowAnswerExplanation] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isMultiAnswer = requiredSelections > 1;

  const handleAnswerSelect = (answerId: string) => {
    if (!hasSubmitted) {
      if (isMultiAnswer) {
        // Multi-answer: toggle selection
        setSelectedAnswerIds(prev => {
          const isSelected = prev.includes(answerId);
          if (isSelected) {
            return prev.filter(id => id !== answerId);
          } else if (prev.length < requiredSelections) {
            return [...prev, answerId];
          }
          return prev;
        });
      } else {
        // Single answer: replace selection
        setSelectedAnswerIds([answerId]);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIds.length > 0) {
      setHasSubmitted(true);
      setShowAnswerExplanation(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswerIds([]);
    setShowAnswerExplanation(false);
    setHasSubmitted(false);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAnswerStyle = (answer: PreviewAnswerWithLetter) => {
    if (!hasSubmitted) {
      return selectedAnswerIds.includes(answer.id)
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50";
    }

    // After submission - show correct/incorrect styling
    const isSelected = selectedAnswerIds.includes(answer.id);
    const isCorrect = answer.is_correct;

    if (isCorrect && isSelected) {
      return "border-green-500 bg-green-50 text-green-900";
    } else if (isCorrect) {
      return "border-green-500 bg-green-50 text-green-900";
    } else if (isSelected) {
      return "border-red-500 bg-red-50 text-red-900";
    }
    return "border-border bg-muted/30";
  };

  const getSelectedAnswers = () => {
    return answersWithLetters.filter(answer =>
      selectedAnswerIds.includes(answer.id)
    );
  };

  const getCorrectAnswers = () => {
    return answersWithLetters.filter(answer => answer.is_correct);
  };

  const isAnswerCorrect = () => {
    if (isMultiAnswer) {
      // For multi-answer: all selected must be correct AND all correct must be selected
      const correctAnswers = getCorrectAnswers();
      const selectedAnswers = getSelectedAnswers();

      return (
        correctAnswers.length === selectedAnswers.length &&
        correctAnswers.every(correct =>
          selectedAnswerIds.includes(correct.id)
        ) &&
        selectedAnswers.every(selected => selected.is_correct)
      );
    } else {
      // For single answer: just check if the selected answer is correct
      const selected = getSelectedAnswers()[0];
      return selected?.is_correct || false;
    }
  };

  // Prepare letters for answers (A, B, C, D, E)
  const answersWithLetters: PreviewAnswerWithLetter[] = answers.map(
    (answer, index) => ({
      ...answer,
      letter: String.fromCharCode(65 + index), // A, B, C, D, E
    })
  );

  const hasValidContent = questionText.trim().length > 0 && answers.length >= 2;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Question Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasSubmitted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Badge variant="secondary" className="text-xs">
              Live Preview
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!hasValidContent ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter a question and at least 2 answers to see the preview.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Question Header - matches exam interface */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Question {questionNumber}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-1",
                      getDifficultyColor(difficulty)
                    )}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Badge>
                </div>
                {knowledgeAreaName && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {knowledgeAreaName}
                  </Badge>
                )}
              </div>

              {certificationName && (
                <div className="text-sm text-muted-foreground">
                  {certificationName}
                </div>
              )}

              <Separator />

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold leading-relaxed">
                  {questionText || "Your question text will appear here..."}
                </h3>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">
                {isMultiAnswer
                  ? `Select ${requiredSelections} answers:`
                  : "Choose the best answer:"}
              </h4>
              <div className="space-y-2">
                {answersWithLetters.map((answer, index) => (
                  <div
                    key={answer.id || index}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                      getAnswerStyle(answer),
                      !hasSubmitted && "hover:shadow-sm"
                    )}
                    onClick={() => handleAnswerSelect(answer.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Answer letter circle */}
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium mt-0.5",
                          selectedAnswerIds.includes(answer.id) && !hasSubmitted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-current"
                        )}
                      >
                        {answer.letter}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed break-words">
                          {answer.answer_text ||
                            `Answer ${answer.letter} text...`}
                        </p>

                        {/* Status indicators after submission */}
                        {hasSubmitted && (
                          <div className="flex items-center gap-2 mt-2">
                            {answer.is_correct && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-green-100 text-green-800"
                                >
                                  Correct Answer
                                </Badge>
                              </div>
                            )}
                            {selectedAnswerIds.includes(answer.id) && (
                              <div className="flex items-center gap-1">
                                {answer.is_correct ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs",
                                    answer.is_correct
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                  )}
                                >
                                  Your Selection
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit/Test Controls */}
            {!hasSubmitted && selectedAnswerIds.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button onClick={handleSubmitAnswer} className="px-8">
                  Submit Answer (Preview)
                </Button>
              </div>
            )}

            {/* Results Summary */}
            {hasSubmitted && selectedAnswerIds.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Your Answer{selectedAnswerIds.length > 1 ? "s" : ""}:
                    </h4>
                    <div className="space-y-1">
                      {getSelectedAnswers().map(answer => (
                        <p
                          key={answer.id}
                          className={cn(
                            "font-medium",
                            isAnswerCorrect()
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {answer.letter}. {answer.answer_text}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Correct Answer{getCorrectAnswers().length > 1 ? "s" : ""}:
                    </h4>
                    <div className="space-y-1">
                      {getCorrectAnswers().map(answer => (
                        <p
                          key={answer.id}
                          className="font-medium text-green-600"
                        >
                          {answer.letter}. {answer.answer_text}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overall result */}
                <div
                  className={cn(
                    "p-4 rounded-lg border flex items-center gap-3",
                    isAnswerCorrect()
                      ? "bg-green-50 border-green-200 text-green-900"
                      : "bg-red-50 border-red-200 text-red-900"
                  )}
                >
                  {isAnswerCorrect() ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {isAnswerCorrect() ? "Correct!" : "Incorrect"}
                    </p>
                    <p className="text-sm">
                      {isAnswerCorrect()
                        ? "Great job! You selected the right answer."
                        : "Review the explanation to understand the correct answer."}
                    </p>
                  </div>
                </div>

                {/* Question explanation */}
                {explanation && explanation.trim().length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Explanation:
                    </h4>
                    <p className="text-blue-800 leading-relaxed text-sm">
                      {explanation}
                    </p>
                  </div>
                )}

                {/* Answer explanation */}
                {showAnswerExplanation &&
                  getSelectedAnswers().some(answer => answer.explanation) && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Answer Explanation
                        {getSelectedAnswers().length > 1 ? "s" : ""}:
                      </h4>
                      <div className="space-y-2">
                        {getSelectedAnswers()
                          .filter(answer => answer.explanation)
                          .map(answer => (
                            <div key={answer.id}>
                              <p className="text-purple-900 font-medium text-sm">
                                {answer.letter}. {answer.answer_text}
                              </p>
                              <p className="text-purple-800 leading-relaxed text-sm">
                                {answer.explanation}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
