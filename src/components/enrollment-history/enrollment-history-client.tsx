"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnrollmentHistory } from "@/hooks/use-enrollment-history";
import { EnrollmentList } from "./enrollment-list";
import { EnrollmentLoadingState } from "./enrollment-loading-state";
import { EnrollmentEmptyState } from "./enrollment-empty-state";

export function EnrollmentHistoryClient() {
  const {
    data: enrollmentData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useEnrollmentHistory({
    sort_by: "enrolled_at",
    sort_order: "desc",
    limit: 50,
  });

  const enrollments = enrollmentData?.items || [];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load enrollment history.{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <EnrollmentLoadingState />;
  }

  if (enrollments.length === 0) {
    return <EnrollmentEmptyState />;
  }

  return (
    <div className="space-y-6">
      <EnrollmentList enrollments={enrollments} />
      {enrollmentData?.has_more && (
        <div className="text-center pt-6">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
