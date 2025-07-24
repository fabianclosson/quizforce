"use client";

import { useState, useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroupItem } from "@/components/ui/radio-group";
import {
  Plus,
  Trash2,
  CheckCircle,

  ChevronDown,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { ANSWER_LETTERS } from "@/types/database";

// Answer schema for form validation
export const answerSchema = z.object({
  answer_letter: z.enum(["A", "B", "C", "D", "E"]),
  answer_text: z
    .string()
    .min(1, "Answer text is required")
    .min(2, "Answer text must be at least 2 characters")
    .max(500, "Answer text cannot exceed 500 characters"),
  explanation: z
    .string()
    .optional()
    .refine(
      val => !val || val.trim().length === 0 || val.trim().length >= 5,
      "Explanation must be at least 5 characters if provided"
    )
    .refine(
      val => !val || val.length <= 300,
      "Explanation cannot exceed 300 characters"
    ),
  is_correct: z.boolean(),
});

export type AnswerFormData = z.infer<typeof answerSchema>;

interface MultipleChoiceAnswersProps {
  questionId?: string;
  initialAnswers?: AnswerFormData[];
  disabled?: boolean;
  requiredSelections?: number;
}

export function MultipleChoiceAnswers({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  questionId,
  initialAnswers = [],
  disabled = false,
  requiredSelections = 1,
}: MultipleChoiceAnswersProps) {
  const form = useFormContext();
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(
    new Set()
  );

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  // Initialize with default answers if none provided
  useEffect(() => {
    if (fields.length === 0 && initialAnswers.length === 0) {
      // Add default A and B answers
      append({
        answer_letter: "A",
        answer_text: "",
        explanation: "",
        is_correct: false,
      });
      append({
        answer_letter: "B",
        answer_text: "",
        explanation: "",
        is_correct: false,
      });
    } else if (initialAnswers.length > 0 && fields.length === 0) {
      // Load initial answers
      initialAnswers.forEach(answer => {
        append(answer);
      });
    }
  }, [append, fields.length, initialAnswers]);

  const watchedAnswers = form.watch("answers") || [];

  const addAnswer = () => {
    const usedLetters = new Set(
      watchedAnswers.map((a: AnswerFormData) => a.answer_letter)
    );
    const nextLetter = ANSWER_LETTERS.find(letter => !usedLetters.has(letter));

    if (nextLetter && fields.length < 5) {
      append({
        answer_letter: nextLetter,
        answer_text: "",
        explanation: "",
        is_correct: false,
      });
    }
  };

  const removeAnswer = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const toggleCorrect = (index: number) => {
    const currentAnswers = form.getValues("answers");

    if (requiredSelections === 1) {
      // Single choice: uncheck all others when one is selected
      const updatedAnswers = currentAnswers.map(
        (answer: AnswerFormData, i: number) => ({
          ...answer,
          is_correct: i === index,
        })
      );
      form.setValue("answers", updatedAnswers);
    } else {
      // Multiple choice: toggle the specific answer
      const updatedAnswers = currentAnswers.map(
        (answer: AnswerFormData, i: number) => ({
          ...answer,
          is_correct: i === index ? !answer.is_correct : answer.is_correct,
        })
      );
      form.setValue("answers", updatedAnswers);
    }
  };

  const toggleExplanation = (answerLetter: string) => {
    const newExpanded = new Set(expandedExplanations);
    if (newExpanded.has(answerLetter)) {
      newExpanded.delete(answerLetter);
    } else {
      newExpanded.add(answerLetter);
    }
    setExpandedExplanations(newExpanded);
  };

  const getAnswerLetterColor = (letter: string, isCorrect: boolean) => {
    if (isCorrect) {
      return "bg-green-100 text-green-800 border-green-300";
    }
    return "bg-muted text-muted-foreground border-border";
  };

  const correctAnswersCount = watchedAnswers.filter(
    (a: AnswerFormData) => a.is_correct
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Answer Choices
        </CardTitle>
        <CardDescription>
          Add multiple choice options and mark the correct answer(s). At least 2
          answers required, maximum 5.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Correct answers summary */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">
              {requiredSelections === 1 ? (
                <span className="font-medium">Single Choice Question</span>
              ) : (
                <span className="font-medium">Multiple Choice Question</span>
              )}
              {" - "}
              <span>
                {correctAnswersCount} of {requiredSelections} correct answer
                {requiredSelections > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="text-xs mt-1">
              {correctAnswersCount === 0 && (
                <span className="text-red-600">
                  ⚠️ No correct answers selected
                </span>
              )}
              {correctAnswersCount > 0 &&
                correctAnswersCount === requiredSelections && (
                  <span className="text-green-600">
                    ✅ Correct number of answers selected
                  </span>
                )}
              {correctAnswersCount > 0 &&
                correctAnswersCount !== requiredSelections && (
                  <span className="text-amber-600">
                    ⚠️ Need exactly {requiredSelections} correct answer
                    {requiredSelections > 1 ? "s" : ""}
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Answer options */}
        <div className="space-y-4">
          {fields.map((field, index) => {
            const answer = watchedAnswers[index] || {};
            const answerLetter = answer.answer_letter || ANSWER_LETTERS[index];
            const isExpanded = expandedExplanations.has(answerLetter);

            return (
              <Card key={field.id} className="relative">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Answer header with letter and correct checkbox */}
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getAnswerLetterColor(
                          answerLetter,
                          answer.is_correct
                        )}`}
                      >
                        {answerLetter}
                      </Badge>

                      <div className="flex items-center gap-2">
                        {requiredSelections === 1 ? (
                          <RadioGroupItem
                            value={index.toString()}
                            id={`correct-${index}`}
                            checked={answer.is_correct || false}
                            onClick={() => toggleCorrect(index)}
                            disabled={disabled}
                          />
                        ) : (
                          <Checkbox
                            checked={answer.is_correct || false}
                            onCheckedChange={() => toggleCorrect(index)}
                            disabled={disabled}
                            id={`correct-${index}`}
                          />
                        )}
                        <label
                          htmlFor={`correct-${index}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {requiredSelections === 1
                            ? "Correct Answer"
                            : "Correct Answer"}
                        </label>
                      </div>

                      {/* Remove button */}
                      {fields.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnswer(index)}
                          disabled={disabled}
                          className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Answer text */}
                    <FormField
                      control={form.control}
                      name={`answers.${index}.answer_text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">
                            Answer {answerLetter} Text
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`Enter answer choice ${answerLetter}...`}
                              disabled={disabled}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {field.value?.length || 0}/500 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Explanation toggle and field */}
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        disabled={disabled}
                        onClick={() => toggleExplanation(answerLetter)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        Add explanation for answer {answerLetter} (optional)
                      </Button>

                      {isExpanded && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name={`answers.${index}.explanation`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">
                                  Explanation for Answer {answerLetter}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={`Explain why answer ${answerLetter} is ${
                                      answer.is_correct
                                        ? "correct"
                                        : "incorrect"
                                    }...`}
                                    className="min-h-[80px] resize-none"
                                    disabled={disabled}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  {field.value?.length || 0}/300 characters
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add answer button */}
        {fields.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={addAnswer}
            disabled={disabled}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Answer Choice ({ANSWER_LETTERS[fields.length]})
          </Button>
        )}

        {/* Validation message */}
        {correctAnswersCount === 0 && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            ⚠️ Please select at least one correct answer
          </div>
        )}
      </CardContent>
    </Card>
  );
}
