"use client";

import React, { useState } from "react";
import { CertificationGroup } from "./certification-group";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  GroupedPracticeExams,
  PracticeExamSortOptions,
} from "@/types/practice-exams";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";

interface PracticeExamListProps {
  groupedExams: GroupedPracticeExams[];
  onStartExam?: (examId: string) => void;
  onContinueExam?: (examId: string) => void;
  onRestartExam?: (examId: string) => void;
  onViewResults?: (examId: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  totalCount?: number;
}

export function PracticeExamList({
  groupedExams,
  onStartExam,
  onContinueExam,
  onRestartExam,
  onViewResults,
  loading = false,
  error,
  onRetry,
  totalCount = 0,
}: PracticeExamListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "enrolled" | "free" | "in_progress" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<PracticeExamSortOptions>({
    field: "name",
    direction: "asc",
  });

  // Filter and search logic
  const filteredGroups = groupedExams.filter(group => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesCertification = group.certification.name
        .toLowerCase()
        .includes(searchLower);
      const matchesCategory = group.certification.category.name
        .toLowerCase()
        .includes(searchLower);
      const matchesExam = group.exams.some(
        exam =>
          exam.name.toLowerCase().includes(searchLower) ||
          (exam.description &&
            exam.description.toLowerCase().includes(searchLower))
      );

      if (!matchesCertification && !matchesCategory && !matchesExam) {
        return false;
      }
    }

    // Status filter
    switch (statusFilter) {
      case "enrolled":
        return group.is_enrolled;
      case "free":
        return group.certification.price_cents === 0;
      case "in_progress":
        return group.exams.some(exam => exam.status === "in_progress");
      case "completed":
        return group.exams.some(exam => exam.status === "completed");
      default:
        return true;
    }
  });

  // Calculate summary stats
  const totalExams = filteredGroups.reduce(
    (sum, group) => sum + group.exams.length,
    0
  );
  const enrolledCertifications = filteredGroups.filter(
    group => group.is_enrolled
  ).length;
  const completedExams = filteredGroups.reduce(
    (sum, group) =>
      sum + group.exams.filter(exam => exam.status === "completed").length,
    0
  );

  const getSortLabel = () => {
    const fieldLabels = {
      name: "Name",
      status: "Status",
      score: "Score",
      updated_at: "Updated",
      category: "Category",
    };
    return `${fieldLabels[sortBy.field]} ${sortBy.direction === "asc" ? "↑" : "↓"}`;
  };

  const getStatusFilterLabel = () => {
    const labels = {
      all: "All Certifications",
      enrolled: "Enrolled Only",
      free: "Free Only",
      in_progress: "In Progress",
      completed: "Completed",
    };
    return labels[statusFilter];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded animate-pulse w-48" />
            <div className="h-4 bg-muted rounded animate-pulse w-32" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded animate-pulse w-64" />
            <div className="h-10 bg-muted rounded animate-pulse w-32" />
            <div className="h-10 bg-muted rounded animate-pulse w-32" />
          </div>
        </div>

        {/* Loading groups */}
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 bg-muted rounded animate-pulse w-48" />
                <div className="h-6 bg-muted rounded animate-pulse w-20" />
                <div className="h-6 bg-muted rounded animate-pulse w-16" />
              </div>
              <div className="h-4 bg-muted rounded animate-pulse w-96" />
              <div className="h-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error !== null && error !== undefined) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Failed to Load Practice Exams
          </h3>
          <p className="text-muted-foreground mb-4">
            {error ||
              "An unexpected error occurred while loading the practice exams."}
          </p>
          <div className="flex gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                Try Again
              </Button>
            )}
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Practice Exams</h2>
          <p className="text-muted-foreground">
            {totalExams} exam{totalExams !== 1 ? "s" : ""} across{" "}
            {filteredGroups.length} certification
            {filteredGroups.length !== 1 ? "s" : ""}
            {enrolledCertifications > 0 &&
              ` • ${enrolledCertifications} enrolled`}
            {completedExams > 0 && ` • ${completedExams} completed`}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search exams and certifications..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="w-4 h-4 mr-2" />
                {getStatusFilterLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Certifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("enrolled")}>
                Enrolled Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("free")}>
                Free Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                {sortBy.direction === "asc" ? (
                  <SortAsc className="w-4 h-4 mr-2" />
                ) : (
                  <SortDesc className="w-4 h-4 mr-2" />
                )}
                {getSortLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setSortBy({ field: "name", direction: "asc" })}
              >
                Name A-Z
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy({ field: "name", direction: "desc" })}
              >
                Name Z-A
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy({ field: "status", direction: "asc" })}
              >
                Status (Progress First)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy({ field: "score", direction: "desc" })}
              >
                Best Score (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setSortBy({ field: "updated_at", direction: "desc" })
                }
              >
                Recently Updated
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto max-w-sm">
            <h3 className="text-lg font-semibold">No Practice Exams Found</h3>
            <p className="text-muted-foreground mt-2">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search terms or filters."
                : "There are no practice exams available at this time."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map(group => (
            <CertificationGroup
              key={group.certification.id}
              group={group}
              onStartExam={onStartExam}
              onContinueExam={onContinueExam}
              onRestartExam={onRestartExam}
              onViewResults={onViewResults}
            />
          ))}
        </div>
      )}
    </div>
  );
}
