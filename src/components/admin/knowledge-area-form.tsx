"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Save, ArrowLeft, Brain, BookOpen, Percent } from "lucide-react";
import { toast } from "sonner";
import { FormValidators } from "@/lib/validators-client";

// Use centralized validation schema
const knowledgeAreaFormSchema = FormValidators.knowledgeArea;

type KnowledgeAreaFormValues = z.infer<typeof knowledgeAreaFormSchema>;

interface Certification {
  id: string;
  name: string;
  slug: string;
}

interface KnowledgeAreaFormProps {
  knowledgeArea?: KnowledgeAreaFormValues & { id: string };
  mode: "create" | "edit";
  onSave?: (data: KnowledgeAreaFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function KnowledgeAreaForm({
  knowledgeArea,
  mode,
  onSave,
  onCancel,
  isLoading = false,
}: KnowledgeAreaFormProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loadingCertifications, setLoadingCertifications] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const form = useForm<KnowledgeAreaFormValues>({
    resolver: zodResolver(knowledgeAreaFormSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      name: knowledgeArea?.name || "",
      description: knowledgeArea?.description || "",
      certification_id: knowledgeArea?.certification_id || "",
      weight_percentage: knowledgeArea?.weight_percentage || 1,
      sort_order: knowledgeArea?.sort_order || 0,
    },
  });

  // Watch form values for real-time validation feedback
  const watchedValues = form.watch();
  const nameLength = watchedValues.name?.length || 0;
  const descriptionLength = watchedValues.description?.length || 0;

  // Load available certifications
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoadingCertifications(true);
        const response = await fetch("/api/admin/certifications", {
          credentials: "include",
        });
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/admin/knowledge-areas");
    }
  };

  const defaultSubmit = async (values: KnowledgeAreaFormValues) => {
    try {
      setSubmitting(true);
      setFieldErrors({}); // Clear previous field errors

      // Additional client-side validation before submission
      if (values.name.trim().length === 0) {
        setFieldErrors({ name: "Knowledge area name cannot be empty" });
        toast.error("Please fix the validation errors before submitting");
        return;
      }

      // Validate description if provided
      if (
        values.description &&
        values.description.trim().length > 0 &&
        values.description.trim().length < 10
      ) {
        setFieldErrors({
          description: "Description must be at least 10 characters",
        });
        toast.error("Please fix the validation errors before submitting");
        return;
      }

      const url =
        mode === "create"
          ? "/api/admin/knowledge-areas"
          : `/api/admin/knowledge-areas/${knowledgeArea?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          name: values.name.trim(), // Ensure name is trimmed
          description: values.description?.trim() || null, // Trim description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle validation errors from server
        if (response.status === 400 && errorData.error?.details) {
          const serverErrors: Record<string, string> = {};
          const details = errorData.error.details;

          // Map server validation errors to form fields
          if (details.includes("name")) {
            serverErrors.name = "Invalid knowledge area name";
          }
          if (details.includes("weight_percentage")) {
            serverErrors.weight_percentage = "Invalid weight percentage";
          }
          if (details.includes("certification")) {
            serverErrors.certification_id = "Invalid certification selected";
          }

          setFieldErrors(serverErrors);
          toast.error("Please fix the validation errors");
          return;
        }

        // Handle duplicate name error
        if (response.status === 409) {
          setFieldErrors({
            name: "A knowledge area with this name already exists for this certification",
          });
          toast.error(
            "Knowledge area name must be unique within the certification"
          );
          return;
        }

        throw new Error(
          errorData.error?.message || `Failed to ${mode} knowledge area`
        );
      }

      toast.success(
        mode === "create"
          ? "Knowledge area created successfully"
          : "Knowledge area updated successfully"
      );

      // Redirect to knowledge areas list
      router.push("/admin/knowledge-areas");
    } catch (error) {
      console.error(`Error ${mode}ing knowledge area:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${mode} knowledge area`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (values: KnowledgeAreaFormValues) => {
    if (submitting) return; // Prevent double submission

    if (onSave) {
      try {
        setSubmitting(true);
        await onSave(values);
      } finally {
        setSubmitting(false);
      }
    } else {
      await defaultSubmit(values);
    }
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Areas
          </Button>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {mode === "create" ? "Create Knowledge Area" : "Edit Knowledge Area"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new knowledge area to a certification with its weighting."
            : "Update the knowledge area details and weighting."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Validation Summary */}
        {(Object.keys(form.formState.errors).length > 0 ||
          Object.keys(fieldErrors).length > 0) && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              Please fix the following issues:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {/* Form validation errors */}
              {Object.entries(form.formState.errors).map(([field, error]) => {
                const fieldLabels: Record<string, string> = {
                  name: "Knowledge Area Name",
                  description: "Description",
                  certification_id: "Certification",
                  weight_percentage: "Weight Percentage",
                  sort_order: "Sort Order",
                };

                return (
                  <li key={field} className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>
                      {fieldLabels[field]}: {error?.message}
                    </span>
                  </li>
                );
              })}
              {/* Server-side field errors */}
              {Object.entries(fieldErrors).map(([field, error]) => {
                const fieldLabels: Record<string, string> = {
                  name: "Knowledge Area Name",
                  description: "Description",
                  certification_id: "Certification",
                  weight_percentage: "Weight Percentage",
                  sort_order: "Sort Order",
                };

                return (
                  <li
                    key={`server-${field}`}
                    className="flex items-start gap-2"
                  >
                    <span className="text-red-600">•</span>
                    <span>
                      {fieldLabels[field]}: {error}
                    </span>
                  </li>
                );
              })}
              {/* Additional validation checks */}
              {nameLength > 0 && nameLength < 3 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>
                    Knowledge Area Name: Must be at least 3 characters
                  </span>
                </li>
              )}
              {descriptionLength > 0 && descriptionLength < 10 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>
                    Description: Must be at least 10 characters if provided
                  </span>
                </li>
              )}
              {certifications.length === 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>
                    Certification: No certifications available. Please create
                    one first.
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Certification Selection */}
            <FormField
              control={form.control}
              name="certification_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Certification
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === "edit"} // Don't allow changing certification in edit mode
                  >
                    <FormControl>
                      <SelectTrigger
                        className={
                          fieldErrors.certification_id ||
                          form.formState.errors.certification_id
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select a certification" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {certifications.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No certifications available
                        </div>
                      ) : (
                        certifications.map(cert => (
                          <SelectItem key={cert.id} value={cert.id}>
                            {cert.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {mode === "edit"
                      ? "Certification cannot be changed after creation"
                      : certifications.length === 0
                        ? "No certifications available. Please create a certification first."
                        : "Choose which certification this knowledge area belongs to"}
                  </FormDescription>
                  {fieldErrors.certification_id && (
                    <p className="text-sm font-medium text-red-600">
                      {fieldErrors.certification_id}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Knowledge Area Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Knowledge Area Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Data Cloud Setup and Architecture"
                      {...field}
                      className={
                        fieldErrors.name || form.formState.errors.name
                          ? "border-red-500 focus:border-red-500"
                          : nameLength > 80
                            ? "border-yellow-500 focus:border-yellow-500"
                            : ""
                      }
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between">
                    <span>
                      Enter a clear, descriptive name for this knowledge area
                    </span>
                    <span
                      className={`text-xs ${
                        nameLength > 80
                          ? "text-yellow-600"
                          : nameLength > 95
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {nameLength}/100 characters
                    </span>
                  </FormDescription>
                  {fieldErrors.name && (
                    <p className="text-sm font-medium text-red-600">
                      {fieldErrors.name}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this knowledge area covers..."
                      className={`resize-none ${
                        fieldErrors.description ||
                        form.formState.errors.description
                          ? "border-red-500 focus:border-red-500"
                          : descriptionLength > 0 && descriptionLength < 10
                            ? "border-yellow-500 focus:border-yellow-500"
                            : descriptionLength > 450
                              ? "border-yellow-500 focus:border-yellow-500"
                              : ""
                      }`}
                      rows={4}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between">
                    <span>
                      {descriptionLength > 0 && descriptionLength < 10
                        ? "Description must be at least 10 characters"
                        : "Provide additional details about what this knowledge area encompasses"}
                    </span>
                    <span
                      className={`text-xs ${
                        descriptionLength > 0 && descriptionLength < 10
                          ? "text-yellow-600"
                          : descriptionLength > 450
                            ? "text-yellow-600"
                            : descriptionLength > 480
                              ? "text-red-600"
                              : "text-muted-foreground"
                      }`}
                    >
                      {descriptionLength}/500 characters
                      {descriptionLength > 0 && descriptionLength < 10 && (
                        <span className="ml-2 text-yellow-600">
                          (needs {10 - descriptionLength} more)
                        </span>
                      )}
                    </span>
                  </FormDescription>
                  {fieldErrors.description && (
                    <p className="text-sm font-medium text-red-600">
                      {fieldErrors.description}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight Percentage */}
            <FormField
              control={form.control}
              name="weight_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Weight Percentage
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      placeholder="e.g., 15"
                      {...field}
                      className={
                        fieldErrors.weight_percentage ||
                        form.formState.errors.weight_percentage
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      onChange={e => {
                        const value = e.target.value;
                        // Only allow valid integer inputs
                        if (value === "" || /^\d+$/.test(value)) {
                          const numValue = value === "" ? 0 : parseInt(value);
                          if (numValue >= 0 && numValue <= 100) {
                            field.onChange(numValue);
                          }
                        }
                      }}
                      onBlur={e => {
                        // Ensure minimum value of 1 on blur if not empty
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value < 1) {
                          field.onChange(1);
                        }
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    <span>
                      The percentage weight of this knowledge area in the exam
                      (1-100%)
                    </span>
                    {watchedValues.weight_percentage && (
                      <span
                        className={`block text-xs mt-1 ${
                          watchedValues.weight_percentage < 1 ||
                          watchedValues.weight_percentage > 100
                            ? "text-red-600"
                            : watchedValues.weight_percentage > 50
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {watchedValues.weight_percentage < 1 &&
                          "Weight must be at least 1%"}
                        {watchedValues.weight_percentage > 100 &&
                          "Weight cannot exceed 100%"}
                        {watchedValues.weight_percentage >= 1 &&
                          watchedValues.weight_percentage <= 100 &&
                          watchedValues.weight_percentage > 50 &&
                          "High weight - ensure this is appropriate"}
                        {watchedValues.weight_percentage >= 1 &&
                          watchedValues.weight_percentage <= 50 &&
                          "Weight looks good"}
                      </span>
                    )}
                  </FormDescription>
                  {fieldErrors.weight_percentage && (
                    <p className="text-sm font-medium text-red-600">
                      {fieldErrors.weight_percentage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sort Order */}
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
                      max="999"
                      step="1"
                      placeholder="0"
                      {...field}
                      className={
                        fieldErrors.sort_order ||
                        form.formState.errors.sort_order
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      onChange={e => {
                        const value = e.target.value;
                        // Only allow valid integer inputs
                        if (value === "" || /^\d+$/.test(value)) {
                          const numValue = value === "" ? 0 : parseInt(value);
                          if (numValue >= 0 && numValue <= 999) {
                            field.onChange(numValue);
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    <span>
                      Display order for this knowledge area (0 for default)
                    </span>
                    {watchedValues.sort_order > 0 && (
                      <span className="block text-xs mt-1 text-muted-foreground">
                        Will be displayed in position {watchedValues.sort_order}
                      </span>
                    )}
                  </FormDescription>
                  {fieldErrors.sort_order && (
                    <p className="text-sm font-medium text-red-600">
                      {fieldErrors.sort_order}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={
                  submitting ||
                  isLoading ||
                  !form.formState.isValid ||
                  Object.keys(fieldErrors).length > 0 ||
                  (nameLength > 0 && nameLength < 3) ||
                  (descriptionLength > 0 && descriptionLength < 10) ||
                  certifications.length === 0
                }
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner className="h-4 w-4" />
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {mode === "create"
                      ? "Create Knowledge Area"
                      : "Update Knowledge Area"}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={submitting || isLoading}
              >
                Cancel
              </Button>

              {/* Validation Status Indicator */}
              {!form.formState.isValid && form.formState.isSubmitted && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                  Please fix validation errors
                </div>
              )}

              {Object.keys(fieldErrors).length > 0 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                  Server validation errors found
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
