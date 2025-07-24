"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui";
import {
  Star,
  BookOpen,
  Clock,
  Users,
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type {
  Certification,
  CertificationPackage,
  PaginationInfo,
} from "@/types/catalog";
import { CertificationCard } from "./certification-card";
import { PackageCard } from "./package-card";
import { useUserEnrollments } from "@/hooks/use-enrollment";
import { useAuth } from "@/contexts/auth-context";

interface CatalogGridProps {
  certifications: Certification[];
  packages: CertificationPackage[];
  isLoading: boolean;
  viewMode?: "grid" | "list";
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function CatalogGrid({
  certifications,
  packages,
  isLoading,
  viewMode = "grid",
  pagination,
  onPageChange,
}: CatalogGridProps) {
  // Get auth state
  const { user, loading: authLoading } = useAuth();

  // Get user enrollments to show enrollment status
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useUserEnrollments();

  // Extract enrolled certification and package IDs
  // Only show enrolled state if we have valid enrollment data and user is authenticated
  const enrolledCertificationIds =
    user && enrollmentsData?.enrollments
      ? enrollmentsData.enrollments.map(e => e.certification.id)
      : [];

  const enrolledPackageIds =
    user && enrollmentsData?.enrollments
      ? enrollmentsData.enrollments
          .filter(e => e.package_id)
          .map(e => e.package_id!)
          .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates
      : [];

  // Show loading state if auth or enrollments are loading
  const shouldShowLoading = isLoading || (user && enrollmentsLoading);

  // Loading skeleton
  if (shouldShowLoading) {
    return (
      <div
        className={`grid gap-4 md:gap-6 ${
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        }`}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // No results
  if (certifications.length === 0 && packages.length === 0) {
    return (
      <Card className="p-6 md:p-8 text-center">
        <CardContent className="pt-6">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
            Try adjusting your search terms or filters to find what you&apos;re
            looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Grid */}
      <div
        className={`grid gap-4 md:gap-6 ${
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1 max-w-4xl mx-auto"
        }`}
      >
        {/* Render Certifications */}
        {certifications.map(cert => (
          <CertificationCard
            key={cert.id}
            certification={cert}
            userEnrollments={enrolledCertificationIds}
          />
        ))}

        {/* Render Packages */}
        {packages.map(pkg => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            userEnrollments={enrolledPackageIds}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-2 mt-8">
          {/* Mobile pagination - simplified */}
          <div className="flex items-center space-x-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="min-h-12 px-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>

            <div className="flex items-center px-3 py-2 text-sm font-medium bg-muted rounded-md">
              {pagination.page} of {pagination.totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="min-h-12 px-4"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Desktop pagination - full */}
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="min-h-10"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = i + Math.max(1, pagination.page - 2);
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === pagination.page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="min-h-10 min-w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="min-h-10"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Results info */}
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
        </div>
      )}
    </div>
  );
}
