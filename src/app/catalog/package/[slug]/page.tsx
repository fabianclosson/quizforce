"use client";

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Users,
  Star,
  Clock,
  Award,
  CheckCircle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { usePackage } from "@/hooks/use-catalog";
import { EnrollmentButton } from "@/components/enrollment";
import { formatPrice } from "@/lib/utils";

interface PackagePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PackagePage({ params }: PackagePageProps) {
  const [slug, setSlug] = React.useState<string>("");

  React.useEffect(() => {
    params.then(resolvedParams => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  const { data: packageData, isLoading, error } = usePackage(slug);

  if (isLoading) {
    return <PackageDetailSkeleton />;
  }

  if (error || !packageData) {
    notFound();
  }

  const isFree = packageData.price_cents === 0;
  const totalExams =
    packageData.certifications?.reduce(
      (sum, cert) => sum + (cert.exam_count || 0),
      0
    ) || 0;
  const totalQuestions =
    packageData.certifications?.reduce(
      (sum, cert) => sum + (cert.total_questions || 0),
      0
    ) || 0;

  // Calculate savings if individual prices were available
  const originalPrice =
    packageData.certifications?.reduce(
      (sum, cert) => sum + (cert.price_cents || 0),
      0
    ) || 0;
  const savings = originalPrice - packageData.price_cents;
  const savingsPercentage =
    originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/catalog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Package</Badge>
                {packageData.is_featured && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    Featured
                  </Badge>
                )}
                {savingsPercentage > 0 && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Save {savingsPercentage}%
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                {packageData.name}
              </h1>

              {packageData.description && (
                <p className="text-lg text-muted-foreground">
                  {packageData.description}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {packageData.certifications?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Certifications
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{totalExams}</div>
                  <div className="text-sm text-muted-foreground">
                    Practice Exams
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Questions
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {packageData.valid_months || 12}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Months Access
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Description */}
            {packageData.detailed_description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Package</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p>{packageData.detailed_description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Included Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Included Certifications
                </CardTitle>
                <CardDescription>
                  {packageData.certifications?.length || 0} comprehensive
                  certification practice bundles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packageData.certifications?.map(certification => (
                    <div
                      key={certification.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{certification.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{certification.exam_count} exams</span>
                            <span>
                              {certification.total_questions} questions
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {certification.category?.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {certification.price_cents > 0 ? (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(certification.price_cents)}
                          </div>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Package Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Package Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {[
                    "Access to all included certification practice exams",
                    "Comprehensive question banks with detailed explanations",
                    "Progress tracking across all certifications",
                    "Career path guidance and recommendations",
                    "Priority customer support",
                    "Regular content updates and new questions",
                    "Mobile-friendly practice on any device",
                    "Performance analytics and weak area identification",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Value Comparison */}
            {originalPrice > packageData.price_cents && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Value Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <span className="font-medium">Individual Purchases</span>
                      <span className="text-lg line-through text-muted-foreground">
                        ${(originalPrice / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <span className="font-medium text-green-700 dark:text-green-300">
                        Package Price
                      </span>
                      <span className="text-lg font-bold text-green-700 dark:text-green-300">
                        {formatPrice(packageData.price_cents)}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          Save ${(savings / 100).toFixed(2)} (
                          {savingsPercentage}%)
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Compared to buying individually
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {isFree ? "Free Package" : "Premium Package"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {formatPrice(packageData.price_cents)}
                    </div>
                    {!isFree && (
                      <div className="text-sm text-muted-foreground">
                        One-time payment
                      </div>
                    )}
                    {savingsPercentage > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        Save {savingsPercentage}% vs individual
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Certifications</span>
                      <span className="font-medium">
                        {packageData.certifications?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Practice Exams</span>
                      <span className="font-medium">{totalExams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Questions</span>
                      <span className="font-medium">{totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access Duration</span>
                      <span className="font-medium">
                        {packageData.valid_months || 12} months
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <EnrollmentButton
                    type="package"
                    id={packageData.id}
                    name={packageData.name}
                    isFree={isFree}
                    className="w-full"
                    size="lg"
                  />

                  {!isFree && (
                    <div className="text-center text-xs text-muted-foreground">
                      30-day money-back guarantee
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Why Choose This Package?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Complete career path coverage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Significant cost savings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Comprehensive preparation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span>Career advancement focused</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PackageDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2" />
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mx-auto" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-24 mx-auto" />
                <Skeleton className="h-px w-full" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
