"use client";

import React from 'react';
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useUserEnrollments } from "@/hooks/use-enrollment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  PlayCircle,
  Target,
  ArrowRight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Trophy,
  AlertCircle,
  Loader2,
  StepForward,
  BookOpenCheck,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  RotateCcw,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Play,

} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CertificationImage } from "@/components/ui/optimized-image";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { generateAltText } from "@/lib/image-seo";
import { formatDistance } from "date-fns";

export function PracticeExamsClient() {
  const { user, loading: authLoading } = useAuth();
  const { data: enrollmentsData, isLoading, error } = useUserEnrollments();

  // Loading state - only show loading if still checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-300">
              Loading practice exams...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Practice Exams
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Sign in to access your enrolled practice exams
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Sign In Required</CardTitle>
            <CardDescription className="text-lg">
              Please sign in to access your practice exams
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have any certifications yet?{" "}
              <Link
                href="/catalog"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                Browse Catalog
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state for authenticated user while fetching enrollments
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-300">
              Loading your practice exams...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Practice Exams
          </h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">
              Unable to Load Practice Exams
            </CardTitle>
            <CardDescription className="text-lg">
              {error.message ||
                "Something went wrong loading your practice exams"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No enrollments
  if (
    !enrollmentsData?.enrollments ||
    enrollmentsData.enrollments.length === 0
  ) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Practice Exams
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get started with your first certification
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl">
              No Enrolled Certifications
            </CardTitle>
            <CardDescription className="text-lg">
              Start your certification journey by enrolling in practice exams
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/catalog" className="flex items-center space-x-2">
                <span>
                  Choose from our comprehensive catalog of Salesforce
                  certification practice exams
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enrolled certifications list
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Practice Exams
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Continue your certification journey
        </p>
      </div>

      <div className="grid gap-8">
        {enrollmentsData.enrollments.map(enrollment => (
          <Card
            key={enrollment.id}
            className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {enrollment.certification.certification_categories?.name ||
                      "Certification"}
                  </Badge>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {enrollment.certification.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enrolled:{" "}
                    {formatDistance(
                      new Date(enrollment.enrolled_at),
                      new Date(),
                      { addSuffix: true }
                    )}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-gray-500 dark:text-gray-400"
                >
                  {new Date(enrollment.expires_at) > new Date()
                    ? `Expires in ${formatDistance(new Date(enrollment.expires_at), new Date())}`
                    : "Expired"}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Available Exams</h3>
                {enrollment.certification.practice_exams.length > 0 ? (
                  <div className="space-y-3">
                    {enrollment.certification.practice_exams.map(exam => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <BookOpenCheck className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <span className="font-medium">{exam.name}</span>
                            <div className="flex items-center space-x-4 mt-1">
                              {/* Best Score Display */}
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">
                                  Best Score:{" "}
                                </span>
                                {exam.best_score !== undefined ? (
                                  <span
                                    className={`font-semibold ${
                                      exam.best_score_passed
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {exam.best_score}% (
                                    {exam.best_score_passed ? "Pass" : "Fail"})
                                  </span>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-500">
                                    N/A
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Dynamic button based on exam attempt status */}
                        {(() => {
                          const status = exam.attempt_status || "start";

                          // For in-progress exams, show both Continue and Start buttons
                          if (status === "continue") {
                            return (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  asChild
                                  className="min-w-fit inline-flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white"
                                >
                                  <Link
                                    href={`/exam/${exam.id}?attempt=${exam.current_attempt_id}`}
                                  >
                                    <StepForward className="h-4 w-4 mr-2" />
                                    Continue Practice
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="min-w-fit inline-flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white"
                                >
                                  <Link href={`/exam/${exam.id}?restart=true`}>
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Start Exam
                                  </Link>
                                </Button>
                              </div>
                            );
                          }

                          // For other statuses, show single button
                          const buttonText = "Start Exam";
                          const ButtonIcon = PlayCircle;
                          const href =
                            status === "start"
                              ? `/exam/${exam.id}`
                              : `/exam/${exam.id}?restart=true`;

                          return (
                            <Button
                              size="sm"
                              asChild
                              className="min-w-fit inline-flex items-center justify-center bg-black text-white hover:bg-blue-600 hover:text-white"
                            >
                              <Link href={href}>
                                <ButtonIcon className="h-4 w-4 mr-2" />
                                {buttonText}
                              </Link>
                            </Button>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No practice exams available for this certification yet.
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
