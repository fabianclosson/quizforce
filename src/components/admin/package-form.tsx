"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Package,
  Save,
  ArrowLeft,
  DollarSign,

  CheckCircle,
  TrendingDown,
} from "lucide-react";
import {
  Certification,
  PackageFormData,
  AdminCertificationPackage,
} from "@/types";
import { toast } from "sonner";

const packageFormSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  slug: z
    .string()
    .min(1, "Package slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  detailed_description: z.string().optional(),
  price_cents: z.number().min(0, "Price must be non-negative"),
  discount_percentage: z
    .number()
    .min(0)
    .max(100, "Discount must be between 0 and 100"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  valid_months: z.number().min(1, "Valid months must be at least 1"),
  sort_order: z.number(),
  certification_ids: z
    .array(z.string().uuid())
    .min(1, "At least one certification must be selected"),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

interface PackageFormProps {
  packageData?: AdminCertificationPackage;
  isEdit?: boolean;
}

export function PackageForm({ packageData, isEdit = false }: PackageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loadingCertifications, setLoadingCertifications] = useState(true);
  const [selectedCertifications, setSelectedCertifications] = useState<
    Certification[]
  >([]);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: packageData?.name || "",
      slug: packageData?.slug || "",
      description: packageData?.description || "",
      detailed_description: packageData?.detailed_description || "",
      price_cents: packageData?.price_cents || 0,
      discount_percentage: packageData?.discount_percentage || 0,
      is_active: packageData?.is_active ?? true,
      is_featured: packageData?.is_featured ?? false,
      valid_months: packageData?.valid_months || 12,
      sort_order: packageData?.sort_order || 0,
      certification_ids:
        packageData?.certifications?.map(cert => cert.id) || [],
    },
  });

  const watchedCertificationIds = form.watch("certification_ids");
  const watchedName = form.watch("name");
  const watchedPriceCents = form.watch("price_cents");

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !isEdit) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchedName, isEdit, form]);

  // Update selected certifications when IDs change
  useEffect(() => {
    const selected = certifications.filter(cert =>
      watchedCertificationIds.includes(cert.id)
    );
    setSelectedCertifications(selected);
  }, [watchedCertificationIds, certifications]);

  // Fetch available certifications
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoadingCertifications(true);
        const response = await fetch("/api/admin/certifications");
        if (!response.ok) {
          throw new Error("Failed to fetch certifications");
        }
        const data = await response.json();
        setCertifications(data.certifications);
      } catch (error) {
        console.error("Error fetching certifications:", error);
        toast.error("Failed to load certifications");
      } finally {
        setLoadingCertifications(false);
      }
    };

    fetchCertifications();
  }, []);

  const calculatePricing = () => {
    const individualTotal = selectedCertifications.reduce(
      (sum, cert) => sum + (cert.price_cents || 0),
      0
    );
    const packagePrice = watchedPriceCents || 0;
    const savings = Math.max(0, individualTotal - packagePrice);
    const savingsPercentage =
      individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0;

    return {
      individualTotal,
      packagePrice,
      savings,
      savingsPercentage,
    };
  };

  const pricing = calculatePricing();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const onSubmit = async (values: PackageFormValues) => {
    try {
      setLoading(true);

      const url = isEdit
        ? `/api/admin/packages/${packageData?.id}`
        : "/api/admin/packages";

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
        throw new Error(errorData.error || "Failed to save package");
      }

      const data = await response.json();

      toast.success(
        isEdit ? "Package updated successfully" : "Package created successfully"
      );

      if (isEdit) {
        router.push(`/admin/packages/${packageData?.id}`);
      } else {
        router.push("/admin/packages");
      }
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save package"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCertificationToggle = (
    certificationId: string,
    checked: boolean
  ) => {
    const currentIds = form.getValues("certification_ids");

    if (checked) {
      form.setValue("certification_ids", [...currentIds, certificationId]);
    } else {
      form.setValue(
        "certification_ids",
        currentIds.filter(id => id !== certificationId)
      );
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Package" : "Create Package"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update package details and certifications"
              : "Create a new certification package with multiple certifications"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Basic Information */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Salesforce Admin Bundle"
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
                              placeholder="e.g., salesforce-admin-bundle"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Used in the package URL. Auto-generated from name.
                          </FormDescription>
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
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description for package listings"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="detailed_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description for the package detail page"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pricing */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="price_cents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="99.99"
                              {...field}
                              onChange={e =>
                                field.onChange(
                                  Math.round(
                                    parseFloat(e.target.value || "0") * 100
                                  )
                                )
                              }
                              value={
                                field.value
                                  ? (field.value / 100).toFixed(2)
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discount_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="20"
                              {...field}
                              onChange={e =>
                                field.onChange(parseInt(e.target.value || "0"))
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valid_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Duration (months)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="12"
                              {...field}
                              onChange={e =>
                                field.onChange(parseInt(e.target.value || "1"))
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Settings */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Package is visible to users
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
                            <FormLabel className="text-base">
                              Featured
                            </FormLabel>
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

                    <FormField
                      control={form.control}
                      name="sort_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort Order</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={e =>
                                field.onChange(parseInt(e.target.value || "0"))
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Lower numbers appear first
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Certifications Selection */}
                  <FormField
                    control={form.control}
                    name="certification_ids"
                    render={() => (
                      <FormItem>
                        <FormLabel>Included Certifications</FormLabel>
                        <FormDescription>
                          Select the certifications to include in this package
                        </FormDescription>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {certifications.map(certification => (
                            <FormField
                              key={certification.id}
                              control={form.control}
                              name="certification_ids"
                              render={({ field }) => (
                                <FormItem
                                  key={certification.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        certification.id
                                      )}
                                      onCheckedChange={checked =>
                                        handleCertificationToggle(
                                          certification.id,
                                          checked as boolean
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <div className="flex-1 space-y-1">
                                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      {certification.name}
                                    </FormLabel>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {formatPrice(certification.price_cents)}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {certification.exam_count} exams
                                      </span>
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          {isEdit ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {isEdit ? "Update Package" : "Create Package"}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Individual Total:
                  </span>
                  <span className="font-medium">
                    {formatPrice(pricing.individualTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Package Price:
                  </span>
                  <span className="font-medium">
                    {formatPrice(pricing.packagePrice)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Savings:</span>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatPrice(pricing.savings)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({pricing.savingsPercentage}% off)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {pricing.savings > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Great savings package!
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Certifications */}
          {selectedCertifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Selected Certifications ({selectedCertifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCertifications.map(cert => (
                    <div
                      key={cert.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-sm">{cert.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {cert.exam_count} exams
                        </div>
                      </div>
                      <Badge variant="outline">
                        {formatPrice(cert.price_cents)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
