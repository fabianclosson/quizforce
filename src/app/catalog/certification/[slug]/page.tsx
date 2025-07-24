"use client";

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Star,
  Clock,
  Award,
  CheckCircle,
  PlayCircle,
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
import { useCertification } from "@/hooks/use-catalog";
import { EnrollmentButton } from "@/components/enrollment";
import { formatPrice } from "@/lib/utils";

interface CertificationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CertificationPage({ params }: CertificationPageProps) {
  const [slug, setSlug] = React.useState<string>("");

  React.useEffect(() => {
    params.then(resolvedParams => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  const { data: certification, isLoading, error } = useCertification(slug);

  if (isLoading) {
    return <CertificationDetailSkeleton />;
  }

  if (error || !certification) {
    notFound();
  }

  const isFree = certification.price_cents === 0;

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
                <Badge variant="secondary">Certification</Badge>
                <Badge variant="outline">{certification.category?.name}</Badge>
                {certification.is_featured && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                {certification.name}
              </h1>

              {certification.description && (
                <p className="text-lg text-muted-foreground">
                  {certification.description}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {certification.exam_count}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Practice Exams
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {certification.total_questions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Questions
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">
                    Months Access
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">
                    Real Questions
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Description */}
            {certification.detailed_description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Certification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p>{certification.detailed_description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Practice Exams Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Practice Exams
                </CardTitle>
                <CardDescription>
                  {certification.exam_count} comprehensive practice exams to
                  prepare you for the real certification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: certification.exam_count }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Practice Exam {i + 1}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ~
                            {Math.floor(
                              certification.total_questions /
                                certification.exam_count
                            )}{" "}
                            questions
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You&apos;ll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {[
                    "Master all exam objectives and topics",
                    "Practice with real certification questions",
                    "Understand complex scenarios and use cases",
                    "Build confidence for the actual exam",
                    "Get detailed explanations for all answers",
                    "Track your progress and improvement",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {isFree ? "Free Access" : "Premium Access"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {formatPrice(certification.price_cents)}
                    </div>
                    {!isFree && (
                      <div className="text-sm text-muted-foreground">
                        One-time payment
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Practice Exams</span>
                      <span className="font-medium">
                        {certification.exam_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Questions</span>
                      <span className="font-medium">
                        {certification.total_questions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access Duration</span>
                      <span className="font-medium">12 months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Category</span>
                      <span className="font-medium">
                        {certification.category?.name}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <EnrollmentButton
                    type="certification"
                    id={certification.id}
                    name={certification.name}
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
                    Why Choose QuizForce?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Updated exam content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Detailed explanations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Community support</span>
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

function CertificationDetailSkeleton() {
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
