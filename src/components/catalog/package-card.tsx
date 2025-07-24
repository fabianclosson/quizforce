"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnrollmentButton } from "@/components/enrollment";
import type { CertificationPackage } from "@/types/catalog";
import { PlaceholderImage } from "@/components/ui";

interface PackageCardProps {
  package: CertificationPackage;
  userEnrollments?: string[];
}

export function PackageCard({
  package: pkg,
  userEnrollments = [],
}: PackageCardProps) {
  const isFree = pkg.price_cents === 0;
  const isEnrolled = userEnrollments.includes(pkg.id);

  // Calculate totals from included certifications
  const totalExams =
    pkg.certifications?.reduce(
      (sum, cert) => sum + (cert.exam_count || 0),
      0
    ) || 0;
  const totalQuestions =
    pkg.certifications?.reduce(
      (sum, cert) => sum + (cert.total_questions || 0),
      0
    ) || 0;

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      {/* Free Badge */}
      {isFree && (
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant="secondary"
            className="bg-green-500 text-white font-semibold px-2 py-1"
          >
            FREE
          </Badge>
        </div>
      )}

      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <PlaceholderImage name={pkg.name} type="package" size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2">
              {pkg.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {pkg.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Practice Exams:
            </span>
            <span className="font-medium">{totalExams}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total Questions:
            </span>
            <span className="font-medium">{totalQuestions}</span>
          </div>

          <div className="flex justify-between items-center text-sm pt-2 border-t">
            <span className="text-gray-600 dark:text-gray-400">Price:</span>
            <span className="font-bold text-lg">
              {isFree ? "Free" : `$${(pkg.price_cents / 100).toFixed(2)}`}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={`/catalog/package/${pkg.slug}`}>View Details</a>
          </Button>

          {isEnrolled ? (
            <Button variant="secondary" size="sm" className="w-full" disabled>
              Enrolled
            </Button>
          ) : (
            <EnrollmentButton
              type="package"
              id={pkg.id}
              name={pkg.name}
              isFree={isFree}
              className="w-full"
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
