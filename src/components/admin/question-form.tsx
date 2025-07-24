"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  HelpCircle,
  BookOpen,
  Brain,
  FileQuestion,
  Hash,
  Save,
  X,
} from "lucide-react";
import {
  MultipleChoiceAnswers,
  answerSchema,
  type AnswerFormData,
} from "./multiple-choice-answers";
import { QuestionPreview } from "./question-preview";
import { ExplanationEditor } from "./explanation-editor";

// Types based on database schema
interface Question {
  id: string;
  practice_exam_id: string;
  knowledge_area_id: string;
  question_text: string;
  explanation: string | null;
  difficulty_level: "easy" | "medium" | "hard";
  question_number: number;
  created_at: string;
  updated_at: string;
}

interface Certification {
  id: string;
  name: string;
}

interface PracticeExam {
  id: string;
  name: string;
  certification_id: string;
  question_count: number;
}

interface KnowledgeArea {
  id: string;
  name: string;
  certification_id: string;
}

// Form validation schema
const questionFormSchema = z
  .object({
    practice_exam_id: z.string().min(1, "Practice exam selection is required"),
    knowledge_area_id: z
      .string()
      .min(1, "Knowledge area selection is required"),
    question_text: z
      .string()
      .min(1, "Question text is required")
      .min(10, "Question text must be at least 10 characters")
      .max(2000, "Question text cannot exceed 2000 characters"),
    explanation: z
      .string()
      .optional()
      .refine(
        val => !val || val.trim().length === 0 || val.trim().length >= 10,
        "Explanation must be at least 10 characters if provided"
      )
      .refine(
        val => !val || val.length <= 1000,
        "Explanation cannot exceed 1000 characters"
      ),
    difficulty_level: z.enum(["easy", "medium", "hard"], {
      required_error: "Difficulty level is required",
    }),
    question_number: z
      .number({
        required_error: "Question number is required",
        invalid_type_error: "Question number must be a number",
      })
      .int("Question number must be a whole number")
      .min(1, "Question number must be at least 1")
      .max(999, "Question number cannot exceed 999"),
    required_selections: z
      .number({
        required_error: "Required selections is required",
        invalid_type_error: "Required selections must be a number",
      })
      .int("Required selections must be a whole number")
      .min(1, "Required selections must be at least 1")
      .max(4, "Required selections cannot exceed 4"),
    answers: z
      .array(answerSchema)
      .min(2, "At least 2 answers are required")
      .max(5, "Maximum 5 answers allowed")
      .refine(
        answers => answers.some(answer => answer.is_correct),
        "At least one answer must be marked as correct"
      ),
  })
  .refine(
    data => {
      const correctAnswersCount = data.answers.filter(
        answer => answer.is_correct
      ).length;
      return correctAnswersCount === data.required_selections;
    },
    {
      message: "Number of correct answers must match required selections",
      path: ["answers"],
    }
  );

type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  question?: Question;
  mode: "create" | "edit";
  onSave?: (question: Question) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function QuestionForm({
  question,
  mode,
  onSave,
  onCancel,
  isLoading = false,
}: QuestionFormProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [practiceExams, setPracticeExams] = useState<PracticeExam[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loadingCertifications, setLoadingCertifications] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCertification, setSelectedCertification] =
    useState<string>("");
  const [nextQuestionNumber, setNextQuestionNumber] = useState<number>(1);
  const router = useRouter();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    mode: "onChange",
    defaultValues: {
      practice_exam_id: question?.practice_exam_id || "",
      knowledge_area_id: question?.knowledge_area_id || "",
      question_text: question?.question_text || "",
      explanation: question?.explanation || "",
      difficulty_level: question?.difficulty_level || "medium",
      question_number: question?.question_number || 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      required_selections: (question as any)?.required_selections || 1,
      answers: [],
    },
  });

  const watchedValues = form.watch();
  const questionTextLength = watchedValues.question_text?.length || 0;
  const explanationLength = watchedValues.explanation?.length || 0;

  // Load certifications on component mount
  useEffect(() => {
    loadCertifications();
  }, []);

  // Load practice exams when certification is selected
  useEffect(() => {
    if (selectedCertification) {
      loadPracticeExams(selectedCertification);
      loadKnowledgeAreas(selectedCertification);
    } else {
      setPracticeExams([]);
      setKnowledgeAreas([]);
      form.setValue("practice_exam_id", "");
      form.setValue("knowledge_area_id", "");
    }
  }, [selectedCertification, form]);

  // Update next question number when practice exam changes
  useEffect(() => {
    if (watchedValues.practice_exam_id && mode === "create") {
      getNextQuestionNumber(watchedValues.practice_exam_id);
    }
  }, [watchedValues.practice_exam_id, mode]);

  // Set initial certification if editing
  useEffect(() => {
    if (question && mode === "edit") {
      findInitialCertification();
    }
  }, [question, mode]);

  const loadCertifications = async () => {
    try {
      setLoadingCertifications(true);
      const response = await fetch("/api/admin/certifications");
      if (!response.ok) throw new Error("Failed to load certifications");
      const data = await response.json();
      setCertifications(data.certifications || []);
    } catch (error) {
      console.error("Error loading certifications:", error);
      toast.error("Failed to load certifications");
    } finally {
      setLoadingCertifications(false);
    }
  };

  const loadPracticeExams = async (certificationId: string) => {
    try {
      setLoadingExams(true);
      const response = await fetch(
        `/api/admin/practice-exams?certification_id=${certificationId}`
      );
      if (!response.ok) throw new Error("Failed to load practice exams");
      const data = await response.json();
      setPracticeExams(data.practiceExams || []);
    } catch (error) {
      console.error("Error loading practice exams:", error);
      toast.error("Failed to load practice exams");
    } finally {
      setLoadingExams(false);
    }
  };

  const loadKnowledgeAreas = async (certificationId: string) => {
    try {
      setLoadingAreas(true);
      const response = await fetch(
        `/api/admin/knowledge-areas?certification_id=${certificationId}`
      );
      if (!response.ok) throw new Error("Failed to load knowledge areas");
      const data = await response.json();
      setKnowledgeAreas(data.knowledgeAreas || []);
    } catch (error) {
      console.error("Error loading knowledge areas:", error);
      toast.error("Failed to load knowledge areas");
    } finally {
      setLoadingAreas(false);
    }
  };

  const getNextQuestionNumber = async (practiceExamId: string) => {
    try {
      const response = await fetch(
        `/api/admin/practice-exams/${practiceExamId}`
      );
      if (!response.ok) return;
      const data = await response.json();
      const exam = data.practiceExam;
      setNextQuestionNumber((exam.question_count || 0) + 1);
      form.setValue("question_number", (exam.question_count || 0) + 1);
    } catch (error) {
      console.error("Error getting next question number:", error);
    }
  };

  const findInitialCertification = async () => {
    if (!question) return;

    try {
      // Find the certification by looking up the practice exam
      const response = await fetch(
        `/api/admin/practice-exams/${question.practice_exam_id}`
      );
      if (!response.ok) return;
      const data = await response.json();
      const exam = data.practiceExam;
      setSelectedCertification(exam.certification_id);
    } catch (error) {
      console.error("Error finding initial certification:", error);
    }
  };

  const handleSubmit = async (values: QuestionFormValues) => {
    try {
      setSubmitting(true);

      const url =
        mode === "create"
          ? "/api/admin/questions"
          : `/api/admin/questions/${question?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save question");
      }

      const data = await response.json();
      const savedQuestion = data.question;

      toast.success(
        mode === "create"
          ? "Question created successfully"
          : "Question updated successfully"
      );

      if (onSave) {
        onSave(savedQuestion);
      } else {
        router.push("/admin/questions");
      }
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save question"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/admin/questions");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {mode === "create" ? "Create New Question" : "Edit Question"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Add a new multiple choice question to a practice exam."
              : "Update the question details and settings."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Certification Selection (for Create mode) */}
              {mode === "create" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Certification</label>
                  <Select
                    value={selectedCertification}
                    onValueChange={setSelectedCertification}
                    disabled={loadingCertifications}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a certification" />
                    </SelectTrigger>
                    <SelectContent>
                      {certifications.map(cert => (
                        <SelectItem key={cert.id} value={cert.id}>
                          {cert.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the certification to load practice exams and
                    knowledge areas
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Practice Exam Selection */}
                <FormField
                  control={form.control}
                  name="practice_exam_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileQuestion className="h-4 w-4" />
                        Practice Exam
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={
                          !selectedCertification ||
                          loadingExams ||
                          mode === "edit"
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select practice exam" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {practiceExams.map(exam => (
                            <SelectItem key={exam.id} value={exam.id}>
                              {exam.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {mode === "edit"
                          ? "Practice exam cannot be changed when editing"
                          : "Select the practice exam for this question"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Knowledge Area Selection */}
                <FormField
                  control={form.control}
                  name="knowledge_area_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Knowledge Area
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedCertification || loadingAreas}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select knowledge area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {knowledgeAreas.map(area => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the knowledge area this question covers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Level */}
                <FormField
                  control={form.control}
                  name="difficulty_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">
                            <span className="text-green-600">Easy</span>
                          </SelectItem>
                          <SelectItem value="medium">
                            <span className="text-yellow-600">Medium</span>
                          </SelectItem>
                          <SelectItem value="hard">
                            <span className="text-red-600">Hard</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        <span
                          className={getDifficultyColor(
                            watchedValues.difficulty_level
                          )}
                        >
                          {watchedValues.difficulty_level === "easy" &&
                            "Suitable for beginners"}
                          {watchedValues.difficulty_level === "medium" &&
                            "Standard difficulty level"}
                          {watchedValues.difficulty_level === "hard" &&
                            "Challenging question"}
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question Number */}
                <FormField
                  control={form.control}
                  name="question_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Question Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="999"
                          placeholder="1"
                          {...field}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {mode === "create" && nextQuestionNumber > 1 && (
                          <span className="text-green-600">
                            Next available: {nextQuestionNumber}
                          </span>
                        )}
                        {mode === "edit" && (
                          <span className="text-muted-foreground">
                            Order of this question in the exam
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="required_selections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Required Selections
                      </FormLabel>
                      <Select
                        onValueChange={value => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of required answers" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">
                            1 answer (Single Choice)
                          </SelectItem>
                          <SelectItem value="2">
                            2 answers (Multiple Choice)
                          </SelectItem>
                          <SelectItem value="3">
                            3 answers (Multiple Choice)
                          </SelectItem>
                          <SelectItem value="4">
                            4 answers (Multiple Choice)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How many answers should students select? Single choice
                        (1) or multiple choice (2-4).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Question Text */}
              <FormField
                control={form.control}
                name="question_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the question text..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Write a clear, concise question for the exam</span>
                      <span
                        className={`text-xs ${
                          questionTextLength > 1800
                            ? "text-red-600"
                            : questionTextLength > 1500
                              ? "text-yellow-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {questionTextLength}/2000 characters
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Explanation */}
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation (Optional)</FormLabel>
                    <FormControl>
                      <ExplanationEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Provide an explanation for the correct answer..."
                        disabled={submitting || isLoading}
                        maxLength={1000}
                      />
                    </FormControl>
                    <FormDescription>
                      {explanationLength > 0 && explanationLength < 10
                        ? "Explanation must be at least 10 characters"
                        : "Explain why the correct answer is right (optional). Use the formatting tools to enhance your explanation."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Multiple Choice Answers */}
              <MultipleChoiceAnswers
                questionId={question?.id}
                disabled={submitting || isLoading}
                requiredSelections={form.watch("required_selections") || 1}
              />

              {/* Question Preview */}
              <QuestionPreview
                questionText={watchedValues.question_text || ""}
                explanation={watchedValues.explanation || ""}
                difficulty={watchedValues.difficulty_level || "medium"}
                questionNumber={watchedValues.question_number || 1}
                answers={(watchedValues.answers || []).map((answer, index) => ({
                  ...answer,
                  id: `preview-${index}`, // Temporary ID for preview
                }))}
                requiredSelections={watchedValues.required_selections || 1}
                certificationName={
                  certifications.find(cert => cert.id === selectedCertification)
                    ?.name
                }
                knowledgeAreaName={
                  knowledgeAreas.find(
                    area => area.id === watchedValues.knowledge_area_id
                  )?.name
                }
              />

              {/* Form Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || isLoading || !form.formState.isValid}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {mode === "create" ? "Create Question" : "Update Question"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting || isLoading}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
