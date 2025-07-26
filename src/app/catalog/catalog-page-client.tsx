"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, BookOpen } from "lucide-react";

interface Certification {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailed_description: string | null;
  price_cents: number;
  exam_count: number;
  total_questions: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  certification_categories: {
    name: string;
    slug: string;
    description: string;
    icon: string | null;
    color: string;
    sort_order: number;
  };
}

interface CatalogResponse {
  certifications: Certification[];
  packages: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function CatalogPageClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertifications() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/catalog/search", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CatalogResponse = await response.json();
        setCertifications(data.certifications || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching certifications:", err);
        setError(err instanceof Error ? err.message : "Failed to load certifications");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCertifications();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Catalog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Browse our comprehensive collection of Salesforce certification practice exams
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading certifications: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          Catalog
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Browse our comprehensive collection of Salesforce certification practice exams
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search certifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="animate-pulse rounded-md bg-muted h-4 w-3/4"></div>
                <div className="animate-pulse rounded-md bg-muted h-3 w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse rounded-md bg-muted h-20 w-full mb-4"></div>
                <div className="animate-pulse rounded-md bg-muted h-9 w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : certifications.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No certifications found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't find any certifications matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {certifications.map((cert) => (
            <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {cert.name}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cert.certification_categories.name}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Exams:</span>
                    <span className="font-medium">{cert.exam_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                    <span className="font-medium">{cert.total_questions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-medium">
                      {cert.price_cents === 0 ? "Free" : `$${(cert.price_cents / 100).toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
