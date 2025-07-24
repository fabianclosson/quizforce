"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Save, ArrowLeft, Clock, Target, BookOpen } from "lucide-react";
import { toast } from "sonner";

// Validation schema for practice exam forms
const practiceExamFormSchema = z.object({
  name: z.string().min(1, "Practice exam name is required"),
  description: z.string().optional(),
  certification_id: z.string().min(1, "Please select a certification"),
  question_count: z
    .number()
    .min(1, "Question count must be at least 1")
    .max(300, "Question count cannot exceed 300"),
  time_limit_minutes: z
    .number()
    .min(1, "Time limit must be at least 1 minute")
    .max(480, "Time limit cannot exceed 8 hours"),
  passing_threshold_percentage: z
    .number()
    .min(1, "Passing threshold must be at least 1%")
    .max(100, "Passing threshold cannot exceed 100%"),
  sort_order: z.number().min(0, "Sort order must be non-negative"),
  is_active: z.boolean(),
});

type PracticeExamFormValues = z.infer<typeof practiceExamFormSchema>;

interface Certification {
  id: string;
  name: string;
  slug: string;
}

interface PracticeExamFormProps {
  practiceExam?: PracticeExamFormValues & { id: string };
  isEdit?: boolean;
}

export function PracticeExamForm({
  practiceExam,
  isEdit = false,
}: PracticeExamFormProps) {
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loadingCertifications, setLoadingCertifications] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PracticeExamFormValues>({
    resolver: zodResolver(practiceExamFormSchema),
    defaultValues: {
      name: practiceExam?.name || "",
      description: practiceExam?.description || "",
      certification_id: practiceExam?.certification_id || "",
      question_count: practiceExam?.question_count || 50,
      time_limit_minutes: practiceExam?.time_limit_minutes || 90,
      passing_threshold_percentage:
        practiceExam?.passing_threshold_percentage || 70,
      sort_order: practiceExam?.sort_order || 0,
      is_active: practiceExam?.is_active ?? true,
    },
  });

  // Load certifications
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoadingCertifications(true);
        const response = await fetch("/api/admin/certifications");
        if (!response.ok) {
          throw new Error("Failed to fetch certifications");
        }
        const data = await response.json();
        setCertifications(data.certifications || []);
      } catch (error) {
        console.error("Failed to fetch certifications:", error);
        toast.error("Failed to load certifications");
      } finally {
        setLoadingCertifications(false);
      }
    };

    fetchCertifications();
  }, []);

  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hours`;
  };

  const onSubmit = async (values: PracticeExamFormValues) => {
    if (submitting) return; // Prevent double submission

    try {
      setSubmitting(true);

      const url = isEdit
        ? `/api/admin/practice-exams/${practiceExam?.id}`
        : "/api/admin/practice-exams";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save practice exam");
      }

      toast.success(
        isEdit
          ? "Practice exam updated successfully"
          : "Practice exam created successfully"
      );

      // Navigate back to practice exams list
      router.push("/admin/practice-exams");
    } catch (error) {
      console.error("Error saving practice exam:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save practice exam"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/practice-exams");
  };

  if (loadingCertifications) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>
              {practiceExam ? "Edit Practice Exam" : "Create New Practice Exam"}
            </CardTitle>
            <CardDescription>
              {practiceExam
                ? "Update practice exam details and settings"
                : "Add a new practice exam to a certification"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Practice Exam Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Administrator Practice Exam 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certification_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a certification" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {certifications.map(certification => (
                          <SelectItem
                            key={certification.id}
                            value={certification.id}
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {certification.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description of the practice exam"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional context about this practice exam
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Exam Configuration */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="question_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="300"
                        placeholder="50"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value || "0"))
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of questions in this exam
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_limit_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="480"
                        placeholder="90"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value || "0"))
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      <Clock className="h-3 w-3 inline mr-1" />
                      {field.value
                        ? formatTimeLimit(field.value)
                        : "Time allowed for exam"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passing_threshold_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Threshold (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="70"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value || "0"))
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      <Target className="h-3 w-3 inline mr-1" />
                      Minimum score to pass the exam
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value || "0"))
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Controls the display order (lower numbers appear first)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Exam is available to users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[120px]"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>{practiceExam ? "Update" : "Create"}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
