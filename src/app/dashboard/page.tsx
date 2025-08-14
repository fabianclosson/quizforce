"use client";

import { useAuth } from "@/contexts/auth-context";
import { useUserEnrollments } from "@/hooks/use-enrollment";
import { useExamsInProgress } from "@/hooks/use-dashboard";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Trophy,
  Clock,
  Target,
  Play,
  BarChart3,
  PauseCircle,
  StepForward,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCertificationImage } from "@/lib/certification-images";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useUserEnrollments();
  const {
    data: examsInProgress,
    isLoading: examsLoading,
    error: examsError,
  } = useExamsInProgress();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <DashboardLoadingState />;
  }

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <p>Please sign in to access your dashboard.</p>
            <div className="flex gap-2">
              <Link href="/auth/signin">
                <Button size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get user's first name for personalization
  const firstName =
    user.user_metadata?.first_name || user.email?.split("@")[0] || "there";

  // Check if user has enrollments and exams in progress
  const hasEnrollments =
    enrollmentsData &&
    enrollmentsData.enrollments &&
    enrollmentsData.enrollments.length > 0;
  const hasExamsInProgress = examsInProgress && examsInProgress.length > 0;

  // Check if errors are authentication-related (should show empty state instead of error)
  const isExamsAuthError =
    examsError &&
    (examsError.message?.includes("not authenticated") ||
      examsError.message?.includes("401") ||
      examsError.message?.includes("Auth session missing") ||
      examsError.message?.includes("Authentication required"));
  const isEnrollmentsAuthError =
    enrollmentsError &&
    (enrollmentsError.message?.includes("not authenticated") ||
      enrollmentsError.message?.includes("401") ||
      enrollmentsError.message?.includes("Auth session missing") ||
      enrollmentsError.message?.includes("Authentication required"));

  // Show authentication error state if both enrollments and exams have auth errors
  if (
    (isEnrollmentsAuthError && enrollmentsError) ||
    (isExamsAuthError && examsError)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <p>
              Your session has expired. Please sign in again to access your
              dashboard.
            </p>
            <div className="flex gap-2">
              <Link href="/auth/signin">
                <Button size="sm">Sign In Again</Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Ready to advance your Salesforce certification journey?
          </p>
        </div>
      </div>

      {/* Loading state for practice exams in progress */}
      {examsLoading && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Your Practice Exams in Progress
          </h2>
          <Card className="border-dashed border-gray-300">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <tbody className="divide-y divide-dashed divide-gray-300">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <Skeleton className="h-5 w-5 mr-3" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="flex-1 mr-3">
                              <Skeleton className="h-2 w-full" />
                            </div>
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end items-center">
                            <Skeleton className="h-9 w-32" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error state for exams in progress - only show for non-auth errors */}
      {examsError && !isExamsAuthError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your exams in progress. Please try refreshing the
            page.
          </AlertDescription>
        </Alert>
      )}

      {/* Your Practice Exams in Progress Section */}
      {!examsLoading && !examsError && hasExamsInProgress && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Your Practice Exams in Progress
          </h2>
          <Card className="border-dashed border-gray-300">
            <CardContent className="p-6 space-y-4">
              {examsInProgress.map(exam => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300"
                >
                  <div className="flex items-center space-x-3">
                    <PauseCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">
                        {exam.certification_name}
                      </div>
                      {exam.category && exam.category !== "General" && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {exam.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Progress Bar */}
                    <div className="flex items-center space-x-2 min-w-[120px]">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${exam.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[3rem]">
                        {exam.progress_percentage}%
                      </span>
                    </div>

                    {/* Continue Button */}
                    <Button
                      asChild
                      size="sm"
                      className="bg-black text-white hover:bg-blue-600 hover:text-white"
                    >
                      <Link
                        href={`/exam/${exam.practice_exam_id}?attempt=${exam.id}`}
                      >
                        <StepForward className="mr-2 h-4 w-4" />
                        Continue Practice
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state for practice exams in progress - show for no data OR auth errors */}
      {!examsLoading &&
        (!examsError || isExamsAuthError) &&
        !hasExamsInProgress && (
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6 text-gray-600" />
                No Practice Exams in Progress
              </CardTitle>
              <CardDescription className="text-base">
                You don&apos;t have any practice exams currently in progress. Visit
                the practice exams section to start one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="hover:bg-white hover:text-black hover:border-black transition-all duration-300 hover:shadow-lg"
                >
                  <Link href="/practice-exams">
                    Start Practice Exam
                    <Play className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/catalog">Browse Catalog</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Loading state for enrollments */}
      {enrollmentsLoading && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Your Enrolled Certifications
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 ml-2" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="pt-2">
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error state for enrollments - only show for non-auth errors */}
      {enrollmentsError && !isEnrollmentsAuthError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your enrollments. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Show enrollments if user has them */}
      {!enrollmentsLoading &&
        (!enrollmentsError || isEnrollmentsAuthError) &&
        hasEnrollments && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Your Enrolled Certifications
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrollmentsData.enrollments.map(enrollment => {
                const certificationImage = getCertificationImage(
                  enrollment.certification.name
                );

                return (
                  <Card
                    key={enrollment.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      {/* Certification badge image at the top */}
                      <div className="flex items-center justify-center mb-4 h-20 w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                        {certificationImage ? (
                          <div className="relative w-16 h-16">
                            <Image
                              src={certificationImage}
                              alt={enrollment.certification.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-contain"
                              priority={false}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {enrollment.certification.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {
                              enrollment.certification.certification_categories
                                ?.name
                            }
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="h-4 w-4" />
                          <span>
                            {enrollment.certification.practice_exams?.length ||
                              0}{" "}
                            Practice Exams
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expires{" "}
                            {new Date(
                              enrollment.expires_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="pt-2">
                          <Button
                            asChild
                            className="w-full hover:bg-blue-600 hover:border-blue-600"
                            size="sm"
                          >
                            <Link href="/practice-exams">
                              View Practice Exams
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      {/* No Certifications Message - Only show if we're sure there are no enrollments AND no exams in progress */}
      {!enrollmentsLoading &&
        (!enrollmentsError || isEnrollmentsAuthError) &&
        !hasEnrollments &&
        !examsLoading &&
        (!examsError || isExamsAuthError) &&
        !hasExamsInProgress && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                No Certifications Enrolled Yet
              </CardTitle>
              <CardDescription className="text-base">
                Start your Salesforce certification journey by exploring our
                comprehensive catalog of practice exams and study materials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="hover:bg-white hover:text-black hover:border-black transition-all duration-300 hover:shadow-lg"
                >
                  <Link href="/catalog">
                    Browse Catalog
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/community">Join Community</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
