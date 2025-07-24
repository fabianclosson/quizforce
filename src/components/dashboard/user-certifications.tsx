/**
 * User Certifications Component
 *
 * Displays user's enrolled certifications with detailed information,
 * progress tracking, and practice exam access.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserCertifications } from "@/hooks/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Calendar,
  Trophy,
  Target,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getCertificationImage } from "@/lib/certification-images";

interface UserCertificationsProps {
  className?: string;
  showHeader?: boolean;
  maxItems?: number;
}

export function UserCertifications({
  className,
  showHeader = true,
  maxItems,
}: UserCertificationsProps) {
  const {
    data: certifications,
    isLoading,
    error,
    refetch,
  } = useUserCertifications();

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              My Certifications
            </h2>
            <Skeleton className="h-9 w-20" />
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        {showHeader && (
          <h2 className="text-2xl font-bold tracking-tight">
            My Certifications
          </h2>
        )}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load your certifications. Please try again.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayedCertifications = maxItems
    ? certifications?.slice(0, maxItems)
    : certifications;

  if (!displayedCertifications?.length) {
    return (
      <div className={cn("space-y-4", className)}>
        {showHeader && (
          <h2 className="text-2xl font-bold tracking-tight">
            My Certifications
          </h2>
        )}
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No Certifications Yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start your Salesforce certification journey by enrolling in
              practice exams and study materials.
            </p>
            <Button asChild>
              <Link href="/catalog">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Certifications
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string, expiresAt?: string) => {
    const isExpired = expiresAt && new Date(expiresAt) < new Date();

    if (isExpired) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    switch (status.toLowerCase()) {
      case "enrolled":
      case "in_progress":
        return (
          <Badge
            variant="default"
            className="gap-1 bg-blue-500 hover:bg-blue-600"
          >
            <Clock className="h-3 w-3" />
            {status === "enrolled" ? "Enrolled" : "In Progress"}
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="default"
            className="gap-1 bg-green-500 hover:bg-green-600"
          >
            <Trophy className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            My Certifications
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/catalog">
              <ExternalLink className="h-4 w-4 mr-1" />
              Browse More
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedCertifications.map(certification => {
          const isExpired = Boolean(
            certification.expires_at &&
              new Date(certification.expires_at) < new Date()
          );
          const daysUntilExpiry = certification.expires_at
            ? Math.ceil(
                (new Date(certification.expires_at).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;
          const isExpiringSoon =
            daysUntilExpiry !== null &&
            daysUntilExpiry <= 30 &&
            daysUntilExpiry > 0;

          const certificationImage = getCertificationImage(
            certification.certification_name
          );

          return (
            <Card
              key={certification.id}
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                isExpired && "opacity-75",
                isExpiringSoon &&
                  "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20"
              )}
            >
              <CardHeader className="pb-3">
                {/* Certification badge image at the top */}
                <div className="flex items-center justify-center mb-4 h-20 w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                  {certificationImage ? (
                    <div className="relative w-16 h-16">
                      <Image
                        src={certificationImage}
                        alt={certification.certification_name}
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
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-base leading-tight line-clamp-2">
                      {certification.certification_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getDifficultyColor(certification.difficulty_level)
                        )}
                      />
                      <span className="capitalize">
                        {certification.difficulty_level}
                      </span>
                      {certification.is_premium && (
                        <Badge variant="outline" className="text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(
                    certification.status,
                    certification.expires_at || undefined
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best Score</span>
                    <span className="font-medium">
                      {certification.score
                        ? `${certification.score}%`
                        : "Not started"}
                    </span>
                  </div>
                  <Progress value={certification.score || 0} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {certification.attempts_count} of{" "}
                      {certification.max_attempts} attempts
                    </span>
                    <span>Pass: {certification.passing_score}%</span>
                  </div>
                </div>

                {/* Expiry Warning */}
                {isExpiringSoon && (
                  <Alert className="py-2 px-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Expires in {daysUntilExpiry} day
                      {daysUntilExpiry !== 1 ? "s" : ""}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    asChild
                    className="flex-1"
                    size="sm"
                    disabled={isExpired}
                  >
                    <Link href={`/exam/${certification.certification_slug}`}>
                      <Target className="h-4 w-4 mr-1" />
                      {certification.score
                        ? "Practice Again"
                        : "Start Practice"}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/catalog/certification/${certification.certification_slug}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Enrollment & Activity Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Enrolled{" "}
                      {formatDistanceToNow(
                        new Date(certification.enrolled_at),
                        { addSuffix: true }
                      )}
                    </span>
                  </div>
                  {certification.completion_date && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {maxItems && certifications && certifications.length > maxItems && (
        <div className="text-center pt-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/certifications">
              View All {certifications.length} Certifications
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
