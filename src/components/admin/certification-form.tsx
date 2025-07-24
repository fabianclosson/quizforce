"use client";

import { useState, useEffect } from "react";
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
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";




// Validation schema for certification forms
const certificationFormSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().min(1, "Description is required"),
  detailed_description: z.string().optional(),
  price_cents: z.number().min(0, "Price must be non-negative"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CertificationFormValues = z.infer<typeof certificationFormSchema>;

interface CertificationFormProps {
  certification?: CertificationFormValues & {
    id: string;
    detailed_description?: string;
  };
  onSave: (data: CertificationFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CertificationForm({
  certification,
  onSave,
  onCancel,
  isLoading = false,
}: CertificationFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationFormSchema),
    defaultValues: {
      name: certification?.name || "",
      slug: certification?.slug || "",
      description: certification?.description || "",
      detailed_description: certification?.detailed_description || "",
      price_cents: certification?.price_cents || 0,
      is_active: certification?.is_active ?? true,
      is_featured: certification?.is_featured ?? false,
      image_url: certification?.image_url || "",
    },
  });

  const watchedName = form.watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !certification) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchedName, certification, form]);

  const onSubmit = async (values: CertificationFormValues) => {
    if (submitting) return; // Prevent double submission

    try {
      setSubmitting(true);
      await onSave(values);
      toast.success(
        certification
          ? "Certification updated successfully"
          : "Certification created successfully"
      );
    } catch (error) {
      console.error("Error saving certification:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save certification"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>
              {certification
                ? "Edit Certification"
                : "Create New Certification"}
            </CardTitle>
            <CardDescription>
              {certification
                ? "Update certification details and settings"
                : "Add a new certification to the catalog"}
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
                    <FormLabel>Certification Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Salesforce Administrator"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., salesforce-administrator"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Used in the certification URL. Auto-generated from name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description shown in catalog and at the top of the details page..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This appears in the catalog cards and at the top of the
                    certification details page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detailed Description */}
            <FormField
              control={form.control}
              name="detailed_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comprehensive description with detailed information about the certification, requirements, what students will learn, etc..."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This appears on the certification details page below the
                    title. You can use line breaks for formatting.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing and Category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price_cents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="e.g., 99.00"
                          className="pl-7"
                          {...field}
                          onChange={e =>
                            field.onChange(
                              Math.round(
                                parseFloat(e.target.value || "0") * 100
                              )
                            )
                          }
                          value={
                            field.value ? (field.value / 100).toFixed(2) : ""
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter price in dollars. e.g., 99.00 for $99.00
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image URL */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.png"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional image URL for the certification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Certification is visible to users
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

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>
                        Show in featured section
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || isLoading}>
                {submitting ? (
                  <>{certification ? "Updating..." : "Creating..."}</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {certification
                      ? "Update Certification"
                      : "Create Certification"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
