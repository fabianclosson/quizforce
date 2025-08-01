"use client";

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Users, Target } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui";
import { getCertificationImage } from "@/lib/certification-images";
import { EnrollmentButton } from "@/components/enrollment/enrollment-button";
import { ReviewsSection } from "@/components/reviews";

interface CertificationPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface CertificationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  detailed_description?: string;
  price_cents: number;
  exam_count: number;
  total_questions: number;
  is_active: boolean;
  is_featured: boolean;
  category: string;
  image_url?: string;
  tags?: string[];
  certification_categories: {
    id: string;
    name: string;
    slug: string;
  };
  knowledge_areas?: {
    id: string;
    name: string;
    description: string;
    weight_percentage: number;
    sort_order: number;
  }[];
}

export default function CertificationPage({ params }: CertificationPageProps) {
  const [id, setId] = React.useState<string>("");
  const [certification, setCertification] =
    React.useState<CertificationData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(resolvedParams => {
      setId(resolvedParams.id);
    });
  }, [params]);

  React.useEffect(() => {
    if (!id) return;

    const fetchCertification = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/catalog/certifications/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            notFound();
            return;
          }
          throw new Error(`Failed to fetch certification: ${response.status}`);
        }

        const data = await response.json();
        setCertification(data.certification);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertification();
  }, [id]);

  if (isLoading) {
    return <CertificationDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto mt-10 text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/certifications">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Certifications
          </Button>
        </Link>
      </div>
    );
  }

  if (!certification) {
    notFound();
    return null;
  }

  const certificationImage = getCertificationImage(certification.name);

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/catalog">
            <Button
              variant="outline"
              className="text-sm bg-white border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden bg-white shadow-lg dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Left Sidebar - Image and Enrollment */}
            <div className="lg:col-span-1">
              <CardContent className="p-6">
                {/* Certification Image */}
                <div className="flex items-center justify-center mb-6 h-48 w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                  {certificationImage ? (
                    <div className="relative w-32 h-32">
                      <Image
                        src={certificationImage}
                        alt={certification.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                        priority={false}
                      />
                    </div>
                  ) : (
                    <PlaceholderImage
                      name={certification.name}
                      type="certification"
                      size="lg"
                    />
                  )}
                </div>

                {/* Price Display */}
                <div className="text-center space-y-2 mb-6">
                  <p className="text-3xl font-bold">
                    {formatPrice(certification.price_cents)}
                  </p>
                  {certification.price_cents > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      One-time purchase
                    </p>
                  )}
                </div>

                {/* Enrollment Button */}
                <EnrollmentButton
                  type="certification"
                  id={certification.id}
                  name={certification.name}
                  isFree={certification.price_cents === 0}
                  size="lg"
                  className="w-full"
                />
              </CardContent>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <CardHeader className="p-6">
                <Badge
                  variant="default"
                  className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {certification.certification_categories?.name ||
                    "Certification"}
                </Badge>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {certification.name}
                </CardTitle>
                {certification.description && (
                  <CardDescription className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                    {certification.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {/* Detailed Description */}
                {certification.detailed_description && (
                  <div className="mb-6">
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed">
                        {certification.detailed_description}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 text-base mb-6">
                  <div className="flex items-center">
                    <BookOpen className="mr-3 h-6 w-6 text-blue-500" />
                    <span>{certification.exam_count} Practice Exams</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-3 h-6 w-6 text-blue-500" />
                    <span>{certification.total_questions} Total Questions</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="mr-3 h-6 w-6 text-green-500" />
                    <span>75% Passing Score</span>
                  </div>
                </div>
                <Separator className="my-6" />
                
                {/* Knowledge Areas Section */}
                {certification.knowledge_areas && certification.knowledge_areas.length > 0 ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Knowledge Areas & Question Distribution
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-separate border-spacing-0">
                        <thead>
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                              Knowledge Area
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                              Questions
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                              Weight
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {certification.knowledge_areas.map((ka, index) => {
                            const questionCount = Math.round(
                              (ka.weight_percentage / 100) *
                                certification.total_questions
                            );
                            const isLast =
                              index === certification.knowledge_areas!.length - 1;
                            return (
                              <tr key={ka.id}>
                                <td
                                  className={`py-3 px-4 text-sm font-medium text-gray-900 dark:text-white ${!isLast ? "border-b border-dashed border-gray-200 dark:border-gray-700" : ""}`}
                                >
                                  {ka.name}
                                </td>
                                <td
                                  className={`py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300 ${!isLast ? "border-b border-dashed border-gray-200 dark:border-gray-700" : ""}`}
                                >
                                  {questionCount}
                                </td>
                                <td
                                  className={`py-3 px-4 text-center text-sm font-semibold text-gray-900 dark:text-white ${!isLast ? "border-b border-dashed border-gray-200 dark:border-gray-700" : ""}`}
                                >
                                  {ka.weight_percentage}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Knowledge Areas Coming Soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Detailed knowledge area breakdown and question distribution will be available soon for this certification.
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
        
        {/* Reviews Section */}
        <div className="mt-8">
          <ReviewsSection certificationId={certification.id} />
        </div>
      </div>
    </div>
  );
}

function CertificationDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="overflow-hidden bg-white shadow-lg dark:bg-gray-800">
            <CardHeader className="p-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="mt-2 h-6 w-full" />
              <Skeleton className="mt-2 h-6 w-2/3" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6 text-base">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Separator className="my-8" />
              <div>
                <Skeleton className="mb-4 h-8 w-1/2" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="bg-white shadow-lg dark:bg-gray-800">
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-48 w-full" />
              <div className="text-center">
                <Skeleton className="mx-auto h-12 w-3/4" />
                <Skeleton className="mx-auto mt-2 h-4 w-1/2" />
                <Skeleton className="mt-6 h-12 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg dark:bg-gray-800">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
