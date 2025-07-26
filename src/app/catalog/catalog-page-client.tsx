"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, BookOpen } from "lucide-react";
import { useCategories, useCatalogSearch } from "@/hooks/use-catalog";
import { useUserEnrollments } from "@/hooks/use-enrollment";
import { useAuth } from "@/contexts/auth-context";
import type { CatalogFilters } from "@/types/catalog";
import {
  CatalogGrid,
  CatalogFilters as CatalogFiltersComponent,
} from "@/components/catalog";

const ITEMS_PER_PAGE = 12;

export function CatalogPageClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "premium">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);

  // Fallback state for direct API calls
  const [fallbackData, setFallbackData] = useState<any>(null);
  const [fallbackLoading, setFallbackLoading] = useState(true);
  const [fallbackError, setFallbackError] = useState<string | null>(null);

  // Get user and enrollment data
  const { user } = useAuth();
  const { data: enrollmentsData } = useUserEnrollments();

  // Build filters object
  const filters = useMemo<CatalogFilters>(
    () => ({
      search: searchTerm || undefined,
      category: selectedCategory === "all" ? undefined : selectedCategory,
      priceType: priceFilter,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }),
    [searchTerm, selectedCategory, priceFilter, currentPage]
  );

  // Fetch data
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const {
    data: catalogData,
    isLoading: catalogLoading,
    error: catalogError,
  } = useCatalogSearch(filters);

  // Debug logging
  console.log("CatalogPageClient Debug:", {
    categoriesLoading,
    catalogLoading,
    categoriesCount: categories?.length || 0,
    certificationsCount: catalogData?.certifications?.length || 0,
    packagesCount: catalogData?.packages?.length || 0,
    catalogError: catalogError?.message || null,
    filters
  });

  // Direct API test and fallback data loading
  useEffect(() => {
    const testAPIs = async () => {
      try {
        console.log("Testing APIs directly...");
        setFallbackLoading(true);
        
        const [categoriesRes, searchRes] = await Promise.all([
          fetch("/api/catalog/categories"),
          fetch("/api/catalog/search")
        ]);
        
        const categoriesData = await categoriesRes.json();
        const searchData = await searchRes.json();
        
        console.log("Direct API test results:", {
          categoriesStatus: categoriesRes.status,
          searchStatus: searchRes.status,
          categoriesData: categoriesData,
          searchData: searchData
        });

        // Set fallback data
        setFallbackData({
          certifications: searchData.certifications || [],
          packages: searchData.packages || [],
          categories: categoriesData.categories || [],
          pagination: searchData.pagination || {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
          },
        });
        
        setFallbackLoading(false);
      } catch (error) {
        console.error("Direct API test failed:", error);
        setFallbackError(error instanceof Error ? error.message : "Unknown error");
        setFallbackLoading(false);
      }
    };
    
    testAPIs();
  }, []);

  // Use fallback data if React Query is failing
  const shouldUseFallback = !catalogData && fallbackData;
  const finalCatalogData = shouldUseFallback ? fallbackData : catalogData;
  const finalCategories = shouldUseFallback ? fallbackData?.categories : categories;
  const finalIsLoading = shouldUseFallback ? fallbackLoading : (categoriesLoading || catalogLoading);
  const finalError = shouldUseFallback ? fallbackError : catalogError;

  console.log("Fallback Debug:", {
    shouldUseFallback,
    fallbackLoading,
    fallbackError,
    fallbackCertificationsCount: fallbackData?.certifications?.length || 0,
    finalCertificationsCount: finalCatalogData?.certifications?.length || 0
  });

  // Get enrolled certification IDs and package IDs
  const enrolledCertificationIds = useMemo(() => {
    if (!enrollmentsData?.enrollments) return new Set<string>();
    return new Set(enrollmentsData.enrollments.map(e => e.certification.id));
  }, [enrollmentsData]);

  const enrolledPackageIds = useMemo(() => {
    if (!enrollmentsData?.enrollments) return new Set<string>();
    return new Set(
      enrollmentsData.enrollments
        .filter(e => e.package_id)
        .map(e => e.package_id!)
    );
  }, [enrollmentsData]);

  // Filter catalog data based on enrollment toggle
  const filteredCatalogData = useMemo(() => {
    if (!finalCatalogData || !showEnrolledOnly) return finalCatalogData;

    const filteredCertifications = finalCatalogData.certifications.filter((cert: any) =>
      enrolledCertificationIds.has(cert.id)
    );

    const filteredPackages = finalCatalogData.packages.filter((pkg: any) =>
      enrolledPackageIds.has(pkg.id)
    );

    return {
      ...finalCatalogData,
      certifications: filteredCertifications,
      packages: filteredPackages,
    };
  }, [
    finalCatalogData,
    showEnrolledOnly,
    enrolledCertificationIds,
    enrolledPackageIds,
  ]);

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriceFilterChange = (price: "all" | "free" | "premium") => {
    setPriceFilter(price);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEnrollmentToggle = () => {
    setShowEnrolledOnly(!showEnrolledOnly);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          Catalog
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Browse our comprehensive collection of Salesforce certification
          practice exams
        </p>
      </div>

      {/* Search and View Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search certifications..."
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View and Filter Controls */}
          <div className="flex gap-2">
            {/* Enrollment Toggle */}
            {user && (
              <Button
                variant={showEnrolledOnly ? "default" : "outline"}
                size="sm"
                onClick={handleEnrollmentToggle}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                My Certification Enrollments
              </Button>
            )}

            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <CatalogFiltersComponent
            categories={finalCategories || []}
            selectedCategory={selectedCategory}
            priceFilter={priceFilter}
            onCategoryChange={handleCategoryChange}
            onPriceFilterChange={handlePriceFilterChange}
          />
        </div>
      )}

      {/* Results */}
      {finalError ? (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-red-600 dark:text-red-400">
              Error loading catalog data: {typeof finalError === 'string' ? finalError : finalError?.message}
            </p>
          </CardContent>
        </Card>
      ) : (
        <CatalogGrid
          certifications={filteredCatalogData?.certifications || []}
          packages={filteredCatalogData?.packages || []}
          isLoading={finalIsLoading}
          pagination={filteredCatalogData?.pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
