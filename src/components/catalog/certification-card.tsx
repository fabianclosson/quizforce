"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Users,
  ArrowRight,
  Star,
  DollarSign,
  Award,
  CheckCircle,
  Trophy,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Certification } from "@/types/catalog";
import { cn, formatPrice } from "@/lib/utils";
import { createTouchCard, touchSpacing } from "@/lib/touch-utils";
import { EnrollmentButton } from "@/components/enrollment/enrollment-button";
import { PlaceholderImage } from "@/components/ui";
import { getCertificationImage } from "@/lib/certification-images";
import Image from "next/image";

interface CertificationCardProps {
  certification: Certification;
  userEnrollments?: string[];
}

export function CertificationCard({
  certification,
  userEnrollments = [],
}: CertificationCardProps) {
  const isFree = certification.price_cents === 0;
  const isEnrolled = userEnrollments.includes(certification.id);

  // Get the actual certification badge image
  const certificationImage = getCertificationImage(certification.name);

  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      {/* Badge at top-right */}
      <div className="absolute top-3 right-3 z-10">
        {isFree ? (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            Free
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Premium
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        {/* Certification badge image at the top */}
        <div className="flex items-center justify-center mb-4 h-20 w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
          {certificationImage ? (
            <div className="relative w-16 h-16">
              <Image
                src={certificationImage}
                alt={certification.name}
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
              {certification.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {certification.category?.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{certification.exam_count || 0} Practice Exams</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{certification.total_questions || 0} Total Questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            <span>
              {isFree ? "$ Free" : formatPrice(certification.price_cents)}
            </span>
          </div>
          <div className="pt-2 space-y-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/catalog/certifications/${certification.id}`}>
                View Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {isEnrolled ? (
              <Button variant="secondary" size="sm" className="w-full" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                Enrolled
              </Button>
            ) : (
              <EnrollmentButton
                type="certification"
                id={certification.id}
                name={certification.name}
                isFree={isFree}
                size="sm"
                className="w-full"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
